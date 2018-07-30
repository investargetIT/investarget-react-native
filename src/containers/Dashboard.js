import React from 'react';
import {
  Text,
  View,
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

  render () {
    return (
      <View>

        <View style={{ height: 120, flexDirection: 'row', backgroundColor: 'white' }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
            <View><Text style={{ color: '#10458F' }}>基金</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.fund}</Text></View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
            <View><Text style={{ color: '#10458F' }}>上市公司</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lc}</Text></View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined }}>
            <View><Text style={{ color: '#10458F' }}>LP</Text></View>
            <View><Text style={{ fontSize: 30, color: '#10458F' }}>{this.state.lp}</Text></View>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>

          { this.state.list.map(m => 
          <View key={m.id} style={{ padding: 10, backgroundColor: 'white', borderBottomWidth: 0.3, borderBottomColor: '#CED0CE' }}>

            <View style={{ width: '80%', alignSelf: 'center', alignItems: 'center', backgroundColor: undefined }}>
              <Text style={{ marginBottom: 20, lineHeight: 20, textAlign: 'center', fontSize: 15 }}>灵芝项目：全新靶点多肽类抗肿瘤、脑卒中创新药研发企业</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>地区：中国</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666' }}>交易类型：股权融资</Text>
              <Text style={{ margin: 2, fontSize: 13, color: '#666', textAlign: 'center' }}>标签：人工智能、大数据、互联网金融</Text>
              <Text style={{ margin: 20, lineHeight: 30, color: '#10458F', backgroundColor: undefined }}>点击查看时间轴</Text>
            </View>

            <View style={{ height: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: undefined }}>
              <Text>BD投资人：10</Text>
              <Text style={{ color: '#10458F' }}>项目详情</Text>
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