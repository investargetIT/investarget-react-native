 import React from 'react'
 import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity, Alert,Linking, ActivityIndicator, DeviceEventEmitter} from 'react-native';
 import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view'
 import * as api from '../api'
 import Toast from 'react-native-root-toast'
 import { connect } from 'react-redux';
 import { receiveBdStatus } from '../../actions';

 class ProjectBD extends React.Component{

   static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
     return {
       title: '项目BD',
       headerStyle: {
         backgroundColor: '#10458f',
       },
       headerTintColor: '#fff',
       headerBackTitle: null,
       headerRight: (
         <TouchableOpacity style={{ marginRight:16 }} onPress={params && params.onPress}>
           <View style={{ position: 'relative' }}>
             <Text style={{ color: 'white', fontSize: 16 }}>筛选</Text>
             {params && params.hasFilters && <View style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' }} />}
           </View>
         </TouchableOpacity>
       ),
     };
   }

   constructor(props) {
     super(props);

     this.state = {
       filters: null,
       rawFilters: null,
     };

     this.props.navigation.setParams({ onPress: this.handleFilterBtnPressed });
   }

   componentDidMount() {
     api.getSource('bdStatus').then(result => {
       this.props.dispatch(receiveBdStatus(result))
     });
   }

   handleFilterBtnPressed = () => {
     this.props.navigation.navigate('ProjectBDFilter', {
       onConfirmFilters: this.handleFilter,
       filters: this.state.rawFilters,
     });
   }

   handleFilter = rawFilters => {
    const { industryGroups, managers, search  } = rawFilters;
    const filters = {
      indGroup: industryGroups.map(m => m.value),
      manager: managers.map(m => m.id),
      search,
    };
    this.setState({ filters, rawFilters });

    // 设置筛选按钮右上角的小红点
    let hasFilters = false;
    if (industryGroups.length > 0 || managers.length > 0 || search.length > 0) {
      hasFilters = true;
    }
    this.props.navigation.setParams({ hasFilters });
   }

   render() {
     return (
       <View style={{ flex: 1 }}>
         <ScrollableTabView
           renderTabBar={() => <ScrollableTabBar style={{ borderBottomColor: '#f4f4f4' }} tabStyle={{ paddingBottom: 0 }} />}
           tabBarUnderlineStyle={{ height: 0 }}
           tabBarTextStyle={{ fontSize: 14 }}
           tabBarBackgroundColor="#fff"
           tabBarActiveTextColor="#10458f"
           tabBarInactiveTextColor="#666"
         >
           {this.props.bdStatus.map(m => (
             <View key={m.id} style={{ flex: 1 }} tabLabel={m.name}>
               <ProjectBDList status={m.id} filters={this.state.filters} {...this.props} />
             </View>
           ))}
         </ScrollableTabView>
       </View>
     );
   }
 }

 class ProjectBDList extends React.Component{
 	constructor(props) {
	    super(props);
	    this.state={
	    	list:[],
	    	total:0,
	    	isLoadingAll:false,
	    	page_index: 1,
	    	page_size: 7,
	    	bd_status:props.status,
	    	loading:false,
	    	isLoadingMore:false
	    }
  	}

  	handleClick = (item) =>{
  		this.props.navigation.navigate('PersonalDetail', {item, source:'projectBD'})
  		
  	}

  	getData = (isLoadingMore, filters) =>{
  		if (isLoadingMore === undefined) {
	        this.setState({ loading: true });
	    }
      const {bd_status, page_size} =this.state
      const additionalFilters = filters || this.props.filters;
  		const params={
  			bd_status,
  			page_index:isLoadingMore?this.state.page_index+1 : 1,
        page_size,
        ...additionalFilters,
      }
      if (!this.props.userInfo.permissions.includes('BD.manageProjectBD')) {
        params.manager = this.props.userInfo.id;
      }
  		api.getProjBDList(params).then((result)=>{			
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
  		this.subscription = DeviceEventEmitter.addListener('updateProjBD', this.getData)
  	}

    componentWillReceiveProps(nextProps) {
      if (JSON.stringify(nextProps.filters) !== JSON.stringify(this.props.filters)) {
        this.getData(undefined, nextProps.filters);
      }
    }

  	componentWillUnmount(){
  		this.subscription.remove()
  	}

  	renderFooter = () => {
        if (this.state.list.length < this.state.page_size) return null;
        if (this.state.isLoadingAll) return (
          <Text style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'gray' }}>---没有更多了---</Text>
        );
    
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
  		return(<FlatList
                    data={this.state.list}
                    keyExtractor={(item,index)=>item.id}             
                    renderItem={({ item }) => <ProjectItem {...item} onSelect={this.handleClick.bind(this, item)} />}
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

 class ProjectItem extends React.Component {
 	constructor(props){
 		super(props)
 		this.state={
 			id: props.bduser,
 			currentBD:this.props
 		}
 	}

 	render(){
 		const {id, currentBD} = this.state
 		const username = currentBD.username || ''
    const proj = currentBD.com_name|| '暂无'
    const useremail = currentBD.useremail || '暂无'
 		const title = currentBD.usertitle&&currentBD.usertitle.name || '暂无'
 		const mobile = currentBD.usermobile ? (currentBD.usermobile.indexOf('-') > -1 ? '+' + currentBD.usermobile : currentBD.usermobile) : '暂无';
 		const imgSource = require('../images/userCenter/defaultAvatar.png')
	    return (
	    <TouchableOpacity onPress={this.props.onSelect}>
	        <View style={{flexDirection:'row',backgroundColor:'#fff',padding: 16,paddingTop: 24}}>
                <Image source={imgSource} style={{width:60,height:60,marginRight:16,borderRadius:30}} />
                <View style={{justifyContent:'space-between', flex: 0.5}}>
                    <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>{proj}</Text>
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
                  <TouchableOpacity onPress={() => Linking.openURL(`mailto:${useremail}`)}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image source={require('../images/ic_email.png')} />
                      <Text style={{ marginLeft: 10, width: '80%', color: '#999' }} numberOfLines={2}>{useremail}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            </View>
       	</TouchableOpacity>
	    )
}
}

function mapStateToProps (state) {
  let { userInfo, bdStatus } = state.app;
  return { userInfo, bdStatus };
}

 export default connect(mapStateToProps)(ProjectBD);