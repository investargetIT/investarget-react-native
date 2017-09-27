import React from 'react';
import { Image, Text, View, StatusBar, WebView, Platform, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

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
        url: null,
        isFavorite: false,
        favorId: null,
      }
    }

    componentDidMount() {
      api.getShareToken(this.id)
      .then(token => this.setState({ url: `http://192.168.1.113:3000/project_for_rn/${this.id}?token=${token}` }))
      .catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
      })
      
      const { userId } = this.props
      const param = { favoritetype: 4, proj: this.id }
      api.getFavoriteProj(param).then(data => {
        const favorData = data.data
        const isFavorite = favorData.length == 1
        const favorId = favorData[0] && favorData[0].id
        this.setState({ isFavorite, favorId })
      }).catch(error => {
        console.log('@@@', error)
        Toast.show(error.message, {position: Toast.positions.CENTER})
      })
    }

    handleTimelinePress = () => {
      this.props.navigation.navigate('Timeline', { entireTitle: this.title, id: this.id });
    }

    handleFavoritePress = () => {
      const { userType } = this.props
      const favoritetype = userType == 1 ? 5 : 3
      this.props.navigation.navigate('SelectUser', { favoritetype, projects: [this.id] })
    }

    handleSavePress = () => {
      const { isFavorite, favorId } = this.state
      if (isFavorite) {
        this.unfavorProject(favorId)
      } else {
        this.favorProject(this.id)
      }
    }

    favorProject = (id) => {
      const { userId } = this.props
      const param = { favoritetype: 4, user: userId, projs: [this.id] }
      api.projFavorite(param).then(data => {
        const favorId = data[0].id
        this.setState({ isFavorite: true, favorId })
        Alert.alert('通知', '收藏成功', [{text: '确定', onPress: ()=>{}}])
      }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
      })
    }

    unfavorProject = (favorId) => {
      const param = { favoriteids: [favorId] }
      api.projCancelFavorite(param).then(data => {
        this.setState({ isFavorite: false, favorId: null })
        Toast.show('取消收藏成功', {position: Toast.positions.CENTER})
      }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
      })
    }
    
    render() {
      if (!this.state.url) return null;

      const imgSource = this.state.isFavorite ? require('../images/home/projCollected.png')
                                              : require('../images/home/projNoCollect.png')
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
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {this.props.userType == 1 ? '感兴趣' : '推荐'}
                </Text>
              </TouchableOpacity>
            </View>


          </View>

          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleSavePress}>
                <Image source={imgSource} style={{ width: 42, height: 42 }} />
              </TouchableOpacity>
            </View>
        </View>
      )
    }
}

function mapStateToProps(state) {
  const { userType, id } = state.app.userInfo
  return { userType, userId: id }
}

export default connect(mapStateToProps)(ProjectDetail)
