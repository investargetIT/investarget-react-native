 import React from 'react'
 import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity, Alert,Linking, ActivityIndicator, DeviceEventEmitter} from 'react-native';
 import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view'
 import * as api from '../api'
 import { connect } from 'react-redux';
 import Toast from 'react-native-root-toast'
import { receiveOrgBDRes } from '../../actions';

 class OrganizationBD extends React.Component{
 	static navigationOptions=({navigation}) =>{

 	return {
      title: '机构BD',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null
    }
 	}

 	constructor(props) {
	    super(props);
  	}

  	render(){
  		return (<View style={{flex:1}}> 
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar style={{borderBottomColor: '#f4f4f4'}} tabStyle={{paddingBottom: 0}} />}
                    tabBarUnderlineStyle={{height:0}}
                    tabBarTextStyle={{fontSize:14}}
                    tabBarBackgroundColor="#fff"
                    tabBarActiveTextColor="#10458f"
                    tabBarInactiveTextColor="#666"                
                >
                    
                    <View style={{ flex: 1 }} tabLabel="未BD"><OrganizationBDList status="1" {...this.props}/></View>
                    <View style={{ flex: 1 }} tabLabel="BD中"><OrganizationBDList status="2" {...this.props}/></View>
                    <View style={{ flex: 1 }} tabLabel="BD成功"><OrganizationBDList status="3" {...this.props}/></View>
                    <View style={{ flex: 1 }} tabLabel="暂不BD"><OrganizationBDList status="4" {...this.props}/></View>
                </ScrollableTabView>
            </View>)
  	}
 }

class OrganizationBDList extends React.Component{

  static navigationOptions = ({navigation}) => {
    const { params } = navigation.state;
    return {
       title: params && params.title,
       headerStyle: {
         backgroundColor: '#10458f',
       },
       headerTintColor: '#fff',
       headerBackTitle: null,
      headerRight: <TouchableOpacity style={{ marginRight: 8 }} onPress={params.handleIconPressed}>
        <Text style={{ color: 'white' }}>新增BD</Text>
      </TouchableOpacity>
     }
    }

 	constructor(props) {
      super(props);
      
      const { params } = props.navigation.state;
      this.org = params.org;
      this.proj = params.proj;

	    this.state={
	    	list:[],
	    	total:0,
	    	isLoadingAll:false,
	    	page_index: 0,
	    	page_size: 6,
	    	bd_status:props.status,
	    	loading:false,
	    	isLoadingMore:false
	    }
  	}

  componentWillMount () {
    this.props.navigation.setParams({ 
      title: this.org.orgname, 
      handleIconPressed: () => this.props.navigation.navigate('AddOrgBD', { org: this.org, proj: this.proj }),
    });
  }

  handleClick = (item) =>{
    this.props.navigation.navigate('OrgBDDetail', {item, source:'orgBD'})
  }

	getData = isLoadingMore =>{
		if (isLoadingMore === undefined) {
        this.setState({ loading: true });
    }
		const {bd_status, page_size} =this.state
		const params={
      page_index:isLoadingMore?this.state.page_index+1 : 1,
      org: this.org.id,
      manager: [this.props.userInfo.id],
      proj: this.proj.id,
      sort: 'response__sort',
    }
		api.getOrgBdList(params).then((result)=>{ 
		this.setState({
			total:result.count,
			list: isLoadingMore?this.state.list.concat(result.data) :result.data,
			isLoadingAll: result.data.length < 10,
			isLoadingMore:false,
			page_index:isLoadingMore ? this.state.page_index + 1 : 1,
			loading:false
		})
		}).catch(err => console.error(err));
	}

	loadMore = () =>{
		if (this.state.isLoadingAll || this.state.isLoadingMore || this.state.list.length === 0) return;
    this.setState({ isLoadingMore: true });
    this.getData(true);
	}



	componentDidMount(){
		this.getData()
    this.subscription = DeviceEventEmitter.addListener('updateOrgBD',this.getData)
    api.getSource('orgbdres').then(data => {
      this.props.dispatch(receiveOrgBDRes(data))
    })
	}

  componentWillUnmount(){
    this.subscription.remove()
  }

	renderFooter = () => {
      if (this.state.list.length < 10) return null;
      if (this.state.isLoadingAll) {
        return (
        <Text style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'gray' }}>---没有更多了---</Text>
      );}
  
      return (
        <View
          style={{
            paddingVertical: 20,
            borderTopWidth: 1,
            borderColor: "#CED0CE"
          }}>
          <ActivityIndicator animating size="small" />
        </View>
      );
    };


	render(){
		return(
    <FlatList
      data={this.state.list}
      keyExtractor={(item,index)=>item.id}             
      renderItem={({ item }) => <OrganizationItem {...item} onSelect={this.handleClick.bind(this, item)}/>}
      overScrollMode="always"
      onEndReachedThreshold={0.01}
      onEndReached={this.loadMore}
      refreshControl={
        <RefreshControl 
          refreshing={this.state.loading} 
          onRefresh={this.getData} 
          colors={['#10458f']} 
          tintColor="#10458f" 
        />
      }               
      ListFooterComponent={this.renderFooter}
      ItemSeparatorComponent={() => <View style={{height:1,backgroundColor:'#f4f4f4'}} />}
    />)
	}
}

  function OrganizationItem (props) {
 		const username = props.username || '暂无联系人' 
 		const title = props.usertitle&&props.usertitle.name
 		const mobile = props.userinfo && props.userinfo.mobile || '暂无'
 		const email = props.userinfo && props.userinfo.email || '暂无'
    const response = props.response && props.orgbdres.filter(f => f.id === props.response)[0].name;
 		const imgSource = props.userinfo&&props.userinfo.photourl ? { uri: props.userinfo.photourl } : require('../images/userCenter/defaultAvatar.png')
	    return (	    
      <TouchableOpacity onPress={props.onSelect}>
        <View style={{flexDirection:'row',backgroundColor:'#fff',padding: 16,paddingTop: 24}}>
            <Image source={imgSource} style={{width:60,height:60,marginRight:16,borderRadius:30}} />
            <View style={{justifyContent: response ? 'space-between' : 'center', flex: 0.5}}>
                { !props.isRead ? <Text style={{fontSize:13,color:'red'}} numberOfLines={1}>New</Text> : null }
                <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>
                    {username + ' '}
                    { title ? 
                    <Text style={{fontSize:13,color:'#999'}} numberOfLines={1}>{title}</Text>
                    : null }
                </Text>
                <Text style={{fontSize:13,color:'#666'}} numberOfLines={1}>{response}</Text>
            </View>
            <View style={{ marginLeft: 4, flex: 0.5, justifyContent: 'space-between'}}>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${mobile}`)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image source={require('../images/ic_phone.png')} />
                  <Text style={{ marginLeft: 10, width: '80%', color: '#999' }}>{mobile}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image source={require('../images/ic_email.png')} />
                  <Text style={{ marginLeft: 10, width: '80%', color: '#999' }} numberOfLines={2}>{email}</Text>
                </View>
              </TouchableOpacity>
            </View>
        </View>
      </TouchableOpacity>
	    )
  }

OrganizationItem = connect(state => ({ orgbdres: state.app.orgbdres }))(OrganizationItem);

function mapStateToProps (state) {
  const { userInfo } = state.app;
  return { userInfo };
}
export default connect(mapStateToProps)(OrganizationBDList);