import React from 'react'
import { View, Platform } from 'react-native'
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
import Spinner from 'react-native-loading-spinner-overlay';
import ProjectList from './src/components/ProjectList'
import Posts from './src/components/Posts'
import Events from './src/components/Events'
import UserCenter from './src/components/UserCenter'
import Contact from './src/components/Contact'
import Login from './src/containers/Login'
import Register from './src/containers/Register'
import Agreement from './src/containers/Agreement'
import Register2 from './src/containers/Register2'
import RetrievePassword from './src/containers/RetrievePassword'
import MyTags from './src/containers/MyTags'
import ModifyBusinessCard from './src/containers/ModifyBusinessCard';
import ModifyPassword from './src/containers/ModifyPassword'
import Avatar from './src/containers/Avatar'
import Service from './src/containers/Service'
import Notification from './src/containers/Notification'
import EditTimeline from './src/containers/EditTimeline'
import ProjectDetail from './src/containers/ProjectDetail';
import UserInfo from './src/containers/UserInfo'
import OrganizationInfo from './src/containers/OrganizationInfo'
import MyPartner from './src/containers/MyPartner'
import Chat from './src/containers/Chat'
import SelectUser from './src/components/SelectUser'
import Filter from './src/containers/Filter'
import AddInvestor from './src/containers/AddInvestor'
import MyCalendar from './src/containers/MyCalendar';
import CustomTabBar from './src/components/CustomTabBar';
import CustomDrawerContentComponent from './src/components/CustomDrawerContentComponent'
import TimelineManagement from './src/containers/TimelineManagement';
import MyFavoriteProject from './src/containers/MyFavoriteProject';
import Timeline from './src/containers/Timeline';
import LatestRemark from './src/containers/LatestRemark';
import MyPartnerOrg from './src/containers/MyPartnerOrg';
import AddSchedule from './src/containers/AddSchedule';
import SelectProject from './src/containers/SelectProject';
import SearchUser from './src/containers/SearchUser';
import EditSchedule from './src/containers/EditSchedule';



const CustomTabView = ({ router, navigation, isFetching }) => {
    const { routes, index } = navigation.state;
    const ActiveScreen = router.getComponentForRouteName(routes[index].routeName);
    return (
      <View style={{ flex: 1 }}>
        { Platform.OS === 'ios' ? 
        <View style={{ height: 24, backgroundColor: '#10458F' }} />
        : null }
        <Spinner visible={isFetching} />
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
  function mapStateToProps1(state) {
    const { isFetching } = state.app;
    return { isFetching };
  }

  const CustomTabRouter = TabRouter(
    {
      project: {
        screen: ProjectList,
        navigationOptions: {
          header: null,
        }
      },
      service: {
        screen: Service,
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
    createNavigator(CustomTabRouter)(connect(mapStateToProps1)(CustomTabView))
  );
  
  const AppNavigator = StackNavigator({
    Home: { 
      screen:  CustomTabs,
      navigationOptions: ({navigation}) => ({
        title: '首页',
        headerBackTitle: null,
        headerTintColor: '#fff',
      }),
    },
    Contact: { screen: Contact },
    Login: { screen: Login },
    Register: { screen: Register },
    Agreement: { screen: Agreement },
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
    Service: { screen: Service },
    Notification: { screen: Notification },
    EditTimeline: { screen: EditTimeline },
    ProjectDetail: { screen: ProjectDetail },
    UserInfo: { screen: UserInfo },
    OrganizationInfo: { screen: OrganizationInfo },
    MyPartner: { screen: MyPartner },
    Chat: { screen: Chat },
    Timeline: { screen: Timeline },
    SelectUser: { screen: SelectUser },
    Filter: { screen: Filter },
    AddInvestor: { screen: AddInvestor },
    LatestRemark: { screen: LatestRemark },
    MyPartnerOrg: { screen: MyPartnerOrg },
    MyCalendar: { screen: MyCalendar },
    AddSchedule: { screen: AddSchedule },
    SelectProject: { screen: SelectProject },
    SearchUser: { screen: SearchUser },
    EditSchedule: { screen: EditSchedule },
  })

  const DrawerApp = DrawerNavigator(
    {
      App: {
        path: '/',
        screen: AppNavigator,
      },
      MyCalendar: {
        screen: MyCalendar
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