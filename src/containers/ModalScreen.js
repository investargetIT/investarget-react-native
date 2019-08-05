import React from 'react';
import { View, Text, Button, TouchableOpacity, StatusBar } from 'react-native';

class ModalScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 20, height: 88, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#10458f' }}>
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={this.handleCancelBtnPressed}>
            <Text style={{ fontSize: 15, color: 'white' }}>取消</Text>
          </TouchableOpacity>
          <Text>标题</Text>
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={this.handleSaveBtnPressed}>
            <Text style={{ fontSize: 15, color: 'white' }}>保存</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30 }}>This is a modal!</Text>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
      </View>
    );
  }
}

export default ModalScreen;
