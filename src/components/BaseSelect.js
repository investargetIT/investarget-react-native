import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import Button from './Button'
import { isIPhoneX } from '../utils';

const buttonContainerStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 28,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 12,
    margin: 5,

}
const activeButtonContainerStyle = {
    ...buttonContainerStyle,
    borderColor: '#2269d4',
}
const buttonStyle = {
    color: '#999',
    fontSize: 13,   
    flex: 0, 
}
const activeButtonStyle = {
    ...buttonStyle,
    color: '#2269d4',
}


class Select extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            _value: props.multiple ? props.value : (props.value ? [props.value] : []),
        }
    }

    handleChange = (itemValue) => {
        if (this.props.multiple) {
            if (this.state._value.includes(itemValue)) {
                let index = this.state._value.indexOf(itemValue)
                this.setState({ _value: [ ...this.state._value.slice(0, index), ...this.state._value.slice(index + 1)] })
            } else {
                this.setState({ _value: [ ...this.state._value, itemValue] })
            }
        } else {
            this.setState({ _value: [itemValue] })
        }
    }

    handleReset = () => {
        this.setState({ _value: [] })
    }

    handleConfirm = () => {
        this.props.onChange(this.props.multiple ? this.state._value : this.state._value[0])
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ _value: nextProps.multiple ? nextProps.value : (nextProps.value ? [nextProps.value] : []) })
    }

    render() {
        return (
            <View style={{ display: 'flex', backgroundColor: '#fff', ...this.props.style}}>
                <Text style={{fontSize: 16,padding: 16}}>{this.props.title}</Text>
                <ScrollView style={{ height: 250}}>
                    <View style={{padding: 10,display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                        {
                            this.props.options.map(option => {
                                const active = this.state._value.includes(option.value)
                                return (
                                    <Button
                                        key={option.value}
                                        containerStyle={active ? activeButtonContainerStyle : buttonContainerStyle}
                                        style={active ? activeButtonStyle : buttonStyle}
                                        onPress={this.handleChange.bind(this, option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                )
                            })
                        }
                    </View>                      
                </ScrollView>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                    <TouchableOpacity activeOpacity={0.8} style={{ flex: 1, height: 50, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center' }} onPress={this.handleReset}>
                        <Text style={{fontSize: 16, color: '#fff'}}>重置</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} style={{ flex: 1, height: 50, backgroundColor: '#2269d4', alignItems: 'center', justifyContent: 'center' }} onPress={this.handleConfirm}>
                        <Text style={{fontSize: 16, color: '#fff'}}>确定</Text>
                    </TouchableOpacity>
                </View>
                { isIPhoneX() ? 
                  <View style={{ height:34 }} />
                : null }
            </View>
        )
    }
}

export default Select