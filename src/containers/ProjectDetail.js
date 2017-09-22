import React from 'react';
import { Image, Text, View, StatusBar, WebView } from 'react-native';
import * as api from '../api';

class ProjectDetail extends React.Component {
    
    static navigationOptions = {
        title: '项目详情',
        headerStyle: {
            backgroundColor: '#10458f',
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
      .then(token => this.setState({ url: `http://localhost:3000/project/${this.id}?token=${token}` }))
    }

    render() {
      if (!this.state.url) return null;
      return <WebView source={{ uri: this.state.url }} />
    }
}

export default ProjectDetail;