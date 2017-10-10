import React from 'react'
import { View, TouchableOpacity, Text, Image, TextInput } from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'
import FitImage from 'react-native-fit-image'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import * as api from '../api'
import Select from '../components/Select'
import { receiveTitles } from '../../actions'

const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    marginBottom: 1,
    height:40,
    paddingLeft:16,
    paddingRight:16,
}
const leftStyle = {width:'30%',fontSize:15,color:'#333'}
const rightStyle = {flex:1,fontSize:15,color:'#333'}

class AddInvestor extends React.Component {

    static navigationOptions = ({ navigation }) =>{
        const { params } = navigation.state
        return {
            title: '新增投资人',
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: (<TouchableOpacity
                style={{marginRight:16}}
                onPress={() => { params.onPress && params.onPress() }}>
                <Text style={{fontSize:15,color:'#fff'}}>提交</Text>
            </TouchableOpacity>)
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            title: null,
            mobile: '',
            email: '',
            company: '',
            file: null,
        }
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    checkFields = () => {
        const { name, title, mobile, email, company } = this.state
        var errMsg = null
        if (!name) {
            errMsg = '请输入姓名'
        } else if (!title) {
            errMsg = '请选择职位'
        } else if (!mobile) {
            errMsg = '请输入手机号'
        } else if (!email) {
            errMsg = '请输入邮箱'
        } else if (!/[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]+\.[A-Za-z0-9_\-\.]+/.test(email)) {
            errMsg = '请输入格式正确的邮箱'
        }else if (!company) {
            errMsg = '请输入公司'
        }
        return errMsg
    }

    handleSubmit = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, {position: Toast.positions.CENTER})
            return
        }
        this.addInvestor()
    }

    addInvestor = () => {
        const body = {
            'usernameC': this.state.name,
            'title': this.state.title,
            'email': this.state.email,
            'mobile': this.state.mobile,
            'orgname': this.state.company,
            'cardBucket': 'image',
        }

        let existUser
        api.checkUserExist(this.state.mobile)
        .then(result => {
          console.log('checkMobileExist', result)
          if (result.result) {
            existUser = result.user
          }
          if (this.state.email) {
            return api.checkUserExist(this.state.email)
          } else {
            return Promise.resolve("The Email is empty!")
          }
        })
        .then(result => {
          console.log('checkEmailExist', result)
          if (result instanceof Object && result.result) {
            if (existUser && existUser.id !== result.user.id) {
              throw new Error("mobile_or_email_possessed")
            }
            existUser = result.user
          }
          if (existUser) {
            return api.checkUserRelation(existUser.id, this.props.userId)
          } else {
            return Promise.resolve("The investor is not exist in our database!")
          }
        })
        .then(result => {
          console.log('checkUserCommonTransaction', result)
          if (existUser && !result) {
            return api.addUserRelation({
              relationtype: false,
              investoruser: existUser.id,
              traderuser: this.props.userId
            })
          } else {
            return Promise.resolve("The investor is not exist or the relationship has already been established!")
          }
        })
        .then(result => {
          console.log('addUserCommonTransaction', result)
          if (existUser) {
            return api.getUserDetailLang(existUser.id)
          } else {
            return Promise.resolve("The investor is not exist in our database!")
          }
        })
        .then(result => {
          console.log('getSingleUserInfo', result, this.state.file)
          let cardKey
          if (existUser) {
            existUser = result
            cardKey = existUser.cardKey
          }
          const formData = new FormData()
          formData.append('file', this.state.file)
          return cardKey ? api.coverUpload(cardKey, formData, 'image') : api.basicUpload(formData, 'image')
        })
        .then(result => {
          console.log('uploadCard', result)
          const cardKey = result.key
          const cardUrl = result.url
          if (existUser) {
            const title = this.state.title || (existUser.title ? existUser.title.id : null)
            const email = this.state.email || existUser.email
            const orgname = this.state.company || existUser.org.id
            const usernameC = this.state.name || existUser.username
            const mobile = this.state.mobile || existUser.mobile
            return api.editUser([existUser.id], { orgname, title, email, usernameC, cardKey, cardUrl, mobile })
          } else {
            const partnerId = this.props.userId
            return api.addUser({ ...body, partnerId, cardKey, cardUrl, userstatus: 2, groups: [1] })
          }
        })
        .then(result => {
          console.log('update or add user result', result)
          if (!existUser) {
            return api.addUserRelation({
              relationtype: false,
              investoruser: result.id,
              traderuser: this.props.userId,
            })
          } else {
            return Promise.resolve('the relationship has already been established')
          }
        })
        .then(data => {
            Toast.show('新增投资人成功', {position: Toast.positions.CENTER})
            this.props.navigation.goBack()
        })
        .catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        const { name, title, mobile, email, company, file } = this.props.navigation.state.params
        this.setState({ name, title, mobile, email, company, file })
        this.props.navigation.setParams({ onPress: this.handleSubmit })
        
        api.getSource('title').then(data => {
            this.props.dispatch(receiveTitles(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    render() {
        const { name, title, mobile, email, company, file } = this.state
        const textInputProps = {
            autoCapitalize: "none",
            spellCheck: false,
            underlineColorAndroid: "transparent",
            selectionColor: "#2269d4",
            placeholderTextColor: "#999",
        }
        return (
            <KeyboardAwareScrollView style={{flex:1}}>
                <View style={{flex: 0}}>
                {file ? <FitImage source={file} /> : <Image source={require('../images/userCenter/emptyCardImage.png')} style={{width:'100%'}} />}
                </View>
                <View style={{flex: 1}}>
                <View style={cellStyle}>
                    <Text style={leftStyle}>姓名</Text>
                    <TextInput style={rightStyle} {...textInputProps} value={name} onChangeText={this.handleChange.bind(this, 'name')} />
                </View>
                <View style={cellStyle}>
                    <Text style={leftStyle}>职位</Text>
                    <Select
                        title="请选择职位"
                        value={title}
                        onChange={this.handleChange.bind(this, 'title')}
                        options={this.props.titleOptions}
                        multiple={false}
                        placeholder="点击选择职位"
                        containerStyle={{ flex: 1, height: '100%' }}
                        style={{fontSize: 15, color: '#333'}}
                    />
                </View>
                <View style={cellStyle}>
                    <Text style={leftStyle}>手机</Text>
                    <TextInput style={rightStyle} {...textInputProps} value={mobile} onChangeText={this.handleChange.bind(this, 'mobile')} />
                </View>
                <View style={cellStyle}>
                    <Text style={leftStyle}>邮箱</Text>
                    <TextInput style={rightStyle} {...textInputProps} value={email} onChangeText={this.handleChange.bind(this, 'email')} />
                </View>
                <View style={cellStyle}>
                    <Text style={leftStyle}>公司</Text>
                    <TextInput style={rightStyle} {...textInputProps} value={company} onChangeText={this.handleChange.bind(this, 'company')} />
                </View>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}


function mapStateToProps(state) {
    const { titles, userInfo } = state.app
    const titleOptions = titles.map(item => ({ label: item.name.trim(), value: item.id }))
    const { id } = userInfo
    return { titleOptions, userId: id }
}

export default connect(mapStateToProps)(AddInvestor)
