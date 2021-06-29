// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Button, Grid, Header, Icon, List } from 'semantic-ui-react'
import { OnlineShop } from '@daml.js/create-daml-app';

type Props = {
  products: OnlineShop.ProductInfo[];
  onBuy: (product: OnlineShop.ProductInfo) => Promise<any>;
}

/**
 * React component to display a list of `User`s.
 * Every party in the list can be added as a friend.
 */
const ProductList: React.FC<Props> = ({ products, onBuy }) => {
  return (
    <List divided relaxed>
      {[...products].sort((x, y) => x.name.localeCompare(y.name)).map(product =>
        <List.Item key={product.name}>
          {/* <List.Icon name='gamepad' /> */}
          <List>
            <List.Item>
              <img width="300em" src={product.imageUrl} />
            </List.Item>
            <List.Item>
              <Grid columns={2}>
                <Grid.Row stretched>
                  <Grid.Column>
                    <Header size='medium'>{product.name}</Header>
                    {product.description}
                    <Header color='orange' size='large'>
                      {product.price} CHF
                    </Header>
                  </Grid.Column>
                  <Grid.Column>
                    <Header style={{ alignSelf: 'flex-end', marginRight: "0.3em" }} color={Number(product.inventory) > 0 ? 'green' : 'red'}>{product.inventory} in stock</Header>
                    <br></br>
                    <Button size='big' color='orange' content="Add to cart" onClick={() => onBuy(product)} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </List.Item>
          </List>
          <List.Content>
            <List.Content floated='right'>
            </List.Content>
          </List.Content>
        </List.Item>
      )}
    </List>
  );
};

export default ProductList;
