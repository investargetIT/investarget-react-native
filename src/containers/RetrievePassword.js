import React from 'react'
import { View, Picker, Platform } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'


class RetrievePassword extends React.Component {

    static navigationOptions = {
        title: '找回密码',
        headerStyle: {
            height: 48,
            backgroundColor: '#fff',
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            showPicker: false,
            areaCode: '86',
            areaCodeOptions: [
                { label: '+86', value: '86' },
                { label: '+861', value: '861' },
                { label: '+862', value: '862' },
                { label: '+863', value: '863' },
                { label: '+864', value: '864' },
                { label: '+865', value: '865' },
                { label: '+866', value: '866' },
            ],
            mobile: '',
            code: '',
            password: '',
        }
    }


    handleAreaCodeChange = (value, index) => {
        this.setState({ areaCode: value, showPicker: false })
    }

    handleMobileChange = (value) => {
        this.setState({ mobile: value })
    }

    handleShowPicker = () => {
        this.setState({ showPicker: true })
    }

    handleCancel = () => {
        this.setState({ showPicker: false })
    }

    handleConfirm = (value) => {
        this.setState({ areaCode: value, showPicker: false })
    }

    handleCodeChange = (value) => {
        this.setState({ code: value })
    }

    handleCodeSend = () => {
        // send verification code
    }

    handlePasswordChange= (value) => {
        this.setState({ password: value })
    }

    render() {
        return (
            <View>
                <FormContainer>
                    <FormMobileInput
                        containerStyle={{marginBottom: 30}}
                        areaCode={this.state.areaCode}
                        areaCodeOptions={this.state.areaCodeOptions}
                        onAreaCodeChange={this.handleAreaCodeChange}
                        onPick={this.handleShowPicker}
                        mobile={this.state.mobile}
                        onMobileChange={this.handleMobileChange}
                    />
                    <FormVerificationCode
                        containerStyle={{marginBottom: 30}}
                        placeholder="请输入验证码"
                        value={this.state.code}
                        onChange={this.handleCodeChange}
                        onSend={this.handleCodeSend}
                    />
                    <FormTextInput
                        containerStyle={{marginBottom: 30}}
                        placeholder="请输入新的密码"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                    />
                </FormContainer>
            </View>
        )
    }
}

export default RetrievePassword
