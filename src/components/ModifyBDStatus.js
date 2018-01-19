import React from 'react'
import { Image, Text, TextInput, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, Modal} from 'react-native';
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
	    disabled:false 
	}
}

setModalVisible = (visible) =>{
	this.props.setVisible(visible)
}

wechatConfirm = () =>{
	// const {bd_status} = this.state
	// const {currentBD} = this.props
	// if(bd_status==3 && currentBD.bd_status.id!=3 && currentBD.wechat &&currentBD.wechat.length>0){

	// }
	// else{
	// 	this.handleConfirmAudit(true);
	// }
}

confirmModify = () =>{
	const {bd_status, username,mobile,wechat,email,group} = this.state
	const {source, currentBD} = this.props
	this.setModalVisible(false)

	if(source == 'orgBD'){
		this.wechatConfirm()
		// api.modifyOrgBD(currentBD.id, {bd_status:bd_status.id}).then(()=>{
		// 	DeviceEventEmitter.emit('updateOrgBD')
		// 	this.props.navigation.goBack()
		// }).catch(error => {
  //           Toast.show(error.message, {position: Toast.positions.CENTER})
  //       })
    }
    else if(source == 'projectBD'){
    	api.editProjBD(currentBD.id, { bd_status:bd_status.id }).then(()=>{
			DeviceEventEmitter.emit('updateProjBD')
			this.props.navigation.goBack()
		}).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }
}

handleChangeStatus = value =>{
	this.setState({bd_status:{name:status_options.find(item=>item.value==value).label, id:value}})	
}

changeGroup = value =>{
	this.setState({group:value})
}

render(){
	const {bd_status, group} = this.state
	const {source, currentBD} = this.props
	return(
	<Modal          
      animationType={"fade"}
      transparent={true}
      visible={true}
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
                <TextInput style={cellContentStyle} onChangeText={username=>{this.setState({username})}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>手机号码</Text>
                <TextInput style={cellContentStyle} onChangeText={mobile=>{this.setState({mobile})}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>微信</Text>
                <TextInput style={cellContentStyle} onChangeText={wechat=>{this.setState({wechat})}}/>
            </View>
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>邮箱</Text>
                <TextInput style={cellContentStyle} onChangeText={email=>{this.setState({email})}}/>
            </View>
    	</View>
    	:null}

    	{source=='orgBD'&&currentBD.bduser&&currentBD.bd_status.id!=3&&bd_status.id==3 ?
			<View style={cellStyle} >
                <Text style={cellLabelStyle}>微信</Text>
                <TextInput style={cellContentStyle} onChangeText={wechat=>{this.setState({wechat})}}/>
            </View>
    	:null}
    	<View style={buttonContainer}>
    		<TouchableOpacity style={buttonStyle} onPress={this.confirmModify.bind(this)}>
			<Text style={{width:30}}>确认</Text>
			</TouchableOpacity>
    	</View>	
    	</View>
    </View>
    </Modal>
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
      });
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