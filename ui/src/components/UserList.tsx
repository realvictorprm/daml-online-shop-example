// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Icon, List } from 'semantic-ui-react'
import { Party } from '@daml/types';
import { OnlineShop } from '@daml.js/create-daml-app';

type Props = {
  products: OnlineShop.ProductDescription[];
  onBuy: (product: OnlineShop.ProductDescription) => Promise<any>;
}

/**
 * React component to display a list of `User`s.
 * Every party in the list can be added as a friend.
 */
const UserList: React.FC<Props> = ({products, onBuy}) => {
  return (
    <List divided relaxed>
      {[...products].sort((x, y) => x.name.localeCompare(y.name)).map(product =>
        <List.Item key={product.name}>
          <List.Icon name='gamepad' />
          <List.Content>
            <List.Header className='test-select-user-in-network'>{product.name}</List.Header>
            <List.Content>
              <img width="40%" src={product.imageUrl}/>
            </List.Content>
            <List.Description>
              
            </List.Description>
            <List.Content>
              {product.description}
            </List.Content>
            <List.Content  floated='right'>
              <Icon name="shop"
                    link
                    onClick={() => onBuy(product)}/>
            </List.Content>
          </List.Content>
        </List.Item>
      )}
    </List>
  );
};

export default UserList;
