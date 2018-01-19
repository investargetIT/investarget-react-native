 import React from 'react'
 import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity, Alert,Linking, ActivityIndicator, DeviceEventEmitter} from 'react-native';
 import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view'
 import * as api from '../api'
 import Toast from 'react-native-root-toast'

 class OrganizationBD extends React.Component{
 	static navigationOptions=({navigation}) =>{

 	return {
      title: '机构BD',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff'
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
                    
                    <View tabLabel="未BD"><OrganizationBDList status="1" {...this.props}/></View>
                    <View tabLabel="BD中"><OrganizationBDList status="2" {...this.props}/></View>
                    <View tabLabel="BD成功"><OrganizationBDList status="3" {...this.props}/></View>
                    <View tabLabel="暂不BD"><OrganizationBDList status="4" {...this.props}/></View>
                </ScrollableTabView>
            </View>)
  	}
 }

class OrganizationBDList extends React.Component{
 	constructor(props) {
	    super(props);
	    this.state={
	    	list:[],
	    	total:0,
	    	isLoadingAll:false,
	    	page_index: 1,
	    	page_size: 6,
	    	bd_status:props.status,
	    	loading:false,
	    	isLoadingMore:false
	    }
  	}

  handleClick = (item) =>{
    this.props.navigation.navigate('PersonalDetail', {item, source:'orgBD'})
    
  }

	getData = isLoadingMore =>{
		if (isLoadingMore === undefined) {
        this.setState({ loading: true });
    }
		const {bd_status, page_size} =this.state
		const params={
			bd_status,
			page_index:isLoadingMore?this.state.page_index+1 : 1,
			page_size
		}
		api.getOrgBdList(params).then((result)=>{  			
		this.setState({
			total:result.count,
			list: isLoadingMore?this.state.list.concat(result.data) :result.data,
			isLoadingAll: result.data.length < page_size,
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
	}

  componentWillUnmount(){
    this.subscription.remove()
  }

	renderFooter = () => {
      if (this.state.list.length < this.state.page_size) return null;
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
 		const username = props.username || ''
 		const title = props.usertitle&&props.usertitle.name || '暂无'
 		const mobile = props.usermobile || '暂无'
 		const email = props.email || '暂无'
    const org = props.org&&props.org.orgname || '暂无'
 		const imgSource = props.useinfo&&props.useinfo.photourl ? { uri: props.useinfo.photourl } : require('../images/userCenter/defaultAvatar.png')
	    return (	    
      <TouchableOpacity onPress={props.onSelect}>
        <View style={{flexDirection:'row',backgroundColor:'#fff',padding: 16,paddingTop: 24}}>
            <Image source={imgSource} style={{width:60,height:60,marginRight:16,borderRadius:30}} />
            <View style={{justifyContent:'space-between', flex: 0.5}}>
                <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>{org}</Text>
                <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>
                    {username + ' '}
                    <Text style={{fontSize:13,color:'#999'}} numberOfLines={1}>{title}</Text>
                </Text>
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

 export default OrganizationBD