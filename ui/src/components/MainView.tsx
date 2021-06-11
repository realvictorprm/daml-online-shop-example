// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider } from 'semantic-ui-react';
import { Party } from '@daml/types';
// import { User } from '@daml.js/create-daml-app';
import { useParty, useLedger, useStreamFetchByKeys, useStreamQueries } from '@daml/react';
// import UserList from './UserList';
// import PartyListEdit from './PartyListEdit';
import { OnlineShop } from '@daml.js/create-daml-app'
import { CreateReservationRequest, ProductDescription } from '@daml.js/create-daml-app/lib/OnlineShop';
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

  const products = useStreamQueries(ProductDescription);

  const onBuy = async (product: OnlineShop.ProductDescription) => {
    await ledger.create(CreateReservationRequest, { customer: username, productName: product.name})
  }

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{padding: '1ex 0em 0ex 0em'}}>
                {`Welcome, ${username}!`}
            </Header>
            <Segment>
              <UserList
                  products={products.contracts.map(it => it.payload)}
                  onBuy={onBuy}
                />
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default MainView;
