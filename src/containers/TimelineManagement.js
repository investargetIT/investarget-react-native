import React from 'react';
import { Image, Text, View, StatusBar } from 'react-native';

class TimelineManagement extends React.Component {
    
    static navigationOptions = {
        title: '时间轴管理',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    render() {
        return (
            <View>
                {/* <StatusBar backgroundColor="red" barStyle="light-content" /> */}
                <Text>时间轴管理</Text>
            </View>
        )
    }
}

export default TimelineManagement;