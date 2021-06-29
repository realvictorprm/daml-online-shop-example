// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Fragment, useState } from 'react';
import { Container, Grid, Header, Segment, List, Button, Portal, Message, Transition, Icon, Step } from 'semantic-ui-react';
import { useParty, useLedger, useStreamQueries } from '@daml/react';
import { OnlineShop } from '@daml.js/create-daml-app'
import { AcknowledgeDeclinedReservation, CreateReservationRequest, DeclinedReservation, Order, OrderRequest, ProductInfo, Reservation } from '@daml.js/create-daml-app/lib/OnlineShop';
import ProductList from './ProductList';
import { ContractId } from '@daml/types';
import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = useParty();
  // USERS_END

  const ledger = useLedger();

  const raw_products = useStreamQueries(ProductInfo);
  const products = raw_products.contracts.map(product => product.payload)

  const productMap = new Map<string, ProductInfo>(products.map(product => [product.name, product]))

  const raw_reservations = useStreamQueries(Reservation);
  const reservations = raw_reservations.contracts.map(reservation => reservation.payload)

  const raw_orders = useStreamQueries(Order);
  const orders: [OnlineShop.Order, ContractId<OnlineShop.Order>][] = raw_orders.contracts.map(order => [order.payload, order.contractId])

  const raw_declinedReservations = useStreamQueries(DeclinedReservation);
  const declinedReservations = raw_declinedReservations.contracts.map(r => r.payload)

  const [foo, bar] = useState(true)

  const empty: ContractId<DeclinedReservation>[] = []

  const onPortalClose = async (contractId: ContractId<DeclinedReservation>) => {
    await ledger.exercise(DeclinedReservation.AcknowledgeDeclinedReservation, contractId, {})
  }

  const onPutInBasket = async (product: OnlineShop.ProductInfo) => {
    await ledger.create(CreateReservationRequest, { customer: username, productName: product.name })
  }

  const onOrder = async () => {
    await ledger.create(OrderRequest, { customer: username, reservations: reservations.map(res => res.productName) })
  }

  const productList =
    <Grid.Column>
      <Header as='h1' size='medium' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em', flexGrow: 0 }}>
        {`Products`}
      </Header>
      <Segment>
        <ProductList
          products={products}
          onBuy={onPutInBasket}
        />
      </Segment>
    </Grid.Column>

  const basketView =
    <Grid.Column>
      <Header as='h1' size='medium' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em', flexGrow: 0 }}>
        {`Basket`}
      </Header>
      <Segment>

        {(reservations.length > 0) ?
          <List divided relaxed>
            {[...reservations].sort((x, y) => x.productName.localeCompare(y.productName)).map(reservation =>
              <List.Item key={reservation.productName}>
                <List.Content>
                  <List.Header className='test-select-user-in-network'>{reservation.productName}</List.Header>
                  <List.Content floated="right">
                    {productMap.get(reservation.productName)?.price} CHF
                  </List.Content>
                  <List.Content>
                    <img width="40%" src={productMap.get(reservation.productName)?.imageUrl} />
                  </List.Content>
                  <List.Description>

                  </List.Description>
                </List.Content>
              </List.Item>
            )}
            <List.Item style={{ alignSelf: "flexEnd" }}>
              <List.Content floated="right">
                <Button icon color='orange' onClick={_ => onOrder()} style={{ flexGrow: 0, alignment: "Right" }}>
                  Order now  <Icon name='arrow circle right' />
                </Button>
              </List.Content>
            </List.Item>
          </List>

          :
          <Container style={{ flexGrow: 0, alignment: "center" }}>
            <Header as='h3' size='small' color='black' textAlign='center' style={{ padding: '1ex 0em 0ex 0em', flexGrow: 0 }}>
              Your basket is empty, put some stuff in :-)
            </Header>
          </Container>
        }
      </Segment>
    </Grid.Column>

  const mkOrderStatus = (order: Order) =>
    <Fragment>
      <Step.Group size='mini'>
        <Step active={order.status == "ReceivedOrder"}>
          <Icon name='cogs' />
          <Step.Content>
            <Step.Title>Processing</Step.Title>
          </Step.Content>
        </Step>
        <Step active={order.status == "PreShipping"}>
          <Icon name='warehouse' />
          <Step.Content>
            <Step.Title>Preparing shipping</Step.Title>
          </Step.Content>
        </Step>
        <Step active={order.status == "Shipping"}>
          <Icon name='truck' />
          <Step.Content>
            <Step.Title>Shipping</Step.Title>
          </Step.Content>
        </Step>

        <Step active={order.status == "Shipped"}>
          <Icon name='home' />
          <Step.Content>
            <Step.Title>Shipped</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>
    </Fragment>

  const mkOrderProductList = (order: Order) =>
    <Segment>
      <List divided relaxed>
        {[...order.products].sort().map(product =>
          <List.Item key={product}>
            <List.Header>{product}</List.Header>
            <List.Content floated="right">
              {productMap.get(product)?.price} CHF
            </List.Content>
            <List.Content>
              <img width="40%" src={productMap.get(product)?.imageUrl} />
            </List.Content>
          </List.Item>
        )}
        <List.Item>
          Total
          <List.Content floated="right">
            {order.products.map(product => productMap.get(product)?.price).reduce((acc, curr) => {
              let ham = curr ?? '0.0'
              return acc + Number(ham)
            }, 0.0)
            } CHF
          </List.Content>
        </List.Item>
      </List>
      {mkOrderStatus(order)}
    </Segment>

  const ordersView =
    <Grid.Column>
      <Header as='h1' size='medium' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em' }}>
        {`Orders`}
      </Header>
      <List>
        {[...orders].map(tpl =>
          <List.Item key={tpl[1]}>
            {mkOrderProductList(tpl[0])}
          </List.Item>)}
      </List>
    </Grid.Column>

  const showPortal = () =>
    <Portal open={declinedReservations.length > 0}>
      <Transition.Group
        as={List}
        duration={200}
        divided
        animation="fade left"
        style={{
          right: '2em',
          position: 'fixed',
          top: '5em',
          zIndex: 1000,
        }}>
        {[...raw_declinedReservations.contracts].map(value => {
          setTimeout(() => onPortalClose(value.contractId), 10000)
          return (<List.Item>
            <Message floating={true} negative size="big" onDismiss={_ => onPortalClose(value.contractId)}>
              <Message.Header>
                We're sorry but this failed :-(
              </Message.Header>
              <Message.Content>
                Reservation for product {(value?.payload.productName)} could not be fulfilled due to: {value.payload.reason}
              </Message.Content>
            </Message>
          </List.Item>);
        }
        )}
      </Transition.Group>
    </Portal>

  return (
    <Container fluid>
      {showPortal()}
      <Grid centered columns={3} style={{ marginLeft: '1em', marginRight: '1em' }}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em' }}>
              {`Welcome, ${username}!`}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row stretched>
          {[productList, basketView, ordersView]}
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default MainView;
