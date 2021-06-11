// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider, List } from 'semantic-ui-react';
import { Party } from '@daml/types';
// import { User } from '@daml.js/create-daml-app';
import { useParty, useLedger, useStreamFetchByKeys, useStreamQueries } from '@daml/react';
// import UserList from './UserList';
// import PartyListEdit from './PartyListEdit';
import { OnlineShop } from '@daml.js/create-daml-app'
import { CreateReservationRequest, ProductDescription, Reservation } from '@daml.js/create-daml-app/lib/OnlineShop';
import UserList from './UserList';

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = useParty();
  // USERS_END

  // Sorted list of users that are following the current user
  // const followers = useMemo(() =>
  //   allUsers
  //   .map(user => user.payload)
  //   .filter(user => user.username !== username)
  //   .sort((x, y) => x.username.localeCompare(y.username)),
  //   [allUsers, username]);

  const ledger = useLedger();

  const raw_products = useStreamQueries(ProductDescription);
  const products = raw_products.contracts.map(product => product.payload)

  const productMap = new Map<string, ProductDescription>(products.map(product => [product.name, product]))

  const raw_reservations = useStreamQueries(Reservation);
  const reservations = raw_reservations.contracts.map(reservation => reservation.payload)

  const onBuy = async (product: OnlineShop.ProductDescription) => {
    await ledger.create(CreateReservationRequest, { customer: username, productName: product.name })
  }

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em' }}>
              {`Welcome, ${username}!`}
            </Header>
            <Segment>
              <UserList
                products={products}
                onBuy={onBuy}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Header as='h1' size='medium' color='blue' textAlign='center' style={{ padding: '1ex 0em 0ex 0em' }}>
              {`Basket`}
            </Header>
            <Segment>
              <List divided relaxed>
                {[...reservations].sort((x, y) => x.productName.localeCompare(y.productName)).map(reservation =>
                  <List.Item key={reservation.productName}>
                    <List.Content>
                      <List.Header className='test-select-user-in-network'>{reservation.productName}</List.Header>
                      <List.Content>
                        <img width="40%" src={productMap.get(reservation.productName)?.imageUrl} />
                      </List.Content>
                      <List.Description>

                      </List.Description>
                    </List.Content>
                  </List.Item>
                )}
              </List>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default MainView;
