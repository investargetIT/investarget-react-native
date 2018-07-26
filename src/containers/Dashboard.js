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
      lp: null
    };
  }

  componentDidMount () {
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 1 })
      .then(result => this.setState({ fund: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, orgtypes: 12 })
      .then(result => this.setState({ lc: result.count }));
    api.getOrg({ trader: this.props.userInfo.id, tags: 57 })
      .then(result => this.setState({ lp: result.count }));
  }

  render () {
    return (
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
    );
  }
}

function mapStateToProps (state) {
  const { userInfo, orgTypes } = state.app;
  return { userInfo, orgTypes };
}

export default connect(mapStateToProps)(Dashboard);