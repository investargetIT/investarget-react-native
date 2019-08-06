import React from 'react';
import { 
  Text,
  TouchableOpacity,
  TextInput,
  Image,
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
import ProjectItem from '../components/ProjectItem';
import UserItem from '../components/UserItem';
import * as api from '../api';
import { requestContents, hideLoading } from '../../actions';
import { connect } from 'react-redux';
import AddVideoMeetingForm from '../components/AddVideoMeetingForm';

class AddVideoMeeting extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加视频会议',
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


    const { initialDate } = props.navigation.state.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.timeline = null;

    this.state = {
      title: '',
      address: '',
      showDatePickerIOS: false,
      date: initialDate || today,
      project: null,
      user: null,
      location: null,
      areaOptions: [],
      country: { label: '中国', value: 42 },
      type: 3,
    }
  }

  componentDidMount() {
    api.getSource('orgarea')
    .then(result => {
      const areaOptions = result.map(m => ({ value: m.id, label: m.name}));
      this.setState({ areaOptions, location: areaOptions[0].value });
    })
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

  addSchedule = async () => {
    this.props.dispatch(requestContents());
    const body = {
      scheduledtime: formatDate(this.state.date),
      comments: this.state.title,
      proj: this.state.project && this.state.project.id,
      address: this.state.address,
      user: this.state.user && this.state.user.id,
      country: this.state.country.value,
      location: ['中国', 'China'].includes(this.state.country.label) ? this.state.location : null,
      type: this.state.type,
    };
    try {
      await api.getUserSession();
      await api.addSchedule([body]);
      this.props.dispatch(hideLoading());
      const { navigation } = this.props;
      navigation.goBack();
      navigation.state.params.onEditEventCompleted(body);
    } catch (err) {
      console.error(err);
    }
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

  handleUserPressed = () => {
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

  handleContentChange = title => {
    this.setState({ title });
    if (title.length > 0) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    } else {
      this.props.navigation.setParams({ onPress: null });
    }
  }

  handleAddressChange = address => {
    this.setState({ address });
  }

  handleEditTitleClicked = () => {
    this.props.navigation.navigate('EditText', {
      title: '标题',
      initialValue: this.state.title,
      onSave: this.handleTitleSaved,
    });
  }

  handleTitleSaved = title => {
    this.setState({ title });
  }

  handleEditAddressClicked = () => {
    this.props.navigation.navigate('EditText', {
      title: '地址',
      initialValue: this.state.address,
      onSave: this.handleAddressSaved,
    });
  }

  handleAddressSaved = address => {
    this.setState({ address });
  }

  handleDatePressed = async () => {
    if (Platform.OS === 'ios') {
      this.setState({ showDatePickerIOS: true });
    } else if (Platform.OS === 'android') {
      try {
        const {action, year, month, day} = await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: new Date(),
          minDate: this.minimumDate,
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          // Selected year, month (0-11), day
          const {action, hour, minute} = await TimePickerAndroid.open({
            hour: 14,
            minute: 0,
            is24Hour: true, // Will display '2 PM'
          });
          if (action !== TimePickerAndroid.dismissedAction) {
            // Selected hour (0-23), minute (0-59)
            console.log(year, month, day, hour, minute);
            this.props.onDateChange(new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}+08:00`))
          }
        }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }
  }

  render () {
    return (
      <ScrollView>

        {/* <AddVideoMeetingForm 
          title={this.state.title}
          handleContentChange={this.handleContentChange}
          address={this.state.address}
          handleAddressChange={this.handleAddressChange}
          date={this.state.date}
          onDateChange={date => this.setState({ date })}
          project={this.state.project}
          handleProjectPressed={this.handleProjectPressed}
          user={this.state.user}
          handleUserPressed={this.handleUserPressed}
          areaOptions={this.state.areaOptions}
          location={this.state.location}
          handleChangeArea={ location => this.setState({ location }) }
          country={this.state.country}
          onSelectCountry={country => this.setState({ country })}
          type={this.state.type}
          handleChangeType={type => this.setState({ type })}
        /> */}

        <View style={{ backgroundColor: 'white', marginTop: 20 }}>

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleEditTitleClicked}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>标题</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.title || '未填写'}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>

          <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleEditAddressClicked}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>地址</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.address || '未填写'}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>
        </View>

        <TouchableHighlight
          style={{ marginTop: 20, backgroundColor: 'white' }}
          onPress={this.handleDatePressed}
          underlayColor={'lightgray'}
        >
          <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>时间</Text>
            <Text style={{ fontSize: 16 }}>{this.state.date && formatDate2(this.state.date)}</Text>
          </View>
        </TouchableHighlight>

        {this.state.project ?
          <View style={{ marginTop: 20 }}>
            <ProjectItem {...this.state.project} onPress={this.handleProjectPressed} />
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

        {this.state.user ?
          <View style={{ marginTop: 20 }}>
            <UserItem {...this.state.user} onSelect={this.handleUserPressed} />
          </View>
          :
          <TouchableHighlight style={{ marginTop: 20 }} underlayColor="lightgray" onPress={this.handleUserPressed}>
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
                  onDateChange={date => this.setState({ date })}
                  minuteInterval={30}
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
function formatDate2(date) {
  return date.getFullYear() +
  '-' + pad(date.getMonth() + 1) +
  '-' + pad(date.getDate()) +
  ' ' + pad(date.getHours()) +
  ':' + pad(date.getMinutes());
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

export default connect(mapStateToProps)(AddVideoMeeting);