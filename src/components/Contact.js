import React from 'react'
import { Image, Text } from 'react-native'

class Contact extends React.Component {
    
    static navigationOptions = {
        title: '联系我们',
        headerStyle: {
            height: 48,
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
        return <Text>联系方式</Text>
    }
}

export default Contact