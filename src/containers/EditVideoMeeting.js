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
  Linking,
} from 'react-native';
import ProjectItem from '../components/ProjectItem';
import UserItem from '../components/UserItem';
import * as api from '../api';
import { requestContents, hideLoading } from '../../actions';
import { connect } from 'react-redux';
import VideoMeetingForm from '../components/VideoMeetingForm';
import moment from 'moment';

class EditVideoMeeting extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '视频会议',
        headerStyle: {
          backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
      headerRight: (
        params.onPress === undefined ? null : (
        params.onPress ? 
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={params.onPress}>
          <Text style={{ fontSize: 15, color: 'white' }}>保存</Text>
        </TouchableOpacity>
        : <Text style={{ marginRight: 16, fontSize: 15, color: 'rgba(255, 255, 255, .5)' }}>保存</Text>
        )
      )
    }
  }

  constructor (props) {
    super (props);

    this.timeline = null;

    this.state = {
      title: '',
      address: '',
      showDatePickerIOS: false,
      date: new Date(),
      project: null,
      user: null,
      country: null,
      areaOptions: [],
      location: null,
      type: 3,
      attendees: [],
      currentAttendee: null,
      meeting: null,
      schedule: null,
    }

    this.schedule = this.props.navigation.state.params.schedule;
    console.log('this.schedule', this.schedule);
  }

  componentDidMount () {
    
    this.props.dispatch(requestContents());
    const { meeting: { id: meetingId }} = this.schedule;
    console.log('meeting id', meetingId);
    api.getWebexUser({ meeting: meetingId })
      .then(data => {
        console.log('get webex user', data);
        const content = data.data.map(m => `${m.name} ${m.email}`).join('\n');
        const currentAttendee = data.data.filter(f => f.user === this.props.userInfo.id)[0];
        console.log('attendees', content);
        console.log('currentAttendee', currentAttendee);
        this.setState({ attendees: content, currentAttendee });
      });

    api.getScheduleDetail(this.schedule.id)
    .then(result => {
      console.log('result', result)
      this.props.dispatch(hideLoading());
      if (result.proj) {
        const item = result.proj;
        var obj = {}
        obj['id'] = item.id
        obj['title'] = item.projtitle
        obj['amount'] = item.financeAmount_USD
        obj['country'] = item.country.country
        obj['imgUrl'] = item.industries[0].url
        obj['industrys'] = item.industries.map(i => i.name)
        obj['isMarketPlace'] = item.ismarketplace
        obj['amount_cny'] = item.financeAmount
        obj['currency'] = item.currency.id
      }

      if (result.user) {
        const { id, username, photourl, org, title } = result.user
        var investor = {
            id,
            username,
            photoUrl: photourl,
            org: org ? org.orgname : '',
            title: title ? title.name : '',
        }
      }

      this.setState({
        title: result.comments,
        address: result.address,
        date: new Date(result.scheduledtime + result.timezone),
        project: obj,
        user: investor,
        country: result.country ? { value: result.country.id, label: result.country.country } : null,
        location: result.location && result.location.id,
        type: result.type,
        meeting: result.meeting,
        schedule: result,
      });
      this.props.navigation.setParams({ onPress: this.isModifiable() ? this.handleSubmit : undefined });
    })
    .catch(error => console.error(error));

    api.getSource('orgarea')
      .then(result => {
        const areaOptions = result.map(m => ({ value: m.id, label: m.name}));
        this.setState({ areaOptions }); 
      })
  }

  isModifiable = () => {
    return false;
    if (this.props.userInfo.id !== this.schedule.createuser.id) {
      return false;
    }
    if (moment(this.schedule.scheduledtime + this.schedule.timezone) < moment().startOf('day')) {
      return false;
    }
    return true;
  }

  handleSubmit = () => {

    if (!this.timeline) {
      this.editSchedule();
      return;
    }

    Alert.alert(
      '是否同步到时间轴备忘录？',
      '',
      [
        {text: '否', onPress: this.editSchedule},
        {text: '是', onPress: this.editScheduleAndSyncRemark},
      ],
      { cancelable: true }
    );

  }

  editSchedule = () => {
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
    api.editSchedule(this.schedule.id, body)
    .then(data => {
      this.props.dispatch(hideLoading());
      const { navigation } = this.props;
      navigation.goBack();
      navigation.state.params.onEditEventCompleted(body);
    })
    .catch(err => console.error(err));
  }

  editScheduleAndSyncRemark = () => {
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
      api.editSchedule(this.schedule.id, body),
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
    // this.props.navigation.navigate(
    //   'SelectProject', 
    //   { onSelectProject: this.onSelectProject }
    // );
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

  handleDeleteBtnPressed = () => {
    Alert.alert(
      '确定要删除该日程吗？',
      '该操作不可恢复',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确定', onPress: this.deleteSchedule},
      ],
      { cancelable: true }
    )
  }

  deleteSchedule = () => {
    this.props.dispatch(requestContents());
    api.deleteSchedule(this.schedule.id)
      .then(result => {
        this.props.dispatch(hideLoading());
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onEditEventCompleted(this.schedule);
      })
      .catch(err => console.error(err));
  }

  getWID = (url) => {
    const wid = url.match(/WID=(.*)&/)[1];
    return wid;
  }

  getPW = (url) => {
    const pw = url.match(/PW=(.*)/)[1];
    return pw;
  }

  startMeeting = async () => {
    const meetingSchedule = this.schedule;
    console.log('meetingSchedule', meetingSchedule);
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

  joinMeeting = async () => {
    const { meeting: { meetingKey } } = this.schedule;
    let joinMeetingSchema = '';
    if (Platform.OS == 'ios') {
      joinMeetingSchema = `wbx://investarget.webex.com.cn/investarget?MK=${meetingKey}&MTGTK=&sitetype=TRAIN&r2sec=1&ST=1`;
    } else if (Platform.OS == 'android') {
      joinMeetingSchema = `wbx://meeting/investarget.webex.com.cn/investarget?MK=${meetingKey}&MTGTK=&sitetype=TRAIN&r2sec=1`;
    }
    console.log('schema', joinMeetingSchema);
    try {
      await Linking.openURL(joinMeetingSchema);
    } catch (err) {
      Alert.alert('无法打开，请确认已安装相关应用');
      console.warn('open url error:', err);
    }
  }

  handleMeetingButtonPressed = () => {
    if (this.isCurrentUserHost()) {
      this.startMeeting();
    } else {
      this.joinMeeting();
    }
  }

  isCurrentUserHost = () => {
    console.log('current user', this.state.currentAttendee);
    if (!this.state.currentAttendee) return false;
    const { meetingRole } = this.state.currentAttendee;
    if (meetingRole) {
      return true;
    } else {
      return false;
    }
  }

  isShowMeetingButton = () => {
    if (!this.schedule.meeting.status) return false;
    if (this.schedule.meeting.status.status === 0) return false;
    return true;
  }
  render () {
    return (
      <ScrollView>

        <VideoMeetingForm
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
          country={this.state.country}
          handleChangeArea={ location => this.setState({ location })}
          onSelectCountry={country => this.setState({ country })}
          location={this.state.location}
          type={this.state.type}
          handleChangeType={type => this.setState({ type })}
          meeting={this.state.meeting}
          attendees={this.state.attendees}
        />

        { this.isShowMeetingButton() &&
        <TouchableHighlight
          style={{ marginTop: 20, marginBottom: 80 }}
          onPress={this.handleMeetingButtonPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: '#428BCA', fontWeight: 'bold' }}>{ this.isCurrentUserHost() ? '启动会议' : '加入会议'}</Text>
          </View>
        </TouchableHighlight>
        }

        {/* { this.props.userInfo.id === this.schedule.createuser.id ? 
        <TouchableHighlight
          style={{ marginTop: 20 }}
          onPress={this.handleDeleteBtnPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: 'red' }}>删除</Text>
          </View>
        </TouchableHighlight>
        : null } */}

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

export default connect(mapStateToProps)(EditVideoMeeting);