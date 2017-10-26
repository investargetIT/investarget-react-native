import React from 'react';
import { 
  Text,
  TouchableOpacity,
} from 'react-native';

class AddEvent extends React.Component {
  
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加日程',
        headerStyle: {
          backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={() => { params.onPress && params.onPress() }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>保存</Text>
        </TouchableOpacity>
      )
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({ onPress: this.handleSubmit });
  }

  handleSubmit () {

  }

  render () {
    return <Text>AddEvent</Text>;
  }

}

export default AddEvent;