import React from 'react'
import { Image, Text, TextInput, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, Alert} from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import Picker from './Picker'
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const backgroundStyle ={
	flex:1,
	justifyContent:'center',
	alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.3)'
}
const modalStyle={
	minHeight:40,
	width:'80%',
	backgroundColor:'white',
	borderRadius:10,
	padding:10
}
const titleStyle={
	flex:0,
	flexDirection:'row',
	justifyContent:'space-between', 
	width:'100%',
	borderBottomColor: '#f4f4f4',
	borderBottomWidth: 1
}
const buttonContainer={
	flexDirection:'row',
	paddingTop:5,
	flex:0,
	justifyContent:'center'
}

let buttonStyle={
	width:35,
	borderRadius:5,
	padding:2,
	flex:0,
	flexDirection:'row',
	justifyContent:'center'
}
const cellStyle = {
  flexDirection:'row',
  alignItems:'center',
  backgroundColor:'#fff',
  marginBottom: 1,
  height:40,
  paddingLeft:16,
  paddingRight:16,
}
const cellLabelStyle = {
    width: 80,
    flex: 0,
}
const leftStyle = {width:'30%',fontSize:15,color:'#333'}
const rightStyle = {
  flex:1,
  fontSize:15,
  color:'#333',
  paddingLeft: 0,
};
const cellContentStyle = {
    width:'60%',
    borderWidth:1,
    borderColor:'#f4f4f4'
}

const textInputProps = {
  autoCapitalize: "none",
  spellCheck: false,
  underlineColorAndroid: "transparent",
  selectionColor: "#2269d4",
  placeholderTextColor: "#999",
}

class ModifyProjBDStatus extends React.Component{

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state
    return {
      title: '修改项目BD状态',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => { params.onPress && params.onPress() }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>提交</Text>
        </TouchableOpacity>
      ),
      headerBackTitle: null,
    }
  }

constructor(props){
  super(props)
  
  const { currentBD, source } = props.navigation.state.params;
  props.navigation.setParams({ onPress: this.confirmModify });

	this.state={
    currentBD,
		bd_status:currentBD.bd_status,
		username: '', 
      mobile: '',
      mobileAreaCode: '86',
	    wechat: '', 
	    email: '',
	    group: '',
	    disabled: this.props.source === 'projectBD' ? false : true,
        visible: true,
	}
}

checkInvalid = () =>{
    if (this.props.source === 'projectBD') return;
    const {username, mobile, wechat, email, bd_status, group} =this.state
    const {currentBD} = this.state;
    let disabled = ((username.length === 0 || mobile.length === 0 || wechat.length === 0 || email.length === 0 || group.length === 0) && bd_status.id === 3 && currentBD.bduser === null && currentBD.bd_status.id !== 3)
           || (wechat.length === 0 && bd_status.id === 3 && currentBD.bduser !== null && currentBD.bd_status.id !== 3);
    this.setState({disabled})       
}

  updatePorjectBD = async () => {
    const { currentBD } = this.state;
    const { bd_status, email, group: title, mobile, mobileAreaCode, username } = this.state;
    const editProjBDBody = { bd_status: bd_status.id };
    if (this.isShowContactForm()) {
      if (username.length === 0 || mobile.length === 0) {
        throw new Error('请填写完整相关信息');
      }
      const usermobile = (mobileAreaCode && mobile) ? mobileAreaCode + '-' + mobile : mobile;
      await api.addProjBDCom({
        projectBD: currentBD.id,
        comments: `联系人姓名：${username}，电话：${usermobile}，邮箱：${email || '暂无'}`,
      });
      editProjBDBody.username = username;
      editProjBDBody.usertitle = title;
      editProjBDBody.usermobile = usermobile;
      editProjBDBody.useremail = email;
    }
    await api.editProjBD(currentBD.id, editProjBDBody);
  }

  confirmModify = () => {
    this.updatePorjectBD().then(() => {
      DeviceEventEmitter.emit('updateProjBD')
      this.props.navigation.goBack();
      this.props.navigation.state.params.onComplete();
    }).catch(error => {
      Toast.show(error.message, { position: Toast.positions.CENTER })
    })
  }

