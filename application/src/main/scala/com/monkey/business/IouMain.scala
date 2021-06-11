package com.monkey.business

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.JavaFlowSupport.Source
import cats.implicits._
import com.daml.grpc.adapter.AkkaExecutionSequencerPool
import com.daml.ledger.api.refinements.ApiTypes.ApplicationId
import com.daml.ledger.client.LedgerClient
import com.daml.ledger.client.binding.{Primitive => P}
import com.daml.ledger.client.configuration.{CommandClientConfiguration, LedgerClientConfiguration, LedgerIdRequirement}
import com.daml.quickstart.iou.model.OnlineShop.{CreateReservationRequest, Product, ProductDescription}
import com.monkey.business.ClientUtil.workflowIdFromParty
import com.monkey.business.DecodeUtil.decodeCreated
import com.typesafe.scalalogging.StrictLogging

import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, ExecutionContext, Future}
import scala.util.{Failure, Success}

object IouMain extends App with StrictLogging {

  private val (ledgerHost, ledgerPort) =
    if (args.length == 2) (args(0), args(1).toInt)
    else ("localhost", 6865)

  private val admin = P.Party("admin")
  private val everyone = P.Party("everyone")
  private val workflowIdAdmin = workflowIdFromParty(admin)
  private val workflowIdEveryone = workflowIdFromParty(everyone)

  private val asys = ActorSystem()
  private implicit val amat = Materializer(asys)
  private val aesf = new AkkaExecutionSequencerPool("clientPool")(asys)

  private def shutdown(): Unit = {
    logger.info("Shutting down...")
    Await.result(asys.terminate(), 10.seconds)
    ()
  }

  private implicit val ec: ExecutionContext = asys.dispatcher

  private val applicationId = ApplicationId("IOU Example")

  // <doc-ref:ledger-client-configuration>
  private val clientConfig = LedgerClientConfiguration(
    applicationId = ApplicationId.unwrap(applicationId),
    ledgerIdRequirement = LedgerIdRequirement.none,
    commandClient = CommandClientConfiguration.default,
    sslContext = None,
    token = None,
  )
  // </doc-ref:ledger-client-configuration>

  private val clientF: Future[LedgerClient] =
    LedgerClient.singleHost(ledgerHost, ledgerPort, clientConfig)(ec, aesf)

  private val clientUtilF: Future[ClientUtil] =
    clientF.map(client => new ClientUtil(client, applicationId))

  case class RawProduct(name: String, inventory: Int, description: String, imgUrl: String)

  private val rawProducts = {
    import io.circe.generic.auto._, io.circe.parser._
    val text = scala.io.Source.fromResource("Products.json").mkString
    decode[List[RawProduct]](text).getOrElse(List.empty[RawProduct])
  }

  def createProduct(product: RawProduct) =
    List(Product(product.name, product.inventory, List.empty).create,
      ProductDescription(product.name, product.description, product.imgUrl).create)

  private val offset0F = clientUtilF.flatMap(_.ledgerEnd)

  val foo = for {
      clientUtil <- clientUtilF
      offset0 <- offset0F
      _ <- clientUtil.subscribe(admin, offset0, None)(tc => {
        logger.info(s"incoming contract: $tc")
        decodeCreated[CreateReservationRequest](tc).foreach { contract =>
            logger.info(s"this is a reservation request: $contract")
            clientUtil.submitCommand(admin, workflowIdAdmin, contract.contractId.exerciseTryAcceptReservation(admin))
              .onComplete {
                case a => logger.info(s"submit result: $a")
              }
        }
      }
      )
    } yield ()

  val issuerFlow: Future[Unit] = for {
    clientUtil <- clientUtilF
    _ = logger.info(s"Client API initialization completed, Ledger ID: ${clientUtil.toString}")
    _ <- rawProducts.flatMap(createProduct).traverse(clientUtil.submitCommand(admin, workflowIdAdmin, _))
  } yield ()

  val returnCodeF: Future[Int] = issuerFlow.transform {
    case Success(_) =>
      logger.info("IOU flow completed.")
      Success(0)
    case Failure(e) =>
      logger.error("IOU flow completed with an error", e)
      Success(1)
  }

  val returnCode: Int = Await.result(returnCodeF, 100.seconds)

  scala.sys.addShutdownHook(() => {
    Await.ready(asys.terminate(), 10.milli)
    System.exit(returnCode)
  }
  )
//  shutdown()
//  System.exit(returnCode)
}
