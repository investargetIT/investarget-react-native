import React from 'react'
import { View, Picker, Platform } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'


class Register extends React.Component {

    static navigationOptions = {
        title: '注册',
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
            mobile: '',
            areaCodeOptions: [
                { label: '+86', value: '86' },
                { label: '+861', value: '861' },
                { label: '+862', value: '862' },
                { label: '+863', value: '863' },
                { label: '+864', value: '864' },
                { label: '+865', value: '865' },
                { label: '+866', value: '866' },
            ],
            code: '',
            email: '',
            next: false,
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

    handleNext = () => {
        this.setState({ next: true })
    }

    handleCodeChange = (value) => {
        this.setState({ code: value })
    }

    handleCodeSend = () => {
        // send verification code
    }

    handleEmailChange= (value) => {
        this.setState({ email: value })
    }

    handleRegisterAsTrader = () => {
        this.props.navigation.navigate('Register2')
    }

    handleRegisterAsInvestor = () => {
        this.props.navigation.navigate('Register2')
    }

    render() {
        return (
            <View style={{flex: 1}}>
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

                    {this.state.next ? (
                        <View>
                            <FormVerificationCode
                                containerStyle={{marginBottom: 30}}
                                placeholder="请输入验证码"
                                value={this.state.code}
                                onChange={this.handleCodeChange}
                                onSend={this.handleCodeSend} />
                            <FormTextInput
                                containerStyle={{marginBottom: 30}}
                                placeholder="请输入邮箱"
                                keyboardType="email-address"
                                value={this.state.email}
                                onChange={this.handleEmailChange}
                            />
                            <FormButton type="primary" onPress={this.handleRegisterAsTrader}>我是交易师</FormButton>
                            <FormButton type="primary" onPress={this.handleRegisterAsInvestor}>我是投资人</FormButton>
                        </View>
                    ) : (
                        <FormButton containerStyle={{marginBottom: 30}} onPress={this.handleNext} type="primary">下一步</FormButton>
                    )}
                </FormContainer>

                {(Platform.OS == 'ios' && this.state.showPicker) ? (
                    <View style={{ display: 'flex', position: 'absolute',bottom: 0,left: 0, width: '100%',backgroundColor: '#fff',borderTopWidth:1,borderTopColor:'#ddd'}}>
                        <PickerIOS2 value={this.state.areaCode} options={this.state.areaCodeOptions} onCancel={this.handleCancel} onConfirm={this.handleConfirm} title="国家区号" />
                    </View>
                ):null}
            </View>
        )
    }
}

export default Register
