import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {
  Platform,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Image,
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  Dimensions,
  TouchableWithoutFeedback,
  Animated
} from 'react-native'

// custom
import Styles from './Styles/MessageScreenStyle'
import {Images, Colors, Metrics} from '../Themes'
import MessageActions from '../Redux/MessageRedux'
import BaseListView from '../Components/BaseListView'
import ImagePicker from 'react-native-image-picker'
import Emoji from 'react-native-emoji'
import Swiper from 'react-native-swiper'
import WebIM from '../Lib/WebIM'
import WebIMConfig from '../Lib/WebIMConfig'
import debounce from 'lodash.debounce'
import AsyncStorage from '../../AsyncStorage'
import md5 from '../../md5'
import { isIPhoneX } from '../../utils';
const {width, height} = Dimensions.get('window')


const options = {
  title: 'Select Avatar',
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

class MessageScreen extends React.Component {

  // ------------ init -------------
  constructor(props) {
    super(props)

    console.log(props)

    this.state = {
      height: 34,
      isRefreshing: false,
      modalVisible: false,
      focused: false,
      visibleHeight: Metrics.screenHeight,
      isEmoji: false,
    }

    this.sendTxtMessage = this.sendTxtMessage.bind(this);
    this.sendImgMessage = this.sendImgMessage.bind(this);
  }

  // ------------ logic  ---------------
  updateList(props) {
    const {message, chatType, id} = props
    const chatTypeData = message[chatType] || {}
    const chatData = chatTypeData[id] || []
    this.setState({
      messages: {
        messages: chatData
      }
    });
  }

  // ------------ lifecycle ------------
  componentDidMount() {
    this.updateList(this.props)

    this.conn = new WebIM.connection({
      https: WebIMConfig.https,
      url: WebIMConfig.xmppURL,
      isAutoLogin: WebIMConfig.isAutoLogin,
      isMultiLoginSessions: WebIMConfig.isMultiLoginSessions
    });

    const RN = this;
    this.conn.listen({
      // xmpp连接成功
      onOpened: (msg) => {
        console.log('onOpened')
        // 出席后才能接受推送消息
        // WebIM.conn.setPresence();
        // // 获取好友信息
        // store.dispatch(RosterActions.getContacts())
        // // 通知登陆成功
        // store.dispatch(LoginActions.loginSuccess(msg))
        // // 获取黑名单列表
        // store.dispatch(BlacklistActions.getBlacklist())
        // // 获取群组列表
        // store.dispatch(GroupActions.getGroups())
    
        // NavigationActions.contacts()
      },
      // 出席消息
      onPresence: (msg) => {
        console.debug('onPresence', msg, store.getState())
        // switch (msg.type) {
        //   case 'subscribe':
    
    
        //     // 加好友时双向订阅过程，所以当对方同意添加好友的时候
        //     // 会有一步对方自动订阅本人的操作，这步操作是自动发起
        //     // 不需要通知提示，所以此处通过state=[resp:true]标示
        //     if (msg.status === '[resp:true]') {
        //       return
        //     }
    
        //     store.dispatch(SubscribeActions.addSubscribe(msg))
        //     break;
        //   case 'subscribed':
        //     store.dispatch(RosterActions.getContacts())
        //     Alert.alert(msg.from + ' ' + I18n.t('subscribed'))
        //     break;
        //   case 'unsubscribe':
        //     // TODO: 局部刷新
        //     store.dispatch(RosterActions.getContacts())
        //     break;
        //   case 'unsubscribed':
        //     // 好友退订消息
        //     store.dispatch(RosterActions.getContacts())
        //     Alert.alert(msg.from + ' ' + I18n.t('unsubscribed'))
        //     break;
        // }
      },
      // 各种异常
      onError: (error) => {
        console.log(error)
        // // 16: server-side close the websocket connection
        // if (error.type == WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED) {
        //   console.log('WEBIM_CONNCTION_DISCONNECTED', WebIM.conn.autoReconnectNumTotal, WebIM.conn.autoReconnectNumMax);
        //   if (WebIM.conn.autoReconnectNumTotal < WebIM.conn.autoReconnectNumMax) {
        //     return;
        //   }
        //   Alert.alert('Error', 'server-side close the websocket connection')
        //   NavigationActions.login()
        //   return;
        // }
        // // 8: offline by multi login
        // if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_ERROR) {
        //   console.log('WEBIM_CONNCTION_SERVER_ERROR');
        //   Alert.alert('Error', 'offline by multi login')
        //   NavigationActions.login()
        //   return;
        // }
        // if (error.type == 1) {
        //   let data = error.data ? error.data.data : ''
        //   data && Alert.alert('Error', data)
        //   store.dispatch(LoginActions.loginFailure(error))
        // }
      },
      // 连接断开
      onClosed: (msg) => {
        console.log('onClosed')
      },
      // 更新黑名单
      onBlacklistUpdate: (list) => {
        // store.dispatch(BlacklistActions.updateBlacklist(list))
      },
      // 文本信息
      onTextMessage: (message) => {
        RN.props.addMessage(message, 'txt');
      },
      onPictureMessage: (message) => {
        console.log('onPictureMessage', message)
        // store.dispatch(MessageActions.addMessage(message, 'img'))
        RN.props.addMessage(message, 'img');
      }
    })

    AsyncStorage.getItem('userInfo')
    .then(userInfoStr => {
      const userInfo = JSON.parse(userInfoStr);
      console.log('getUserInfo', userInfo);
      var options = {
        apiUrl: WebIMConfig.apiURL,
        user: '' + userInfo.id,
        pwd: md5('' + userInfo.id),
        appKey: WebIMConfig.appkey,
        success: function (token) {
          console.log('loginSuccess', token)
          var accessToken = token.access_token;
          // localStorage.setItem('easemob_access_token', accessToken)
        }
      };
      this.conn.open(options);
    })


  }

  componentWillReceiveProps(nextProps) {
    this.updateList(nextProps)
  }

  componentWillMount() {
    // Using keyboardWillShow/Hide looks 1,000 times better, but doesn't work on Android
    // TODO: Revisit this if Android begins to support - https://github.com/facebook/react-native/issues/3468
    if (Platform.OS == 'ios') {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow)
      this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide)
    } else {
      //this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
      //this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = (e) => {
    // Animation chatTypes easeInEaseOut/linear/spring
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    let newSize = Metrics.screenHeight - e.endCoordinates.height
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      visibleHeight: newSize,
    })
  }

  keyboardDidHide = (e) => {
    // Animation chatTypes easeInEaseOut/linear/spring
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      keyboardHeight: 0,
      visibleHeight: Metrics.screenHeight,
    })
  }
  // ------------ handlers -------------
  handleRefresh() {
    this.setState({isRefreshing: true})
    // this.props.getContacts()
    // TODO: 刷新成功/刷新失败
    setTimeout(() => {
      this.setState({isRefreshing: false})
    }, 1000)
  }

  handleFocusSearch() {
    this.setState({
      focused: true,
      isEmoji: false,
    })

  }

  handleBlurSearch() {
    this.setState({focused: false})
  }

  handleSend() {
    if (!this.state.value || !this.state.value.trim()) return
    this.sendTxtMessage(this.props.chatType, this.props.id, {
      msg: this.state.value.trim()
    })
    this.setState({
      value: '',
      height: 34
    })
  }

  sendTxtMessage(chatType, chatId, message = {}) {

    const msgTpl = {
      base: {
        error: false,
        errorCode: '',
        errorText: '',
        // status 为空将被当做服务端的数据处理，处理成sent
        status: 'sending', // [sending, sent ,fail, read]
        id: '',
        // from 不能删除，决定了房间id
        from: '',
        to: '',
        toJid: '',
        time: '',
        type: '', // chat / groupchat
        body: {},
        ext: {},
        bySelf: false,
      },
      txt: {
        type: 'txt',
        msg: ''
      },
      img: {
        type: 'img',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
      }
    }

    function copy(message, tpl) {
      let obj = {}
      Object.keys(tpl).forEach((v) => {
        obj[v] = message[v] || tpl[v]
      })
      return obj
    }

    function parseFromLocal(type, to, message = {}, bodyType) {
      let ext = message.ext || {}
      let obj = copy(message, msgTpl.base)
      let body = copy(message, msgTpl[bodyType])
      return {
        ...obj,
        type,
        to,
        id: WebIM.conn.getUniqueId(),
        body: {
          ...body, ...ext, type: bodyType
        }
      }
    }
  
    const pMessage = parseFromLocal(chatType, chatId, message, 'txt')
    const {body, id, to} =  pMessage
    const {type, msg} = body
    const msgObj = new WebIM.message(type, id);
    msgObj.set({
      //TODO: cate type == 'chatrooms'
      msg, to, roomType: false,
      success: function () {
        // dispatch(Creators.updateMessageStatus(pMessage, 'sent'))
        console.log('success');
      },
      fail: function (e) {
        dispatch(Creators.updateMessageStatus(pMessage, 'fail'))
        console.log('failure', e);
      }
    });

    // TODO: 群组聊天需要梳理此参数的逻辑
    // if (type !== 'chat') {
    //   msgObj.setGroup('groupchat');
    // }
    console.log('ready to send msg: ' + msgObj);
    this.conn.send(msgObj.body);
    this.props.addMessage(pMessage, chatType);
  }

  sendImgMessage(chatType, chatId, message = {}, source = {}) {
    const msgTpl = {
      base: {
        error: false,
        errorCode: '',
        errorText: '',
        // status 为空将被当做服务端的数据处理，处理成sent
        status: 'sending', // [sending, sent ,fail, read]
        id: '',
        // from 不能删除，决定了房间id
        from: '',
        to: '',
        toJid: '',
        time: '',
        type: '', // chat / groupchat
        body: {},
        ext: {},
        bySelf: false,
      },
      txt: {
        type: 'txt',
        msg: ''
      },
      img: {
        type: 'img',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
      }
    }

    function copy(message, tpl) {
      let obj = {}
      Object.keys(tpl).forEach((v) => {
        obj[v] = message[v] || tpl[v]
      })
      return obj
    }

    function parseFromLocal(type, to, message = {}, bodyType) {
      let ext = message.ext || {}
      let obj = copy(message, msgTpl.base)
      let body = copy(message, msgTpl[bodyType])
      return {
        ...obj,
        type,
        to,
        id: WebIM.conn.getUniqueId(),
        body: {
          ...body, ...ext, type: bodyType
        }
      }
    }

    let pMessage = null
    const id = WebIM.conn.getUniqueId()
    const type = 'img'
    const to = chatId
    const msgObj = new WebIM.message(type, id);
    msgObj.set({
      apiUrl: WebIM.config.apiURL,
      ext: {
        file_length: source.fileSize,
        filename: source.fileName || '',
        filetype: source.fileName && (source.fileName.split('.')).pop(),
        width: source.width,
        height: source.height,
      },
      file: {
        data: {
          uri: source.uri, type: 'application/octet-stream', name: source.fileName
        }
      },
      to, roomType: '',
      onFileUploadError: function (error) {
        console.log(error)
        // dispatch(Creators.updateMessageStatus(pMessage, 'fail'))
      },
      onFileUploadComplete: function (data) {
        console.log(data)
        url = data.uri + '/' + data.entities[0].uuid;
        // dispatch(Creators.updateMessageStatus(pMessage, 'sent'))
      },
      success: function (id) {
        console.log(id)
      },
    });

    this.conn.send(msgObj.body);
    pMessage = parseFromLocal(chatType, chatId, msgObj.body, 'img')
    // uri只记录在本地
    pMessage.body.uri = source.uri
    // console.log('pMessage', pMessage, pMessage.body.uri)
    this.props.addMessage(pMessage, type);
  }
  

  handleChangeText(v) {
    // 场景1：正常+ -
    // 场景2：从中间位置+ - -> 如果删除一个字符后字符串匹配，则非中间位置
    // 场景3：删除操作可以从textInput直接编辑，适应于以上情况
    // 场景5：从emoji的删除按钮删除，则从末尾位置编辑
    // 场景6：点击外部区域隐藏emoji框
    const splitValue = this.state.value ? this.state.value.split('') : []
    splitValue.pop()
    if (v == splitValue.join('')) {
      this.handleEmojiCancel()
    }
  }

  handleImagePicker() {
    this.setState({
      isEmoji: false
    })
    ImagePicker.launchImageLibrary(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        }
        else {
          // You can display the image using either data...
          //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

          // or a reference to the platform specific asset location
          let source = null;
          if (Platform.OS === 'ios') {
            source = {uri: response.uri.replace('file://', ''), isStatic: true};
          } else {
            source = {uri: response.uri, isStatic: true};
          }

          response.uri = source.uri
          const {chatType, id} = this.props
          this.sendImgMessage(chatType, id, {}, response)
        }
      }
    )
    ;
  }

  handleCameraPicker() {
    this.setState({
      isEmoji: false
    })
    // Launch Camera:
    ImagePicker.launchCamera(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        // You can display the image using either data...
        //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        // or a reference to the platform specific asset location
        let source = null;
        if (Platform.OS === 'ios') {
          source = {uri: response.uri.replace('file://', ''), isStatic: true};
        } else {
          source = {uri: response.uri, isStatic: true};
        }

        response.uri = source.uri
        const {chatType, id} = this.props
        this.props.sendImgMessage(chatType, id, {}, response)
      }
    });
  }

  handleEmojiOpen() {
    this.setState({
      isEmoji: !this.state.isEmoji
    })

    this.refs.search.blur()
  }

  handleEmojiClick(v) {
    this.setState({
      value: (this.state.value || '') + v
    })
  }

  handleEmojiCancel() {
    if (!this.state.value) return
    const arr = this.state.value.split('')
    const len = arr.length
    let newValue = ''

    if (arr[len - 1] != ']') {
      arr.pop()
      newValue = arr.join('')
    } else {
      const index = arr.lastIndexOf('[')
      newValue = arr.splice(0, index).join('')
    }

    this.setState({
      value: newValue
    })
  }


