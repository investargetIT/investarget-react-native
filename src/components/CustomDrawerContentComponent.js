import React from 'react';
import { View, Text } from 'react-native';
import { DrawerItems } from 'react-navigation';
import { connect } from 'react-redux';
import { logout } from '../../actions';
import AsyncStorage from '../AsyncStorage';

const CustomDrawerContentComponent = (props) => {
  function handleLogout() {
    AsyncStorage.removeItem('userInfo')
      .then(data => {
        props.dispatch(logout());
        props.navigation.navigate('DrawerClose');
      })
      .catch(error => console.log(error));
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 20, backgroundColor: 'cyan' }} />
      <Text>Custom Drawer Header</Text>
      <DrawerItems {...props} />
      <Text style={{ marginLeft: 15, marginTop: 10 }} onPress={handleLogout}>退出登录</Text>
    </View>
  );
};

export default connect()(CustomDrawerContentComponent);