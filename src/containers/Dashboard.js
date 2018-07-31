import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
import * as api from '../api';

class Dashboard extends React.Component {

  constructor (props) {
    super (props);
    this.state = {
      fund: null,
      lc: null,
      lp: null,
      list: [],
    };
  }

  componentDidMount () {
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 1 })
      .then(result => this.setState({ fund: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 12 })
      .then(result => this.setState({ lc: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, tags: 57 })
      .then(result => this.setState({ lp: result.count }));

    api.getProj({ bdm: this.props.userInfo.id, projstatus: [4, 6, 7], page_size: 2 })
      .then(result => this.setState({ list: result.data }));
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



  render () {
    return (
      <View>

        <View style={{ height: 120, flexDirection: 'row', backgroundColor: 'white' }}>
          <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 1)} style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
              <View><Text style={{ color: '#10458F' }}>基金</Text></View>
              <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.fund}</Text></View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 12)} style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
              <View><Text style={{ color: '#10458F' }}>上市公司</Text></View>
              <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lc}</Text></View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight underlayColor="lightgray" onPress={this.handleOrgTypePressed.bind(this, 57)} style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
              <View><Text style={{ color: '#10458F' }}>LP</Text></View>
              <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lp}</Text></View>
            </View>
          </TouchableHighlight>
        </View>

        <View style={{ marginTop: 10 }}>

          { this.state.list.map(m => 
          <View key={m.id} style={{ padding: 10, backgroundColor: 'white', borderBottomWidth: 0.3, borderBottomColor: '#CED0CE' }}>

            <View style={{ width: '80%', alignSelf: 'center', alignItems: 'center', backgroundColor: undefined }}>
              <Text style={{ marginBottom: 20, lineHeight: 20, textAlign: 'center', fontSize: 15 }}>{m.projtitle}</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>地区：{m.country.country}</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>交易类型：{m.transactionType.map(m => m.name).join('、')}</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666', textAlign: 'center' }}>标签：{m.tags.map(m => m.name).join('、')}</Text>
              <Text style={{ margin: 20, lineHeight: 30, color: '#10458F', backgroundColor: undefined }}>点击查看时间轴</Text>
            </View>

            <View style={{ height: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: undefined }}>
              <Text>BD投资人：10</Text>
              <TouchableOpacity onPress={this.handleItemPressed.bind(this, m)}>
                <Text style={{ color: '#10458F' }}>项目详情</Text>
              </TouchableOpacity>
            </View>

          </View>)}

        </View>

      </View>
    );
  }
}

function mapStateToProps (state) {
  const { userInfo, orgTypes } = state.app;
  return { userInfo, orgTypes };
}

export default connect(mapStateToProps)(Dashboard);