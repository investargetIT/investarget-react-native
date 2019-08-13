import React from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';

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
      industryGroups: [],
      managers: [],
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

  handleEditIndustryGroupClicked = () => {

  }

  handleManagerPressed = () => {
    this.props.navigation.navigate('FilterUser', {
      title: '添加交易师',
      type: 'trader',
      onSelectUser: this.onSelectTrader,
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          
          <View style={{ backgroundColor: 'white', marginTop: 20 }}>
            <TouchableHighlight
              style={{ backgroundColor: 'white' }}
              onPress={this.handleEditIndustryGroupClicked}
              underlayColor={'lightgray'}
            >
              <View style={{ height: 44, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16 }}>行业组</Text>
                <Text style={{ fontSize: 16, color: 'gray', flex: 1, textAlign: 'right' }}>
                  {this.state.industryGroups.length > 0 ? this.state.industryGroups.map(m => m.name).join('、') : '未选择'}
                </Text>
                <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{ width: 14, height: 14, flex: 0, marginLeft: 8 }} />
              </View>
            </TouchableHighlight>
          </View>

          <Text style={{ marginTop: 20, marginBottom: 8, marginLeft: 10, color: 'gray' }}>BD负责人</Text>
          <View style={{ backgroundColor: 'white' }}>
            {this.state.managers.map((m, i) => (<View key={i}>
              <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={this.handleRemoveTraderBtnPressed.bind(this, i)}>
                  <View style={{ marginRight: 8, width: 24, height: 24, backgroundColor: 'red', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 2, backgroundColor: 'white' }} />
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{m.username}</Text>
                  <Text style={{ fontSize: 16, color: 'gray' }}>{m.email}</Text>
                </View>
              </View>
              <View style={{ height: 0.4, backgroundColor: "#CED0CE", marginLeft: 10 }} />
            </View>))}
          </View>
          <TouchableHighlight
            style={{ backgroundColor: 'white' }}
            onPress={this.handleManagerPressed}
            underlayColor="lightgray"
          >
            <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
              <Text style={{ fontSize: 16, color: '#10458f' }}>添加BD负责人</Text>
            </View>
          </TouchableHighlight>

        </View>
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
