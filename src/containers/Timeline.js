import React from 'react';
import { Image, Text, View, StatusBar, ImageBackground, Platform } from 'react-native';

class Timeline extends React.Component {
    
  static navigationOptions = {
    title: '项目进程',
    headerStyle: {
      backgroundColor: '#10458f',
      marginTop: Platform.OS === 'android' ? 24 : 0,
    },
    headerTintColor: '#fff',
    headerBackTitle: null,
  };


  render() {
    return (
      <View style={{ flex: 1 }}>
        
        <Image source={require('../images/timeline/timeLineBG.png')} style={{ position: 'absolute', width: '100%', height: '100%' }}/>

        <View style={{ marginLeft: 50, paddingLeft: 10, paddingTop: 10, paddingRight: 48, paddingBottom: 10, borderLeftWidth: 1, borderLeftColor: 'white',  }}>
          <View style={{ width: 10, height: 10, backgroundColor: 'white', borderWidth: 1, borderColor: 'orange', borderRadius: 5, position: 'absolute', left: -6, top: 20 }}></View>
          <Image source={require('../images/timeline/timeline-title-bg.png')} style={{ position: 'relative', backgroundColor: 'transparent'}}>
            <Text style={{ position: 'absolute', left: 16, top: Platform.OS === 'android' ? 2 : 4, color: 'white', fontSize: 16, backgroundColor: 'transparent' }}>碧溪项目</Text>
          </Image>
        </View>

      </View>
    );
  }
}

export default Timeline;