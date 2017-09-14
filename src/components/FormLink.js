import React from 'react'
import { TouchableOpacity, Text } from 'react-native'


const style = {
    textAlign:'center',
    fontSize:15,
    color:'#2269d4',
    backgroundColor:'transparent',
    opacity:0.8,
}

class FormLink extends React.Component {
    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <Text style={style}>
                    {this.props.children}
                </Text>
            </TouchableOpacity>
        )
    }
}

export default FormLink