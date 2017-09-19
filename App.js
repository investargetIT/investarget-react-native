import React from 'react'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import Toast from 'react-native-root-toast'

import AsyncStorage from './src/AsyncStorage'
import rootReducer from './reducers'
import AppWithNavigationState from './AppNavigator'
import * as utils from './src/utils'
import * as api from './src/api'
import { receiveCurrentUserInfo } from './actions'

AsyncStorage.setItem('source', '1')
window.LANG = 'cn'
StatusBar.setBarStyle('light-content');
const store = createStore(rootReducer)

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
  }).catch(error => {
    Toast.show(error.message, { position: Toast.positions.CENTER })
  })
}) // 没有 userInfo 便是初次使用 App


export default () => (
  <Provider store={store}>
    <AppWithNavigationState />
  </Provider>
)
