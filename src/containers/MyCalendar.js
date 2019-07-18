import React from 'react';
import { 
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  Platform,
} from 'react-native';
import { Agenda } from 'react-native-calendars';
import * as api from '../api';
import RNCalendarEvents from 'react-native-calendar-events';
import { connect } from 'react-redux';
import AsyncStorage from '../AsyncStorage';
import moment from 'moment';
import { syncSchedule } from '../../actions';

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
    };
    this.loadingOrLoadedDate = [];
    this.tappedDate = null;
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPress: this.handleAddIconPressed });
  }

  handleAddIconPressed = () => {
    this.props.navigation.navigate('AddSchedule', {
      onEditEventCompleted: this.onEditEventCompleted,
      initialDate: this.tappedDate,
    });
  }

  onEditEventCompleted = event => {
    const dateString = event.scheduledtime.slice(0, 10);
    this.loadItems({ dateString });
    this.props.dispatch(syncSchedule());
  };

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
          <Text>会议类型：</Text>
          <View style={{ width: 20, height: 20, backgroundColor: 'rgb(230, 168, 47)' }}></View>
          <Text style={{ marginLeft: 5 }}>路演会议</Text>
          <View style={{ marginLeft: 10, width: 20, height: 20, backgroundColor: 'rgb(66, 175, 149)' }}></View>
          <Text style={{ marginLeft: 5 }}>约见公司</Text>
          <View style={{ marginLeft: 10, width: 20, height: 20, backgroundColor: 'rgb(95, 163, 246)' }}></View>
          <Text style={{ marginLeft: 5 }}>约见投资人</Text>
        </View>

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
    api.getSchedule({ date: day.dateString, page_size: 10000 })
    .then(result => {
      
      // console.log('data from result', result);

      const loadDate = moment(day.dateString);
      const startOfMonth = loadDate.clone().startOf('month');
      const dayNumOfTheMonth = loadDate.clone().endOf('month').date();
      const dateOfTheMonth = [];
      for (const i = 0; i < dayNumOfTheMonth; i++) {
        const currentDate = startOfMonth.clone().add(i, 'd').format('YYYY-MM-DD');
        dateOfTheMonth.push(currentDate);
      }
      // console.log('dateOfTheMonth', dateOfTheMonth);

      dateOfTheMonth.forEach(element => {
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
    this.props.navigation.navigate(
      'EditSchedule', 
      {
        schedule,
        onEditEventCompleted: this.onEditEventCompleted 
      }
    );
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
    default:
      return 'rgb(95, 163, 246)';
  }
}

function mapStateToProps(state) {
  const { schedule, userInfo } = state.app;
  return { schedule, userInfo };
}

export default connect(mapStateToProps)(MyCalendar);