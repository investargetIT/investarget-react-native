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

        <View style={{ margin: 10, marginTop: 20, marginBottom: 20, height: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: undefined }}>
          <Text>BD机构：{orgCount}</Text>
          <TouchableOpacity onPress={projOnPress}>
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
      list: [],
      loading: false,
      isLoadingMore: false,
      isLoadingAll: false,
    };
  }

  componentDidMount () {
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 1 })
      .then(result => this.setState({ fund: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 12 })
      .then(result => this.setState({ lc: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, tags: 57 })
      .then(result => this.setState({ lp: result.count }));
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
      max_size: PAGE_SIZE 
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
    this.props.navigation.navigate('MyPartnerOrg', { title, disableAdd: true, filter });
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
    <View>
      <View style={{ height: 120, flexDirection: 'row', backgroundColor: 'white' }}>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 1)} style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
            <View><Text style={{ color: '#10458F' }}>基金</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.fund}</Text></View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 12)} style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
            <View><Text style={{ color: '#10458F' }}>上市公司</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lc}</Text></View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 57)} style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
            <View><Text style={{ color: '#10458F' }}>LP</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lp}</Text></View>
          </View>
        </TouchableHighlight>
      </View>
      <View style={{ height: 5 }} />
    </View>
  );

  render () {
    return (
      <FlatList
        style={{ backgroundColor: undefined }}
        data={this.state.list}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrgBDGroupByProjCell
          onPress={this.handleProjPressed.bind(this, item)}
          projOnPress={this.handleItemPressed.bind(this, item)}
          data={item}
        />}
        ListHeaderComponent={this.renderHeader}
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
    );
  }
}

function mapStateToProps (state) {
  const { userInfo, orgTypes } = state.app;
  return { userInfo, orgTypes };
}

export default connect(mapStateToProps)(Dashboard);