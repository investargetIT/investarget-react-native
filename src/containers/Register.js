import React from 'react'
import { View, Picker, Platform, asyncStorage } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'
import * as api from '../api'
import { connect } from 'react-redux'
import { receiveContinentsAndCountries, handleError } from '../../actions'
import CheckBox from 'react-native-checkbox'

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
            showNext: false,
            userExist: false,
            areaCode: '86',
            mobile: '18625089842',
            code: '048571',
            token: 'f87da664ec3c2c1ccf0a7f6ca382c08d',
            email: 'xuzhiming920@gmail.com',
            checked: true,
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

    checkPhoneExist = () => {
        api.checkUserExist(this.state.mobile)
            .then(data => {
                if (data.result) {
                    this.setState({ userExist: true })
                    const { areaCode, mobile } = this.state
                    this.props.navigation.navigate('RetrievePassword', { areaCode, mobile, title: '设置密码' })
                } else {
                    this.setState({ showNext: true, userExist: false })
                }
            })
            .catch(error => {
                this.props.dispatch(handleError(error))
            })
    }

    handleCodeChange = (value) => {
        this.setState({ code: value })
    }

    handleCodeSend = () => {
        const { areaCode, mobile } = this.state
        const param = { areacode: areaCode, mobile }
        api.sendSmsCode(param)
            .then(data => {
                console.log('@@@', data)
                const {status, smstoken: token, msg} = data
                if (status !== 'success') {
                    throw new Error(msg)
                }
                this.setState({ token })
            })
            .catch(error => {
                console.log('>>>', error)
                this.props.dispatch(handleError(error))
            })
    }

    handleEmailChange= (value) => {
        this.setState({ email: value })
    }

    handleRegister = (userType) => {
        const { areaCode, mobile, code, token, email, checked } = this.state
        if (!(areaCode && mobile && code && token && email && checked)) {
            return
        }
        const param = { areaCode, mobile, code, token, email, userType }
        this.props.navigation.navigate('Register2', param)
    }

    handleRegisterAsTrader = () => {
        this.handleRegister('trader')
    }

    handleRegisterAsInvestor = () => {
        this.handleRegister('investor')
    }

    handleCheck = (checked) => {
        this.setState({ checked: !checked })
    }
    
    componentDidMount() {
        this.setState({ showNext: false })

        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        }).catch(error => {
            this.props.dispatch(handleError(error))
        })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <FormContainer>
                    <FormMobileInput
                        containerStyle={{marginBottom: 30}}
                        areaCode={this.state.areaCode}
                        areaCodeOptions={this.props.areaCodeOptions}
                        onAreaCodeChange={this.handleAreaCodeChange}
                        onPick={this.handleShowPicker}
                        mobile={this.state.mobile}
                        onMobileChange={this.handleMobileChange}
                    />

                    {!this.state.showNext ? (
                        <FormButton containerStyle={{marginBottom: 30}} onPress={this.checkPhoneExist} type="primary">下一步</FormButton>
                    ) : null}
                    
                    {(this.state.showNext && !this.state.userExist) ? (
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

                            <View style={{display:'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 30}}>
                                <CheckBox checkboxStyle={{width: 16, height: 16}} labelStyle={{fontSize:13,color:'#999'}} label="用户协议" checked={this.state.checked} onChange={this.handleCheck} />
                            </View>
                        </View>
                    ) : null}
                </FormContainer>
            </View>
        )
    }
}


function mapStateToProps(state) {
    const { continentsAndCountries } = state.app
    const areaCodeOptions = continentsAndCountries.filter(item => item.level == 2)
                                .map(item => ({ label: item.country, value: item.areaCode }))
    return { areaCodeOptions }
}
export default connect(mapStateToProps)(Register)
