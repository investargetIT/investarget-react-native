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
import { connect } from 'react-redux';

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
    this.searchUser = debounce(this.searchUser, 400);
  }

  handleSubmit = () => {}

  searchUser = () => {
    this.asyncFetchAllUsers().then(data => {
      const list = data.map(m => {
        const { id, username, photourl, org, email } = m;
        return {
          id,
          username,
          email,
          photoUrl: photourl,
          org: org ? org.orgname : '',
        }
      });
      this.setState({ users: list });
    }).catch(err => console.error(err));
  }
 
  asyncFetchAllUsers = async value => {
    const reqUserGroup = await api.queryUserGroup({ type: this.type || 'investor' });
    const reqUsers = await api.getUser({ search: value, groups: reqUserGroup.data.map(m => m.id), page_size: 100 });
    return reqUsers.data.filter(f => f.id !== this.props.userInfo.id);
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

function mapStateToProps (state) {
  const { userInfo } = state.app;
  return { userInfo };
}

export default connect(mapStateToProps)(FilterUser);