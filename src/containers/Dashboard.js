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
          <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>交易类型：{transactionType.map(m => m.name).join('、')}</Text>
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

class Dashboard extends React.Component {

  constructor (props) {
    super (props);
    this.state = {
      fund: null,
      lc: null,
      lp: null,
      total: null,
      list: [],
      loading: false,
      isLoadingMore: false,
      isLoadingAll: false,
    };
    this.search = '';
  }

  componentDidMount () {
    api.getOrg({ trader: this.props.userInfo.id })
      .then(result => this.setState({ total: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 1 })
      .then(result => this.setState({ fund: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 12 })
      .then(result => this.setState({ lc: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, tags: 57 })
      .then(result => this.setState({ lp: result.count }));
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
    const allData = await api.getProj({ 
      bdm: this.props.userInfo.id, 
      projstatus: [4, 6, 7], 
      skip_count: isLoadingMore ? this.state.list.length : 0, 
      max_size: PAGE_SIZE,
      search: this.search,
    });

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
    });
  }

  handleItemPressed = item => this.props.navigation.navigate('ProjectDetail', { project: item });
  
  handleOrgTypePressed (type) {
    let title, filter;
    switch (type) {
      case 1:
        title = '基金';
        filter = [{type: 'orgTypes', value: 1}];
        break;
      case 12:
        title = '上市公司';
        filter = [{type: 'orgTypes', value: 12}];
        break;
      case 57:
        title = 'LP';
        filter = [{type: 'tag', value: 57}];
    }
    this.props.navigation.navigate('OrgBDProjList', { title, disableAdd: true, filter });
  }

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

  renderHeader = () => (
    <View style={{ backgroundColor: 'white' }}>
      <Text style={{ marginTop: 20, backgroundColor: undefined, textAlign: 'center', fontSize: 17 }}>我的资源库共有：<Text style={{ fontSize: 30, fontFamily: 'DIN Condensed' }}>{this.state.total}</Text> 家机构，其中</Text>

      <View style={{ height: 130, flexDirection: 'row' }}>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 1)} style={{ flex: 1, margin: 10, borderRadius: 8, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: undefined, backgroundColor: undefined }}>
            <View style={{ flexBasis: 44, justifyContent: 'center', backgroundColor: undefined }}><Text style={{ color: '#999' }}>基金</Text></View>
            <View><Text style={{ fontSize: 50, color: 'rgb(48, 148, 224)', fontWeight: '700', fontFamily: 'DIN Condensed' }}>{this.state.fund}</Text></View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 12)} style={{ flex: 1, marginTop: 10, marginBottom: 10, borderRadius: 8, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: undefined, backgroundColor: undefined }}>
            <View style={{ flexBasis: 44, justifyContent: 'center', backgroundColor: undefined }}><Text style={{ color: '#999' }}>上市公司</Text></View>
            <View><Text style={{ fontSize: 50, color: 'rgb(48, 148, 224)', fontWeight: '700', fontFamily: 'DIN Condensed' }}>{this.state.lc}</Text></View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 57)} style={{ flex: 1, margin: 10, borderRadius: 8, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: undefined, backgroundColor: undefined }}>
            <View style={{ flexBasis: 44, justifyContent: 'center', backgroundColor: undefined }}><Text style={{ color: '#999' }}>LP</Text></View>
            <View><Text style={{ fontSize: 50, color: 'rgb(48, 148, 224)', fontWeight: '700', fontFamily: 'DIN Condensed' }}>{this.state.lp}</Text></View>
          </View>
        </TouchableHighlight>
      </View>

      <Text style={{ marginRight: 10, marginBottom: 10, textAlign: 'right', color: '#999' }}>其他：{this.state.total-this.state.fund-this.state.lc-this.state.lp}</Text>
      <Text style={{ backgroundColor: undefined, textAlign: 'center', fontSize: 17 }}>BD统计</Text>

      <View style={{ height: 130, flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 1)} style={{ flexBasis: 116, margin: 10, borderRadius: 8, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: undefined, backgroundColor: undefined }}>
            <View style={{ flexBasis: 44, justifyContent: 'center', backgroundColor: undefined }}><Text style={{ color: '#999' }}>机构BD</Text></View>
            <View><Text style={{ fontSize: 50, color: 'rgb(48, 148, 224)', fontWeight: '700', fontFamily: 'DIN Condensed' }}>{this.state.fund}</Text></View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 57)} style={{ flexBasis: 116, margin: 10, borderRadius: 8, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: undefined, backgroundColor: undefined }}>
            <View style={{ flexBasis: 44, justifyContent: 'center', backgroundColor: undefined }}><Text style={{ color: '#999' }}>项目BD</Text></View>
            <View><Text style={{ fontSize: 50, color: 'rgb(48, 148, 224)', fontWeight: '700', fontFamily: 'DIN Condensed' }}>{this.state.lp}</Text></View>
          </View>
        </TouchableHighlight>
      </View>

      <Text style={{ marginTop: 10, paddingLeft: 10, fontSize: 13, color: '#999', backgroundColor: 'rgb(242, 242, 242)', lineHeight: 32 }}>新增机构BD</Text>
    </View>
  );

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
          ListHeaderComponent={this.search ? null : this.renderHeader}
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

export default connect(mapStateToProps)(Dashboard);