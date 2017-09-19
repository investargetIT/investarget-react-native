import React from 'react';
import { Image, Text, View, StatusBar } from 'react-native';

class ModifyBusinessCard extends React.Component {
    
    static navigationOptions = {
        title: '修改名片',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    render() {
        return <Text>修改名片</Text>
    }
}

export default ModifyBusinessCard;