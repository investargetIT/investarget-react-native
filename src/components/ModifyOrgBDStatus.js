import React from 'react'
import { Image, Text, TextInput, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, Modal, Alert, Switch } from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import Picker from '../components/Picker'
import { connect } from 'react-redux';
import { 
  checkMobile,
  checkEmail,
} from '../utils';

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
    // borderWidth:1,
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
		bd_status:props.currentBD.response,
		username: '', 
	    mobile: '',
	    wechat: '', 
	    email: '',
	    group: '',
	    disabled: this.props.source === 'projectBD' ? false : true,
        visible: true,
        confirmModal:false,
        isimportant:props.currentBD.isimportant,
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
    let disabled = ((username.length === 0 || !checkMobile(mobile) || wechat.length === 0 || !checkEmail(email) || group.length === 0) && bd_status === 3 && currentBD.bduser === null && currentBD.response !== 3);
    this.setState({disabled})       
}


    wechatConfirm = () => {
        const { bd_status, confirmModal } = this.state
        const { currentBD } = this.props
        if ([2, 3].includes(bd_status) && ![2, 3].includes(currentBD.response)) {
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
                if (currentBD.userinfo.wechat && currentBD.userinfo.wechat.length > 0 && this.state.wechat.length > 0) {
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
    const {bd_status, username,mobile,wechat,email,group,isimportant} = this.state
    const {currentBD} = this.props
    const body={ response: bd_status, isimportant: isimportant ? 1 : 0}
    api.modifyOrgBD(currentBD.id, body).then(()=>{
        DeviceEventEmitter.emit('updateOrgBD')
        if(bd_status === currentBD.response || ![1, 2, 3].includes(bd_status) || ([1, 2, 3].includes(bd_status) && [1, 2, 3].includes(currentBD.response))) {
        this.setState({visible:false})
        this.props.navigation.goBack()
        }        
    }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
    })
    
    // 如果状态没有改变
    // 或者状态改为除了已见面、已签NDA、正在看前期资料这三个状态以外的状态
    // 或者虽然状态改成了上述三种状态之一，但是原来的状态也是这三种状态之一
    // 以上三种情况结束执行
    if(bd_status === currentBD.response || ![1, 2, 3].includes(bd_status) || ([1, 2, 3].includes(bd_status) && [1, 2, 3].includes(currentBD.response))) {
        return;
    }

    if(currentBD.bduser){
      api.checkUserRelation(currentBD.bduser, currentBD.manager.id)
        .then(result => {
          if (result || this.props.userInfo.permissions.includes('usersys.admin_changeuser') && isModifyWechat) {
            api.addUserRelation({
                relationtype: true,
                investoruser: currentBD.bduser,
                traderuser: currentBD.manager.id
              })
            api.editUser([currentBD.bduser], { wechat }); 
          } else {
            api.addUserRelation({
              relationtype: true,
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
        if (wechat.length > 0) {
            api.addOrgBDComment({
                orgBD: currentBD.id,
                comments: `微信: ${wechat}`
            }).then((data) => {
                DeviceEventEmitter.emit('updateOrgBD')
                this.props.navigation.goBack()
            })
        } else {
            DeviceEventEmitter.emit('updateOrgBD')
            this.props.navigation.goBack(); 
        }
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
  if (this.props.currentBD.bduser && this.props.currentBD.response !== 2 && this.state.bd_status === 2) {
    const { proj, bduser, manager } = this.props.currentBD;
    const params = {
      timelinedata: {
        'proj': proj.id,
        'investor': bduser,
        'trader': manager.id,
      },
      statusdata: {
        'alertCycle': 7,
        'transationStatus': 1,
        'isActive': true
      }
    }
    api.addTimeline(params);
  }
  this.wechatConfirm()

}

handleChangeStatus = value =>{
	this.setState({bd_status:value},this.checkInvalid)	

}

changeGroup = value =>{
	this.setState({group:value},this.checkInvalid)
    
}

componentDidMount(){   
    this.checkInvalid()
}

render(){
	const {bd_status, group, disabled, confirmModal, visible, isimportant} = this.state
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
                            <TouchableOpacity onPress={this.setModalVisible.bind(this, false)}>
                                <Text >X</Text>
                            </TouchableOpacity>
                        </View>


                        <View style={cellStyle}>
                            <Text style={cellLabelStyle}>重点BD</Text>
                            <View style={{ width: '70%' }}>
                                <Switch
                                    onTintColor="#10458f"
                                    value={isimportant}
                                    onValueChange={isimportant => this.setState({ isimportant })}
                                />
                            </View>
                        </View>

                        <View style={cellStyle}>
                            <Text style={cellLabelStyle}>状态</Text>
                            <View style={{ width: '70%' }}>
                                <Picker
                                    value={bd_status}
                                    options={this.props.orgbdres}
                                    onChange={this.handleChangeStatus}
                                />
                            </View>
                        </View>

    	{ !currentBD.bduser && currentBD.response!=3 && bd_status==3 ?
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
    	:null}

        { /* 有联系人的BD成功时要求填写联系人微信号 */ }
    	{currentBD.bduser && ![2, 3].includes(currentBD.response) && [2, 3].includes(bd_status) ?
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

function mapStateToProps (state) {
  let { orgbdres, userInfo } = state.app;
  orgbdres = orgbdres.map(m => ({ label: m.name, value: m.id }));
  return { orgbdres, userInfo };
}

export default connect(mapStateToProps)(ModifyBDStatus);