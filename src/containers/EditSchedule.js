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

class EditSchedule extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '编辑日程',
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

    this.timeline = null;

    this.state = {
      title: '',
      address: '',
      showDatePickerIOS: false,
      date: new Date(),
      project: null,
      user: null,
      area: null,
      areaOptions: [],
    }
  }

  componentDidMount () {
    this.id = this.props.navigation.state.params.id;
    this.props.dispatch(requestContents());
    api.getScheduleDetail(this.id)
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
        area: result.country && result.country.id,
      });
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    })
    .catch(error => console.error(error));

    api.getSource('country')
      .then(result => {
        const areaOptions = result.filter(f => f.level === 3).map(m => ({ value: m.id, label: m.country }));
        this.setState({ areaOptions });
      })
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
      country: this.state.area,
    };
    api.editSchedule(this.id, body)
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
      api.editSchedule(this.id, body),
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
          area={this.state.area}
          handleChangeArea={ area => this.setState({ area })}
        />
        
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

export default connect(mapStateToProps)(EditSchedule);