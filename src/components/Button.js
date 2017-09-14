import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'



const containerStyle = {
    overflow:'hidden',
}
const touchableStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}
const style = {
    textAlign: 'center',
}

class Button extends React.Component {
    render() {
        return (
            <View style={{...containerStyle, ...this.props.containerStyle}}>
                <TouchableOpacity onPress={this.props.onPress} style={touchableStyle}>
                    <Text style={{...style, ...this.props.style}}>{this.props.children}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

export default Button