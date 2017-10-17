import React from 'react';
import { 
  Image, 
  Text, 
  View, 
  StatusBar, 
  WebView, 
  Platform, 
  TouchableOpacity, 
  Alert,
  Share,
} from 'react-native';
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import * as api from '../api';
import * as WeChat from 'react-native-wechat';

class ProjectDetail extends React.Component {
    
    static navigationOptions = ({ navigation }) => {
      const { params } = navigation.state
      return { 
        title: '项目详情',
        headerStyle: {
            backgroundColor: '#10458F',
            // marginTop: Platform.OS === 'android' ? 24 : 0,
            
        },
        headerTintColor: '#fff',
        headerBackTitle: null,
        headerRight: <TouchableOpacity style={{ marginRight: 12 }} onPress={params.onPress}>
          <Image source={require('../images/share.png')} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      }
    };

    constructor(props) {
      super(props);
      this.project = props.navigation.state.params.project;
      this.id = this.project.id;
      this.title = this.project.title;
      this.state = {
        url: null,
        isFavorite: false,
        favorId: null,
      }
    }

    componentDidMount() {
      this.props.navigation.setParams({ onPress: this.handleShareIconPressed })
      api.getShareToken(this.id)
      .then(token => this.setState({ url: `http://192.168.1.113:3000/project_for_rn/${this.id}?token=${token}` }))
      .catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
      })
      
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
      const { userType } = this.props.userInfo
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
      const param = { favoritetype: 4, user: this.props.userInfo.id, projs: [this.id] }
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
    
    handleShareIconPressed = () => {
      // Share.share({
      //   message: Platform.OS === 'ios' ? this.title : `${this.title} ${this.state.url}`,
      //   url: this.state.url, // Only work on iOS
      // })
      WeChat.shareToSession({
          type: 'news', 
          title: this.title,
          description: '地区:' + this.project.country + ' 行业:' + this.project.industrys + ' 交易规模:$' + formatNumber(this.project.amount),
          webpageUrl: this.state.url,
          thumbImage: this.project.imgUrl,
        });
      // WeChat.shareToSession({
      //     type: 'imageFile', 
      //     title: this.title,
      //     description: '地区:' + this.project.country + ' 行业:' + this.project.industrys + ' 交易规模:$' + formatNumber(this.project.amount),
      //     imageUrl: '../images/home/projCollected.png',
      //   });
        
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
                  {this.props.userInfo.userType == 1 ? '感兴趣' : '推荐'}
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
  const { userInfo } = state.app
  return { userInfo }
}

function formatNumber(number) {
  const reverseStrArr = (number + "").split("").reverse()
  const arr = reverseStrArr.reduce((pre, cur) => {
      if (pre.length > 0 && pre[pre.length - 1].length < 3) {
          const maxIndexValue = pre[pre.length - 1]
          pre[pre.length - 1] = maxIndexValue + cur
      } else {
          pre.push(cur)
      }
      return pre
  }, [])
  return arr.map(m => m.split("").reverse().join("")).reverse().join(",")
}

export default connect(mapStateToProps)(ProjectDetail)
