import React from 'react'
import { View, Picker, TextInput, Image, Platform, TouchableOpacity } from 'react-native'
import FormContainer from '../components/FormContainer'
import FormTextInput from '../components/FormTextInput'
import FormButton from '../components/FormButton'
import FormLink from '../components/FormLink'
import PickerIOS2 from '../components/PickerIOS2'
import Button from '../components/Button'


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
            name: '',
            company: '',
            title: '',
            industry: '',
            password: '',
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    handleRegister = () => {
        //
    }

    render() {
        return (
            <FormContainer>
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="姓名"
                    value={this.state.name}
                    onChange={this.handleChange.bind(this, 'name')}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="公司名称"
                    value={this.state.company}
                    onChange={this.handleChange.bind(this, 'company')}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="请选择职位"
                    value={this.state.title}
                    onChange={this.handleChange.bind(this, 'title')}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="请选择关注的行业"
                    value={this.state.industry}
                    onChange={this.handleChange.bind(this, 'industry')}
                />
                <FormTextInput
                    containerStyle={{marginBottom: 30}}
                    placeholder="请输入密码"
                    secureTextEntry={true}
                    value={this.state.password}
                    onChange={this.handleChange.bind(this, 'password')}
                />
                <FormButton type="primary" onPress={this.handleRegister}>注册</FormButton>
            </FormContainer>
        )
    }
}

export default Register2
