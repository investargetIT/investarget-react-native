import React from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    Image, 
    TextInput,
    Alert,
    DeviceEventEmitter,
} from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as api from '../api'
import Select from '../components/Select'
import { 
    receiveTitles, 
    receiveTags, 
    requestContents,
    hideLoading,
} from '../../actions';
import { checkMobile } from '../utils';

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
const rightStyle = {flex:1,fontSize:15,color:'#333',paddingLeft: 0}

class EditUser extends React.Component {
 
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '修改联系人信息',
            headerTintColor: '#fff',
            headerStyle: {
                backgroundColor: '#10458F',
            },
            headerBackTitle: null,
            headerRight: (<TouchableOpacity style={{ marginRight: 16 }} onPress={params.handleIconPressed}>
                <Text style={{ fontSize: 16, color: '#fff' }}>确定</Text>
            </TouchableOpacity>)
        }
    }

  constructor (props) {
    super (props);

    this.userID = props.navigation.state.params.userID;
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
        mobileAreaCode: '86',
    }
  }

  checkFields = () => {
    const { name, title, mobile, email, company, tags, group, mobileAreaCode } = this.state
    var errMsg = null
    if (!name) {
        errMsg = '请输入姓名'
    // } else if (!group) {
    //     errMsg = '请选择角色'
    } else if (!title) {
        errMsg = '请选择职位'
    } else if (tags.length === 0) {
        errMsg = '请选择标签'
    } else if (!checkMobile(mobile)) {
        errMsg = '请输入正确的手机号'
    } else if (!email) {
        errMsg = '请输入邮箱'
    } else if (!/[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]+\.[A-Za-z0-9_\-\.]+/.test(email)) {
        errMsg = '请输入格式正确的邮箱'
    // } else if (!company) {
    //     errMsg = '请输入公司'
    } else if (!mobileAreaCode) {
        errMsg = '请填写区号';
    }
    return errMsg
}

    componentWillMount () {
        this.props.navigation.setParams({ handleIconPressed: this.handleSubmit })
    }
    handleSubmit = () => {
        const errMsg = this.checkFields()
        if (errMsg) {
            Toast.show(errMsg, {position: Toast.positions.CENTER})
            return
        }
        this.props.dispatch(requestContents());
        const body = {
            usernameC: this.state.name,
            title: this.state.title,
            tags: this.state.tags,
            mobile: this.state.mobile,
            mobileAreaCode: this.state.mobileAreaCode,
            email: this.state.email,
        }
        api.editUser([this.userID], body)
          .then(result => {
              Toast.show('修改成功');
              this.props.navigation.goBack();
              this.props.navigation.state.params.onComplete();
            //   DeviceEventEmitter.emit('updateOrgBDDetail') 
            })
          .catch(error => Toast.show(error.message, {position: Toast.positions.CENTER}))
          .finally(() => this.props.dispatch(hideLoading()));
         
    }
  componentDidMount () {
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

    this.props.dispatch(requestContents());
    api.getUserDetailLang(this.userID)
      .then(result => {
        this.setState({ 
          name: result.username,
          group: result.groups && result.groups.length > 0 && result.groups[0].id,
          title: result.title && result.title.id,
          tags: result.tags ? result.tags.map(m => m.id) : [],
          mobile: result.mobile,
          email: result.email,
        });
      })
      .catch(err => Toast.show(err.message, {position: Toast.positions.CENTER}))
      .finally(() => this.props.dispatch(hideLoading()));
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value })
  }

  render () {
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
        {/* <View style={{flex: 0}}>
        {file ? <Image style={{ width: '100%', height: 220 }} source={{uri: 'data:image/png;base64, ' + imageData}} /> : <Image source={require('../images/userCenter/emptyCardImage.png')} style={{width:'100%'}} />}
        </View> */}
        <View style={{flex: 1}}>
        <View style={cellStyle}>
            <Text style={leftStyle}>姓名</Text>
            <TextInput style={rightStyle} {...textInputProps} value={name} onChangeText={this.handleChange.bind(this, 'name')} />
        </View>
        {/* <View style={cellStyle}>
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
        </View>  */}
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
            <Text style={{ color: '#333' }}>+</Text>
            <TextInput placeholder="区号" style={{ width: 40, fontSize: 15, color: '#333' }} {...textInputProps} value={this.state.mobileAreaCode} onChangeText={this.handleChange.bind(this, 'mobileAreaCode')} />
            <TextInput placeholder="手机" style={rightStyle} {...textInputProps} value={mobile} onChangeText={this.handleChange.bind(this, 'mobile')} />
        </View>
        <View style={cellStyle}>
            <Text style={leftStyle}>邮箱</Text>
            <TextInput style={rightStyle} {...textInputProps} value={email} onChangeText={this.handleChange.bind(this, 'email')} />
        </View>
        {/* <View style={cellStyle}>
            <Text style={leftStyle}>机构</Text>
            <Text numberOfLines={1} onPress={this.handleOrgPressed} style={rightStyle}>
              { typeof company === 'object' && company !== null ? company.orgname : company }
            </Text>
        </View> */}
        </View>
    </KeyboardAwareScrollView>
    );
  }
}

function mapStateToProps(state) {
    const { titles, tags } = state.app
    const titleOptions = titles.map(item => ({ label: item.name.trim(), value: item.id }))
    const tagOptions = tags.map(item => ({ label: item.name.trim(), value: item.id }))
    return { titleOptions, tagOptions }
}

export default connect(mapStateToProps)(EditUser);