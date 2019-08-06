import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

class EditText extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params.title, 
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
      text: props.navigation.state.params.initialValue || '',
      keyboardType: props.navigation.state.params.keyboardType || 'default',
    };
  }

  handleTextChange = text => {
    this.setState({ text });
    if (text.length > 0) {
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
            onChangeText={this.handleTextChange}
            value={this.state.text}
            keyboardType={this.state.keyboardType}
            placeholder="内容"
            underlineColorAndroid="transparent"
            autoFocus={true}
          />
        </View>
      </View>
    );
  }
}

export default EditText;
