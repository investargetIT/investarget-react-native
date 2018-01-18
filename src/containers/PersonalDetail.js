import React from 'react'
import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity, DeviceEventEmitter, ScrollView} from 'react-native';
import * as api from '../api'
import Picker from '../components/Picker'
import Toast from 'react-native-root-toast'
import PersonalInfo from '../components/PersonalInfo'
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
const status_options=[{label: '未BD',value: 1},{label: 'BD中',value: 2},{label: 'BD成功',value: 3},{label: '暂不BD',value: 4}]

class PersonalDetail extends React.Component{
	static navigationOptions=({navigation}) =>{
	const { params } = navigation.state
 	return {
      title: params.item.username|| '',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: <Text style={headerRightStyle} onPress={() => {params.handleSubmit && params.handleSubmit()}}>提交</Text>
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
			proj:null
		}
	}

	handleSubmit = () =>{
		const {currentBD, bd_status} = this.state
		const {source} = this.props.navigation.state.params
		if(source == 'orgBD'){
			api.modifyOrgBD(currentBD.id, {bd_status:bd_status.id}).then(()=>{
				DeviceEventEmitter.emit('updateOrgBD')
				this.props.navigation.goBack()
			}).catch(error => {
	            Toast.show(error.message, {position: Toast.positions.CENTER})
	        })
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
		let {proj, comments, bd_status, id, org } =this.state		
		return(
		<View style={containerStyle}>
           <PersonalInfo userId={id} org={org}/>
           {proj ? <Cell label="项目" content={proj} /> : null}
           {bd_status? 
           	<View style={cellStyle}>
                <Text style={cellLabelStyle}>当前状态</Text>
                <Picker value={bd_status.id} options={status_options} onChange={this.handleChangeStatus}/>
            </View> : null}
            {comments&&comments.length>0? <Remarks comments={comments} />:null}

        </View>
		)
	}
}

function Remarks (props){
	return(
	<View style={{flex:1}}>
	<View style={cellStyle}>
    	<Text>备注</Text>    
    </View>
    <ScrollView style={{flex:1}}>
        {props.comments.map(item => {       	
            var time = item.createdtime
            time = time.slice(0,19).replace('T',' ')
            return (
			<View key={item.id} style={{paddingLeft:16, marginBottom:8,backgroundColor: '#f8f8f8'}}>	               
                <Text style={{fontSize: 14,color: '#333',marginBottom: 8}}  >{item.comments}</Text>
                <Text style={{fontSize: 12,color: '#999',textAlign:'right'}}>{time}</Text>
            </View>
            )
        })} 
    </ScrollView>
    </View>
	)
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