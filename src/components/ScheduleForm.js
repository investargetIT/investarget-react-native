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
} from 'react-native';
import ProjectItem from './ProjectItem';
import UserItem from './UserItem';

class ScheduleForm extends React.Component {

    constructor (props) {
        super (props);

        this.state = {
            showDatePickerIOS: false,
        }
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
                props.onDateChange(new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`))
                // this.setState({ date: new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`) });
              }
            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
        }
      }


    render() {

        const props = this.props;

        return (
            <View>
                <View style={{ backgroundColor: 'white', marginTop: 20 }}>
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
                        <Text style={{ fontSize: 16 }}>{props.date && props.date.toLocaleString()}</Text>
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
                                    minimumDate={props.minimumDate}
                                    onDateChange={props.onDateChange}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    : null}
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
  
export default ScheduleForm;