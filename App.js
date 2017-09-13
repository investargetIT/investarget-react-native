import React from 'react'
import { StatusBar } from 'react-native'
import { TabNavigator, StackNavigator } from 'react-navigation'
import ProjectList from './src/components/ProjectList'
import Posts from './src/components/Posts'
import Events from './src/components/Events'
import UserCenter from './src/components/UserCenter'
import Contact from './src/components/Contact'
import AsyncStorage from './src/AsyncStorage'

AsyncStorage.setItem('source', '1')

const MainNavigator = TabNavigator({
  ProjectList: {
    screen: ProjectList,
    navigationOptions: {
      header: null,
    }
  },
  Posts: {
    screen: Posts,
    navigationOptions: {
      header: null,
    }
  },
  Events: {
    screen: Events,
    navigationOptions: {
      header: null,
    }
  },
  UserCenter: {
    screen: UserCenter,
    navigationOptions: {
      header: null,
    }
  },
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#10458f',
    inactiveTintColor: 'gray',
    style: {
      borderTopWidth: 1,
      borderTopColor: '#c0bfc4',
      backgroundColor: '#f7f7fa',
      height: 48,
      padding: 0,
      margin: 0,
    },
    showIcon: true,
    iconStyle: {
      width: 24,
      height: 24,
      padding: 0,
      margin: 0,
      marginTop: -4, // 为了让 icon 和 label 整体居中
    },
    labelStyle: {
      fontSize: 12,
      padding: 0,
      margin: 0,
    },
    indicatorStyle: {
      backgroundColor: '#10458f',
    }
  },
  animationEnabled: false,
  lazy: false,
})


const App = StackNavigator({
  Home: { screen:  MainNavigator },
  Contact: { screen: Contact },
})

// StatusBar.setTranslucent(true) // why not working ?
StatusBar.setHidden(true)

export default App

