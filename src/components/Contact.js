import React from 'react'
import { Image, Text, View, StatusBar } from 'react-native'

class Contact extends React.Component {
    
    static navigationOptions = {
        title: '联系我们',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            // display: 'flex',
            // flexDirection: 'row',
            // alignItems: 'center',
            // justifyContent: 'center',
        }
    }

    render() {
        return (
            <View>
                <StatusBar backgroundColor="red" barStyle="light-content" />
                <Text>联系方式</Text>
            </View>
        )
    }
}

export default Contact