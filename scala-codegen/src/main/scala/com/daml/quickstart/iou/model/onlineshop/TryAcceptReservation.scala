/*
 * THIS FILE WAS AUTOGENERATED BY THE DIGITAL ASSET DAML SCALA CODE GENERATOR
 * DO NOT EDIT BY HAND!
 */
import _root_.com.daml.ledger.client.{binding=>$u0020lfdomainapi}
import _root_.com.daml.ledger.api.v1.{value=>$u0020rpcvalue}
package com.daml.quickstart.iou.model {
  package OnlineShop {
    final case class TryAcceptReservation() extends ` lfdomainapi`.ValueRef

    object TryAcceptReservation extends ` lfdomainapi`.ValueRefCompanion with _root_.scala.Function0[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] {
      import _root_.scala.language.higherKinds;
      trait view[` C`[_]] extends ` lfdomainapi`.encoding.RecordView[` C`, view] { $u0020view =>
        final override def hoist[` D`[_]](` f` : _root_.scalaz.~>[` C`, ` D`]): view[` D`] = {
          final class $anon extends _root_.scala.AnyRef with view[` D`];
          new $anon()
        }
      };
      implicit val `TryAcceptReservation Value`: ` lfdomainapi`.Value[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] = {
        final class $anon extends this.`Value ValueRef`[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] {
          override def write(value: _root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation): ` rpcvalue`.Value.Sum = ` record`();
          override def read(argValue: ` rpcvalue`.Value.Sum): _root_.scala.Option[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] = argValue.record.flatMap(_root_.scala.Function.const(_root_.scala.Some(TryAcceptReservation())))
        };
        new $anon()
      };
      override protected val ` dataTypeId` = ` mkDataTypeId`(`Package IDs`.OnlineShop, "OnlineShop", "TryAcceptReservation");
      implicit def `TryAcceptReservation LfEncodable`: ` lfdomainapi`.encoding.LfEncodable[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] = {
        final class $anon extends ` lfdomainapi`.encoding.LfEncodable[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] {
          override def encoding(lte: ` lfdomainapi`.encoding.LfTypeEncoding): lte.Out[_root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation] = lte.emptyRecord(` dataTypeId`, (() => _root_.com.daml.quickstart.iou.model.OnlineShop.TryAcceptReservation()))
        };
        new $anon()
      }
    }
  }
}
