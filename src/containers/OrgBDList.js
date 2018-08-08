import React from 'react';
import {
  FlatList,
  TouchableHighlight,
  View,
  Text,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as api from '../api';
import { connect } from 'react-redux';
import { SearchBar } from 'react-native-elements';
import _ from 'lodash';

function MyPartnerOrgCell (props) {
  const { org, count, data } = props.data;
  return (
    <TouchableHighlight onPress={props.onPress} underlayColor={'lightgray'}>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 16, color: 'black' }}>{org} ({count})</Text>
        <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 14, marginTop: 4, color: 'grey' }}>{data.map(m => m.username || '暂无').join(', ')}</Text>
      </View>
    </TouchableHighlight>
  )
}

class OrgBDList extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params.title,
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
    }
  }

  constructor (props) {
    super (props);

    const { params } = props.navigation.state;
    this.proj = params.proj;

    this.search = '';

    this.state = {
      data: [],
      loading: false,
      isLoadingAll: false,
      isLoadingMore: false,
      page: 0,
    }
  }

  componentWillMount () {
    this.props.navigation.setParams({ title: this.proj.projtitle });
  }

  componentDidMount () {
    this.getData();
  }

  getData = async isLoadingMore => {
    if (isLoadingMore === undefined) {
      this.setState({ loading: true });
    }

    let org = [];
    if (this.search) {
      const reqOrg = await api.getOrg({ search: this.search, issub: false, page_size: 100, proj: this.proj.id });
      org = reqOrg.data.map(m => m.id);
    }

    const basicData = await api.getOrgBdBase({ proj: this.proj.id, manager: [this.props.userInfo.id], page_index: isLoadingMore ?  this.state.page + 1 : 1, org });
    const allData = await Promise.all(basicData.data.map(m => api.getOrgBdList({ proj: m.proj, org: m.org, manager: [this.props.userInfo.id] })));
    allData.forEach(function(element) {
      element['id'] = element.data[0].org.id;
      element['org'] = element.data[0].org.orgname;
    }, this);
    this.setState({ 
      data: isLoadingMore ? this.state.data.concat(allData) : allData, 
      loading: false, 
      isLoadingAll: allData.length < 10,
      page: isLoadingMore ? this.state.page + 1 : 1,
      isLoadingMore: false,
    });
  }

  separator = () => <View style={{ height: 0.3, backgroundColor: "#CED0CE", marginLeft: 10 }} />;

  handleItemPressed (item) {
    this.props.navigation.navigate('OrganizationBD', { org: item.data[0].org });
  }

  loadMore = () => {
    if (this.state.isLoadingAll || this.state.isLoadingMore || this.state.data.length === 0) return;
    this.setState({ isLoadingMore: true });
    this.getData(true);
  }

  renderFooter = () => {
    if (this.state.data.length < 10) return null;
    if (this.state.isLoadingAll) return (
      <Text style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'gray' }}>---没有更多了---</Text>
    );

    return (
      <View
        style={{
          paddingVertical: 20,
          borderColor: "#CED0CE"
        }}>
        <ActivityIndicator animating size="small" />
      </View>
    );
  };

  handleSearch = text => {
    this.search = text;
    this.getData();
  }

  render () {
    return (
      <View style={{ height: '100%' }}>

        <SearchBar
          lightTheme
          containerStyle={{ backgroundColor: 'rgb(242, 242, 242)' }}
          inputStyle={{ backgroundColor: 'rgb(226, 227, 229)' }}
          onChangeText={_.debounce(this.handleSearch, 1000)}
          placeholder='根据机构名称搜索机构BD' />

        <FlatList
          style={{ backgroundColor: 'white' }}
          data={this.state.data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MyPartnerOrgCell data={item} onPress={this.handleItemPressed.bind(this, item)} />}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.getData}
              colors={['#10458f']}
              tintColor="#10458f"
            />
          }
          ItemSeparatorComponent={this.separator}
          onEndReachedThreshold={0.01}
          onEndReached={this.loadMore}
          ListFooterComponent={this.renderFooter}
          ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
            <Image style={{ width: 100, height: 86 }} source={require('../images/emptyBox.png')} />
          </View>}
        />

      </View>
    )
  }
}

function mapStateToProps (state) {
  const { userInfo, myInvestorRefresh,trueOrgFilter } = state.app;
  return { userInfo, myInvestorRefresh,trueOrgFilter };
}

export default connect(mapStateToProps)(OrgBDList);