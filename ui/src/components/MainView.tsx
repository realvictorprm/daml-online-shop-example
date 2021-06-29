// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Container, Grid, Header, Segment, List, Button } from 'semantic-ui-react';
import { useParty, useLedger, useStreamQueries } from '@daml/react';
import { OnlineShop } from '@daml.js/create-daml-app'
import { CreateReservationRequest, Order, OrderRequest, ProductDescription, Reservation } from '@daml.js/create-daml-app/lib/OnlineShop';
import ProductList from './ProductList';
import { ContractId } from '@daml/types';

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = useParty();
  // USERS_END

  const ledger = useLedger();

  const raw_products = useStreamQueries(ProductDescription);
  const products = raw_products.contracts.map(product => product.payload)

  const productMap = new Map<string, ProductDescription>(products.map(product => [product.name, product]))

  const raw_reservations = useStreamQueries(Reservation);
  const reservations = raw_reservations.contracts.map(reservation => reservation.payload)

  const raw_orders = useStreamQueries(Order);
  const orders: [OnlineShop.Order, ContractId<OnlineShop.Order>][] = raw_orders.contracts.map(order => [order.payload, order.contractId])


  const onPutInBasket = async (product: OnlineShop.ProductDescription) => {
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
                <Button onClick={_ => onOrder()} style={{ flexGrow: 0, alignment: "Right" }} >Order now</Button>
              </List.Content>
            </List.Item>
          </List>

          :
          <Container style={{ flexGrow: 0, alignment: "center" }}>
            <Header as='h3' size='small' color='black' textAlign='center' style={{ padding: '1ex 0em 0ex 0em', flexGrow: 0 }}>
              Your basket is empty.
            </Header>
          </Container>
        }
      </Segment>
    </Grid.Column>

  const mkOrderProductList = (order: Order) =>
    <Segment>
      <Header style={{ flexGrow: 0 }}>Order status: {order.status}
      </Header>
      <List divided relaxed>
        {[...order.products].sort().map(product =>
          <List.Item key={product}>
            <List.Header className='test-select-user-in-network'>{product}</List.Header>
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


  return (
    <Container>
      <Grid centered columns={3}>
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
