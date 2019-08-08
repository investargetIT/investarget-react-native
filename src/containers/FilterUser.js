import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import * as api from '../api';
import UserItem from '../components/UserItem';
import debounce from 'lodash.debounce';

class FilterUser extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '选择用户',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        params.onPress ?
        <TouchableOpacity style={{ marginRight: 16 }} onPress={params.onPress}>
          <Text style={{ fontSize: 15, color: '#fff' }}>确定</Text>
        </TouchableOpacity>
        : null
      )
    }
  }

  constructor (props) {
    super (props);
    this.state = {
      search: '',
      users: [],
      selected: [],
    }
    const { project, type } = props.navigation.state.params;
    this.project = project;
    this.type = type;
    this.searchUser = debounce(this.searchUser, 1000);
  }

  handleSubmit = () => {}

  searchUser = () => {
    const params = {
      search: this.state.search
    };
      api.getUserRelation(params)
      .then(data => {
        var { count: total, data: list } = data
        list = list.map(item => {
            const user = item.investoruser
            const { id, username, photourl, org, title } = user
            return {
                id,
                username,
                photoUrl: photourl,
                org: org ? org.orgname : '',
                title: title ? title.name : '',
            }
        })
        this.setState({ users: list });
    })
    .catch(err => console.error(err));
  }
  
  componentDidMount () {
    // this.props.navigation.setParams({ onPress: this.handleSubmit });
  }

  handleSelect = user => {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelectUser(user);
  }

  handleSearchTextChange = value => {
    this.setState({ search: value }, this.searchUser());
  }

  render () {
    return (
      <View>
      
      <View style={{ position: 'absolute' }} >
        
        <View style={{ height: 48, backgroundColor: 'white', paddingLeft: 8, paddingRight: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../images/home/search.png')}
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          <TextInput
            style={{ width: '100%', fontSize: 15 }}
            placeholder="搜索用户"
            value={this.state.search}
            onChangeText={this.handleSearchTextChange}
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={{ height: 0.4, backgroundColor: "#CED0CE" }} />

      </View>

      <FlatList
        style={{ marginTop: 48.4 }}
        data={this.state.users}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item, sparators }) => <UserItem {...item} selected={this.state.selected == item.id} onSelect={this.handleSelect.bind(this, item)} />}
        overScrollMode="always"
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: '#f4f4f4' }}></View>
        )}
      />

    </View>
    );
  }
}

export default FilterUser;