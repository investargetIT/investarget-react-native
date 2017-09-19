import React from 'react'
import { View, Picker, Platform, Alert } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormVerificationCode, FormMobileInput } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'
import * as api from '../api'
import { connect } from 'react-redux'
import { receiveContinentsAndCountries, handleError } from '../../actions'
import { NavigationActions } from 'react-navigation'
import Spinner from 'react-native-loading-spinner-overlay'


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
            mobile: '18625089842',
            code: '315289',
            token: '193a10ddd4417a258b85cdb14907e69a',
            password: 'xzm1991',
            loading: false,
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

    handlePasswordChange= (value) => {
        this.setState({ password: value })
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

    retrievePassword = () => {
        const { areaCode, mobile, code, token, password } = this.state
        const param = { mobile, mobileAreaCode: areaCode, mobilecode: code, mobilecodetoken: token, password }
        this.setState({ loading: true })
        api.retrievePassword(param).then(data => {
            console.log('@@@', data)
            this.setState({ loading: false })

            Alert.alert('操作成功', '密码已更新,请重新登录', [
                {text: '确定', onPress: this.goLogin}
            ], { cancelable: false })
            
        }).catch(error => {
            console.log('>>>', error)
            this.setState({ loading: false })
            this.props.dispatch(handleError(error))
        })
    }

    componentDidMount() {
        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        }).catch(error => {
            this.props.dispatch(handleError(error))
        })
    }

    render() {
        return (
            <FormContainer>
                <Spinner visible={this.state.loading} />
                <FormMobileInput
                    containerStyle={{marginBottom: 30}}
                    areaCode={this.state.areaCode}
                    areaCodeOptions={this.props.areaCodeOptions}
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
                <FormButton type="primary" onPress={this.retrievePassword}>确认</FormButton>
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

export default connect(mapStateToProps)(RetrievePassword)
