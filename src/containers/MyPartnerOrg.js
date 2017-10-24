import React from 'react';
import { 
  View, 
  Text,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import * as api from '../api';
import { connect } from 'react-redux';

function MyPartnerOrgCell (props) {
  const { org, count, data } = props.data;
  return (
    <TouchableHighlight onPress={props.onPress} underlayColor={'lightgray'}>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 16, color: 'black' }}>{org} ({count})</Text>
        <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 14, marginTop: 4, color: 'grey' }}>{data.map(m => m.investoruser.username).join(', ')}</Text>
      </View>
    </TouchableHighlight>
  )
}

class MyPartnerOrg extends React.Component {
    static navigationOptions = {
        title: '我的投资人',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
        headerBackTitle: null,
    }

    constructor (props) {
      super(props);
      this.state = {
        data: []
      }
    }

    componentDidMount() {
      let org = [];
      api.getOrg({ trader: this.props.userInfo.id, page_size: 10000 })
      .then(data => {
        org = data.data;
        return Promise.all(
          org.map(item => api.getUserRelation({ traderuser: this.props.userInfo.id, orgs: item.id, page_size: 10 }))
        )
      })
      .then(data => {
        data.forEach(function(element, index) {
          element['id'] = org[index]['id'];
          element['org'] = org[index]['orgname'];
        }, this);
        this.setState({ data })
      })
      .catch(err => console.error(err));
    }

    separator = () => <View style={{ height: 0.3, backgroundColor: "#CED0CE", marginLeft: 10 }} />;

    handleItemPressed (org) {
      const { userType } = this.props.userInfo;
      this.props.navigation.navigate('MyPartner', { org, userType });
    }

    render() {
      return (
        <FlatList
          style={{ backgroundColor: 'white' }}
          data={this.state.data}
          keyExtractor={ item => item.id }
          renderItem={({ item }) => <MyPartnerOrgCell data={item} onPress={this.handleItemPressed.bind(this, item)} />}
          ItemSeparatorComponent={this.separator}
        />
      );
    }
}

function mapStateToProps(state) {
  const { userInfo } = state.app;
  return { userInfo };
}

export default connect(mapStateToProps)(MyPartnerOrg);