import React from 'react';
import {
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
} from 'react-native';
import * as api from '../api'
import Toast from 'react-native-root-toast'
import TimelineRemark from '../components/TimelineRemark'
import ModifyBDStatus from '../components/ModifyBDStatus'
import { connect } from 'react-redux';

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
    borderBottomWidth: 1,
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


class PersonalInfo extends React.Component{
    constructor(props){
      super(props);
      const { currentBD } = props;
      this.state={
        mobile: currentBD.userinfo && currentBD.userinfo.mobile,
        email: currentBD.userinfo && currentBD.userinfo.email,
        title: currentBD.usertitle && currentBD.usertitle.name,
        org: currentBD.org && currentBD.org.orgname,
        wechat: currentBD.userinfo && currentBD.userinfo.wechat,
        tags: currentBD.userinfo && currentBD.userinfo.tags && currentBD.userinfo.tags.map(item => item.name).join(','),
        manager: currentBD.manager.username,
        famlv: 0,
        famOptions: [],
      }

      this.relation = null;
    }

    getTraders = investor =>{
    const param = { investoruser: investor}
    api.getUserRelation(param).then(result => {
    const data = result.data.sort((a, b) => Number(b.relationtype) - Number(a.relationtype))
    const list = []
    data.forEach(item => {
        const trader = item.traderuser
        if (trader) {
            list.push({ label: trader.username, value: trader.id, onjob: trader.onjob })
        }
        this.setState({ traders:list });
    })

    // 找出当前交易师与投资人的熟悉程度
    this.relation = data.filter(f => f.traderuser.id === this.props.userInfo.id)[0];
    if (this.relation) {
      this.setState({ famlv: this.relation.familiar });
    } else {
      this.setState({ famlv: null });
    }
    
    }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
    })
    }

    componentDidMount() {
        api.getSource('famlv').then(data => {
            const famOptions = data.map(item => ({ label: item.name, value: item.id }));
            this.setState({ famOptions });
        });
    }

    render(){
        let {mobile, email, title, org, wechat, tags, manager} =this.state
        mobile = mobile ? /^\d{2}-/.test(mobile) ? mobile = '+' + mobile : mobile : '暂无';
        
        email = email || '暂无'
        title = title || '暂无'
        wechat = wechat || '暂无'
        tags = tags&&tags.length>0 ? tags : '暂无'
        org =  org || '暂无'    
        return(
          <View style={this.props.style}>
            <Cell label="电话" content={mobile} />
            <Cell label="邮箱" content={email} />
            <Cell label="职位" content={title} />
            <Cell label="标签" content={tags} />
            <Cell label="微信" content={wechat} />
            <Cell label="负责人" content={manager} />
            <Cell label="机构" content={org} />
          </View>
        )
    }

}

function mapStateToProps(state) {
  const { userInfo } = state.app;
  return { userInfo };
}

PersonalInfo = connect(mapStateToProps)(PersonalInfo);

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
			response:null,
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

			this.setState({
				currentBD: item,
				proj: item.proj&&item.proj.projtitle,
				org: item.org&&item.org.orgname,
				comments: item.BDComments,
				response: item.response
			})
 
	}
	render(){
		let {proj, comments, response, id, org, currentBD, visible } =this.state
		const {item, source} = this.props.navigation.state.params
		return(
		<ScrollView style={containerStyle}>
           <PersonalInfo currentBD={item} />
           <Cell label="项目" content={proj} />

                <View style={{...cellStyle, justifyContent: 'space-between'}}>
                    <Text style={cellLabelStyle}>当前状态</Text>
                    <Text style={{flex: 1}}>{response ? this.props.orgbdres.filter(f => f.id === response)[0].name : '暂无'}</Text>
                    <TouchableOpacity style={{ marginRight: 16 }} onPress={this.setModalVisible.bind(this, true)}>
                        <Text style={{ textAlign: 'right', color: '#10458F' }}>修改状态</Text>
                    </TouchableOpacity>
                </View>

			<TimelineRemark 
			  disableAdd={source === 'orgBD' && !this.props.userInfo.permissions.includes('BD.manageOrgBD') && this.props.userInfo.id !== item.manager.id} 
			  style={{flex: 1}} 
			  source={source} 
			  id={item.id} 
			  comments={item.BDComments} 
			/>
            {visible?
			<ModifyBDStatus 
			  currentBD={item} 
			  source={source} 
			  setVisible={this.setModalVisible} 
			  {...this.props}/> 
			:null}
            
            
        </ScrollView>

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

function mapStateToProps(state) {
  const { userInfo, orgbdres } = state.app;
  return { userInfo, orgbdres };
}

export default connect(mapStateToProps)(PersonalDetail);