import React from 'react';
import { 
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Platform,
  Button,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { Agenda } from 'react-native-calendars';
import * as api from '../api';
import RNCalendarEvents from 'react-native-calendar-events';
import { connect } from 'react-redux';
import AsyncStorage from '../AsyncStorage';
import moment from 'moment';
import { syncSchedule } from '../../actions';
import PickerIOS2 from '../components/PickerIOS2';

const pickerContainerStyle = {
  display: 'flex',
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: '#fff',
  borderTopWidth:1,
  borderTopColor:'#ddd'
}

const scheduleTypeOptions = [
  { label: '视频会议', value: 0 },
  { label: '其他日程', value: 1 },
];

class MyCalendar extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '日程管理',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
      headerRight: params ?
        <TouchableOpacity style={{ marginRight: 12 }} onPress={params.onPress}>
          <Image source={require('../images/plus.png')} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
        : null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      items: {},
      markedDates: {},
      showChooseScheduleTypeDialog: false, // 为Android准备的日程类型选择控件
      showIosPicker: false, // 为iOS准备的日程类型选择控件
    };
    this.loadingOrLoadedDate = [];
    this.tappedDate = null;
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPress: this.handleAddIconPressed });
  }

  handleAddIconPressed = () => {
    if (Platform.OS === 'ios') {
      this.setState({ showIosPicker: true });
    } else {
      this.setState({ showChooseScheduleTypeDialog: !this.state.showChooseScheduleTypeDialog });
    }
  }

  onEditEventCompleted = event => {
    const dateString = event.scheduledtime.slice(0, 10);
    this.loadItems({ dateString });
    this.props.dispatch(syncSchedule());
  };

  handleSpecificScheduleTypeClicked(type) {
    this.setState({ showChooseScheduleTypeDialog: false, showIosPicker: false });
    let scene = 'AddSchedule';
    if (type === 0) {
      scene = 'AddVideoMeeting';
    }
    this.props.navigation.navigate(scene, {
      onEditEventCompleted: this.onEditEventCompleted,
      initialDate: this.tappedDate,
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={new Date().toISOString().slice(0, 10)}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        onDayPress={this.handleOnDayPress}
        
        markedDates={this.state.markedDates}
        markingType={'interactive'}
         /* monthFormat={'yyyy'} */
        /* theme={{calendarBackground: 'red', agendaKnobColor: 'green'}} */
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
      />

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 12 }}>会议类型：</Text>
          <View style={{ width: 10, height: 10, backgroundColor: 'rgb(230, 168, 47)' }}></View>
          <Text style={{ marginLeft: 2, fontSize: 12 }}>路演会议</Text>
          <View style={{ marginLeft: 5, width: 10, height: 10, backgroundColor: 'rgb(66, 175, 149)' }}></View>
          <Text style={{ marginLeft: 2, fontSize: 12 }}>约见公司</Text>
          <View style={{ marginLeft: 5, width: 10, height: 10, backgroundColor: 'rgb(95, 163, 246)' }}></View>
          <Text style={{ marginLeft: 2, fontSize: 12 }}>约见投资人</Text>
          <View style={{ marginLeft: 5, width: 10, height: 10, backgroundColor: 'rgb(239, 83, 80)' }}></View>
          <Text style={{ marginLeft: 2, fontSize: 12 }}>视频会议</Text>
        </View>

        {this.state.showChooseScheduleTypeDialog ?
          <TouchableWithoutFeedback onPress={() => this.setState({ showChooseScheduleTypeDialog: false })}>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#10458F' }}>
                <Text style={{ padding: 10, color: 'white' }} onPress={this.handleSpecificScheduleTypeClicked.bind(this, 0)}>视频会议</Text>
                <Text style={{ padding: 10, color: 'white' }} onPress={this.handleSpecificScheduleTypeClicked.bind(this, 1)}>其他日程</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          : null}

        {Platform.OS === 'ios' &&  
        <Modal visible={this.state.showIosPicker} animationType="slide" transparent={true}>
          <View style={pickerContainerStyle}>
            <PickerIOS2
              value={0}
              options={scheduleTypeOptions}
              onCancel={() => this.setState({ showIosPicker: false })}
              onConfirm={this.handleSpecificScheduleTypeClicked.bind(this)}
              title="选择日程类型"
            />
          </View>
        </Modal>
        }

      </View>
    );
  }

  handleOnDayPress = day => {
    const { dateString } = day;
    const dateStringWithTimezone = `${dateString}T00:00:00+08:00`;
    this.tappedDate = new Date(dateStringWithTimezone);
    // if (this.state.items[day.dateString] === null) {
    //   this.state.items[day.dateString] = []
    // }
    // this.setState({
    //   items: this.state.items,
    // });
  }

  loadItems(day) {
    // 如果已经加载过这个日期之后的日程的话就不要再加载一次了
    // if (this.loadingOrLoadedDate.includes(day.dateString)) return;
    // this.loadingOrLoadedDate.push(day.dateString);
    if (this.isLoading) return;
    this.isLoading = true;
    const items = Object.assign({}, this.state.items);
    const markedDates = Object.assign({}, this.state.markedDates);
    let newItems;

    const selectedDate = moment(day.dateString);
    const lastMonth = selectedDate.clone().subtract(1, 'M');
    const nextMonth = selectedDate.clone().add(1, 'M');
    const requestThreeMonthsSchedule = [
      lastMonth,
      selectedDate,
      nextMonth,
    ].map(m => api.getSchedule({
      manager: this.props.userInfo.id, 	
      page_size: 10000, 	    
      date: m.format('YYYY-MM-DD'),
    }));

    Promise.all(requestThreeMonthsSchedule).then(res => {
     
      const data = res.reduce((prev, curr) => prev.concat(curr.data), []);
      const result = { data };

      const loadDate = moment(day.dateString);
      const startOfLastMonth = loadDate.clone().subtract(1, 'M').startOf('month');
      const endOfNextMonth = loadDate.clone().add(1, 'M').endOf('month');
      const dayNumOfThreeMonths = endOfNextMonth.diff(startOfLastMonth, 'days') + 1;
      const dateOfThreeMonths = [];
      for (const i = 0; i < dayNumOfThreeMonths; i++) {
        const currentDate = startOfLastMonth.clone().add(i, 'd').format('YYYY-MM-DD');
        dateOfThreeMonths.push(currentDate);
      }

      dateOfThreeMonths.forEach(element => {
        const cachedEvent = items[element] && items[element].slice();
        // console.log('cachedEvent', cachedEvent);
        const eventFromServer = result.data.filter(f => f.scheduledtime.slice(0, 10) === element);
        // console.log('eventFromServer', eventFromServer);
        if (cachedEvent && cachedEvent.length > 0 && eventFromServer.length === 0) {
          items[element] = [];
        } else if (eventFromServer.length > 0 && (!cachedEvent || cachedEvent.length === 0)) {
          items[element] = eventFromServer;
        } else if (cachedEvent && cachedEvent.length > 0 && eventFromServer.length > 0) {
          const cachedEventID = cachedEvent.map(m => m.id);
          const eventFromServerID = eventFromServer.map(m => m.id);

          const cacheYesServerNo = cachedEventID.filter(f => !eventFromServerID.includes(f));
          const cacheNoServerYes = eventFromServerID.filter(f => !cachedEventID.includes(f));
          const bothHas = cachedEventID.filter(f => eventFromServerID.includes(f));

          // Remove from cache
          cacheYesServerNo.forEach(e => {
            const index = items[element].map(m => m.id).indexOf(e);
            items[element].splice(index, 1);
          });

          // Add new event
          cacheNoServerYes.forEach(e => {
            items[element].push(eventFromServer.filter(f => f.id === e)[0]);
          });

          // Update events on both sides
          bothHas.forEach(e => {
            const index = items[element].map(m => m.id).indexOf(e);
            items[element].splice(index, 1);
            items[element].push(eventFromServer.filter(f => f.id === e)[0]);
          });

        }

        const isDateHasEvent = result.data.filter(m => m.scheduledtime.slice(0, 10) === element).length > 0;
        const isDateInCache = element in markedDates;

        // 比较日程类型，如果类型变了的话，日历上该日期的颜色应该跟着一起变化
        let oldColor = '';
        let newColor = '';
        if (isDateHasEvent && isDateInCache) {
          const newSchedule = result.data.filter(f => f.scheduledtime.slice(0, 10) === element)[0];
          newColor = typeToColor(newSchedule.type);
          oldColor = markedDates[element][0].color;
        }

        if (isDateHasEvent && (!isDateInCache || oldColor !== newColor)) {
          const schedule = result.data.filter(f => f.scheduledtime.slice(0, 10) === element)[0];
          // console.log('schedule', schedule);
          const color = typeToColor(schedule.type);
          markedDates[element] = [{startingDay: true, color}, {endingDay: true, color}];
        } else if (!isDateHasEvent && isDateInCache) {
          delete markedDates[element]; 
        }
      });

      for (const i = -30; i < 30; i++) {
        const newDate = addDaysToDate(day.dateString, i);
        const newDateString = newDate.toISOString().slice(0, 10);
        if (items[newDateString] === undefined) {
          items[newDateString] = [];
        }
      }
      // console.log('items', items);
      // console.log('markedDates', markedDates);
      this.setState({ items, markedDates }, () => this.isLoading = false);
    })
    .catch(err => {
      console.log(err)
      this.isLoading = false;
    });
    
  }

  handleSchedulePressed (schedule) {
    let navigateTo = 'EditSchedule';
    if (schedule.type === 4) {
      // if (this.isShowVideoMeetingButton(schedule)) {
      //   this.handleStartMeetingButtonPressed(schedule);
      // }
      // return;
      navigateTo = 'EditVideoMeeting';
    };
    this.props.navigation.navigate(navigateTo, {
      schedule,
      onEditEventCompleted: this.onEditEventCompleted 
    });
  }

  getWID = (url) => {
    const wid = url.match(/WID=(.*)&/)[1];
    return wid;
  }

  getPW = (url) => {
    const pw = url.match(/PW=(.*)/)[1];
    return pw;
  }

  async handleStartMeetingButtonPressed(meetingSchedule) {
    const webExUrl = 'https://investarget.webex.com.cn/investarget/user.php';
    const { meeting: { url, meetingKey } } = meetingSchedule;
    const wid = this.getWID(url);
    const pw = this.getPW(url);
    const formData = new FormData();
    formData.append('AT', 'GetAuthInfo');
    formData.append('UN', wid);
    formData.append('PW', pw);
    formData.append('getEncryptedPwd', true);
    const encryptedPwRes = await fetch(webExUrl, {
      method: 'post',
      body: formData,
    });
    const encryptedPassword = await encryptedPwRes.text();
    // console.log('encrypw', encryptedPassword);
    const formData2 = new FormData();
    formData2.append('AT', 'GetAuthInfo');
    formData2.append('UN', wid);
    formData2.append('EPW', encryptedPassword);
    formData2.append('isUTF8', 1);
    const sessionTicketRes = await fetch(webExUrl, {
      method: 'post',
      body: formData2,
    });
    const sessionTicketXml = await sessionTicketRes.text();
    // console.log('sessionTicketXml', sessionTicketXml);
    let sessionTicket = '';
    if (window.DOMParser) {
      // console.log('we have dom parser');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sessionTicketXml, "text/xml");
      sessionTicket = xmlDoc.getElementsByTagName("SessionTicket")[0].childNodes[0].nodeValue;
    }
    // console.log('session ticket', sessionTicket);
    let startMeetingSchema = '';
    if (Platform.OS == 'ios') {
      startMeetingSchema = `wbx://investarget.webex.com.cn/investarget?MK=${meetingKey}&MTGTK=&sitetype=TRAIN&r2sec=1&ST=1&UN=${encodeURIComponent(wid)}&TK=${encodeURIComponent(sessionTicket)}`;
    } else if (Platform.OS == 'android') {
      startMeetingSchema = `wbx://meeting/investarget.webex.com.cn/investarget?MK=${meetingKey}&MTGTK=&sitetype=TRAIN&r2sec=1&UN=${encodeURIComponent(wid)}&TK=${encodeURIComponent(sessionTicket)}`;
    }
    console.log('schema', startMeetingSchema);
    try {
      await Linking.openURL(startMeetingSchema);
    } catch (err) {
      Alert.alert('无法打开，请确认已安装相关应用');
      console.warn('open url error:', err);
    }
  }

  isShowVideoMeetingButton(schedule) {
    const { type, meeting } = schedule;
    if (type !== 4 || !meeting) return false;
    const { status } = meeting.status;
    if (!status || status === 0) return false;
    return true;
  }

  renderItem(item) {
    const color = typeToColor(item.type);
    return (
      <TouchableHighlight style={[styles.item, { height: item.height, backgroundColor: color }]} onPress={this.handleSchedulePressed.bind(this, item)} underlayColor="lightgray">
      <View>
        <Text>{item.comments}</Text>
        { item.createuser.id !== this.props.userInfo.id ?
        <Text style={{ fontSize: 12, textAlign: 'right' }}>{item.createuser.username}</Text>
        : null }
          {/* {this.isShowVideoMeetingButton(item) &&
            <TouchableOpacity
              style={{ marginTop: 10 }}
              activeOpacity={0.8}
              onPress={this.handleStartMeetingButtonPressed.bind(this, item)}
            >
              <Text style={{ fontSize: 12, textAlign: 'right' }}>点击进入会议</Text>
            </TouchableOpacity>
          } */}
      </View>
      </TouchableHighlight>
    );
  }

  renderEmptyDate() {
    return (
      null
    );
  }

  rowHasChanged(r1, r2) {
    return r1.comments !== r2.comments || r1.type !== r2.type;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }

}

const styles = StyleSheet.create({
    item: {
      backgroundColor: 'white',
      flex: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      marginTop: 17
    },
    emptyDate: {
      height: 15,
      flex:1,
      paddingTop: 30
    }
  });


function addDaysToDate(dateString, days) {
  var dat = new Date(dateString);
  dat.setDate(dat.getDate() + days);
  return dat;
} 

function dateToColor(date) {
  const seconds = (date - new Date()) / 1000;
  let color;
  if (seconds < 0) {
    color = '#4caf50';
  } else if (seconds < 2 * 24 * 60 * 60) {
    color = '#f44336';
  } else {
    color = '#ffeb3b';
  }
  return color;
}

function typeToColor(type) {
  switch (type) {
    case 1:
      return 'rgb(230, 168, 47)';
    case 2:
      return 'rgb(66, 175, 149)';
    case 3:
      return 'rgb(95, 163, 246)';
    case 4:
      return 'rgb(239, 83, 80)';
    default:
      return 'rgb(0, 0, 0)';
  }
}

function mapStateToProps(state) {
  const { schedule, userInfo } = state.app;
  return { schedule, userInfo };
}

export default connect(mapStateToProps)(MyCalendar);