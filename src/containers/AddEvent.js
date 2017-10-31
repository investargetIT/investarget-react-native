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
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={() => { params.onPress && params.onPress() }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>保存</Text>
        </TouchableOpacity>
      )
    }
  }

  constructor (props) {
    super (props);

    this.state = {
      title: '',
      address: '',
      showDatePickerIOS: false,
      date: new Date(),
      project: null,
      user: null,
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({ onPress: this.handleSubmit });
  }

  handleSubmit = () => {
    this.props.dispatch(requestContents());
    const body = {
      scheduledtime: formatDate(this.state.date),
      comments: this.state.title,
      proj: this.state.project.id,
      address: this.state.address,
      user: this.state.user.id
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

  onSelectProject = project => {
    this.setState({ project });
  }

  onSelectUser = user => {
    this.setState({ user });
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

  render () {
    return (
      <ScrollView>

        <View style={{ backgroundColor: 'white',  marginTop: 20 }}>

        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
          <TextInput
            style={{ fontSize: 16 }}
            onChangeText={ title => this.setState({ title })}
            value={this.state.title}
            placeholder="标题"
          />
        </View>

        <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
          <TextInput
            style={{ fontSize: 16 }}
            onChangeText={address => this.setState({ address })}
            value={this.state.address}
            placeholder="地点"
          />
        </View>
        </View>

        <TouchableHighlight style={{ marginTop: 20, backgroundColor: 'white' }} onPress={() => this.setState({ showDatePickerIOS: 'end' })} underlayColor={'lightgray'}>
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
          style={{ marginTop:20, paddingLeft: 10, backgroundColor: 'white' }} 
          underlayColor="lightgray" 
          onPress={this.handleProjectPressed}
        >
          <Text style={{ fontSize: 16, lineHeight: 44 }}>添加项目</Text>
        </TouchableHighlight>
        }

        { this.state.user ? 
        <View style={{ marginTop: 20 }}>
          <UserItem {...this.state.user} onSelect={this.handleUserProcessed} />
        </View>
        :
        <TouchableHighlight style={{ marginTop:20, paddingLeft: 10, backgroundColor: 'white' }} underlayColor="lightgray" onPress={this.handleUserProcessed}>
          <Text style={{ fontSize: 16, lineHeight: 44 }}>添加用户</Text>
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

function formatDate(date) {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }
  return date.getFullYear() +
  '-' + pad(date.getMonth() + 1) +
  '-' + pad(date.getDate()) +
  'T' + pad(date.getHours()) +
  ':' + pad(date.getMinutes()) +
  ':' + pad(date.getSeconds());
}

export default connect()(AddEvent);