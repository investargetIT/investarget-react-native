import React from 'react';
import { View, Text } from 'react-native';
import { DrawerItems } from 'react-navigation';

const CustomDrawerContentComponent = (props) => (
  <View style={{ flex: 1 }}>
    <View style={{ height: 20, backgroundColor: 'cyan' }} />
    <Text>Custom Drawer Header</Text>
    <DrawerItems {...props} />
  </View>
);

export default CustomDrawerContentComponent;