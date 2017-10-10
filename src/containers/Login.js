import React from 'react'
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation'
import { Alert, Text } from 'react-native'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay';

import FormContainer from '../components/FormContainer'
import FormTextInput, { FormTextInputWithIcon, FormPassword } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import FormLink from '../components/FormLink'
import * as api from '../api'
import * as utils from '../utils';
import { receiveCurrentUserInfo } from '../../actions';
import AsyncStorage from '../AsyncStorage';


class Login extends React.Component {

    static navigationOptions = {
        header: null,
        // title: '登录',
        // headerStyle: {
        //     height: 48,
        //     backgroundColor: '#fff',
        // },
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            password: '',
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    checkFields = () => {
        const { account, password } = this.state
        var errMsg = null
        if (!account) {
            errMsg = '请输入手机号/邮箱'
        } else if (!password) {
            errMsg = '请输入密码'
        }
        return errMsg
    }

    handleLogin = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, { position: Toast.positions.CENTER })
            return
        }
   
        const { account: username, password } = this.state
        const param = { username, password }
        this.setState({ loading: true });
        api.login(param)
            .then(data => {
                this.setState({ loading: false });
                const { token: authToken, user_info, permissions } = data;
                let userInfo = utils.convertUserInfo(user_info, permissions)
                this.props.dispatch(receiveCurrentUserInfo(authToken, userInfo, username, password))
                userInfo = Object.assign({}, userInfo, {
                    token: authToken,
                    username: username,
                    password: password
                });
                return AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            })
            .then(data => this.props.navigation.dispatch(NavigationActions.back()))
            .catch(error => {
                this.setState({ loading: false });
                Toast.show(error.message, { position: Toast.positions.CENTER })
            })
    }

    handleRegister = () => {
        this.props.navigation.navigate('Register')
    }

    handleForget = () => {
        // this.props.navigation.navigate('RetrievePassword', {title: '找回密码'})
        this.props.navigation.navigate('Register2')
    }

    componentDidMount() {

    }

    render() {
        return (
            <FormContainer onBack={()=>{this.props.navigation.goBack()}} title="登录">
                <Spinner visible={this.state.loading} />
                <FormTextInputWithIcon
                    containerStyle={{marginBottom: 30}}
                    icon={require('../images/login/User-copy.png')}
                    keyboardType="email-address"
                    placeholder="请输入手机号/邮箱"
                    value={this.state.account}
                    onChange={this.handleChange.bind(this, 'account')}
                />
                <FormPassword
                    containerStyle={{marginBottom: 30}}
                    icon={require('../images/login/Locked.png')}
                    placeholder="请输入密码"
                    value={this.state.password}
                    onChange={this.handleChange.bind(this, 'password')}    
                />
                <FormButton type="primary" onPress={this.handleLogin}>登录</FormButton>
                <FormButton onPress={this.handleRegister}>注册</FormButton>
                <FormLink onPress={this.handleForget}>忘记密码？</FormLink>         
            </FormContainer>
        )
    }
}

export default connect()(Login);
