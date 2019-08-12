import React from 'react';
import { Text, View, Image, TextInput, } from 'react-native';

class ProjectBDFilter extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: (
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 240, height: 30, backgroundColor: '#fff', borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../images/home/search.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <TextInput
              underlineColorAndroid="transparent"
              selectionColor="#2269d4"
              placeholderTextColor="#999"
              style={{ width: 180, fontSize: 15, padding: 0 }}
              placeholder="输入项目名称搜索项目BD"
              value={params.value}
              onChangeText={(value) => { params.onChange && params.onChange(value) }}
            />
          </View>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: <View style={{ width: 24, height: 24 }}></View>
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      search: '',
    };

    this.props.navigation.setParams({
      value: this.state.search,
      onChange: this.handleChangeSearch,
    });
  }

  handleChangeSearch = (value) => {
    this.setState({ search: value });
    this.props.navigation.setParams({ value: value });
  }

  render() {
    return <Text>{this.state.search}</Text>;
  }
}

export default ProjectBDFilter;
