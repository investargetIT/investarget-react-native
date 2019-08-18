import React from 'react'
import { Image, Text, TextInput, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, Modal, Alert} from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import Picker from './Picker'
import { connect } from 'react-redux';

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

class ModifyProjBDStatus extends React.Component{
constructor(props){
	super(props)
	this.state={
		bd_status:props.currentBD.bd_status,
		username: '', 
	    mobile: '',
	    wechat: '', 
	    email: '',
	    group: '',
	    disabled: this.props.source === 'projectBD' ? false : true,
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
    if (this.props.source === 'projectBD') return;
    const {username, mobile, wechat, email, bd_status, group} =this.state
    const {currentBD} = this.props
    let disabled = ((username.length === 0 || mobile.length === 0 || wechat.length === 0 || email.length === 0 || group.length === 0) && bd_status.id === 3 && currentBD.bduser === null && currentBD.bd_status.id !== 3)
           || (wechat.length === 0 && bd_status.id === 3 && currentBD.bduser !== null && currentBD.bd_status.id !== 3);
    this.setState({disabled})       
}


    wechatConfirm = () => {
        const { bd_status, confirmModal } = this.state
        const { currentBD } = this.props
        if (bd_status.id == 3 && currentBD.bd_status.id != 3) {
            if (!currentBD.bduser) {
                this.checkExistence(this.state.mobile, this.state.email).then(ifExist => {
                    if (ifExist) {
                        Alert.alert('用户已存在');
                    } else {
                        this.handleConfirmAudit(true);
                    }
                })
            } else {
                // 已经有联系人时
                if (currentBD.wechat && currentBD.wechat.length > 0) {
                    // 该联系人已经有微信
                    this.setState({ visible: false, confirmModal: true })
                } else {
                    // 该联系人没有微信
                    this.setState({ visible: false }, () => this.handleConfirmAudit(true));
                }
            }
        } else {
            this.handleConfirmAudit(true)
        }
    }

checkExistence = (mobile, email) => {
    return new Promise((resolve, reject) => {
      Promise.all([api.checkUserExist(mobile),api.checkUserExist(email)])
        .then(result => {
          for(let item of result) {
            if(item.result === true)
                resolve(true);
          }
          resolve(false);
        })
        .catch(err => reject(err));
    });
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

      api.checkUserRelation(currentBD.bduser, currentBD.manager.id)
        .then(result => {
          if (result.data || hasPerm('usersys.admin_changeuser') && isModifyWechat) {
            api.editUser([currentBD.bduser], { wechat }); 
          } else {
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
                if (isModifyWechat && error.code === 2025) {
                  Alert.alert('该用户正处于保护期，无法建立联系，因此暂时无法修改微信');
                }
              }); 
          }
        });

        this.addRelation(currentBD.bduser);
        
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
  return ![6, 7].includes(this.props.currentBD.bd_status.id) && [6, 7].includes(this.state.bd_status.id);
}

render(){
	const {bd_status, group, disabled, confirmModal, visible} = this.state
	const {source, currentBD} = this.props
    let color=disabled ? 'white' : 'lightblue'
    buttonStyle={...buttonStyle,backgroundColor:color}
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
    	<Picker value={bd_status&&bd_status.id} options={this.props.statusOptions} onChange={this.handleChangeStatus}/>
    	</View>
    	</View>
    	{this.isShowContactForm() &&
    	<View>
            <SelectInvestorGroup 
              value={group} 
              onLoadData={ options => options.length > 0 ? this.setState({ group: options[0].value }) : null }
              onChange={this.changeGroup.bind(this)}/>
			<View style={cellStyle} >
                <Text style={cellLabelStyle}>姓名</Text>
                <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={username=>{this.setState({username},this.checkInvalid);}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>手机号码</Text>
                <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={mobile=>{this.setState({mobile},this.checkInvalid)}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>微信</Text>
                <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={wechat=>{this.setState({wechat},this.checkInvalid)}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>邮箱</Text>
                <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={email=>{this.setState({email},this.checkInvalid)}}/>
            </View>
    	</View>
    	}

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
      <Text style={cellLabelStyle}>角色</Text>
      <View style={{width:'50%'}}>
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
