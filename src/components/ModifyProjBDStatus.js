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

const textInputProps = {
  autoCapitalize: "none",
  spellCheck: false,
  underlineColorAndroid: "transparent",
  selectionColor: "#2269d4",
  placeholderTextColor: "#999",
}

class ModifyProjBDStatus extends React.Component{
constructor(props){
	super(props)
	this.state={
		bd_status:props.currentBD.bd_status,
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

setModalVisible = (visible) =>{              
	this.props.setVisible(visible)    
}

checkInvalid = () =>{
    if (this.props.source === 'projectBD') return;
    const {username, mobile, wechat, email, bd_status, group} =this.state
    const {currentBD} = this.props
    let disabled = ((username.length === 0 || mobile.length === 0 || wechat.length === 0 || email.length === 0 || group.length === 0) && bd_status.id === 3 && currentBD.bduser === null && currentBD.bd_status.id !== 3)
           || (wechat.length === 0 && bd_status.id === 3 && currentBD.bduser !== null && currentBD.bd_status.id !== 3);
    this.setState({disabled})       
}


  confirmModify = () => {
    const { bd_status, username, mobile, wechat, email, group } = this.state
    const { source, currentBD } = this.props
    this.setModalVisible(false)
    api.editProjBD(currentBD.id, { bd_status: bd_status.id }).then(() => {
      DeviceEventEmitter.emit('updateProjBD')
      this.props.navigation.goBack()
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
  return ![6, 7].includes(this.props.currentBD.bd_status.id) && [6, 7].includes(this.state.bd_status.id);
}

render(){
	const {bd_status, group, disabled, visible} = this.state
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
                <View style={cellStyle} >
                  <Text style={cellLabelStyle}>联系人姓名</Text>
                  <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={username => { this.setState({ username }, this.checkInvalid); }} />
                </View>
                <SelectTitle
                  value={group}
                  onLoadData={options => options.length > 0 ? this.setState({ group: options[0].value }) : null}
                  onChange={this.changeGroup.bind(this)} />
                <View style={cellStyle} >
                  <Text style={cellLabelStyle}>联系人电话</Text>
                  <Text style={{ color: '#333' }}>+</Text>

                  <TextInput placeholder="区号" style={{ width: 40, fontSize: 15, color: '#333', borderWidth: 1, borderColor:'#f4f4f4' }} {...textInputProps} value={this.state.mobileAreaCode} onChangeText={value => this.setState({ mobileAreaCode: value })} />

                  <TextInput style={{...cellContentStyle, width: '40%'}} underlineColorAndroid="transparent" onChangeText={mobile => { this.setState({ mobile }, this.checkInvalid) }} />
                </View>
                <View style={cellStyle} >
                  <Text style={cellLabelStyle}>邮箱</Text>
                  <TextInput style={cellContentStyle} underlineColorAndroid="transparent" onChangeText={email => { this.setState({ email }, this.checkInvalid) }} />
                </View>
              </View>
            }

    	<View style={buttonContainer}>
    		<TouchableOpacity style={{...buttonStyle}} onPress={disabled ? null : this.confirmModify.bind(this)}>
			<Text style={{width:30}}>确认</Text>
			</TouchableOpacity>
    	</View>	
    	</View>
    </View>
    </Modal>
    </View>
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
      <Text style={cellLabelStyle}>联系人职位</Text>
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
