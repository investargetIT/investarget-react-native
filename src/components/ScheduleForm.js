import React from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableHighlight,
    Modal,
    TouchableWithoutFeedback,
    DatePickerIOS,
    Platform,
    DatePickerAndroid,
    TimePickerAndroid,
} from 'react-native';
import ProjectItem from './ProjectItem';
import UserItem from './UserItem';
import Picker from './Picker';
import Cascader from './Cascader';
import { connect } from 'react-redux';
import * as api from '../api';
import { receiveContinentsAndCountries } from '../../actions';

const scheduleTypeOptions = [
    { label: '路演会议', value: 1 },
    { label: '约见公司', value: 2 },
    { label: '约见投资人', value: 3 },
];

class ScheduleForm extends React.Component {

    constructor (props) {
        super (props);

        this.state = {
            showDatePickerIOS: false,
            showSelectCountry: false,
        }
      
      const now = new Date();
      this.minimumDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    componentDidMount() {
        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        })
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


    handleSelectCountry = country => {
      this.setState({ showSelectCountry: false });
      this.props.onSelectCountry(country);
    }

    render() {

        const props = this.props;
        const isChina = this.props.country && ['中国', 'China'].includes(this.props.country.label);
        return (
            <View>
                <View style={{ backgroundColor: 'white', marginTop: 20 }}>

                    <Picker
                        style={{ flex: 1, height: 44, paddingLeft: 2 }}
                        value={props.type}
                        onChange={props.handleChangeType}
                        placeholder="日程类型"
                        options={scheduleTypeOptions} />

                    <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

                    <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
                        <TextInput
                            style={{ fontSize: 16, paddingLeft: 0 }}
                            onChangeText={props.handleContentChange}
                            value={props.title}
                            placeholder="内容"
                            underlineColorAndroid="transparent"
                        />
                    </View>

                    <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

                    <TouchableHighlight
                      style={{ backgroundColor: 'white' }}
                      onPress={() => this.setState({ showSelectCountry: true })}
                      underlayColor={'lightgray'}
                    >
                      <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16, color: props.country ? undefined : 'lightgray' }}>
                          {props.country ? props.country.label : '国家'}
                        </Text>
                      </View>
                    </TouchableHighlight>

                    <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />

                    { isChina ? 
                    <Picker
                        style={{flex: 1, height: 44, paddingLeft: 2}}
                        value={props.location}
                        onChange={props.handleChangeArea}
                        placeholder="地区"
                        options={props.areaOptions} />
                   : null }

                    { isChina ? 
                    <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
                    : null }

                    <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
                        <TextInput
                            style={{ fontSize: 16, paddingLeft: 0 }}
                            onChangeText={props.handleAddressChange}
                            value={props.address}
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
                        <Text style={{ fontSize: 16 }}>{props.date && formatDate(props.date)}</Text>
                    </View>
                </TouchableHighlight>

                {props.project ?
                    <View style={{ marginTop: 20 }}>
                        <ProjectItem {...props.project} onPress={props.handleProjectPressed} />
                    </View>
                    :
                    <TouchableHighlight
                        style={{ marginTop: 20 }}
                        underlayColor="lightgray"
                        onPress={props.handleProjectPressed}
                    >
                        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
                            <Text style={{ fontSize: 16 }}>添加项目</Text>
                        </View>
                    </TouchableHighlight>
                }

                {props.user ?
                    <View style={{ marginTop: 20 }}>
                        <UserItem {...props.user} onSelect={props.handleUserPressed} />
                    </View>
                    :
                    <TouchableHighlight style={{ marginTop: 20 }} underlayColor="lightgray" onPress={props.handleUserPressed}>
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
                                    date={props.date}
                                    mode="datetime"
                                    minimumDate={this.minimumDate}
                                    onDateChange={props.onDateChange}
                                    minuteInterval={30}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    : null}

                <Modal
                  transparent={true}
                  visible={this.state.showSelectCountry}
                >
                  <TouchableWithoutFeedback style={{ backgroundColor: 'cyan' }} onPress={() => this.setState({ showSelectCountry: false })}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, .2)' }}>
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }}>
                        <Cascader
                          chosenItem={[]}
                          onItemClick={this.handleSelectCountry} 
                          options={props.countryOptions} 
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

            </View>
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
    ' ' + pad(date.getHours()) +
    ':' + pad(date.getMinutes());
  }
 
function mapStateToProps(state) {
    const { continentsAndCountries } = state.app;
    const countryOptions = continentsAndCountries.filter(item => item.parent == null)
        .map(item => ({ value: item.id, label: item.country }))
    countryOptions.forEach(pItem => {
        pItem['children'] = continentsAndCountries.filter(item => item.parent == pItem.value)
            .map(item => ({ value: item.id, label: item.country }))
    });
    return { countryOptions };
}

export default connect(mapStateToProps)(ScheduleForm);