handleChangeStatus = value =>{
	this.setState({bd_status:{name:this.props.statusOptions.find(item=>item.value==value).label, id:value}},this.checkInvalid)	

}

changeGroup = value =>{
	this.setState({group:value},this.checkInvalid)
    
}

componentDidMount(){   
    this.checkInvalid()
}

// 项目BD状态改为已见面或已联系(对应id为6,7)时需要填写联系人信息, 详细需求见bugClose#340
isShowContactForm = () => {
  return ![6, 7].includes(this.state.currentBD.bd_status.id) && [6, 7].includes(this.state.bd_status.id);
}

render(){
	const {bd_status, group, disabled, visible} = this.state
	const {source, currentBD} = this.state;
    let color=disabled ? 'white' : 'lightblue'
    buttonStyle={...buttonStyle,backgroundColor:color}
	return(
    <KeyboardAwareScrollView style={{ flex: 1 }}>

      <View style={cellStyle}>
        <Text style={leftStyle}>状态</Text>
        <View style={{flex:1,paddingLeft: 0}}>
          <Picker value={bd_status && bd_status.id} options={this.props.statusOptions} onChange={this.handleChangeStatus} />
        </View>
      </View>

      {this.isShowContactForm() &&
        <View>

          <View style={cellStyle} >
            <Text style={leftStyle}>联系人姓名</Text>
            <TextInput
              style={{ ...rightStyle, paddingLeft: 8, paddingRight: 16 }}
              underlineColorAndroid="transparent"
              onChangeText={username => { this.setState({ username }, this.checkInvalid); }}
              placeholder="未填写"
            />
          </View>

          <SelectTitle
            value={group}
            onLoadData={options => options.length > 0 ? this.setState({ group: options[0].value }) : null}
            onChange={this.changeGroup.bind(this)}
          />

          <View style={cellStyle} >
            <Text style={leftStyle}>联系人电话</Text>
            <Text style={{ color: '#333', paddingLeft: 8 }}>+</Text>
            <TextInput
              placeholder="区号"
              style={{ width: 40, fontSize: 15, color: '#333' }}
              {...textInputProps}
              value={this.state.mobileAreaCode}
              onChangeText={value => this.setState({ mobileAreaCode: value })}
            />
            <TextInput
              style={{ ...rightStyle, paddingRight: 16 }}
              underlineColorAndroid="transparent"
              onChangeText={mobile => { this.setState({ mobile }, this.checkInvalid) }}
              placeholder="未填写"
            />
          </View>

          <View style={cellStyle} >
            <Text style={leftStyle}>邮箱</Text>
            <TextInput
              style={{ ...rightStyle, paddingLeft: 8, paddingRight: 16 }}
              underlineColorAndroid="transparent"
              onChangeText={email => { this.setState({ email }, this.checkInvalid) }}
              placeholder="未填写"
            />
          </View>

        </View>
      }

    </KeyboardAwareScrollView>
	)
}
}

class SelectTitle extends React.Component {
	state = {
    options: []
  	}

  	componentDidMount() {
    api.getSource('title' )
      .then(result => {
        const options = result.map(m => ({ label: m.name, value: m.id }));
        this.setState({ options });
        this.props.onLoadData(options);
      }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
  	}

  	render() {
  	const options=this.state.options
    if (options.length === 0) return null;
    return (
    <View style={cellStyle}>
      <Text style={leftStyle}>联系人职位</Text>
      <View style={{ flex:1, paddingLeft: 0 }}>
      <Picker value={this.props.value} options={options} onChange={this.props.onChange}/>
      </View>
    </View>
    )
  }
}

function mapStateToProps(state) {
  const { bdStatus } = state.app;
  const statusOptions = bdStatus.map(m => ({ label: m.name, value: m.id }));
  return { statusOptions };
}

export default connect(mapStateToProps)(ModifyProjBDStatus);
