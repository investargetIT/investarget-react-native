import React from 'react'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AsyncStorage from './src/AsyncStorage'
import rootReducer from './reducers'
import AppWithNavigationState from './AppNavigator'

AsyncStorage.setItem('source', '1')
StatusBar.setBarStyle('light-content');

const store = createStore(rootReducer)

export default () => (
  <Provider store={store}>
    <AppWithNavigationState />
  </Provider>
)
