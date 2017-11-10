import React from 'react';
import { 
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableHighlight,
} from 'react-native';
import { Agenda } from 'react-native-calendars';
import * as api from '../api';

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
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPress: this.handleAddIconPressed });
  }

  handleAddIconPressed = () => {
    this.props.navigation.navigate('AddSchedule', { onEditEventCompleted: this.onEditEventCompleted });
  }

  onEditEventCompleted = event => {
    console.log('event', event);
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

  loadItems(day) {
    const items = Object.assign({}, this.state.items);
    const markedDates = Object.assign({}, this.state.markedDates);

    api.getSchedule({ date: day.dateString, page_size: 10000 })
    .then(result => {
      // 从服务端加载日程
      result.data.forEach(function(element) {
        const date = element.scheduledtime.slice(0, 10)
        
        if (date in items && !items[date].map(m => m.id).includes(element.id)) {
          items[date].push(element);
        } else {
          items[date] = [element];
        }

        if (date in markedDates === false) {
          const color = dateToColor(new Date(element.scheduledtime + element.timezone));
          markedDates[date] = [{startingDay: true, color}, {endingDay: true, color}];
        }

      }, this);

      // 加上前后30天内没有日程的日期
      for (const i = -30; i < 30; i++) {
        const newDate = addDaysToDate(day.dateString, i);
        const newDateString = newDate.toISOString().slice(0, 10);
        if (items[newDateString] === undefined) {
          items[newDateString] = [];
        }
      }
      this.setState({ items, markedDates });
    });
  }

  handleSchedulePressed (schedule) {
    this.props.navigation.navigate('EditSchedule', { id: schedule.id, onEditEventCompleted: this.onEditEventCompleted });
  }

  renderItem(item) {
    const color = dateToColor(new Date(item.scheduledtime + item.timezone));
    return (
      <TouchableHighlight style={[styles.item, { height: item.height, backgroundColor: color }]} onPress={this.handleSchedulePressed.bind(this, item)} underlayColor="lightgray">
      <View>
        <Text>{item.comments}</Text>
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
    return r1.name !== r2.name;
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

export default MyCalendar;