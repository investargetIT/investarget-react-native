import React from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity, Text } from 'react-native'
import CheckBox from 'react-native-checkbox'
import Toast from 'react-native-root-toast'

import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import * as api from '../api'
import { receiveContinentsAndCountries } from '../../actions'


class Register extends React.Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            userExist: null,
            areaCode: '86',
            mobile: '',
            code: '',
            token: '',
            email: '',
            checked: true,
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    handleCheck = (checked) => {
        this.setState({ checked: !checked })
    }

    checkPhoneExist = () => {
        if (!this.state.mobile) {
            Toast.show('请输入手机号', { position: Toast.positions.CENTER })
            return
        }
        api.checkUserExist(this.state.mobile)
            .then(data => {
                if (data.result) {
                    this.setState({ userExist: null })
                    const { areaCode, mobile } = this.state
                    this.props.navigation.navigate('RetrievePassword', { areaCode, mobile, title: '设置密码' })
                } else {
                    this.setState({ userExist: false })
                }
            })
            .catch(error => {
                Toast.show(error.message, { position: Toast.positions.CENTER })
            })
    }

    handleCodeSend = () => {
        const { areaCode, mobile } = this.state
        if (!areaCode || !mobile) {
            Toast.show('请先填写区号和手机号', { position: Toast.positions.CENTER })
            return
        }
        const param = { areacode: areaCode, mobile }
        api.sendSmsCode(param)
            .then(data => {
                const {status, smstoken: token, msg} = data
                if (status !== 'success') {
                    throw new Error(msg)
                }
                this.setState({ token })
            })
            .catch(error => {
                Toast.show(error.message, { position: Toast.positions.CENTER })
            })
    }

    handleRegisterAsTrader = () => {
        this.handleRegister('trader')
    }

    handleRegisterAsInvestor = () => {
        this.handleRegister('investor')
    }

    checkEmailFormat() {
        var re = /[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]+\.[A-Za-z0-9_\-\.]+/
        return re.test(this.state.email)
    }

    checkFields = () => {
        const { areaCode, mobile, code, token, email, checked } = this.state
        var errMsg = null
        if (!areaCode) {
            errMsg = '请选择区号'
        } else if (!mobile) {
            errMsg = '请输入手机号'
        } else if (!token) {
            errMsg = '请发送验证码'
        } else if (!code) {
            errMsg = '请输入验证码'
        } else if (!email) {
            errMsg = '请输入邮箱'
        } else if (!this.checkEmailFormat(email)) {
            errMsg = '邮箱格式不正确'
        } else if (!checked) {
            errMsg = '请同意用户协议'
        }
        return errMsg
    }

    handleRegister = (userType) => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, { position: Toast.positions.CENTER })
            return
        }
        const { areaCode, mobile, code, token, email } = this.state
        const param = { areaCode, mobile, code, token, email, userType }
        this.props.navigation.navigate('Register2', param)
    }
    
    componentDidMount() {
        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    render() {
        return (
            <FormContainer onBack={()=>{this.props.navigation.goBack()}} title="注册">
                <FormMobileInput
                    containerStyle={{marginBottom: 30}}
                    areaCode={this.state.areaCode}
                    areaCodeOptions={this.props.areaCodeOptions}
                    onAreaCodeChange={this.handleChange.bind(this, 'areaCode')}
                    mobile={this.state.mobile}
                    onMobileChange={this.handleChange.bind(this, 'mobile')}
                />

                {this.state.userExist === null ? (
                    <FormButton containerStyle={{marginBottom: 30}} onPress={this.checkPhoneExist} type="primary">下一步</FormButton>
                ) : null}
                
                {this.state.userExist === false ? (
                    <View>
                        <FormVerificationCode
                            containerStyle={{marginBottom: 30}}
                            placeholder="请输入验证码"
                            value={this.state.code}
                            onChange={this.handleChange.bind(this, 'code')}
                            onSend={this.handleCodeSend} />
                        <FormTextInput
                            containerStyle={{marginBottom: 30}}
                            placeholder="请输入邮箱"
                            keyboardType="email-address"
                            value={this.state.email}
                            onChange={this.handleChange.bind(this, 'email')}
                        />
                        <FormButton type="primary" onPress={this.handleRegisterAsTrader}>我是交易师</FormButton>
                        <FormButton type="primary" onPress={this.handleRegisterAsInvestor}>我是投资人</FormButton>

                        <View style={{display:'flex', flexDirection: 'row', justifyContent: 'center',alignItems:'center', marginTop: 30}}>
                            <CheckBox labelBefore containerStyle={{width:16,height:16,marginRight:8}} checkboxStyle={{width: 16, height: 16}} labelStyle={{fontSize:13,color:'#999'}} label="" checked={this.state.checked} onChange={this.handleCheck} />
                            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Agreement')}}>
                                <Text style={{fontSize:13,color:'#999',backgroundColor:'transparent'}}>用户协议</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}
            </FormContainer>
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
