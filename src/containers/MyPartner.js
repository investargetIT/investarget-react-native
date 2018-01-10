import React from 'react'
import { 
  ScrollView, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
} from 'react-native';
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'
import ImagePicker from 'react-native-image-picker'
 
import * as api from '../api'
import PartnerCard from '../components/PartnerCard'

const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}
const cardContainerStyle = {
    flex: 1,
    flexDirection:'row',
    flexWrap:'wrap',
    backgroundColor:'#fff'
}
const cardStyle = {
    width: '33%',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
}

const PAGE_SIZE = 7 
class MyPartner extends React.Component {

    static navigationOptions = ({navigation}) => {
        const { params } = navigation.state
        const org = params.org
        const userType = params.userType
        return {
            title: userType == 1 ? '我的交易师' : org.org,
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerBackTitle: null,
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            partners: [],
            total: 0,
            page: 1,
            loading: false,
            isLoadingAll: false, 
            isLoadingMore: false, 
        }
    }

    handleClickPartner = (id, name) => {
        this.props.navigation.navigate('Chat', { targetUserId: id, targetUserName: name })
    }

    getPartners = (page) => {
        const { userId, userType } = this.props
        var param = { page_size: PAGE_SIZE, page_index: page }
        if (userType == 1) {
            param['investoruser'] = userId
        } else {
            param['traderuser'] = userId
            param['orgs'] = this.org.id
        }
        return api.getUserRelation(param).then(data => {
            var { count: total, data: list } = data
            list = list.map(item => {
                const user = userType == 1 ? item.traderuser : item.investoruser
                const { id, username, org, photourl, title } = user
                return { 
                    id, 
                    username, 
                    org: org ? org.orgname : '', 
                    photoUrl: photourl, 
                    title: title ? title.name : '', 
                }
            })
            return { total, list }
        })
    }

    loadMore = () => {
        const { page, total, partners } = this.state
        if (page * PAGE_SIZE >= total) return // 已全部加载完毕
        
        let nextPage = page + 1
        this.setState({ loading: true, page: nextPage })
        this.getPartners(nextPage).then(({ total, list }) => {
            this.setState({
                loading: false,
                total: total,
                list: [...partners, ...list],
            })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    parseData(data) {
        const name = data.formatted_name ? data.formatted_name[0].item : null
        const email = data.email ? data.email[0].item : null
        let title
        if (data.title) {
          const index = this.props.titles.map(item => item.titleName).indexOf(data.title[0].item)
          if (index > -1) {
            title = this.props.titles[index].id
          }
        }
        let mobile
        if (data.telephone) {
          const mobileArr = data.telephone.filter(f => /1[34578]\d{9}/.exec(f.item.number))
          if (mobileArr.length > 0) {
            mobile = /1[34578]\d{9}/.exec(mobileArr[0].item.number)[0]
          }
        }
        let company = null
        if (data.organization) {
          const companyObj = data.organization[0].item
          company = companyObj.name || companyObj.positional || companyObj.unit
        }
        return { name, email, title, mobile, company }
    }

    componentDidMount() {
        this.org = this.props.navigation.state.params.org;
        this.getData();
    }

    getData = () => {
        this.setState({ loading: true });
        this.getPartners(1).then(({ total, list }) => {
            this.setState({ 
                total, 
                partners: list, 
                isLoadingAll: total === list.length,
                page: 1,
                loading: false,  
            });
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    loadMore = () => {
        if (this.state.isLoadingAll || this.state.isLoadingMore || this.state.partners.length === 0) return;
        this.setState({ isLoadingMore: true });
        this.getPartners(this.state.page + 1)
          .then(({ total, list }) => setTimeout(
            () => this.setState({
              total,
              partners: this.state.partners.concat(list),
              isLoadingAll: list.length < PAGE_SIZE,
              isLoadingMore: false,
              page: this.state.page + 1
            }),
            1000
          ))
          .catch(error => Toast.show(error.message, { position: Toast.positions.CENTER }));
    }

    renderFooter = () => {
        if (this.state.partners.length < PAGE_SIZE) return null;
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

    handlePartnerPressed = partner => this.props.navigation.navigate(
        'Chat',
        { targetUserId: partner.id, targetUserName: partner.username }
    );

    render() {
        return (
            <View style={{flex:1}}>
                <FlatList
                    data={this.state.partners}
                    keyExtractor={(item,index)=>item.id}             
                    renderItem={({ item }) => <UserItem {...item} onSelect={this.handlePartnerPressed.bind(this, item)} />}
                    overScrollMode="always"
                    onEndReachedThreshold={0.01}
                    refreshControl={
                      <RefreshControl 
                        refreshing={this.state.loading} 
                        onRefresh={this.getData} 
                        colors={['#10458f']} 
                        tintColor="#10458f" 
                      />
                    }
                    onEndReached={this.loadMore}
                    ListFooterComponent={this.renderFooter}
                    // ListEmptyComponent={() => (
                    //     <View style={{flex:1,alignItems:'center',paddingTop: 60}}>
                    //         <Image source={require('../images/emptyUser.png')} />
                    //     </View>
                    // )}
                    ItemSeparatorComponent={() => <View style={{height:1,backgroundColor:'#f4f4f4'}} />}
                />
            </View>
        )
    }
}

function UserItem(props) {
    const { username, photoUrl, org, title } = props
    const imgSource = photoUrl ? { uri: photoUrl } : require('../images/userCenter/defaultAvatar.png')

    return (
        <TouchableOpacity onPress={props.onSelect}>
            <View style={{flexDirection:'row',backgroundColor:'#fff',padding: 16,paddingTop: 24}}>
                <Image source={imgSource} style={{width:50,height:50,marginRight:16,borderRadius:25}} />
                <View style={{justifyContent:'space-between'}}>
                    <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>{org}</Text>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{width:120,marginRight:20,fontSize:16,color:'#333'}} numberOfLines={1}>{username}</Text>
                        <Text style={{fontSize:13,color:'#999'}} numberOfLines={1}>{title}</Text>
                    </View>
                </View>
            </View>
            {props.selected ? (
                <View style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,.3)',zIndex:1}}></View>
            ):null}
        </TouchableOpacity>
    )
}

function mapStateToProps(state) {
    const { userType, id } = state.app.userInfo
    const { titles } = state.app
    return { userType, userId: id, titles }
}

export default connect(mapStateToProps)(MyPartner)