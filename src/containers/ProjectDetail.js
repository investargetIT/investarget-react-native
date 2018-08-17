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
  ActionSheetIOS,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import fs from 'react-native-fs';
import * as api from '../api';
import * as WeChat from 'react-native-wechat';
import { baseUrl, mobileUrl } from '../request';
import { isIPhoneX } from '../utils';

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
        </TouchableOpacity>,
        headerLeft: <TouchableOpacity onPress={params.goBack}>
          <Image source={require('../images/login/backButton.png')} style={{ marginLeft: 10, width: 16, height: 18 }} />
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
        showShareDialog: false,
        showShareContentDialog: false,
        sharingContent: -1,
        canGoBack: false,
      }
    }

    componentDidMount() {
      this.props.navigation.setParams({ 
        onPress: this.handleShareIconPressed,
        goBack: this.handleNavGoBack,
      });

      api.getShareToken(this.id)
      .then(token => this.setState({ url: `${mobileUrl}/project_for_rn/${this.id}?token=${token}` }))
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
    
    handleNavGoBack = () => {
      if (this.state.canGoBack) {
        this.webView.goBack();
      } else {
        this.props.navigation.goBack();
      }
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
      if (this.state.showShareDialog) {
        this.setState({ showShareDialog: false });
      } else {
        this.setState({ 
          showShareContentDialog: !this.state.showShareContentDialog 
        });
      }
    }

    shareContent(type) {
      this.setState({ 
        showShareContentDialog: false, 
        showShareDialog: true,
        sharingContent: type,
      });
    }

    handleShareToWechat = () => {
      switch (this.state.sharingContent) {
        case 0:
          WeChat.shareToSession({
            type: 'news',
            title: this.title,
            description: '地区:' + this.project.country + ' 行业:' + this.project.industrys + ' 交易规模:$' + formatNumber(this.project.amount),
            webpageUrl: this.state.url,
            thumbImage: this.project.imgUrl+'?imageView2/0/w/300/h/300',
          });
          break;
        case 1:
          let rootPath1 = fs.DocumentDirectoryPath;
          let savePath1 = rootPath1 + '/email-signature-262x100.png';
          fs.downloadFile({ fromUrl: baseUrl + '/service/getQRCode?url=' + encodeURIComponent(this.state.url) + '&acw_tk=' + this.props.userInfo.token, toFile: savePath1 }).promise
            .then(res => {
              WeChat.shareToSession({
                type: 'imageFile',
                title: this.title,
                description: 'share image file to time line',
                mediaTagName: 'email signature',
                messageAction: undefined,
                messageExt: undefined,
                imageUrl: "file://" + savePath1,
                fileExtension: '.png'
              });
            });
          break;
        case 2:
          let rootPath2 = Platform.OS === 'ios' ? fs.DocumentDirectoryPath : fs.ExternalDirectoryPath;
          let fileName = 'signature_method.pdf';
          let savePath2 = rootPath2 + '/' + fileName;
          fs.downloadFile({
            fromUrl: baseUrl + '/proj/pdf/' + this.id + '/?acw_tk=' + this.props.userInfo.token,
            toFile: savePath2
          }).promise.then(res => {
            WeChat.shareToSession({
              type: 'file',
              title: this.title + '.pdf',
              description: 'share word file to chat session',
              mediaTagName: 'pdf file',
              messageAction: undefined,
              messageExt: undefined,
              filePath: savePath2,
              fileExtension: '.pdf'
            });
          })
          break;
      }
    }

    handleShareToMoments = () => {
      switch (this.state.sharingContent) {
        case 0:
          WeChat.shareToTimeline({
            type: 'news',
            title: this.title,
            description: '地区:' + this.project.country + ' 行业:' + this.project.industrys + ' 交易规模:$' + formatNumber(this.project.amount),
            webpageUrl: this.state.url,
            thumbImage: this.project.imgUrl+'?imageView2/0/w/300/h/300',
          });
          break;
        case 1:
          let rootPath1 = fs.DocumentDirectoryPath;
          let savePath1 = rootPath1 + '/email-signature-262x100.png';
          fs.downloadFile({ fromUrl: baseUrl + '/service/getQRCode?url=' + encodeURIComponent(this.state.url) + '&acw_tk=' + this.props.userInfo.token, toFile: savePath1 }).promise
            .then(res => {
              WeChat.shareToTimeline({
                type: 'imageFile',
                title: this.title,
                description: 'share image file to time line',
                mediaTagName: 'email signature',
                messageAction: undefined,
                messageExt: undefined,
                imageUrl: "file://" + savePath1,
                fileExtension: '.png'
              });
            });
          break;
        case 2:
          let rootPath2 = Platform.OS === 'ios' ? fs.DocumentDirectoryPath : fs.ExternalDirectoryPath;
          let fileName = 'signature_method.pdf';
          let savePath2 = rootPath2 + '/' + fileName;
          fs.downloadFile({
            fromUrl: baseUrl + '/proj/pdf/' + this.id + '/?acw_tk=' + this.props.userInfo.token,
            toFile: savePath2
          }).promise.then(res => {
            WeChat.shareToTimeline({
              type: 'file',
              title: this.title + '.pdf',
              description: 'share word file to chat session',
              mediaTagName: 'pdf file',
              messageAction: undefined,
              messageExt: undefined,
              filePath: savePath2,
              fileExtension: '.pdf'
            });
          })
          break;
      }
    }

    render() {
      if (!this.state.url) return null;

      const imgSource = this.state.isFavorite ? require('../images/home/projCollected.png')
                                              : require('../images/home/projNoCollect.png')
      const uri = `${this.state.url}&userToken=${this.props.userInfo.token}&email=${encodeURIComponent(this.props.userInfo.emailAddress)}`;
      return (
        <View style={{ flex: 1 }}>

          <WebView
            ref={ref => this.webView = ref}
            onNavigationStateChange={navState => this.setState({ canGoBack: navState.canGoBack })} 
            source={{ uri }} />

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

          { isIPhoneX() ? 
              <View style={{ height:34 }} />
            : null }

          <View style={{ position: 'absolute', left: Dimensions.get('window').width / 2 - 21, bottom: isIPhoneX() ? 34 + 16 : 16 }}>
              <TouchableOpacity onPress={this.handleSavePress}>
                <Image source={imgSource} style={{ width: 42, height: 42 }} />
              </TouchableOpacity>
            </View>


          { this.state.showShareContentDialog ? 
          <TouchableWithoutFeedback onPress={() => this.setState({ showShareContentDialog: false })}>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#10458F' }}>
                <Text style={{ padding: 10, color: 'white' }} onPress={this.shareContent.bind(this, 0)}>分享项目名片</Text>
                <Text style={{ padding: 10, color: 'white' }} onPress={this.shareContent.bind(this, 1)}>分享项目二维码</Text>
                <Text style={{ padding: 10, color: 'white' }} onPress={this.shareContent.bind(this, 2)}>分享项目BP</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          : null }

          { this.state.showShareDialog ? 
          <TouchableWithoutFeedback onPress={() => this.setState({ showShareDialog: false })}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: -30, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgb(220, 220, 220)' }}>

              <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'gray' }}>分享到</Text>

              <View style={{ flexDirection: 'row', paddingTop: 20, paddingBottom: 20, justifyContent: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={this.handleShareToWechat}>
                    <Image style={{ width: 56, height: 56 }} source={require('../images/icon64_appwx_logo.png')} />
                    <Text style={{ marginTop: 6, textAlign: 'center', color: 'rgb(70, 70, 70)', fontSize: 14 }}>微信</Text>
                  </TouchableOpacity>
                </View>

                { this.state.sharingContent !== 2 ? 
                <View style={{ width: 80 }}></View>
                : null }

                { this.state.sharingContent !== 2 ? 
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={this.handleShareToMoments}>
                    <Image style={{ width: 56, height: 56 }} source={require('../images/wechat_moments.png')} />
                    <Text style={{ marginTop: 6, textAlign: 'center', color: 'rgb(70, 70, 70)', fontSize: 14 }}>朋友圈</Text>
                  </TouchableOpacity>
                </View>
                : null }

              </View>

              <Text style={{ padding: 12, textAlign: 'center', backgroundColor: 'rgb(250, 250, 250)', fontSize: 16 }}>取消</Text>
              { isIPhoneX() ? 
                <View style={{ height:34 }} />
              : null }
            </View>
            
          </View>
          </TouchableWithoutFeedback>
          
          : null }

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