// ------------ renders -------------
  _renderRow(rowId, sectionId, rowID, highlightRow) {
    const {message} = this.props
    const rowData = message.byId[rowId] || {}
    if (rowData.bySelf) {
      return this._renderRightRow(rowData)
    } else {
      return this._renderLeftRow(rowData)
    }
  }

  _renderRightRow(rowData) {
    const chatType = rowData.body.type || ''
    const obj = {
      txt: this._renderRightTxt.bind(this),
      img: this._renderRightImg.bind(this),
    }
    return typeof
      obj[chatType] == 'function' ? (obj[chatType](rowData)) : null
  }

  _renderRightTxt(rowData = {}) {
    return (
      <View style={[Styles.row, Styles.directionEnd]}>
        <Image source={Images.default} resizeMode='cover' style={[Styles.rowLogo, Styles.rowLogoRight]}/>
        <View style={Styles.rowMessage}>
          {/*<Text style={[Styles.nameText, Styles.textRight]}>{rowData.from}</Text>*/}
          <View style={[Styles.message, Styles.messageRight]}>
            <Text style={[Styles.messageText, Styles.messageTextRight]}>{this._renderTxt(rowData.body.msg || '')}</Text>
          </View>
          <Text style={[Styles.timeText, Styles.textRight]}>{this._renderDate(rowData.time)}</Text>
        </View>
      </View>
    )
  }

  _renderRightImg(rowData = {}) {
    const {body} = rowData
    const maxWidth = 250
    let width = Math.min(maxWidth, body.width)
    let height = body.height * width / body.width
    const loading = rowData.status == 'sending' ? (
        <ActivityIndicator style={{margin: 5}}/>
      ) : null

    return (
      <View style={[Styles.row, Styles.directionEnd]}>
        <Image source={Images.default} resizeMode='cover' style={[Styles.rowLogo, Styles.rowLogoRight]}/>
        <View style={Styles.rowMessage}>
          {/*<Text style={[Styles.nameText, Styles.textRight]}>{rowData.from}</Text>*/}
          <View style={[Styles.message, Styles.messageRight, Styles.messageImage]}>
            <Image source={{uri: body.uri || body.url}}
                   style={[Styles.rowImage, {width, height}]}/>
          </View>
          <Text style={[Styles.timeText, Styles.textRight]}>{this._renderDate(rowData.time)}</Text>
        </View>
        {loading}
      </View>
    )
  }

  _renderLeftRow(rowData) {
    const chatType = rowData.body.type || ''
    const obj = {
      txt: this._renderLeftTxt.bind(this),
      img: this._renderLeftImg.bind(this),
    }
    return typeof
      obj[chatType] == 'function' ? (obj[chatType](rowData)) : null
  }

  _renderLeftTxt(rowData = {}) {
    return (
      <View style={Styles.row}>
        <Image source={Images.default} resizeMode='cover' style={Styles.rowLogo}/>
        <View style={Styles.rowMessage}>
          <Text style={Styles.nameText}>{rowData.from}</Text>
          <View style={Styles.message}>
            <Text style={Styles.messageText}>{this._renderTxt(rowData.body.msg || '')}</Text>
          </View>
          <Text style={Styles.timeText}>{this._renderDate(rowData.time)}</Text>
        </View>
      </View>
    )
  }

  _renderLeftImg(rowData = {}) {
    const {body} = rowData
    const maxWidth = 250
    let width = Math.min(maxWidth, body.width)
    let height = body.height * width / body.width
    const loading = rowData.status == 'sending' ? (
        <ActivityIndicator style={{margin: 5}}/>
      ) : null
      
    return (
      <View style={Styles.row}>
        <Image source={Images.default} resizeMode='cover' style={Styles.rowLogo}/>
        <View style={Styles.rowMessage}>
          <Text style={Styles.nameText}>{rowData.from}</Text>
          <View style={[Styles.message, Styles.messageImage]}>
            <Image source={{uri: body.uri || body.url}}
            style={[Styles.rowImage, {width, height}]}/>
          </View>
          <Text style={Styles.timeText}>{this._renderDate(rowData.time)}</Text>
        </View>
        {loading}
      </View>
    )
  }

  _renderDate(time) {
    // I18n.locale.substr(0, 2)
    // .toLocaleString('zh-Hans-CN', {hour12: false, })
    const d = new Date(time)
    return `${d.getMonth() + 1}-${d.getDay() > 9 ? d.getDay() : '0' + d.getDay()  } ${d.getHours()}:${d.getMinutes()}`
  }

  _renderSendButton() {
    const {focused} = this.state

    return (
        <TouchableOpacity style={Styles.searchExtra} onPress={this.handleSend.bind(this)}>
          <Text style={Styles.sendText}>发送</Text>
        </TouchableOpacity>
      ) 
  }

  _renderTxt(txt) {
    const emoji = WebIM.emoji

    // 替换不能直接用replace，必须以数组组合的方式，因为混合着dom元素
    let rnTxt = []
    let match = null
    const regex = /(\[.*?\])/g
    let start = 0
    let index = 0
    while (match = regex.exec(txt)) {
      index = match.index
      if (index > start) {
        rnTxt.push(txt.substring(start, index))
      }
      if (match[1] in emoji.map) {
        rnTxt.push((
          <Emoji style={{marginBottom: 3}} key={`emoji-${index}-${match[1]}`} name={emoji.map[match[1]]}/>
        ))
      } else {
        rnTxt.push(match[1])
      }
      start = index + match[1].length
    }
    rnTxt.push(txt.substring(start, txt.length))

    return rnTxt
  }

  _renderEmoji() {
    const {isEmoji, focused} = this.state
    const emoji = WebIM.emoji
    const emojiStyle = []
    const rowIconNum = 7
    const rowNum = 3
    const emojis = Object.keys(emoji.map).map((v, k) => {
      const name = emoji.map[v]
      return (
        <TouchableOpacity key={v + k} onPress={() => {
          this.handleEmojiClick(v)
        }}>
          <Text style={[Styles.emoji, emojiStyle]}><Emoji name={name}/></Text>
        </TouchableOpacity>
      )
    })
    return isEmoji ? (
        <View style={Styles.emojiRow}>
          <Swiper style={Styles.wrapper} loop={false}
                  height={125}
                  dotStyle={ {bottom: -30} }
                  activeDotStyle={ {bottom: -30} }
          >
            <View style={Styles.slide}>
              <View style={Styles.slideRow}>
                {emojis.slice(0, rowIconNum)}
              </View>
              <View style={Styles.slideRow}>
                {emojis.slice(1 * rowIconNum, rowIconNum * 2)}
              </View>
              <View style={Styles.slideRow}>
                {emojis.slice(2 * rowIconNum, rowIconNum * 3 - 1)}
                <TouchableOpacity onPress={this.handleEmojiCancel.bind(this)}>
                  <Text style={[Styles.emoji, emojiStyle]}><Emoji name="arrow_left"/></Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={Styles.slide}>
              <View style={Styles.slideRow}>
                {emojis.slice(3 * rowIconNum - 1, rowIconNum * 4 - 1)}
              </View>
              <View style={Styles.slideRow}>
                {emojis.slice(4 * rowIconNum - 1, rowIconNum * 5 - 1)}
              </View>
              <View style={Styles.slideRow}>
                {emojis.slice(5 * rowIconNum - 1, rowIconNum * 6 - 1)}
                <TouchableOpacity>
                  <Text style={[Styles.emoji, emojiStyle]}><Emoji name="arrow_left"/></Text>
                </TouchableOpacity>
              </View>
            </View>
          </Swiper>
          <View style={Styles.sendRow}>
            <TouchableOpacity style={Styles.send} onPress={this.handleSend.bind(this)}>
              <Text style={Styles.sendText}>发送</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null
  }

  _renderMessageBar() {
    const {value = '', isEmoji} = this.state

    return (
      <View style={Styles.search}>
        <View style={Styles.inputRow}>
          <View style={Styles.searchRow}>
            <TextInput
              ref="search"
              style={[Styles.searchInput, {height: Math.min(Math.max(this.state.height, 34), 100)}]}
              value={value}
              editable={true}
              keyboardType='default'
              returnKeyType='default'
              autoCapitalize='none'
              autoCorrect={false}
              multiline={true}
              onChange={(event) => {
                this.setState({
                  value: event.nativeEvent.text,
                  // 5 for paddingf
                });
              }}
              onContentSizeChange={event => this.setState({height: event.nativeEvent.contentSize.height + 5})}
              onFocus={this.handleFocusSearch.bind(this)}
              onBlur={this.handleBlurSearch.bind(this)}
              onChangeText={this.handleChangeText.bind(this)}
              onEndEditing={() => {
              }}
              onLayout={() => {
              }}
              underlineColorAndroid='transparent'
              onSubmitEditing={() => this.refs.search.focus()}
              placeholder="发送消息"
            />
          </View>
          {this._renderSendButton()}
        </View>
        <View style={Styles.iconRow}>
          <TouchableOpacity style={Styles.iconTouch} onPress={debounce(this.handleCameraPicker.bind(this), 2000, {
            'leading': true,
            'trailing': false
          })}>
            <Image source={Images.iconCamera}/>
          </TouchableOpacity>
          <TouchableOpacity style={Styles.iconTouch} onPress={debounce(this.handleImagePicker.bind(this), 2000, {
            'leading': true,
            'trailing': false
          })}>
            <Image source={Images.iconImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={Styles.iconTouch} onPress={this.handleEmojiOpen.bind(this)}>
            {
              isEmoji ? <Image source={Images.iconEmojiActive}/> : <Image source={Images.iconEmoji}/>
            }
          </TouchableOpacity>
          {/*<TouchableOpacity>*/}
          {/*<Image source={Images.iconAudio}/>*/}
          {/*</TouchableOpacity>*/}
          {/*<TouchableOpacity>*/}
          {/*<Image source={Images.iconLocation}/>*/}
          {/*</TouchableOpacity>*/}
          {/*<TouchableOpacity>*/}
          {/*<Image source={Images.iconFile}/>*/}
          {/*</TouchableOpacity>*/}
        </View>
        {this._renderEmoji()}
        { isIPhoneX() ? 
              <View style={{ height:34 }} />
            : null }
      </View>
    )
  }

// ------------ render -------------
  render() {
    const {messages = {}, visibleHeight, keyboardHeight} = this.state
    return (
      <View style={[Styles.container, {flex: 1, flexDirection: 'column'}]}>
        <BaseListView
          autoScroll={true}
          data={messages}
          handleRefresh={this.handleRefresh.bind(this)}
          renderRow={this._renderRow.bind(this)}
          renderSeparator={() => null}
        />
        {this._renderMessageBar()}
        <View style={{height: keyboardHeight}}/>
      </View>
    )

    // <View style={{height: keyboardHeight, borderWidth: 1, borderColor: 'black'}}></View>
  }
}

MessageScreen.propTypes = {
  message: PropTypes.object,
  // chatType: PropTypes.oneOf(['chat', 'groupChat']),
  // id: PropTypes.string
}

// ------------ redux -------------
const mapStateToProps = (state) => {
  console.log('state', state);
  return {
    // TODO: 如何过滤无用的请求 、普通聊天和群里拆离 or 判断props？
    message: state.easemob,
    // chatType: 'chat',
    // id: 'lwz3'
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addMessage: (message, chatType) => dispatch({ type: 'addMessage', message, bodyType: chatType}),
    sendImgMessage: (chatType, id, message, source) => dispatch(MessageActions.sendImgMessage(chatType, id, message, source))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageScreen)