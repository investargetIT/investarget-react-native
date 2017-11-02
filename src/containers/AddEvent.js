import React from 'react';
import { 
  Text,
  TouchableOpacity,
  TextInput,
  View,
  DatePickerIOS,
  Platform,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  DatePickerAndroid,
  TimePickerAndroid,
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import ProjectItem from '../components/ProjectItem';
import UserItem from '../components/UserItem';
import * as api from '../api';
import { requestContents, hideLoading } from '../../actions';
import { connect } from 'react-redux';

class AddEvent extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加日程',
        headerStyle: {
          backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
      headerRight: (
        params.onPress ? 
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={params.onPress}>
          <Text style={{ fontSize: 15, color: 'white' }}>保存</Text>
        </TouchableOpacity>
        : <Text style={{ marginRight: 16, fontSize: 15, color: 'rgba(255, 255, 255, .5)' }}>保存</Text>
      )
    }
  }

  constructor (props) {
    super (props);

    // 一小时以后
    this.minimumDate = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);

    this.timeline = null;

    this.state = {
      title: '',
      address: '',
      showDatePickerIOS: false,
      date: this.minimumDate,
      project: null,
      user: null,
    }
  }

  handleSubmit = () => {

    if (!this.timeline) {
      this.addSchedule();
      return;
    }

    Alert.alert(
      '是否同步到时间轴备忘录？',
      '',
      [
        {text: '否', onPress: this.addSchedule},
        {text: '是', onPress: this.addScheduleAndSyncRemark},
      ],
      { cancelable: true }
    );

  }

  addSchedule = () => {
    this.props.dispatch(requestContents());
    const body = {
      scheduledtime: formatDate(this.state.date),
      comments: this.state.title,
      proj: this.state.project && this.state.project.id,
      address: this.state.address,
      user: this.state.user && this.state.user.id
    };
    api.addSchedule(body)
    .then(data => {
      this.props.dispatch(hideLoading());
      const { navigation } = this.props;
      navigation.goBack();
      navigation.state.params.onEditEventCompleted(body);
    })
    .catch(err => console.error(err));
  }

  addScheduleAndSyncRemark = () => {
    const body = {
      scheduledtime: formatDate(this.state.date),
      comments: this.state.title,
      proj: this.state.project && this.state.project.id,
      address: this.state.address,
      user: this.state.user && this.state.user.id
    };
    const request = [
      api.addTimelineRemark({
        remark: this.state.title,
        timeline: this.timeline.id
      }),
      api.addSchedule(body),
    ]
    Promise.all(request)
    .then(result => {
      this.props.dispatch(hideLoading());
      const { navigation } = this.props;
      navigation.goBack();
      navigation.state.params.onEditEventCompleted(body);
    })
    .catch(err => console.error(err));
  }

  onSelectProject = project => {
    this.setState({ project }, this.checkTimelineExist);
  }

  onSelectUser = user => {
    this.setState({ user }, this.checkTimelineExist);
  }
  
  handleProjectPressed = () => {
    this.props.navigation.navigate(
      'SelectProject', 
      { onSelectProject: this.onSelectProject }
    );
  }

  handleUserProcessed = () => {
    this.props.navigation.navigate(
      'SearchUser', 
      { onSelectUser: this.onSelectUser }
    );
  }

  checkTimelineExist = () => {
    if (!this.state.project || !this.state.user) return;
    const params = {
      proj: this.state.project.id,
      investor: this.state.user.id,
      trader: this.props.userInfo.id,
    };
    api.getTimeline(params)
    .then(result => {
      if (result.count > 0) {
        this.timeline = result.data[0];
      }
    })
    .catch(err => console.error(err));
  }

  handleDatePressed = async () => {
    if (Platform.OS === 'ios') {
      this.setState({ showDatePickerIOS: true });
    } else if (Platform.OS === 'android') {
      try {
        const {action, year, month, day} = await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: this.state.date,
          minDate: this.minimumDate,
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          // Selected year, month (0-11), day
          const {action, hour, minute} = await TimePickerAndroid.open({
            hour: 14,
            minute: 0,
            is24Hour: false, // Will display '2 PM'
          });
          if (action !== TimePickerAndroid.dismissedAction) {
            // Selected hour (0-23), minute (0-59)
            console.log(year, month, day, hour, minute);
            this.setState({ date: new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`) });
          }
        }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }
  }

  handleContentChange = title => {
    this.setState({ title });
    if (title.length > 0) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    } else {
      this.props.navigation.setParams({ onPress: null });
    }
  }

  render () {
    return (
      <ScrollView>

        <View style={{ backgroundColor: 'white',  marginTop: 20 }}>

        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
          <TextInput
            style={{ fontSize: 16, paddingLeft: 0 }}
            onChangeText={this.handleContentChange}
            value={this.state.title}
            placeholder="内容"
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
          <TextInput
            style={{ fontSize: 16, paddingLeft: 0 }}
            onChangeText={address => this.setState({ address })}
            value={this.state.address}
            placeholder="地点"
            underlineColorAndroid="transparent"
          />
        </View>
        </View>

        <TouchableHighlight 
          style={{ marginTop: 20, backgroundColor: 'white' }} 
          onPress={this.handleDatePressed} 
          underlayColor={'lightgray'}
        >
          <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>时间</Text>
            <Text style={{ fontSize: 16 }}>{this.state.date.toLocaleString()}</Text>
          </View>
        </TouchableHighlight>

        { this.state.project ? 
        <View style={{ marginTop: 20 }}>
          <ProjectItem {...this.state.project} onPress={this.handleProjectPressed}/>
        </View>
        : 
        <TouchableHighlight 
          style={{ marginTop: 20 }} 
          underlayColor="lightgray" 
          onPress={this.handleProjectPressed}
        >
          <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16 }}>添加项目</Text>
          </View>
        </TouchableHighlight>
        }

        { this.state.user ? 
        <View style={{ marginTop: 20 }}>
          <UserItem {...this.state.user} onSelect={this.handleUserProcessed} />
        </View>
        :
        <TouchableHighlight style={{ marginTop:20 }} underlayColor="lightgray" onPress={this.handleUserProcessed}>
          <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16 }}>添加用户</Text>
          </View>
        </TouchableHighlight>
        }

        {Platform.OS === 'ios' && this.state.showDatePickerIOS ?
          <Modal
            transparent={true}
            visible={true}
            onRequestClose={() => { alert("Modal has been closed.") }}
          >
            <TouchableWithoutFeedback onPress={() => this.setState({ showDatePickerIOS: false })}>
              <View style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                <DatePickerIOS
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white' }}
                  date={this.state.date}
                  mode="datetime"
                  minimumDate={this.minimumDate}
                  onDateChange={date => this.setState({date})}
                />
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          : null}
        
      </ScrollView>
    );
  }

}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}
function formatDate(date) {
  return date.getFullYear() +
  '-' + pad(date.getMonth() + 1) +
  '-' + pad(date.getDate()) +
  'T' + pad(date.getHours()) +
  ':' + pad(date.getMinutes()) +
  ':' + pad(date.getSeconds());
}

function mapStateToProps (state) {
  const { userInfo } = state.app;
  return { userInfo };
}

export default connect(mapStateToProps)(AddEvent);