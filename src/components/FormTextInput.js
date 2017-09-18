import React from 'react'
import { View, TextInput, Image, Platform, TouchableOpacity } from 'react-native'
import Button from './Button'
import Picker2 from './Picker'


const _containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2269d4',
}
const _iconStyle = {
    flex: 0,
    width: 30,
    height: 30,
    marginRight: 20,
}
const _style = {
    flex: 1,
    fontSize:15,
    height: 30,
    color: '#333',
}


class FormTextInput extends React.Component {
    
    render() {
        const { containerStyle, style, value, onChange, ...extraProps } = this.props

        return (
            <View style={{..._containerStyle, ...containerStyle}}>
                <TextInput
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    style={{..._style, ...style}}
                    value={value}
                    onChangeText={onChange}
                    {...extraProps}
                />
            </View>
        )
    }
}


class FormTextInputWithIcon extends React.Component {

    render() {
        const { containerStyle, style, icon, value, onChange, ...extraProps } = this.props

        return (
            <View style={{..._containerStyle, borderBottomWidth: 0, ...containerStyle}}>
                <Image source={icon} style={_iconStyle} />
                <TextInput
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    style={{..._style, borderBottomWidth: 1, borderBottomColor: '#2269d4', ...style}}
                    value={value}
                    onChangeText={onChange}
                    {...extraProps}
                />
            </View>
        )
    }
}


class FormPassword extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            secure: true,
        }
    }

    toggle = () => {
        this.setState({
            secure: !this.state.secure
        })
    }

    render() {
        const { containerStyle, style, icon, value, onChange, ...extraProps } = this.props

        const eyeIcon = this.state.secure ? require('../images/login/eyeClose.png')
                                        : require('../images/login/eyeOpen.png')

        return (
            <View style={{..._containerStyle, borderBottomWidth: 0, ...containerStyle}}>
                <Image source={icon} style={_iconStyle} />
                <TextInput
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    secureTextEntry={this.state.secure}
                    style={{..._style, borderBottomWidth: 1, borderBottomColor: '#2269d4', ...style}}
                    value={value}
                    onChangeText={onChange}
                    {...extraProps}
                />
                <TouchableOpacity onPress={this.toggle} style={{position:'absolute',right:0,top:5,width:20,height:20}}>
                    <Image source={eyeIcon} style={{width:20,height:20}} />
                </TouchableOpacity>
            </View>
        )
    }
}


class FormVerificationCode extends React.Component {

    render() {
        const { containerStyle, style, onChange, onSend, ...extraProps } = this.props

        return (
            <View style={{..._containerStyle, ...containerStyle}}>
                <TextInput
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    style={{..._style, ...style}}
                    value={this.props.value}
                    onChangeText={this.props.onChange}
                    {...extraProps} />
                <Button
                    type="primary"
                    containerStyle={{flex: 0, backgroundColor: '#2269d4', width: 90, height: 26, borderRadius: 13}}
                    style={{color: '#fff', fontSize: 13}}
                    onPress={this.props.onSend}>
                    发送验证码
                </Button>
            </View>
        )
    }
}


class FormMobileInput extends React.Component {

    render() {

        return (
            <View style={{..._containerStyle, ...this.props.containerStyle}}>
                <Picker2
                    value={this.props.areaCode}
                    onChange={this.props.onAreaCodeChange}
                    options={this.props.areaCodeOptions}
                    title="国家代码"
                    placeholder="国家代码"
                    style={{flex: 0, width: 120, height: 30}}
                />
                <TextInput
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                    placeholder="请输入手机号"
                    style={{flex: 1,fontSize:15,height: 30,color: '#333'}}
                    value={this.props.mobile}
                    onChangeText={this.props.onMobileChange}
                />
            </View>
        )
    }
}


export default FormTextInput

export {
    FormTextInputWithIcon,
    FormPassword,
    FormVerificationCode,
    FormMobileInput,
}
