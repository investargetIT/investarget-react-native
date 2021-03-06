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
import Toast from 'react-native-root-toast';

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

    this.state = {
      title: '',
      address: '',
      password: '',
      duration: 60,
      investors: [],
      traders: [],
      attendees: [],
      showDatePickerIOS: false,
      date: initialDate || today,
      project: null,
      oldSelectedProj: null,
      user: null,
      location: null,
      areaOptions: [],
      country: { label: '中国', value: 42 },
    }

    const now = new Date();
    this.minimumDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  componentDidMount() {
    api.getSource('orgarea')
    .then(result => {
      const areaOptions = result.map(m => ({ value: m.id, label: m.name}));
      this.setState({ areaOptions, location: areaOptions[0].value });
    })
  }

  handleSubmit = () => {
    const param = {
      scheduledtime: formatDate(this.state.date),
      comments: this.state.title,
      proj: this.state.project && this.state.project.id,
      address: this.state.address,
      type: 4, // 视频会议类型的日程为4
      duration: this.state.duration,
      password: this.state.password,
    };
    this.props.dispatch(requestContents());
    this.addEventAsync(param)
      .then(() => {
        this.props.dispatch(hideLoading());
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onEditEventCompleted(param);
      })
      .catch(error => {
        this.props.dispatch(hideLoading());
        // 必须将弹框延时，否则页面会出错，感觉loading效果和alert冲突了
        setTimeout(() => Alert.alert(error.message), 100);
      });
  }

  addEventAsync = async (param) => {
    const body = { ...param, title: param.comments };
    await api.getUserSession();
    const meetingResult = await api.addSchedule([body]);
    if (param.type === 4) {
      const { id: meeting, meetingKey } = meetingResult[0].meeting;
      const attendee = this.formatAttendee(param);
      const userBody = attendee.map(m => ({ ...m, meeting, meetingKey }));
      await api.addWebexUser(userBody);

      // 为在库里的参会人创建日程
      const existAttendees = attendee.filter(f => f.user !== undefined && f.user !== this.props.userInfo.id);
      const attendeeBody = existAttendees.map(m => ({ ...body, manager: m.user, meeting }));
      await api.getUserSession();
      await api.addSchedule(attendeeBody);
    }
  }

  formatAttendee = () => {
    const existAttendees = this.state.investors.concat(this.state.traders).map(m => ({
      user: m.id,
      name: m.username,
      email: m.email,
    }));
    const manualAttendees = this.state.attendees.map(m => ({
      name: m.username,
      email: m.email,
    }));
    const currentUser = this.props.userInfo;
    const meetingHost = {
      user: currentUser.id,
      name: currentUser.username,
      email: currentUser.emailAddress,
      meetingRole: true,
    };
    return existAttendees.concat(meetingHost, manualAttendees);
  }

  onSelectProject = project => {
    this.setState(
      { project, oldSelectedProj: this.state.project },
      () => this.checkProjectContact(project),
    );
  }

  checkProjectContact = project => {
    api.getProjDetail(project.id)
      .then((response) => {
        const { email } = response;
        if (!email) return;
        const { contactPerson: username } = response;
        const contact = { username, email };
        const projectWithContact = { ...project, ...contact };
        let newAttendees = this.state.attendees.concat(contact);

        // 自动删除原来选的项目的联系人
        if (this.state.oldSelectedProj && this.state.oldSelectedProj.email) {
          const { email: oldContactEmail } = this.state.oldSelectedProj;
          newAttendees = newAttendees.filter(f => f.email !== oldContactEmail);
        }

        this.setState({
          project: projectWithContact,
          attendees: newAttendees,
        });
      });
  }
  
  handleProjectPressed = () => {
    this.props.navigation.navigate(
      'SelectProject', 
      { onSelectProject: this.onSelectProject }
    );
  }

  handleInvestorPressed = () => {
    this.props.navigation.navigate('FilterUser', {
      title: '添加投资人',
      project: this.state.project,
      type: 'investor',
      onSelectUser: this.onSelectInvestor,
    });
  }

  onSelectInvestor = user => {
    this.setState({ investors: this.state.investors.concat(user) });
  }

  handleTraderPressed = () => {
    this.props.navigation.navigate('FilterUser', {
      title: '添加交易师',
      type: 'trader',
      onSelectUser: this.onSelectTrader,
    });
  }

  onSelectTrader = user => {
    this.setState({ traders: this.state.traders.concat(user) });
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
    if (title.length > 0 && this.state.password.length >= 4) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    }
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

  handleEditPasswordClicked = () => {
    this.props.navigation.navigate('EditText', {
      title: '会议密码',
      initialValue: this.state.password,
      onSave: this.handlePasswordSaved,
    });
  }

  handlePasswordSaved = password => {
    if (password.length < 4) {
      Toast.show('密码长度至少四位', {position: Toast.positions.CENTER})
      return;
    }
    this.setState({ password });
    if (this.state.title.length > 0) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    }
  }

  handleEditDurationClicked = () => {
    this.props.navigation.navigate('EditText', {
      title: '持续时间',
      initialValue: this.state.duration.toString(),
      keyboardType: 'numeric',
      onSave: this.handleDurationSaved,
    });
  }

  handleDurationSaved = duration => {
    this.setState({ duration: parseInt(duration, 10) });
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
            hour: this.state.date.getHours(),
            minute: this.state.date.getMinutes(),
            is24Hour: true, // Will display '2 PM'
          });
          if (action !== TimePickerAndroid.dismissedAction) {
            // Selected hour (0-23), minute (0-59)
            console.log(year, month, day, hour, minute);
            this.setState({ date: new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}+08:00`) });
          }
        }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }
  }

  handleAddAttendeeBtnPressed = () => {
    this.props.navigation.navigate('EditAttendee', {
      title: '添加参会人', 
      onSave: this.handleAttendeeSaved,
    });
  }

  handleAttendeeSaved = attendee => {
    if (attendee.index === undefined) {
      this.setState({ attendees: this.state.attendees.concat(attendee) });
      return;
    }
    const { index, username, email } = attendee;
    const newAttendees = [...this.state.attendees];
    newAttendees[index].username = username;
    newAttendees[index].email = email;
    this.setState({ attendees: newAttendees });
  }

  handleAttendeeItemPressed = (index, item) => {
    const { username, email } = item;
    this.props.navigation.navigate('EditAttendee', {
      index,
      username,
      email,
      onSave: this.handleAttendeeSaved,
    });
  }

  handleRemoveInvestorBtnPressed = index => {
    Alert.alert(
      '确定移除？',
      '移除后无法恢复，需要重新输入',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确定', onPress: () => this.removeInvestor(index)},
      ],
      { cancelable: true }
    )
  }

  removeInvestor = index => {
    this.setState({ investors: this.state.investors.filter((f, i) => i !== index) });
  }

  handleRemoveTraderBtnPressed = index => {
    Alert.alert(
      '确定移除？',
      '移除后无法恢复，需要重新输入',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确定', onPress: () => this.removeTrader(index)},
      ],
      { cancelable: true }
    )
  }

  removeTrader = index => {
    this.setState({ traders: this.state.traders.filter((f, i) => i !== index) });
  }

  handleRemoveAttendeeBtnPressed = index => {
    Alert.alert(
      '确定移除？',
      '移除后无法恢复，需要重新输入',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确定', onPress: () => this.removeAttendee(index)},
      ],
      { cancelable: true }
    )
  }

  removeAttendee = index => {
    this.setState({ attendees: this.state.attendees.filter((f, i) => i !== index) })
  }

  render () {
    return (
      <ScrollView>

        <View style={{ backgroundColor: 'white', marginTop: 20 }}>

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleEditTitleClicked}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>标题</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.title || '未填写(必填)'}</Text>
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

          <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleDatePressed}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>时间</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.date && formatDate2(this.state.date)}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>

          <View style={{ height: 0.5, backgroundColor: "#CED0CE", marginLeft: 10 }} />

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleProjectPressed}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>项目</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.project ? this.state.project.title : '未选择'}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>

        </View>

        <View style={{ backgroundColor: 'white', marginTop: 20 }}>

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleEditPasswordClicked}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>会议密码</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{this.state.password || '未填写(必填，长度至少四位)'}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>

          <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleEditDurationClicked}
            underlayColor={'lightgray'}
          >
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>持续时间</Text>
              <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>{`${this.state.duration}分钟`}</Text>
              <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
            </View>
          </TouchableHighlight>

        </View>

        <Text style={{ marginTop: 20, marginBottom: 8, marginLeft: 10, color: 'gray' }}>投资人</Text>

        <View style={{ backgroundColor: 'white' }}>

          {this.state.investors.map((m, i) => (<View key={i}>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={this.handleRemoveInvestorBtnPressed.bind(this, i)}>
                <View style={{ marginRight: 8, width: 24, height: 24, backgroundColor: 'red', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 2, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{m.username}</Text>
                <Text style={{ fontSize: 16, color: 'gray' }}>{m.email}</Text>
              </View>
            </View>
            <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
          </View>))}

        </View>

        <TouchableHighlight
          style={{ backgroundColor: 'white' }}
          onPress={this.handleInvestorPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: '#10458f' }}>添加投资人</Text>
          </View>
        </TouchableHighlight>

        <Text style={{ marginTop: 20, marginBottom: 8, marginLeft: 10, color: 'gray' }}>交易师</Text>

        <View style={{ backgroundColor: 'white' }}>

          {this.state.traders.map((m, i) => (<View key={i}>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={this.handleRemoveTraderBtnPressed.bind(this, i)}>
                <View style={{ marginRight: 8, width: 24, height: 24, backgroundColor: 'red', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 2, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{m.username}</Text>
                <Text style={{ fontSize: 16, color: 'gray' }}>{m.email}</Text>
              </View>
            </View>
            <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
          </View>))}

        </View>

        <TouchableHighlight
          style={{ backgroundColor: 'white' }}
          onPress={this.handleTraderPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: '#10458f' }}>添加交易师</Text>
          </View>
        </TouchableHighlight>

        <Text style={{ marginTop: 20, marginBottom: 8, marginLeft: 10, color: 'gray' }}>参会人</Text>

        <View style={{ backgroundColor: 'white' }}>

          {this.state.attendees.map((m, i) => (<View key={i}>
            <TouchableHighlight
              style={{ backgroundColor: 'white' }}
              onPress={this.handleAttendeeItemPressed.bind(this, i, m)}
              underlayColor={'lightgray'}
            >
              <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={this.handleRemoveAttendeeBtnPressed.bind(this, i)}>
                  <View style={{ marginRight: 8, width: 24, height: 24, backgroundColor: 'red', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 2, backgroundColor: 'white' }} />
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{m.username}</Text>
                  <Text style={{ fontSize: 16, color: 'gray' }}>{m.email}</Text>
                </View>
                <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
              </View>
            </TouchableHighlight>
            <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
          </View>))}
          
        </View>

        <TouchableHighlight
          style={{ marginBottom: 40, backgroundColor: 'white' }}
          onPress={this.handleAddAttendeeBtnPressed}
          underlayColor="lightgray"
        >
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 16, color: '#10458f' }}>添加参会人</Text>
          </View>
        </TouchableHighlight>

        {/* {this.state.project ?
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
        } */}

        {/* {this.state.user ?
          <View style={{ marginTop: 20 }}>
            <UserItem {...this.state.user} onSelect={this.handleUserPressed} />
          </View>
          :
          <TouchableHighlight style={{ marginTop: 20 }} underlayColor="lightgray" onPress={this.handleUserPressed}>
            <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
              <Text style={{ fontSize: 16 }}>添加用户</Text>
            </View>
          </TouchableHighlight>
        } */}

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