import React from 'react'
import {
  View,
  Text,
} from 'react-native';
import * as api from '../api';
import Toast from 'react-native-root-toast'
import Picker from './Picker';
import { connect } from 'react-redux';



const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    marginLeft: 16,
    minHeight: 40,
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

class PersonalInfo extends React.Component{
    constructor(props){
      super(props)
      this.state={
        mobile:null,
        email:null,
        title:null,
        org:null,
        wechat:null,
        tags:[],
        traders:[],
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
    this.setState({ famlv: this.relation.familiar });
    
    }).catch(error => {
        Toast.show(error.message, {position: Toast.positions.CENTER})
    })
    }

  componentDidMount(){
    const currentBD = this.props.currentBD
    if(this.props.userId){
        this.getTraders(this.props.userId)     
        api.getUserBase(this.props.userId).then(result=>{
        this.setState({
            mobile:result.mobile,
            email: result.email,
            title: result.title&&result.title.name,
            tags: result.tags&&result.tags.map(item=>item.name).join(','),
            org: result.org&&result.org.orgname,
            wechat: result.wechat
        })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }
    else if(currentBD){
        this.setState({
            mobile:currentBD.usermobile,
            email:currentBD.email||currentBD.useremail,
            title:currentBD.usertitle&&currentBD.usertitle.name,
            org:currentBD.org&&currentBD.org.orgname,
            wechat:currentBD.wechat,
            tags:currentBD.useinfo&&currentBD.useinfo.tags&&currentBD.useinfo.tags.map(item=>item.name).join(','),
            traders: currentBD.manager && [{ label: currentBD.manager.username }],
        })
    }
    api.getSource('famlv').then(data => {
      const famOptions = data.map(item => ({ label: item.name, value: item.id }));
      this.setState({ famOptions });
    });
  }

    handleChangeFamLv = value => {
      this.setState({ famlv: value });
      const { investoruser, traderuser, relationtype, id } = this.relation;
      api.editUserRelation([{ 
        id, 
        traderuser: traderuser.id, 
        investoruser: investoruser.id, 
        relationtype, 
        familiar: value 
      }]);
    };

    render(){
        let {mobile, email, title, org, wechat, tags, traders} =this.state
        traders=traders.length>0 ? traders.map(m =>m.label).join(',') :'暂无'
        mobile = mobile ? /^\d{2}-/.test(mobile) ? mobile = '+' + mobile : mobile : '暂无';
        
        email = email || '暂无'
        title = title || '暂无'
        wechat = wechat || '暂无'
        tags = tags&&tags.length>0 ? tags : '暂无'
        org =  org || null    
        return(
          <View style={this.props.style}>
            <Cell label="电话" content={mobile} />
            <Cell label="邮箱" content={email} />
            <Cell label="职位" content={title} />
            <Cell label="标签" content={tags} />
            <Cell label="微信" content={wechat} />
            <Cell label="交易师" content={traders} />
            {org ? <Cell label="机构" content={org} /> : null}
            { !this.props.currentBD ? 
            <View style={cellStyle}>
              <Text style={cellLabelStyle}>熟悉程度</Text>
              <Picker
                style={{ flex: 1, height: 28 }}
                value={this.state.famlv}
                onChange={this.handleChangeFamLv}
                options={this.state.famOptions} 
              />
            </View>
            : null }
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

function mapStateToProps(state) {
  const { userInfo } = state.app;
  return { userInfo };
}

export default connect(mapStateToProps)(PersonalInfo);