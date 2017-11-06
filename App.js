import React from 'react'
import { StatusBar, Platform, Alert, AppState } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import Toast from 'react-native-root-toast'
import JPushModule from 'jpush-react-native'
import { NavigationActions } from 'react-navigation'
import AsyncStorage from './src/AsyncStorage'
import rootReducer from './reducers'
import AppWithNavigationState from './AppNavigator'
import * as utils from './src/utils'
import * as api from './src/api'
import { receiveCurrentUserInfo, logout } from './actions'
import * as WeChat from 'react-native-wechat';

AsyncStorage.setItem('source', '1')
window.LANG = 'cn'
StatusBar.setBarStyle('light-content');
const store = createStore(rootReducer)

let msgReceiveTime = 0

WeChat.registerApp('wx9a404829cfaab3aa');

AsyncStorage.getItem('userInfo').then(data => {
  if (!data) { return }

  const userInfo = JSON.parse(data)
  const { username, password } = userInfo
  const param = { username, password }
  api.login(param).then(data => {
    const { token: authToken, user_info, permissions } = data
    let userInfo = utils.convertUserInfo(user_info, permissions)

    store.dispatch(receiveCurrentUserInfo(authToken, userInfo, username, password))
    userInfo = Object.assign({}, userInfo, {
        token: authToken,
        username: username,
        password: password
    })
    AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // 登录后接收推送
    JPushModule.getRegistrationID((registrationId) => {})
    if (Platform.OS == 'android') {
      JPushModule.notifyJSDidLoad((resultCode) => {
        if (resultCode === 0) {}
      });
    }
    JPushModule.setAlias(String(userInfo.id), ()=>{})
    JPushModule.addReceiveNotificationListener((map) => {
      onNotification(map.alertContent)
    })
    JPushModule.addReceiveOpenNotificationListener((message) => {
      // todo?
    })
    // iOS Only 监听：应用没有启动的状态点击推送打开应用
    JPushModule.addOpenNotificationLaunchAppListener(() => {
      // todo？
    })
  }).catch(error => {
    // Toast.show(error.message, { position: Toast.positions.CENTER })
    AsyncStorage.removeItem('userInfo')
    .then(data => {
      store.dispatch(logout());
      store.dispatch(NavigationActions.navigate({routeName: 'Login'}));
    })
  })
})

function onNotification(msg) {
  Alert.alert('通知', msg, [
    {text: '取消', onPress: () => {}},
    {text: '确定', onPress: () => {
       store.dispatch(NavigationActions.navigate({routeName: 'Notification'}))        
    }}
  ])
}

export default () => (
  <Provider store={store}>
    <AppWithNavigationState />
  </Provider>
)
