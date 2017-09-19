import React from 'react';
import { View, Text, Alert, ImageBackground, Image } from 'react-native';
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
      .then(data => {
        props.dispatch(logout());
        props.navigation.navigate('Login');
      })
      .catch(error => console.log(error));
  }
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../images/userCenter/ht-usercenterheaderbg.png')}
        style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' }}
        blurRadius={2}>
        <Image
          source={props.userInfo ? { uri: props.userInfo.photoUrl } : require('../images/userCenter/defaultAvatar.png')}
          style={{ width: 64, height: 64, borderRadius: 32 }} />

        <Text style={{ backgroundColor: 'transparent', color: 'white', marginTop: 16, fontSize: 18 }}>{props.userInfo && props.userInfo.company}</Text>
        <Text style={{ backgroundColor: 'transparent', color: 'white', marginTop: 10 }}>{props.userInfo && props.userInfo.name}       {props.userInfo&&props.userInfo.title&&props.userInfo.title.titleName}</Text>
      </ImageBackground>
      <DrawerItems {...props} />
      <Text style={{ marginLeft: 15, marginTop: 10 }} onPress={confirm}>退出登录</Text>
    </View>
  );
};

function mapStateToProps(state) {
  const { userInfo } = state.app;
  return { userInfo };
}

export default connect(mapStateToProps)(CustomDrawerContentComponent);