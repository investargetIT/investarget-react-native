import React from 'react';
import { 
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
} from 'react-native';

class AddProject extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加项目',
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

  constructor (props) {
    super (props);
    this.state = {
      search: ''
    }
  }
  
  componentDidMount () {
    this.props.navigation.setParams({ onPress: this.handleSubmit });
  }
  handleSubmit () {}
  render () {
    return (
      <View>

        <View style={{ height: 48, backgroundColor: 'white', paddingLeft: 8, paddingRight: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={require('../images/home/search.png')} 
              style={{ width: 20, height: 20, marginRight: 8 }} 
            />
            <TextInput
                style={{ width: '90%', fontSize: 15 }}
                placeholder="搜索项目"
                value={this.state.search}
                onChangeText={value => this.setState({ search: value }) }
            />
        </View>

    </View>
    );
  }
}

export default AddProject;