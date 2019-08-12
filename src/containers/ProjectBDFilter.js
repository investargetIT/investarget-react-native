import React from 'react';
import { Text, View, Image, TextInput, TouchableOpacity } from 'react-native';

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
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} />
        <View style={{ height: 60, backgroundColor: '#fff', paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>已选条件:</Text>
          <Text numberOfLines={2} style={{ fontSize: 13, color: '#666', lineHeight: 18 }}>
            {`项目名称：${this.state.search}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', height: 48 }}>
          <TouchableOpacity onPress={this.reset} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#71a2e5' }}>
            <Text style={{ fontSize: 16, color: '#fff' }}>清空</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.submit} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10458f' }}>
            <Text style={{ fontSize: 16, color: '#fff' }}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default ProjectBDFilter;
