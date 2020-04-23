import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import * as api from '../api';
import { SearchBar } from 'react-native-elements';
import _ from 'lodash';

const PAGE_SIZE = 10;

function OrgBDGroupByProjCell (props) {
  const { onPress, data, projOnPress } = props;
  const { projtitle, country, transactionType, tags, orgCount } = data;
  return (
    <TouchableHighlight underlayColor="lightgray" onPress={onPress}>
      <View style={{ backgroundColor: 'white' }}>

        <View style={{ width: '80%', alignSelf: 'center', alignItems: 'center', backgroundColor: undefined }}>
          <Text style={{ marginTop: 20, marginBottom: 20, lineHeight: 20, textAlign: 'center', fontSize: 15 }}>{projtitle}</Text>
          <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>地区：{country.country}</Text>
          {/* <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>交易类型：{transactionType.map(m => m.name).join('、')}</Text> */}
          <Text style={{ margin: 2, fontSize: 13, color: '#666', textAlign: 'center' }}>标签：{tags.map(m => m.name).join('、')}</Text>
          {/* <Text style={{ margin: 10, lineHeight: 30, color: '#10458F', backgroundColor: undefined }}>点击查看时间轴</Text> */}
        </View>

        <View style={{ margin: 10, marginTop: 10, marginBottom: 10, height: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: undefined}}>
          <Text>BD机构：{orgCount}</Text>
          <TouchableOpacity style={{ padding: 10 }} onPress={projOnPress}>
            <Text style={{ color: '#10458F' }}>项目详情</Text>
          </TouchableOpacity>
        </View>

      </View>
    </TouchableHighlight>
  );
}

class OrgBDProjList extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: '机构BD',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
    }
  }

  constructor (props) {
    super (props);
    this.state = {
      list: [],
      loading: false,
      isLoadingMore: false,
      isLoadingAll: false,
      page: 0,
    };
    this.search = '';
  }

  componentDidMount () {
    this.getData();
  }

  handleSearch = text => {
    this.search = text;
    this.getData();
  }

  getData = async isLoadingMore => {
    if (isLoadingMore === undefined) {
      this.setState({ loading: true });
    }
    // const allData = await api.getProj({ 
    //   bdm: this.props.userInfo.id, 
    //   projstatus: [4, 6, 7], 
    //   skip_count: isLoadingMore ? this.state.list.length : 0, 
    //   max_size: PAGE_SIZE,
    //   search: this.search,
    // });
    const allProj = await api.getOrgBDProj({ 
      search: this.search,
      manager: [this.props.userInfo.id],
      page_size: PAGE_SIZE,
      page_index: isLoadingMore ? this.state.page + 1 : 1,
    });

    const allData = allProj.data.filter(f => f.proj).map(m => m.proj);

    for (let index = 0; index < allData.data.length; index++) {
      const element = allData.data[index];
      const bdReq = await api.getOrgBdBase({ proj: element.id, manager: this.props.userInfo.id });
      element.orgCount = bdReq.count;
    }

    this.setState({ 
      list: isLoadingMore ? this.state.list.concat(allData.data) : allData.data, 
      loading: false, 
      isLoadingAll: allData.data.length < PAGE_SIZE,
      isLoadingMore: false,
      page: isLoadingMore ? this.state.page + 1 : 1,
    });
  }

  handleItemPressed = item => this.props.navigation.navigate('ProjectDetail', { project: item });
  
  handleProjPressed (proj) {
    this.props.navigation.navigate('OrgBDList', { proj });
  }

  separator = () => <View style={{ height: 0.5, backgroundColor: "#CED0CE", marginLeft: undefined }} />;

  loadMore = () => {
    if (this.state.isLoadingAll || this.state.isLoadingMore || this.state.list.length === 0) return;
    this.setState({ isLoadingMore: true });
    this.getData(true);
  }

  renderFooter = () => {
    if (this.state.list.length < PAGE_SIZE) return null;
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

  render () {
    return (
      <View style={{ height: '100%' }}>

        <SearchBar
          lightTheme
          containerStyle={{ backgroundColor: 'rgb(242, 242, 242)' }}
          inputStyle={{ backgroundColor: 'rgb(226, 227, 229)' }}
          onChangeText={_.debounce(this.handleSearch, 1000)}
          placeholder='根据项目名称搜索机构BD' />

        <FlatList
          data={this.state.list}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <OrgBDGroupByProjCell
            onPress={this.handleProjPressed.bind(this, item)}
            projOnPress={this.handleItemPressed.bind(this, item)}
            data={item}
          />}
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
    );
  }
}

function mapStateToProps (state) {
  const { userInfo, orgTypes } = state.app;
  return { userInfo, orgTypes };
}

export default connect(mapStateToProps)(OrgBDProjList);