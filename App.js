import React from 'react'
import { StatusBar, View } from 'react-native'
import { 
  TabNavigator, 
  StackNavigator, 
  TabRouter,
  createNavigationContainer,
  createNavigator,
  addNavigationHelpers,
} from 'react-navigation';
import ProjectList from './src/components/ProjectList'
import Posts from './src/components/Posts'
import Events from './src/components/Events'
import UserCenter from './src/components/UserCenter'
import Contact from './src/components/Contact'
import AsyncStorage from './src/AsyncStorage'
import { Provider } from 'react-redux'
import rootReducer from './reducers'
import { createStore } from 'redux'
import CustomTabBar from './src/components/CustomTabBar';

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

const CustomTabView = ({ router, navigation }) => {
  const { routes, index } = navigation.state;
  const ActiveScreen = router.getComponentForRouteName(routes[index].routeName);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 24, backgroundColor: '#10458F' }} />
      <CustomTabBar navigation={navigation} />
      <ActiveScreen
        navigation={addNavigationHelpers({
          ...navigation,
          state: routes[index],
        })}
      />
    </View>
  );
};

const CustomTabRouter = TabRouter(
  {
    project: {
      screen: ProjectList,
    },
    service: {
      screen: Posts,
    },
  }
);
const CustomTabs = createNavigationContainer(
  createNavigator(CustomTabRouter)(CustomTabView)
);

const App = StackNavigator({
  Home: { screen:  MainNavigator },
  Contact: { screen: Contact },
})

StatusBar.setBarStyle('light-content');

export default () => (
  <Provider store={createStore(rootReducer)}>
    {/* <App /> */}
    <CustomTabs />
  </Provider>
)

