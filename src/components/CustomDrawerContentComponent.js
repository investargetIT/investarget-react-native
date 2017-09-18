import React from 'react';
import { View, Text, Alert } from 'react-native';
import { DrawerItems } from 'react-navigation';
import { connect } from 'react-redux';
import { logout } from '../../actions';
import AsyncStorage from '../AsyncStorage';

const CustomDrawerContentComponent = (props) => {
  function confirm() {
    props.navigation.navigate('DrawerClose');
    Alert.alert(
      '确定退出？',
      '退出后将无法收到推荐项目等通知消息',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确定', onPress: () => handleLogout()},
      ],
      { cancelable: true }
    )

  }
  function handleLogout() {
    AsyncStorage.removeItem('userInfo')
      .then(data => props.dispatch(logout()))
      .catch(error => console.log(error));
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 20, backgroundColor: 'cyan' }} />
      <Text>Custom Drawer Header</Text>
      <DrawerItems {...props} />
      <Text style={{ marginLeft: 15, marginTop: 10 }} onPress={confirm}>退出登录</Text>
    </View>
  );
};

export default connect()(CustomDrawerContentComponent);