import React from 'react'
import { Alert, Text } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormTextInputWithIcon, FormPassword } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import FormLink from '../components/FormLink'
import Toast from 'react-native-root-toast'
import * as api from '../api'
import { NavigationActions } from 'react-navigation'

class Login extends React.Component {

    static navigationOptions = {
        title: '登录',
        headerStyle: {
            height: 48,
            backgroundColor: '#fff',
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            password: '',
        }
    }

    handleAccountChange = (value) => {
        this.setState({ account: value })
    }

    handlePasswordChange = (value) => {
        this.setState({ password: value })
    }

    handleLogin = () => {
        // const param = {
        //     username: this.state.account,
        //     password: this.state.password, 
        // }
        // api.login(param).then(data => {
        //     console.log('>>>', data)
        // }).catch(error => {
        //     console.log('===', error)
        //     Toast.show(error.message)
        // })

        const backAction = NavigationActions.back()
        this.props.navigation.dispatch(backAction)
    }

    handleRegister = () => {
        this.props.navigation.navigate('Register')
    }

    handleForget = () => {
        this.props.navigation.navigate('RetrievePassword')
    }

    componentDidMount() {

    }

    render() {
        return (
            <FormContainer>
                <FormTextInputWithIcon
                    containerStyle={{marginBottom: 30}}
                    icon={require('../images/login/User-copy.png')}
                    keyboardType="email-address"
                    placeholder="请输入手机号/邮箱"
                    value={this.state.account}
                    onChange={this.handleAccountChange}
                />
                <FormPassword
                    containerStyle={{marginBottom: 30}}
                    icon={require('../images/login/Locked.png')}
                    placeholder="请输入密码"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}    
                />
                <FormButton type="primary" onPress={this.handleLogin}>登录</FormButton>
                <FormButton onPress={this.handleRegister}>注册</FormButton>
                <FormLink onPress={this.handleForget}>忘记密码？</FormLink>         
            </FormContainer>
        )
    }
}

export default Login
