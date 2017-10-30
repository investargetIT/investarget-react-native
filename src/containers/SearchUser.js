import React from 'react';
import {
  Text,
  TouchableOpacity,
} from 'react-native';

class SearchUser extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '选择用户',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => { params.onPress && params.onPress() }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>保存</Text>
        </TouchableOpacity>
      )
    }
  }

  handleSubmit = () => {}
  
  componentDidMount () {
    this.props.navigation.setParams({ onPress: this.handleSubmit });
  }

  render () {
    return <Text>SelectUser</Text>;
  }
}

export default SearchUser;