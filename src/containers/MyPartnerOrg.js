import React from 'react';
import { Text } from 'react-native';

class MyPartnerOrg extends React.Component {
    static navigationOptions = {
        title: '投资人机构',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    }

  render () {
    return <Text>MyPartnerOrg</Text>;
  }
}

export default MyPartnerOrg;