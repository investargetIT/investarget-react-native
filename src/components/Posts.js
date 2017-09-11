import React from 'react'
import { Image, Text } from 'react-native'

class Posts extends React.Component {
    
    static navigationOptions = {
        title: '智库',
        tabBarIcon: ({ focused, tintColor }) => {
            const image = focused ? require('../images/tabbar/creative_fill.png') : require('../images/tabbar/creative.png')
            return <Image source={image} style={{width:24,height:24,resizeMode:'cover'}} />
        },
    }

    render() {
        return <Text>智库</Text>
    }
}

export default Posts