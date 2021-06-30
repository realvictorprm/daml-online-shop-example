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
      {[...products].map(product =>
        <List.Item key={product.name}>
          {/* <List.Icon name='gamepad' /> */}
          <List>
            <List.Item>
              <img width="300em" src={product.imageUrl} />
            </List.Item>
            <List.Item>
              <Grid relaxed columns={2}>
                <Grid.Row stretched>
                  <Grid.Column stretched>
                    <Header size='medium'>{product.name}</Header>
                    {product.description}
                    <Header color='orange' size='huge'>
                      {product.price} CHF
                    </Header>
                  </Grid.Column>
                  <Grid.Column>
                    <Header style={{ alignSelf: 'flex-end', marginRight: "0.3em" }} color={Number(product.inventory) > 0 ? 'green' : 'red'}>
                      {Number(product.inventory) > 0 ? product.inventory + " in stock" : "Out of stock"} </Header>
                    <br></br>
                    <Button
                      icon='shop'
                      disabled={Number(product.inventory) == 0}
                      size='small'
                      color='orange'
                      onClick={() => onBuy(product)}
                      label={{ color: 'orange', as: 'a', basic: true, content: "Add to cart"}}
                      labelPosition='left'
                      style={{ flexGrow: 0, alignItems: 'stretch', alignSelf: 'flex-end', marginBottom: "4px" }} />
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
