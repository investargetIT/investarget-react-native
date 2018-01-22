import React from 'react'
import { Image, Text, View, TouchableOpacity, DeviceEventEmitter, ScrollView, Modal,TouchableHighlight} from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import PersonalInfo from '../components/PersonalInfo'
import TimelineRemark from '../components/TimelineRemark'
import ModifyBDStatus from '../components/ModifyBDStatus'

const containerStyle = {
    backgroundColor: '#fff',
    flex:1
}
const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}
const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    marginLeft: 16,
    height: 40,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1
}
const cellLabelStyle = {
    width: 80,
    flex: 0,
    fontSize: 13,
    color: '#333'
}
const cellContentStyle = {
    fontSize: 13,
    width:'75%'
}


class PersonalDetail extends React.Component{
	static navigationOptions=({navigation}) =>{
	const { params } = navigation.state
 	return {
      title: params.item.username|| '暂无',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff'
    }
 	}

	constructor(props){
		super(props)
		this.state={
			id:this.props.navigation.state.params.item.bduser,
			comments:[],
			bd_status:null,
			currentBD:null,
			org:null,
			proj:null,
			visible:false,
		}
	}

	handleChangeStatus = value =>{
		this.setState({chosenStatus:{name:status_options.find(item=>item.value==value).label, id:value}})
		
	}
	
	setModalVisible = (visible) =>{
	this.setState({visible:visible})
	}

	componentDidMount(){
		this.props.navigation.setParams({ handleSubmit: this.handleSubmit })
		const {item, source} = this.props.navigation.state.params
		if(source == 'projectBD'){
			this.setState({
				currentBD:item, 
				proj: item.com_name, 
				bd_status: item.bd_status,
				comments: item.BDComments
			})
		}
		else if(source == 'orgBD'){
			this.setState({
				currentBD: item,
				proj: item.proj&&item.proj.projtitle,
				org: item.org&&item.org.orgname,
				comments: item.BDComments,
				bd_status: item.bd_status
			})
		}
 
	}
	render(){
		let {proj, comments, bd_status, id, org, currentBD, visible } =this.state
		const {item, source} = this.props.navigation.state.params
		return(
		<View style={containerStyle}>
           <PersonalInfo currentBD={item} />
           {proj ? <Cell label="项目" content={proj} /> : null}
           {bd_status? 
           	<View style={cellStyle}>
                <Text style={cellLabelStyle}>当前状态</Text>
                <Text>{bd_status.name}</Text>
                <TouchableOpacity onPress={this.setModalVisible.bind(this,true)}>
                	<Text style={{width:200,textAlign:'right'}}>修改</Text>
                </TouchableOpacity>
            </View> : null}
            <TimelineRemark style={{flex: 1}} source={source} id={item.id} comments={item.BDComments}/>
            {visible?
            <ModifyBDStatus type="proj_bd" currentBD={item} source={source} setVisible={this.setModalVisible} {...this.props}/> :null}
            
            
        </View>

		)
	}
}

class Cell extends React.Component {

    render() {
        const { label, content } = this.props
        return (
            <View style={cellStyle} >
                <Text style={cellLabelStyle}>{label}</Text>
                <Text style={cellContentStyle} numberOfLines={2}>{content}</Text>
            </View>
        )
    }
}



export default PersonalDetail