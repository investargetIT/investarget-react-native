import React from 'react'
import { Image, Text } from 'react-native'

class Events extends React.Component {
    
    static navigationOptions = {
        title: '活动',
        tabBarIcon: ({ focused, tintColor }) => {
            const image = focused ? require('../images/tabbar/activity_fill.png') : require('../images/tabbar/activity.png')
            return <Image source={image} style={{width:24,height:24,resizeMode:'cover'}} />
        },
    }

    render() {
        return <Text>活动</Text>
    }
}

export default Events