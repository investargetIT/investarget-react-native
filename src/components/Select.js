import React from 'react'
import { View, TextInput, Modal, TouchableOpacity } from 'react-native'

import BaseSelect from './BaseSelect'

const selectStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    borderTopWidth:1,
    borderTopColor:'#ddd',
}


class Select extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    handleClick = () => {
        this.setState({ visible: true })
    }

    handleChange = (value) => {
        this.setState({ visible: false })
        this.props.onChange(value)
    }

    render() {
        var valueStr = ''
        if (this.props.multiple) {
            valueStr = this.props.options.filter(item => this.props.value.includes(item.value)).map(item => item.label).join(',')
        } else {
            let item = this.props.options.filter(item => item.value == this.props.value)[0]
            valueStr = item ? item.label : ''
        }

        return (
            <View style={this.props.containerStyle}>
                <TouchableOpacity style={{position: 'absolute',zIndex: 1,width: '100%',height:'100%'}} onPress={this.handleClick}></TouchableOpacity>
                <TextInput
                    editable={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    placeholder={this.props.placeholder}
                    style={{ height: '100%',padding: 0, ...this.props.style }}
                    value={valueStr}
                />
                <Modal visible={this.state.visible} animationType="slide" transparent={true} onRequestClose={()=>{}}>
                    <BaseSelect
                        value={this.props.value}
                        onChange={this.handleChange}
                        options={this.props.options}
                        title={this.props.title}
                        multiple={this.props.multiple}
                        style={selectStyle}
                    />
                </Modal>
            </View>
        )
    }
}

export default Select