import React from 'react';
import { Image, Text, View, StatusBar, WebView, Platform, TouchableOpacity } from 'react-native';
import * as api from '../api';

class ProjectDetail extends React.Component {
    
    static navigationOptions = {
        title: '项目详情',
        headerStyle: {
            backgroundColor: '#10458F',
            marginTop: Platform.OS === 'android' ? 24 : 0,
        },
        headerTintColor: '#fff',
        headerBackTitle: null,
    };

    constructor(props) {
      super(props);
      this.id = props.navigation.state.params.projectID;
      this.title = props.navigation.state.params.projectTitle;
      this.state = {
        url: null
      }
    }

    componentDidMount() {
      api.getShareToken(this.id)
      .then(token => this.setState({ url: `http://192.168.1.113:3000/project_for_rn/${this.id}?token=${token}` }))
    }

    handleTimelinePress() {
      this.props.navigation.navigate('Timeline', { entireTitle: this.title, id: this.id });
    }

    handleFavoritePress() {
      console.log('Favorite press')
    }

    handleSavePress() {
      console.log('save')
    }
    
    render() {
      if (!this.state.url) return null;
      return (
        <View style={{ flex: 1 }}>

          <WebView source={{ uri: this.state.url }} />

          <View style={{ height: 42, backgroundColor: '#10458F', flexDirection: 'row' }}>
            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleTimelinePress.bind(this)}>
                <Text style={{ color: 'white', fontSize: 16 }} >时间轴</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleFavoritePress}>
                <Text style={{ color: 'white', fontSize: 16 }}>感兴趣</Text>
              </TouchableOpacity>
            </View>


          </View>

          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleSavePress}>
                <Image source={require('../images/home/projNoCollect.png')} style={{ width: 42, height: 42 }} />
              </TouchableOpacity>
            </View>
        </View>
      )
    }
}

export default ProjectDetail;