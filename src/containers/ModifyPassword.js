import React from 'react'
import { View, Text, TextInput } from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'

import * as utils from '../utils'
import * as api from '../api'
import AsyncStorage from '../AsyncStorage'

const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    marginLeft: 16,
    height: 40,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1
}
const cellLabelStyle = {
    width: 100,
    flex: 0,
    fontSize: 13,
    color: '#333'
}
const cellInputStyle = {
    flex: 1,
    fontSize: 13
}
const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}


class ModifyPassword extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '修改密码',
            headerTintColor: '#fff',
            headerStyle: {
                height: 48,
                backgroundColor: '#10458F',
            },
            headerRight: <Text style={headerRightStyle} onPress={() => {params.handleSubmit && params.handleSubmit()}}>提交</Text>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    checkFields = () => {
        const { oldPassword, newPassword, confirmPassword } = this.state 
        var errMsg = null
        if (!oldPassword) {
            errMsg = '请输入旧密码'
        } else if (!newPassword) {
            errMsg = '请输入新密码'
        } else if (!confirmPassword) {
            errMsg = '请再次输入新密码'
        } else if (newPassword != confirmPassword) {
            errMsg = '两次输入的密码不一致，请重新输入'
        }
        return errMsg
    }

    handleSubmit = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, { position: Toast.positions.CENTER })
            return
        }
        const userId = this.props.userId
        const { oldPassword, newPassword } = this.state
        api.modifyPassword(userId, oldPassword, newPassword).then(data => {
            this.updateUserInfo(newPassword)
            Toast.show('密码修改成功', { position: Toast.positions.CENTER })
            this.props.navigation.goBack()
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    updateUserInfo = (newPassword) => {
        AsyncStorage.getItem('userInfo').then(dataStr => {
            const data = JSON.parse(dataStr)
            data.password = newPassword
            const newDataStr = JSON.stringify(data)
            AsyncStorage.setItem('userInfo', newDataStr)
        })
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleSubmit: this.handleSubmit })
    }

    render() {
        const { oldPassword, newPassword, confirmPassword } = this.state        

        return (
            <View style={{backgroundColor: '#fff'}}>
                <Cell label="旧密码" placeholder="请输入旧密码" value={oldPassword} onChange={this.handleChange.bind(this, 'oldPassword')} />
                <Cell label="新密码" placeholder="请输入新密码（新旧密码不能相同）" value={newPassword} onChange={this.handleChange.bind(this, 'newPassword')} />
                <Cell label="新密码确认" placeholder="请再次输入新密码" value={confirmPassword} onChange={this.handleChange.bind(this, 'confirmPassword')} />
            </View>
        )
    }
}

class Cell extends React.Component {

    render() {
        const { label, placeholder, value, onChange } = this.props
        return (
            <View style={cellStyle}>
                <Text style={cellLabelStyle}>{label}</Text>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    style={cellInputStyle}
                    placeholder={placeholder}
                    autoCapitalize="none"
                    spellCheck={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#2269d4"
                    placeholderTextColor="#999"
                />
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { id } = state.app.userInfo
    return { userId: id }
}
export default connect(mapStateToProps)(ModifyPassword)
