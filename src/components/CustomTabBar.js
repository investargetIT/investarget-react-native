import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

class CustomTabBar extends React.Component {
  routeToName = {
    project: '项目',
    service: '服务',
  };
  state = {
    active: 'project'
  };
  handleTabItemOnPress(route) {
    this.setState({ active: route.routeName });
    this.props.navigation.navigate(route.routeName);
  }
  handleIconPressed = () => this.props.navigation.navigate('DrawerOpen');
  render() {
    const { routes } = this.props.navigation.state;
    return (
      <View style={{ backgroundColor: '#10458F', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', left: 18, height: '100%', width: 36, justifyContent: 'center', alignContent: 'center' }}>
          <TouchableOpacity onPress={this.handleIconPressed}>
            <Image source={require('../images/usericon.png')} style={{ width: 18, height: 22 }} />
          </TouchableOpacity>
        </View>
        {routes.map(route => (
          <View key={route.key} style={{ borderBottomWidth: this.state.active === route.routeName ? 2 : 0, borderBottomColor: 'white', padding: 10 }}>
            <Text style={{ fontSize: 18, color: this.state.active !== route.routeName ? 'rgba(255, 255, 255, 0.8)' : 'white' }} onPress={this.handleTabItemOnPress.bind(this, route)}>{this.routeToName[route.routeName]}</Text>
          </View>
        ))}
      </View>
    )
  }
}

export default CustomTabBar;