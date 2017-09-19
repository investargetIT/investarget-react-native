import React from 'react'
import { View, Picker, TextInput, Image, Platform, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'

import FormContainer from '../components/FormContainer'
import FormTextInput, { FormSelect } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import * as api from '../api'
import * as utils from '../utils'
import AsyncStorage from '../AsyncStorage'
import { receiveTitles, receiveTags, receiveCurrentUserInfo } from '../../actions'


class Register2 extends React.Component {

    static navigationOptions = {
        title: '个人信息',
        headerStyle: {
            height: 48,
            backgroundColor: '#fff',
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            username: '',
            organization: '',
            title: null,
            tags: [],
            password: '',
            loading: false,
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    checkFields = () => {
        const { username, organization, title, tags, password } = this.state
        var errMsg = null
        if (!username) {
            errMsg = '请输入姓名'
        } else if (!organization) {
            errMsg = '请输入公司名称'
        } else if (!title) {
            errMsg = '请选择职位'
        } else if (!tags.length) {
            errMsg = '请选择关注的行业'
        } else if (!password) {
            errMsg = '请输入密码'
        }
        return errMsg
    }

    handleRegister = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, { position: Toast.positions.CENTER })
            return
        }

        const { areaCode, mobile, code, token: smstoken, email, userType: type } = this.props.navigation.state.params
        const { username, organization, title, tags, password } = this.state
        const param = { areaCode, mobile, code, smstoken, email, type, username, organization, title, tags, password }
        this.setState({ loading: true })
        api.register(param).then(data => {
            this.setState({ loading: false })
            Toast.show('注册成功', { position: Toast.positions.CENTER })
            this.login()
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    login = () => {
        api.login({username: mobile, password}).then(data => {
            const { token: authToken, user_info, permissions } = data;
            let userInfo = utils.convertUserInfo(user_info, permissions)
            this.props.dispatch(receiveCurrentUserInfo(authToken, userInfo, mobile, password))
            userInfo = Object.assign({}, userInfo, {
                token: authToken,
                username: mobile,
                password: password
            });
            return AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        }).then(data => {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [ NavigationActions.navigate({ routeName: 'Home' }) ]
            })
            this.props.navigation.dispatch(resetAction)
        })
    }

    componentDidMount() {        
        api.getSource('title')
            .then(data => {
                this.props.dispatch(receiveTitles(data))
            })
            .catch(error => {
                Toast.show(error.message, { position: Toast.positions.CENTER })
            })

        api.getSource('tag')
            .then(data => {
                this.props.dispatch(receiveTags(data))
            })
            .catch(error => {
                Toast.show(error.message, { position: Toast.positions.CENTER })
            })
    }

    render() {
        return (
            <FormContainer>
                <Spinner visible={this.state.loading} />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="姓名"
                    value={this.state.username}
                    onChange={this.handleChange.bind(this, 'username')}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="公司名称"
                    value={this.state.organization}
                    onChange={this.handleChange.bind(this, 'organization')}
                />
                <FormSelect
                    containerStyle={{marginBottom: 30}}
                    placeholder="请选择职位"
                    title="请选择职位"
                    value={this.state.title}
                    onChange={this.handleChange.bind(this, 'title')}
                    options={this.props.titleOptions}
                />
                <FormSelect
                    containerStyle={{marginBottom: 30}}
                    placeholder="请选择关注的行业"
                    title="请选择关注的行业"
                    value={this.state.tags}
                    multiple
                    onChange={this.handleChange.bind(this, 'tags')}
                    options={this.props.tagOptions}                
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="请输入密码"
                    value={this.state.password}
                    onChange={this.handleChange.bind(this, 'password')}
                />
                <FormButton type="primary" onPress={this.handleRegister}>注册</FormButton>
            </FormContainer>
        )
    }
}

function mapStateToProps(state) {
    const { titles, tags } = state.app
    const titleOptions = titles.map(item => ({ label: item.name.trim(), value: item.id }))
    const tagOptions = tags.map(item => ({ label: item.name.trim(), value: item.id }))
    return { titleOptions, tagOptions }
}

export default connect(mapStateToProps)(Register2)
