import React from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, DeviceEventEmitter } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import * as api from '../api'
import { 
    receiveTitles,
    requestContents,
    hideLoading,
} from '../../actions';
import moment from 'moment';

const PAGE_SIZE = 10
const loadingBottomStyle = {
    fontSize:15,
    color:'#999',
    textAlign:'center',
    paddingTop:8,
    paddingBottom:8,
    backgroundColor:'#fff'
}

class AddOrgBD extends React.Component {

    static navigationOptions = ({navigation}) => {
        const { params } = navigation.state
        return {
            title: '新增BD',
            headerTintColor: '#fff',
            headerStyle: {
                backgroundColor: '#10458F',
            },
            headerRight: (<TouchableOpacity style={{marginRight:16}} onPress={() => {params.onPress && params.onPress()}}>
                <Text style={{fontSize:16,color:'#fff'}}>确定</Text>
            </TouchableOpacity>)
        }
    }

    constructor(props) {
        super(props);

        this.org = props.navigation.state.params.org;
        this.proj = props.navigation.state.params.proj;

        this.state = {
            users: [],
            page: 1,
            total: 0,
            loading: false,
            selected: [],
        }
    }


    getUsers = (page) => {
        var param = { page_index: page, page_size: PAGE_SIZE, org: this.org.id, onjob: true }
        return api.getUser(param).then(data => {
            var { count: total, data: list } = data
            list = list.map(item => {
                const { id, username, photourl, org, title } = item 
                return {
                    id,
                    username,
                    photoUrl: photourl,
                    org: org ? org.orgname : '',
                    title: title || '',
                }
            })
            return { total, list }
        })
    }

    loadMore = () => {
        const { users, page, total, loading } = this.state
        if (page * PAGE_SIZE >= total) return // 已全部加载完毕

        let nextPage = page + 1
        this.setState({ loading: true })
        this.getUsers(nextPage).then(({ total, list }) => {
            this.setState({ users: [ ...users, ...list ], loading: false })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }


    handleSelect = (id) => {
        this.setState({ selected: id })
    }

    confirmSelect = () => {
        const body = {
          bduser: this.state.selected,
          expirationtime: moment().add(1, 'weeks').format('YYYY-MM-DDTHH:mm:ss'),
          isimportant: false,
          manager: this.props.userId,
          org: this.org.id,
          proj: this.proj.id,
        } 
        this.props.dispatch(requestContents());
        api.addOrgBD(body)
            .then(() => {
                DeviceEventEmitter.emit('updateOrgBD') 
                this.props.navigation.goBack()
            })
            .catch(error => {
                
                Toast.show(error.message, { position: Toast.positions.CENTER })
        }).finally(() => this.props.dispatch(hideLoading()))
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onPress: this.confirmSelect
        })

        api.getSource('title').then(data => {
            this.props.dispatch(receiveTitles(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })

        this.getUsers(1).then(({total, list}) => {
            this.setState({ total, users: list })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    render() {
        const { users, selected, loading, total } = this.state

        return (
            <View style={{flex:1}}>
                <FlatList
                    data={users}
                    keyExtractor={(item,index)=>item.id}             
                    renderItem={({item}) => (
                        <UserItem {...item}
                            titles={this.props.titles}
                            selected={selected == item.id}
                            onSelect={this.handleSelect.bind(this, item.id)} />
                        )}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    ListFooterComponent={() => {
                        return loading && total >= PAGE_SIZE ? (<Text style={loadingBottomStyle}>加载中...</Text>) : null
                    }}
                    ListEmptyComponent={() => (
                        <View style={{flex:1,alignItems:'center',paddingTop: 60}}>
                            <Image source={require('../images/emptyUser.png')} />
                        </View>
                    )}
                    ItemSeparatorComponent={() => (
                        <View style={{height:1,backgroundColor:'#f4f4f4'}}></View>
                    )}
                />
            </View>
        )
    }
}


function UserItem(props) {
    const { username, photoUrl, org, title, titles } = props
    const imgSource = photoUrl ? { uri: photoUrl } : require('../images/userCenter/defaultAvatar.png')

    return (
        <TouchableOpacity onPress={props.onSelect}>
            <View style={{flexDirection:'row',backgroundColor:'#fff',padding: 16,paddingTop: 24}}>
                <Image source={imgSource} style={{width:50,height:50,marginRight:16,borderRadius:25}} />
                <View style={{justifyContent:'space-between'}}>
                    <Text style={{fontSize:16,color:'#333'}} numberOfLines={1}>{org}</Text>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{width:120,marginRight:20,fontSize:16,color:'#333'}} numberOfLines={1}>{username}</Text>
                        <Text style={{fontSize:13,color:'#999'}} numberOfLines={1}>{titles.length > 0 ? titles.filter(f => f.id === title)[0].name : title}</Text>
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
    const { userInfo, titles } = state.app;
    const { userType, id } = userInfo;
    return { userType, userId: id, titles };
}

export default connect(mapStateToProps)(AddOrgBD)
