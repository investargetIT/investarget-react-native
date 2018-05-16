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
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPress: this.handleAddIconPressed });
  }

  handleAddIconPressed = () => {
    this.props.navigation.navigate('AddSchedule', { onEditEventCompleted: this.onEditEventCompleted });
  }

  onEditEventCompleted = event => {
    const dateString = event.scheduledtime.slice(0, 10);
    this.loadItems({ dateString });
  };

  render() {
    return (
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={new Date().toISOString().slice(0, 10)}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        /* onDayPress={this.handleOnDayPress} */
        
        markedDates={this.state.markedDates}
        markingType={'interactive'}
         /* monthFormat={'yyyy'} */
        /* theme={{calendarBackground: 'red', agendaKnobColor: 'green'}} */
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
      />
    );
  }

  handleOnDayPress = day => {
    if (this.state.items[day.dateString] === null) {
      this.state.items[day.dateString] = []
    }
    this.setState({
      items: this.state.items,
    });
  }

  saveScheduleToLocal = schedule => new Promise((resolve, reject) => {
    if (Platform.OS === 'android') {
      throw new Error('Android无法同步日程！')
    }
    if (schedule.createuser.id !== this.props.userInfo.id) {
      resolve(undefined);
      return;
    }
    let localSchedule = [];
    RNCalendarEvents.authorizationStatus()
      .then(status => {
        if (status === 'authorized') {
          return AsyncStorage.getItem('schedule');
        } else {
          throw new Error('未授权');
        }
      })
      .then(data => {
        if (data) {
          localSchedule = JSON.parse(data);
        }
        // 如果该日程已经同步过了就不需要再同步了
        if (localSchedule.map(m => m && m.remote).includes(schedule.id)) {
          // throw new Error('已经存在该日程');
          return undefined;
        } else {
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
      }
      })
      .then(id => {
        if (id) {
          const scheduleRelation = {
            remote: schedule.id,
            local: id
          }
          resolve(scheduleRelation);
        } else {
          resolve(undefined);
        }

        // setTimeout(() => AsyncStorage.setItem('schedule', JSON.stringify(localSchedule.concat([scheduleRelation]))), time);
      })
      .catch(error => console.log(error));
  })

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
      
      console.log('data from result', result);

      const loadDate = moment(day.dateString);
      const startOfMonth = loadDate.clone().startOf('month');
      const dayNumOfTheMonth = loadDate.clone().endOf('month').date();
      const dateOfTheMonth = [];
      for (const i = 0; i < dayNumOfTheMonth; i++) {
        const currentDate = startOfMonth.clone().add(i, 'd').format('YYYY-MM-DD');
        dateOfTheMonth.push(currentDate);
      }
      console.log('dateOfTheMonth', dateOfTheMonth);

      dateOfTheMonth.forEach(element => {
        const cachedEvent = items[element] && items[element].slice();
        console.log('cachedEvent', cachedEvent);
        const eventFromServer = result.data.filter(f => f.scheduledtime.slice(0, 10) === element);

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
      });

      const dateOnServer = result.data.map(m => m.scheduledtime.slice(0, 10));
      const markedDatesKeys = Object.keys(markedDates);

      const serverYesCacheNo = dateOnServer.filter(f => !markedDatesKeys.includes(f));
      const serverNoCacheYes = markedDatesKeys.filter(f => !dateOnServer.includes(f));

      serverYesCacheNo.forEach(element => {
        const schedule = result.data.filter(f => f.scheduledtime.slice(0, 10) === element)[0];
        const color = dateToColor(new Date(schedule.scheduledtime + schedule.timezone));
        markedDates[element] = [{startingDay: true, color}, {endingDay: true, color}];
      });

      serverNoCacheYes.forEach(element => {
        delete markedDates[element];
      });


      // // 从服务端加载日程
      // result.data.forEach(function(element, index) {
      //   const date = element.scheduledtime.slice(0, 10)
         
      //   if (date in items) {
      //     const index = items[date].map(m => m.id).indexOf(element.id);
      //     if (index > -1) {
      //       items[date].splice(index, 1);
      //     }
      //     items[date].push(element);
      //   } else {
      //     items[date] = [element];
      //   }

      //   if (date in markedDates === false) {
      //     const color = dateToColor(new Date(element.scheduledtime + element.timezone));
      //     markedDates[date] = [{startingDay: true, color}, {endingDay: true, color}];
      //   }
      //   // this.saveScheduleToLocal(element, index * 1000);
      // }, this);

      for (const i = -30; i < 30; i++) {
        const newDate = addDaysToDate(day.dateString, i);
        const newDateString = newDate.toISOString().slice(0, 10);
        if (items[newDateString] === undefined) {
          items[newDateString] = [];
        }
      }
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
    const color = dateToColor(new Date(item.scheduledtime + item.timezone));
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
    return r1.comments !== r2.comments;
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

function mapStateToProps(state) {
  const { schedule, userInfo } = state.app;
  return { schedule, userInfo };
}

export default connect(mapStateToProps)(MyCalendar);