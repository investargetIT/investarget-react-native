import React from 'react'
import { View, Platform, StatusBar } from 'react-native'



class CommonStatusBar extends React.Component {

    render() {
        const { backgroundColor, barStyle } = this.props
        if (Platform.OS == 'ios') {
            return (
                <View style={{height:20,backgroundColor:backgroundColor}}>
                    <StatusBar barStyle={barStyle} />
                </View>
            )
        } else {
            return (
                <View style={{height:StatusBar.currentHeight,backgroundColor:backgroundColor}}>
                    <StatusBar backgroundColor={'rgba(0, 0, 0, 0.0)'} barStyle={barStyle} translucent={true} />
                </View>
            )
        }
    }
}

export default CommonStatusBar