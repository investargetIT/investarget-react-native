import React from 'react';
import { View, Text, Button, TouchableOpacity, SafeAreaView, Platform, ScrollView, StatusBar } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import CommonStatusBar from '../components/StatusBar';

class ModalScreen extends React.Component {

  componentDidMount() {
    if (Platform.OS === 'android' && DeviceInfo.hasNotch()) {
      SafeAreaView.setStatusBarHeight(
        /* Some value for status bar height + notch height */
      );
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
      <CommonStatusBar backgroundColor="#10458f" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#10458f' }}>
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={this.handleCancelBtnPressed}>
            <Text style={{ fontSize: 15, color: 'white' }}>取消</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: 'white' }}>标题</Text>
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={this.handleSaveBtnPressed}>
            <Text style={{ fontSize: 15, color: 'white' }}>保存</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={{ height: 1000 }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30 }}>This is a modal!</Text>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
        </ScrollView>
      </SafeAreaView>
      </View>
    );
  }
}

export default ModalScreen;
