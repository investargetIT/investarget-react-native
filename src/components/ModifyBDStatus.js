import React from 'react'
import { Image, Text, TextInput, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, Modal, Alert} from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import Picker from '../components/Picker'

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

const buttonStyle={
	width:35,
	borderRadius:5,
	padding:2,
	flex:0,
	flexDirection:'row',
	justifyContent:'center',
	backgroundColor:'lightblue'
}

const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    marginLeft: 10,
    height: 40,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1
}
const cellLabelStyle = {
    width: 80,
    flex: 0,
}
const cellContentStyle = {
    width:'60%',
    borderWidth:1,
    borderColor:'#f4f4f4'
}
const status_options=[{label: '未BD',value: 1},
{label: 'BD中',value: 2},
{label: 'BD成功',value: 3},
{label: '暂不BD',value: 4}]


class ModifyBDStatus extends React.Component{
constructor(props){
	super(props)
	this.state={
		bd_status:props.currentBD.bd_status,
		username: '', 
	    mobile: '',
	    wechat: '', 
	    email: '',
	    group: '',
	    disabled:true,
        visible: true,
        confirmModal:false
	}
}

setModalVisible = (visible) =>{              
	this.props.setVisible(visible)    
}

pressCancel = () =>{
    this.handleConfirmAudit(false)
}

pressOk = () =>{
    this.handleConfirmAudit(true)
}

checkInvalid = () =>{
    const {username, mobile, wechat, email, bd_status, group} =this.state
    const {currentBD} = this.props
    let disabled = ((username.length === 0 || mobile.length === 0 || wechat.length === 0 || email.length === 0 || group.length === 0) && bd_status.id === 3 && currentBD.bduser === null && currentBD.bd_status.id !== 3)
           || (wechat.length === 0 && bd_status.id === 3 && currentBD.bduser !== null && currentBD.bd_status.id !== 3);
    this.setState({disabled})       
}


wechatConfirm = () =>{
	const {bd_status, confirmModal} = this.state
	const {currentBD} = this.props
	if(bd_status.id==3 && currentBD.bd_status.id!=3 && currentBD.wechat &&currentBD.wechat.length>0){
        this.setState({visible:false, confirmModal:true})
	}
	else{
		this.handleConfirmAudit(true);
	}
}

checkExistence = (mobile, email) =>{
    return Promise.all([api.checkUserExist(mobile),api.checkUserExist(email)])
    .then(result=>{
        for(let item of result){
            if(item.result==true)
                return true
        }
        return false
    })
    .catch(err=>{
        Toast.show(error.message, {position: Toast.positions.CENTER})
    })
}

handleConfirmAudit = (isModifyWechat) =>{
    const {bd_status, username,mobile,wechat,email,group} = this.state
    const {currentBD} = this.props
    const body={bd_status:bd_status.id}
    api.modifyOrgBD(currentBD.id, body).then(()=>{
        DeviceEventEmitter.emit('updateOrgBD')
        if(bd_status.id!==3 || currentBD.bd_status.id===3) {
        this.setState({visible:false})
        this.props.navigation.goBack()
        }        
    }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
    })
    
    if(bd_status.id!==3 || currentBD.bd_status.id===3) {
        return;
    }

    if(currentBD.bduser){

        this.addRelation(currentBD.bduser);
        api.addUserRelation({
        relationtype: false,
        investoruser: currentBD.bduser,
        traderuser: currentBD.manager.id
        })
        .then(result => {
          if (isModifyWechat) {
            api.editUser([currentBD.bduser], { wechat });
          }
        })
        .catch(error => {
        if (isModifyWechat) {
            api.editUser([currentBD.bduser], { wechat });
          }   
        });
        api.addOrgBDComment({
        orgBD: currentBD.id,
        comments: `微信: ${wechat}`
      }).then((data)=>{
        DeviceEventEmitter.emit('updateOrgBD') 
        this.props.navigation.goBack()
      })
    }
    else{
        api.addOrgBDComment({
        orgBD: currentBD.id,
        comments: `姓名: ${username} 手机号码: ${mobile} 微信: ${wechat} 邮箱: ${email}`
      });
        const newUser = { mobile, wechat, email, groups: [Number(group)], userstatus: 2 };
        if (window.LANG === 'en') {
            newUser.usernameE = username;
        } else {
            newUser.usernameC = username;
        }

        this.checkExistence(mobile,email).then(ifExist=>{
        if(ifExist){
            alert('用户已存在')         
        }
        else{
        this.setState({visible:false})
        api.addUser(newUser)
        .then(result =>{
          this.addRelation(result.id);
          api.addUserRelation({
          relationtype: false,
          investoruser: result.id,
          traderuser: currentBD.manager.id
          }).then(data=>{
            DeviceEventEmitter.emit('updateOrgBD') 
            this.props.navigation.goBack()
          })
        })
        }
        });
            
        
        
    }
}

