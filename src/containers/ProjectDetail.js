import React from 'react';
import { Image, Text, View, StatusBar, WebView, Platform } from 'react-native';
import * as api from '../api';

class ProjectDetail extends React.Component {
    
    static navigationOptions = {
        title: '项目详情',
        headerStyle: {
            backgroundColor: '#10458F',
            marginTop: Platform.OS === 'android' ? 24 : 0,
        },
        headerTintColor: '#fff',
    };

    constructor(props) {
      super(props);
      this.id = this.props.navigation.state.params.projectID;
      this.state = {
        url: null
      }
    }

    componentDidMount() {
      api.getShareToken(this.id)
      .then(token => this.setState({ url: `http://192.168.1.113:3000/project_for_rn/${this.id}?token=${token}` }))
    }

    render() {
      if (!this.state.url) return null;
      return <WebView source={{ uri: this.state.url }} />
    }
}

export default ProjectDetail;