import React from 'react'
import { 
  StatusBar, 
  Platform, 
  Alert, 
  AppState,
  View,
} from 'react-native';
import { Provider, connect } from 'react-redux'
import { createStore } from 'redux'
import Toast from 'react-native-root-toast'
import JPushModule from 'jpush-react-native'
import { NavigationActions } from 'react-navigation'
import AsyncStorage from './src/AsyncStorage'
import rootReducer from './reducers'
import AppWithNavigationState from './AppNavigator'
import * as utils from './src/utils'
import * as api from './src/api'
import { 
  receiveCurrentUserInfo, 
  logout, 
  scheduleSynced,
} from './actions';
import * as WeChat from 'react-native-wechat';
import Spinner from 'react-native-loading-spinner-overlay';
import InitialSwiper from './src/components/InitialSwiper';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';

AsyncStorage.setItem('source', '1')
window.LANG = 'cn'
StatusBar.setBarStyle('light-content');
const store = createStore(rootReducer)

let msgReceiveTime = 0

WeChat.registerApp('wx9a404829cfaab3aa');



function onNotification(msg) {
  Alert.alert('通知', msg, [
    {text: '取消', onPress: () => {}},
    {text: '确定', onPress: () => {
       store.dispatch(NavigationActions.navigate({routeName: 'Notification'}))        
    }}
  ])
}

class Container extends React.Component {
  state = {
    isShowApp: false,
    isShowSwiper: null,
  }
  componentDidMount() {
    AsyncStorage.getItem('userInfo').then(data => {
     
      if (!data) { 
        this.setState({ isShowApp: true });
        return 
      }
    
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
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
        .then(() => this.setState({ isShowApp: true }));
        
        // 登录后接收推送
        JPushModule.getRegistrationID((registrationId) => {})
        if (Platform.OS == 'android') {
          JPushModule.notifyJSDidLoad((resultCode) => {
            if (resultCode === 0) {}
          });
        }
        JPushModule.setAlias(String(userInfo.id), ()=>{})
        JPushModule.addReceiveNotificationListener(
          notification => onNotification(notification.alertContent || notification.aps.alert)
        );
        JPushModule.addReceiveOpenNotificationListener(
          notification => onNotification(notification.alertContent || notification.aps.alert)
        )
        // iOS Only 监听：应用没有启动的状态点击推送打开应用
        JPushModule.addOpenNotificationLaunchAppListener(
          notification => onNotification(notification.alertContent || notification.aps.alert)
        );
        if (Platform.OS === 'ios') {
          JPushModule.setBadge(0, () => {});
        }
      }).catch(error => {
        // Toast.show(error.message, { position: Toast.positions.CENTER })
        AsyncStorage.removeItem('userInfo')
        .then(data => {
          store.dispatch(logout());
          this.setState({ isShowApp: true }, () => store.dispatch(NavigationActions.navigate({routeName: 'Login'})));
        })
      })
    })

    // 同步App日程到iOS日历
    this.syncSchedule();

    // AsyncStorage.removeItem('is_first_time'); return;
    // 检查是否是首次打开App
    AsyncStorage.getItem('is_first_time')
      .then(data => this.setState({ isShowSwiper: data ? false : true }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isNeedSyncSchedule) {
      this.syncSchedule();
    }
  }

  handleFinishInitialSwiper = () => {
    this.setState({ isShowSwiper: false });
    AsyncStorage.setItem('is_first_time', 'false');
  }

  syncSchedule = async () => {
    try {

      if (Platform.OS !== 'ios') {
        throw new Error('Schedule Sync Only on iOS');
      }

      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo === null) {
        throw new Error('Not Login');
      }

      // 判断权限
      const status = await RNCalendarEvents.authorizationStatus();
      if (status !== 'authorized') {
        throw new Error('Not Authorized');
      }

      // 网络加载数据
      const allData = await api.getSchedule({ page_size: 1000 });
      const dataNeedToSync = allData.data.filter(f => 
        f.createuser.id === JSON.parse(userInfo).id && moment(f.scheduledtime + f.timezone) > moment()
      );

      // 获取本地记录
      const localRecords = await AsyncStorage.getItem('schedule');

      // 根据本地纪录删除iOS日历中的日程后删除本地记录
      if (localRecords) {
        const allLocalSchedule = await Promise.all(JSON.parse(localRecords).map(m => RNCalendarEvents.findEventById(m.local)));
        await Promise.all(allLocalSchedule.filter(f => f !== null).map(m => RNCalendarEvents.removeEvent(m.id)));
        await AsyncStorage.removeItem('schedule');
      }

      // 将日程写入iOS的日历中
      const sync = await Promise.all(dataNeedToSync.map(schedule => {
        const startDate = new Date(schedule.scheduledtime + schedule.timezone);
        // set endDate 2 hours later
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        return RNCalendarEvents.saveEvent(schedule.comments, {
          location: schedule.address,
          notes: schedule.projtitle || '',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          alarms: [{
            date: -1 * 24 * 60
          }]
        });
      }));

      // 生成本地记录
      const records = sync.map((m, i) => ({ remote: dataNeedToSync[i].id, local: m }));
      await AsyncStorage.setItem('schedule', JSON.stringify(records));

      this.props.dispatch(scheduleSynced());
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>

        <Spinner visible={this.props.isFetching} />

        { this.state.isShowSwiper ? 
          <InitialSwiper onFinish={this.handleFinishInitialSwiper} />
        : null }

        { this.state.isShowApp && this.state.isShowSwiper === false ? 
          <AppWithNavigationState />  
        : null }

      </View>
    )
  }
}

function mapStateToProp(state) {
      const { isFetching, isNeedSyncSchedule } = state.app;		
      //console.log('isFetching', isFetching);
      return { isFetching, isNeedSyncSchedule };		
    }

Container = connect(mapStateToProp)(Container)

export default () => (
  <Provider store={store}>
    <Container />
  </Provider>
)
