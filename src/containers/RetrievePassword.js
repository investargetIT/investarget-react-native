import React from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import Spinner from 'react-native-loading-spinner-overlay'
import Toast from 'react-native-root-toast'

import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import * as api from '../api'
import { receiveContinentsAndCountries } from '../../actions'
import { NavigationActions } from 'react-navigation'


class RetrievePassword extends React.Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            areaCode: '86',
            mobile: '',
            code: '',
            token: '',
            password: '',
            loading: false,
            disableCodeBtn: true,
        }
    }

    handleChange = (key, value) => {
        this.setState({ 
            [key]: value, 
            disableCodeBtn: key === 'mobile' && value.length === 0 
        });
    }

    handleCodeSend = () => {
        const { areaCode, mobile } = this.state
        const param = { areacode: areaCode.trim(), mobile }
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

    goLogin = () => {
        const resetAction = NavigationActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: 'Home' }),
                NavigationActions.navigate({ routeName: 'Login' }),
            ]
        })
        this.props.navigation.dispatch(resetAction)
    }

    checkFields = () => {
        const { areaCode, mobile, code, token, password } = this.state
        var errMsg = null
        if (!areaCode) {
            errMsg = '请选择区号'
        } else if (!mobile) {
            errMsg = '请输入手机号'
        } else if (!token) {
            errMsg = '请发送验证码'
        } else if (!code) {
            errMsg = '请输入验证码'
        } else if (!password) {
            errMsg = '请输入密码'
        }
        return errMsg
    }

    retrievePassword = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, { position: Toast.positions.CENTER })
            return
        }

        const { areaCode, mobile, code, token, password } = this.state
        const param = { mobile, mobileAreaCode: areaCode.trim(), mobilecode: code, mobilecodetoken: token, password }
        this.setState({ loading: true })
        api.retrievePassword(param).then(data => {
            this.setState({ loading: false })
            Alert.alert('操作成功', '密码已更新,请重新登录', [
                {text: '确定', onPress: this.goLogin}
            ], { cancelable: false })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    componentDidMount() {
        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    render() {
        const title = this.props.navigation.state.params.title
        return (
            <FormContainer onBack={()=>{this.props.navigation.goBack()}} title={title}>
                <Spinner visible={this.state.loading} />
                <FormMobileInput
                    containerStyle={{marginBottom: 30}}
                    areaCode={this.state.areaCode}
                    areaCodeOptions={this.props.areaCodeOptions}
                    onAreaCodeChange={this.handleChange.bind(this, 'areaCode')}
                    mobile={this.state.mobile}
                    onMobileChange={this.handleChange.bind(this, 'mobile')}
                />
                <FormVerificationCode
                    disabled={this.state.disableCodeBtn}
                    containerStyle={{marginBottom: 30}}
                    placeholder="请输入验证码"
                    value={this.state.code}
                    onChange={this.handleChange.bind(this, 'code')}
                    onSend={this.handleCodeSend}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="请输入新的密码"
                    value={this.state.password}
                    onChange={this.handleChange.bind(this, 'password')}
                />
                <FormButton type="primary" onPress={this.retrievePassword}>确认</FormButton>
            </FormContainer>
        )
    }
}

function mapStateToProps(state) {
    const { continentsAndCountries } = state.app
    const areaCodeOptions = continentsAndCountries.filter(item => item.level == 2)
                                .map(item => ({ label: item.country, value: item.country !== '美国' ? item.areaCode : item.areaCode + ' ' }))
    return { areaCodeOptions }
}

export default connect(mapStateToProps)(RetrievePassword)
