import React from 'react';
import { 
  ScrollView, 
  Text, 
  Alert, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  TouchableHighlight,
  View, 
  StyleSheet, 
} from 'react-native';
import { DrawerItems, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { logout } from '../../actions';
import AsyncStorage from '../AsyncStorage';
import { isIPhoneX } from '../utils';

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
    <ScrollView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../images/userCenter/ht-usercenterheaderbg.png')}
        style={{ width: '100%', height: 200, alignItems: 'center', paddingTop: isIPhoneX() ? 44 : undefined, justifyContent: isIPhoneX() ? undefined : 'center' }}
        blurRadius={2}>
        <TouchableOpacity onPress={() => { props.navigation.navigate('Avatar') }}>
          <Image
            source={props.userInfo ? { uri: props.userInfo.photoUrl } : require('../images/userCenter/defaultAvatar.png')}
            style={{ width: 64, height: 64, borderRadius: 32 }} />
        </TouchableOpacity>

        <Text style={{ backgroundColor: 'transparent', color: 'white', marginTop: 16, fontSize: 18 }}>{props.userInfo && props.userInfo.company}</Text>
        <Text style={{ backgroundColor: 'transparent', color: 'white', marginTop: 10 }}>{props.userInfo && props.userInfo.name}       {props.userInfo&&props.userInfo.title&&props.userInfo.title.titleName}</Text>
      </ImageBackground>
      {/* <DrawerItems {...props} /> */}

      <View style={{ marginTop: 10 }}>
      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('MyCalendar')}>
        <Text>日程管理</Text>
      </TouchableHighlight>

      { props.userInfo && (props.userInfo.permissions.includes('BD.manageProjectBD') || props.userInfo.permissions.includes('BD.user_getProjectBD')) ?
      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('ProjectBD')}>
        <Text>项目BD</Text>
      </TouchableHighlight>
      : null }

      { props.userInfo && (props.userInfo.permissions.includes('BD.manageOrgBD') || props.userInfo.permissions.includes('BD.user_getOrgBD')) ?
      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('OrganizationBD')}>
        <Text>机构BD</Text>
      </TouchableHighlight>
      : null }

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('MyTags')}>
        <Text>关注标签</Text>
      </TouchableHighlight>

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('TimelineManagement')}>
        <Text>项目进程</Text>
      </TouchableHighlight>

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('MyFavoriteProject')}>
        <Text>收藏的项目</Text>
      </TouchableHighlight>

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('ModifyPassword')}>
        <Text>修改密码</Text>
      </TouchableHighlight>

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={() => props.navigation.navigate('ModifyBusinessCard')}>
        <Text>修改名片</Text>
      </TouchableHighlight>

      <TouchableHighlight style={styles.menuContainer} underlayColor="lightgray" onPress={confirm}>
        <Text>退出登录</Text>
      </TouchableHighlight>
</View>
    </ScrollView>
  );
};

function mapStateToProps(state) {
  const { userInfo } = state.app;
  return { userInfo };
}

const styles = StyleSheet.create({
  menuContainer: {
  padding: 15,
  paddingTop: 10,
  paddingBottom: 10,
  } 
});

export default connect(mapStateToProps)(CustomDrawerContentComponent);