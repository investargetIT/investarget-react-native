import React from 'react'
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import * as api from '../api'

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
        const { favoritetype, projects } = this.props.navigation.state.params
        const { selected } = this.state
        const { userId } = this.props
        var param
        var successMessage
        if (favoritetype == 3) {
            param = { user: selected, projs: projects, favoritetype, trader: userId }
            successMessage = '推荐成功'
        } else if (favoritetype == 5) {
            param = { user: userId, projs: projects, favoritetype, trader: selected }
            successMessage = '感兴趣成功'
        }
        api.projFavorite(param).then(() => {
            Toast.show(successMessage, {position: Toast.positions.CENTER})
        }).catch(error => {
            console.log('###', error)
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onPress: this.confirmSelect
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
    return { userType, userId: id }
}

export default connect(mapStateToProps)(AddOrgBD)
