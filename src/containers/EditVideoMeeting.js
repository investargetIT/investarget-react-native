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
import ProjectItem from '../components/ProjectItem';
import UserItem from '../components/UserItem';
import * as api from '../api';
import { requestContents, hideLoading } from '../../actions';
import { connect } from 'react-redux';
import ScheduleForm from '../components/ScheduleForm';
import moment from 'moment';

class EditVideoMeeting extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '编辑视频会议',
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

  render () {
    return (
      <ScrollView>

        <ScheduleForm 
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
        />

        { this.props.userInfo.id === this.schedule.createuser.id ? 
        <TouchableHighlight
          style={{ marginTop: 20 }}
          onPress={this.handleDeleteBtnPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: 'red' }}>删除</Text>
          </View>
        </TouchableHighlight>
        : null }

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