addRelation = investorID =>{
    const {currentBD} = this.props
    if(currentBD.makeUser && currentBD.proj){
        api.addUserRelation({
        relationtype: false,
        investoruser: investorID,
        traderuser: currentBD.makeUser,
        proj: currentBD.proj.id,
      }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }
}

confirmModify = () =>{
	const {bd_status, username,mobile,wechat,email,group} = this.state
	const {source, currentBD} = this.props

	if(source == 'orgBD'){
        this.wechatConfirm()
    }
    else if(source == 'projectBD'){
        this.setModalVisible(false)
    	api.editProjBD(currentBD.id, { bd_status:bd_status.id }).then(()=>{
			DeviceEventEmitter.emit('updateProjBD')
			this.props.navigation.goBack()
		}).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }
}

handleChangeStatus = value =>{
	this.setState({bd_status:{name:status_options.find(item=>item.value==value).label, id:value}},this.checkInvalid)	

}

changeGroup = value =>{
	this.setState({group:value},this.checkInvalid)
    
}

componentDidMount(){   
    this.checkInvalid()
}

render(){
	const {bd_status, group, disabled, confirmModal, visible} = this.state
	const {source, currentBD} = this.props
	return(
    <View>
	<Modal          
      animationType={"fade"}
      transparent={true}
      visible={visible}
    >
    <View style={backgroundStyle}>
    	<View style={modalStyle}>
    		<View style={titleStyle}>
    		<Text >修改BD状态</Text>
    		<TouchableOpacity onPress={this.setModalVisible.bind(this,false)}>
			<Text >X</Text>
			</TouchableOpacity>
    		</View>
    	<View style={cellStyle}>
		<Text style={cellLabelStyle}>状态</Text>
    	<View style={{width:'50%'}}>
    	<Picker value={bd_status&&bd_status.id} options={status_options} onChange={this.handleChangeStatus}/>
    	</View>
    	</View>
    	{source=='orgBD'&&!currentBD.bduser&&currentBD.bd_status.id!=3&&bd_status.id==3 ?
    	<View>
            <SelectInvestorGroup value={group} onChange={this.changeGroup.bind(this)}/>
			<View style={cellStyle} >
                <Text style={cellLabelStyle}>姓名</Text>
                <TextInput style={cellContentStyle} onChangeText={username=>{this.setState({username},this.checkInvalid);}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>手机号码</Text>
                <TextInput style={cellContentStyle} onChangeText={mobile=>{this.setState({mobile},this.checkInvalid)}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>微信</Text>
                <TextInput style={cellContentStyle} onChangeText={wechat=>{this.setState({wechat},this.checkInvalid)}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>邮箱</Text>
                <TextInput style={cellContentStyle} onChangeText={email=>{this.setState({email},this.checkInvalid)}}/>
            </View>
    	</View>
    	:null}

    	{source=='orgBD'&&currentBD.bduser&&currentBD.bd_status.id!=3&&bd_status.id==3 ?
			<View style={cellStyle} >
                <Text style={cellLabelStyle}>微信</Text>
                <TextInput style={cellContentStyle} onChangeText={wechat=>{this.setState({wechat},this.checkInvalid)}}/>
            </View>
    	:null}
    	<View style={buttonContainer}>
    		<TouchableOpacity style={{...buttonStyle}} onPress={disabled ? null : this.confirmModify.bind(this)}>
			<Text style={{width:30}}>确认</Text>
			</TouchableOpacity>
    	</View>	
    	</View>
    </View>
    </Modal>
    <Modal
    animationType={"fade"}
    transparent={true}
    visible={confirmModal}>
        <View style={backgroundStyle}>
            <View style={modalStyle}>
                <View style={{marginBottom:20}}>
                    <Text style={{textAlign:'center'}}>联系人微信已存在，是否覆盖现有微信</Text>
                </View>
                <View style={{flex:0,flexDirection:'row',justifyContent:'center'}}>
                <TouchableOpacity  style={{width:35,marginRight:20}} onPress={this.pressCancel.bind(this)}>
                    <Text >取消</Text>
                </TouchableOpacity>
                <TouchableOpacity  style={{width:35}} onPress={this.pressOk.bind(this)}>
                    <Text style={{color:'blue'}}>确认</Text>
                </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
    </View>
	)
}
}

class SelectInvestorGroup extends React.Component {
	state = {
    options: []
  	}

  	componentDidMount() {
    api.queryUserGroup({ type: 'investor' })
      .then(result => {
        const options = result.data.map(m => ({ label: m.name, value: m.id }));
        this.setState({ options });
      }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
  	}

  	render() {
  	const options=this.state.options
    if (options.length === 0) return null;
    return (
    <View style={cellStyle}>
      <Text style={cellLabelStyle}>角色</Text>
      <View style={{width:'50%'}}>
      <Picker value={this.props.value} options={options} onChange={this.props.onChange}/>
      </View>
    </View>
    )
  }
}


export default ModifyBDStatus