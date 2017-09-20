import React from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import {
    TabNavigator, 
    StackNavigator, 
    TabRouter,
    createNavigationContainer,
    createNavigator,
    addNavigationHelpers,
    NavigationActions,
    DrawerNavigator,
} from 'react-navigation';

import ProjectList from './src/components/ProjectList'
import Posts from './src/components/Posts'
import Events from './src/components/Events'
import UserCenter from './src/components/UserCenter'
import Contact from './src/components/Contact'
import Login from './src/containers/Login'
import Register from './src/containers/Register'
import Register2 from './src/containers/Register2'
import RetrievePassword from './src/containers/RetrievePassword'
import MyTags from './src/containers/MyTags'
import ModifyBusinessCard from './src/containers/ModifyBusinessCard';
import ModifyPassword from './src/containers/ModifyPassword'
import Avatar from './src/containers/Avatar'

import CustomTabBar from './src/components/CustomTabBar';
import CustomDrawerContentComponent from './src/components/CustomDrawerContentComponent'
import TimelineManagement from './src/containers/TimelineManagement';
import MyFavoriteProject from './src/containers/MyFavoriteProject';




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
        navigationOptions: {
          header: null,
        }
      },
      service: {
        screen: Posts,
        navigationOptions: {
          header: null,
        }
      },
    },
    {
      initialRouteName: 'project',
    }
  );
  const CustomTabs = createNavigationContainer(
    createNavigator(CustomTabRouter)(CustomTabView)
  );
  
  const AppNavigator = StackNavigator({
    Home: { 
      screen:  CustomTabs,
      navigationOptions: ({navigation}) => ({
        title: '首页',
        headerBackTitle: null,
      }),
    },
    Contact: { screen: Contact },
    Login: { screen: Login },
    Register: { screen: Register },
    Register2: { screen: Register2 },
    RetrievePassword: {
      screen: RetrievePassword,
      navigationOptions: ({navigation}) => ({
        title: navigation.state.params ? navigation.state.params.title : '找回密码'
      })
    },
    Events: { screen: Events },
    MyTags: { screen: MyTags },
    TimelineManagement: { screen: TimelineManagement },
    ModifyBusinessCard: { screen: ModifyBusinessCard },
    ModifyPassword: { screen: ModifyPassword },
    MyFavoriteProject: { screen: MyFavoriteProject },
    Avatar: { screen: Avatar },
  })

  const DrawerApp = DrawerNavigator(
    {
      App: {
        path: '/',
        screen: AppNavigator,
      },
      MyTags: {
        screen: MyTags
      },
      TimelineManagement: {
        screen: TimelineManagement
      },
      MyFavoriteProject: {
        screen: MyFavoriteProject
      },
      ModifyPassword: {
        screen: ModifyPassword
      },
      ModifyBusinessCard: {
        screen: ModifyBusinessCard
      },
      Contact: {
        path: '/sent',
        screen: Contact,
      },
    },
    {
      initialRouteName: 'App',
      contentOptions: {
        activeTintColor: '#e91e63',
      },
      contentComponent: CustomDrawerContentComponent,
    }
  );


const App = ({dispatch, nav}) => (
  <DrawerApp navigation={addNavigationHelpers({ dispatch, state: nav })} />
)

const mapStateToProps = (state) => ({
    nav: state.nav
})

const AppWithNavigationState = connect(mapStateToProps)(App)

export default AppWithNavigationState
export { DrawerApp }