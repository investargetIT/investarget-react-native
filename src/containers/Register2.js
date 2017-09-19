import React from 'react'
import { View, Picker, TextInput, Image, Platform, TouchableOpacity } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput, { FormSelect } from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import FormLink from '../components/FormLink'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'
import { receiveTitles, receiveTags, handleError } from '../../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { NavigationActions } from 'react-navigation'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay';


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
            username: '许志铭',
            organization: '多维海拓',
            title: 1,
            tags: [1],
            password: 'xzm1991',
            loading: false,
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    handleRegister = () => {
        const { username, organization, title, tags, password } = this.state
        if (!(username && organization && title && tags && password)) {
            return
        }
        const { areaCode, mobile, code, token: smstoken, email, userType: type } = this.props.navigation.state.params

        const param = { areaCode, mobile, code, smstoken, email, type, username, organization, title, tags, password }
        this.setState({ loading: true })
        api.register(param).then(data => {
            this.setState({ loading: false })
            console.log('@@@', data)
            Toast.show('注册成功', {
                position: Toast.positions.CENTER,
            })
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [ NavigationActions.navigate({ routeName: 'Home' }) ]
            })
            this.props.navigation.dispatch(resetAction)
        }).catch(error => {
            this.setState({ loading: false })
            console.log('>>>', error)
            // this.props.dispatch(handleError(error))
            Toast.show(error.message, {
                position: Toast.positions.CENTER,
            })
        })
    }

    componentDidMount() {
        console.log('>>>>', this.props.navigation.state.params)
        
        api.getSource('title')
            .then(data => {
                this.props.dispatch(receiveTitles(data))
            })
            .catch(error => {
                this.props.dispatch(handleError(error))
            })

        api.getSource('tag')
            .then(data => {
                this.props.dispatch(receiveTags(data))
            })
            .catch(error => {
                this.props.dispatch(handleError(error))
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
