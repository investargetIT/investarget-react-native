import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

class EditAttendee extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '编辑参会人', 
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

  constructor(props) {
    super(props);
    this.state = {
      username: props.navigation.state.params.username || '',
      email: props.navigation.state.params.email || '',
    };
  }

  handleUsernameChange = text => {
    this.setState({ username: text });
    if (text.length > 0 && this.state.email.length > 0) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    } else {
      this.props.navigation.setParams({ onPress: null });
    }
  }

  handleEmailChange = text => {
    this.setState({ email: text });
    if (text.length > 0 && this.state.username.length > 0) {
      this.props.navigation.setParams({ onPress: this.handleSubmit });
    } else {
      this.props.navigation.setParams({ onPress: null });
    }
  }

  handleSubmit = () => {
    this.props.navigation.goBack();
    this.props.navigation.state.params.onSave(this.state.text);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
          <TextInput
            style={{ fontSize: 16, paddingLeft: 0 }}
            onChangeText={this.handleUsernameChange}
            value={this.state.username}
            placeholder="姓名（必填）"
            underlineColorAndroid="transparent"
            autoFocus={true}
          />
        </View>
        <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
        <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', backgroundColor: 'white' }}>
          <TextInput
            style={{ fontSize: 16, paddingLeft: 0 }}
            onChangeText={this.handleEmailChange}
            value={this.state.email}
            keyboardType="email-address"
            placeholder="邮箱（必填）"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
    );
  }
}

export default EditAttendee;
