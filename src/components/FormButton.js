import React from 'react'
import Button from './Button'


const _containerStyle = {
    marginBottom:10,
    borderWidth:1,
    borderColor:'#2269d4',
    height:40,
    borderRadius:20,
    overflow:'hidden',
    backgroundColor:'transparent',
}
const _style = {
    fontSize:18,
    color:'#2269d4',
}
const _containerPrimaryStyle = {
    ..._containerStyle,
    borderColor:'#2269d4',
    backgroundColor:'#2269d4',
}
const _primaryStyle = {
    ..._style,
    color: '#fff',
}

class FormButton extends React.Component {
    render() {

        const containerStyle = this.props.type == 'primary' ? _containerPrimaryStyle : _containerStyle
        const style = this.props.type == 'primary' ? _primaryStyle : _style

        return (
            <Button
                containerStyle={{ ...containerStyle, ...this.props.containerStyle }}
                style={{ ...style, ...this.props.style }}
                onPress={this.props.onPress}
            >
                {this.props.children}    
            </Button>
        )
    }
}

export default FormButton
