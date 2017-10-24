import React from 'react';
import { 
  View, 
  Text,
  FlatList,
} from 'react-native';

function MyPartnerOrgCell() {
  return (
    <View style={{ padding: 14 }}>
      <Text style={{ fontSize: 16, color: 'black' }}>同学 (18)</Text>
      <Text style={{ fontSize: 14, marginTop: 4,  color: 'grey' }}>章三, 里斯, 王五, 刘人</Text>
    </View>
  )
}

class MyPartnerOrg extends React.Component {
    static navigationOptions = {
        title: '投资人机构',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    }

    separator = () => <View style={{ height: 0.3, backgroundColor: "#CED0CE", marginLeft: 10 }} />;

    render() {
      return (
        <FlatList
          style={{ backgroundColor: 'white' }}
          data={[{ key: 'a' }, { key: 'b' }]}
          renderItem={({ item }) => <MyPartnerOrgCell />}
          ItemSeparatorComponent={this.separator}
        />
      );
    }
}

export default MyPartnerOrg;