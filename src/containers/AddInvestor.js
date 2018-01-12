import React from 'react'
import { 
    View, 
    TouchableOpacity, 
    Text, 
    Image, 
    TextInput,
    Alert, 
} from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'
import FitImage from 'react-native-fit-image'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Picker2 from '../components/Picker';
import * as api from '../api'
import Select from '../components/Select'
import { 
    receiveTitles, 
    receiveTags, 
    requestContents,
    hideLoading,
} from '../../actions';

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
            </TouchableOpacity>),
            headerBackTitle: null,
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
            imageData: null, 
            tags: [],
            group: null, 
            investorGroupOptions: [],
        }
        this.org = null;
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value })
    }

    checkFields = () => {
        const { name, title, mobile, email, company, tags, group } = this.state
        var errMsg = null
        if (!name) {
            errMsg = '请输入姓名'
        } else if (!group) {
            errMsg = '请选择角色'
        } else if (!title) {
            errMsg = '请选择职位'
        } else if (tags.length === 0) {
            errMsg = '请选择标签'
        } else if (!mobile) {
            errMsg = '请输入手机号'
        } else if (!email) {
            errMsg = '请输入邮箱'
        } else if (!/[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]+\.[A-Za-z0-9_\-\.]+/.test(email)) {
            errMsg = '请输入格式正确的邮箱'
        } else if (!company) {
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
        if (typeof this.state.company === 'string') {
            Alert.alert(
                '确定新增机构？',
                `机构${this.state.company}目前不在库中，点击确定将新增该机构`,
                [
                  {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: '确定', onPress: this.addInvestor},
                ],
                { cancelable: false }
              )
        } else {
            this.addInvestor();
        }
    }

    addInvestor = () => {
        this.props.dispatch(requestContents());
        const body = {
            'usernameC': this.state.name,
            'title': this.state.title,
            'email': this.state.email,
            'mobile': this.state.mobile,
            'org': typeof this.state.company === 'object' ? this.state.company.id : null,
            'cardBucket': 'image',
            'groups': [this.state.group], 
            'tags': this.state.tags, 
        }

        let existUser, uploadCardResult;
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
          if (this.state.file) {
            const formData = new FormData()
            formData.append('file', this.state.file)
            return cardKey ? api.coverUpload(cardKey, formData, 'image') : api.basicUpload(formData, 'image')
          }
        })
        // 添加机构
        .then(result => {
          console.log('uploadCard', result);
          uploadCardResult = result;
          if (typeof this.state.company === 'string') {
            return api.addOrg({ orgnameC: this.state.company });
          }
        })
        .then(result => {
          console.log('addOrg', result)
          let cardKey = uploadCardResult && uploadCardResult.key
          let cardUrl = uploadCardResult && uploadCardResult.url
          const org = result ? result.id : this.state.company.id;
          if (existUser) {
            const title = this.state.title || (existUser.title ? existUser.title.id : null)
            const email = this.state.email || existUser.email
            const usernameC = this.state.name || existUser.username
            const mobile = this.state.mobile || existUser.mobile
            const tags = this.state.tags.length > 0 ? this.state.tags : existUser.tags;
            cardKey = cardKey || existUser.cardKey
            cardUrl = cardUrl || existUser.cardUrl
            return api.editUser([existUser.id], { org, title, email, usernameC, cardKey, cardUrl, mobile, tags })
          } else {
            const partnerId = this.props.userId
            return api.addUser({ ...body, partnerId, cardKey, cardUrl, userstatus: 2, org })
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
            this.props.dispatch(hideLoading());
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        })
        .catch(error => {
            this.props.dispatch(hideLoading());
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        if (this.props.navigation.state.params) {
            const { name, title, mobile, email, company, file, imageData } = this.props.navigation.state.params
            this.setState({ name, title, mobile, email, company, file, imageData })
        }

        this.props.navigation.setParams({ onPress: this.handleSubmit })
        
        api.getSource('title').then(data => {
            this.props.dispatch(receiveTitles(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
        api.getSource('tag').then(data => {
            this.props.dispatch(receiveTags(data))
        })
        .catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
        api.queryUserGroup({ type: 'investor' }).then(data => {
            const investorGroupOptions = data.data.map(m => ({ value: m.id, label: m.name }));
            this.setState({ investorGroupOptions });
        })
    }

    handleOrgPressed = () => {
        this.props.navigation.navigate(
            'SelectOrg',
            { onSelectOrg: this.onSelectOrg }
        );
    }

    onSelectOrg = org => {
        this.setState({ company: org });
    }

    render() {
        const { name, title, mobile, email, company, file, imageData, tags, group } = this.state
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
                {file ? <Image style={{ width: '100%', height: 220 }} source={{uri: 'data:image/png;base64, ' + imageData}} /> : <Image source={require('../images/userCenter/emptyCardImage.png')} style={{width:'100%'}} />}
                </View>
                <View style={{flex: 1}}>
                <View style={cellStyle}>
                    <Text style={leftStyle}>姓名</Text>
                    <TextInput style={rightStyle} {...textInputProps} value={name} onChangeText={this.handleChange.bind(this, 'name')} />
                </View>
                <View style={cellStyle}>
                  <Text style={leftStyle}>角色</Text>
                  <Select
                    title="请选择角色"
                    value={group}
                    onChange={this.handleChange.bind(this, 'group')}
                    options={this.state.investorGroupOptions}
                    multiple={false}
                    placeholder="点击选择角色"
                    containerStyle={{ flex: 1, height: '100%' }}
                    style={{fontSize: 15, color: '#333'}}
                  /> 
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
                    <Text style={leftStyle}>标签</Text>
                    <Select
                        title="请选择标签"
                        value={tags}
                        onChange={this.handleChange.bind(this, 'tags')}
                        options={this.props.tagOptions}
                        multiple={true}
                        placeholder="点击选择标签"
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
                    <Text style={leftStyle}>机构</Text>
                    <Text numberOfLines={1} onPress={this.handleOrgPressed} style={rightStyle}>
                      { typeof company === 'object' && company !== null ? company.orgname : company }
                    </Text>
                </View>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}


function mapStateToProps(state) {
    const { titles, userInfo, tags } = state.app
    const titleOptions = titles.map(item => ({ label: item.name.trim(), value: item.id }))
    const tagOptions = tags.map(item => ({ label: item.name.trim(), value: item.id }))
    const { id } = userInfo
    return { titleOptions, userId: id, tagOptions }
}

export default connect(mapStateToProps)(AddInvestor)
