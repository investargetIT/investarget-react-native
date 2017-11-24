import React from 'react'
import { View, Image, Text, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native'
import Toast from 'react-native-root-toast'

import * as api from '../api'


const containerStyle = {flex:1,backgroundColor:'#fff',justifyContent:'flex-start'}
const tabContainerStyle = {paddingTop: 8,paddingBottom: 8,borderBottomColor:'#f4f4f4',borderBottomWidth:1,flexDirection:'row',justifyContent:'center'}
const tabWrapStyle = {backgroundColor:'#10458f',borderColor:'#10458f',borderWidth:1,width:160,height:32,borderRadius:16,flexDirection:'row'}
const tabStyle = {flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'transparent',borderRadius:16}
const tabTextStyle = {color:'#fff',textAlign:'center'}
const activeTabStyle = {flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',borderRadius:16}
const activeTabTextStyle = {color:'#10458f',textAlign:'center'}


class Notification extends React.Component {

    static navigationOptions = {
        title: '通知',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    }

    constructor(props) {
        super(props)
        this.state = {
            isRead: true,
        }
    }

    toggleRead = () => {
        this.setState({ isRead: !this.state.isRead })
    }

    handlePress = data => {
        if (!data.isRead) {
            api.readMsg(data.id);
        }
        // TODO: 跳转到消息详情
        Alert.alert(data.messagetitle, data.content);
    }

    render() {
        const { isRead, refreshing, readList, unreadList } = this.state
        return (
            <View style={containerStyle}>
                <View style={tabContainerStyle}>
                    <View style={tabWrapStyle}>
                        <TouchableOpacity style={isRead ? activeTabStyle : tabStyle} onPress={this.toggleRead}>
                            <Text style={isRead ? activeTabTextStyle : tabTextStyle}>已读</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={isRead ? tabStyle : activeTabStyle} onPress={this.toggleRead}>
                            <Text style={isRead ? tabTextStyle : activeTabTextStyle}>未读</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                { this.state.isRead ? <MessageList style={{flex:1}} isRead={true} onPress={this.handlePress} /> : null }
                { !this.state.isRead ? <MessageList style={{flex:1}} isRead={false} onPress={this.handlePress} /> : null }
                
            </View>
        )
    }
}


const PAGE_SIZE = 10

class MessageList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            list: [],
            loading: false,
            total: 0,
            page: 1,
        }
    }

    getData = (page) => {
        const param = { page_size: PAGE_SIZE, page_index: page, isRead: this.props.isRead }
        return api.getMsg(param).then(data => {
            const { count: total, data: list } = data
            return { total, list }
        })
    }

    onRefresh = () => {
        this.setState({ refreshing: true })
        this.getData().then(({ total, list }) => {
            this.setState({ refreshing: false, list, total, page: 1 })
        }).catch(error => {
            this.setState({ refreshing: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    loadMore = () => {
        const { page, total } = this.state
        if (page * PAGE_SIZE >= total) return // 已全部加载完毕
        
        let nextPage = page + 1
        this.setState({ loading: true, page: nextPage })
        this.getData(nextPage).then(({ total, list }) => {
            this.setState({
                loading: false,
                total: total,
                list: [...this.state.list, ...list],
            })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        this.getData(1).then(({ total, list }) => {
            this.setState({ total, list })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    render() {
        return (
            <View style={this.props.style}>
                <FlatList
                    data={this.state.list}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({item}) => <Message {...item} onPress={this.props.onPress} />}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} colors={['#10458f']} tintColor="#10458f" />}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    ListFooterComponent={() => {
                        return this.state.loading && this.state.total >= PAGE_SIZE ? (<Text style={loadingBottomStyle}>加载中...</Text>) : null
                    }}
                    ListEmptyComponent={() => (
                        <View style={{flex:1,alignItems:'center',paddingTop: 80}}>
                            <Text style={{textAlign:'center',color:'#999',fontSize:13}}>
                                { this.props.isRead ? '暂无已读消息' : '暂无未读消息' }
                            </Text>
                        </View>
                    )}
                />
            </View>
        )
    }
}





const msgContainerStyle = {flexDirection:'row',paddingTop:16,paddingBottom:16,paddingLeft:12,paddingRight:12,borderBottomColor:'#f4f4f4',borderBottomWidth:1}
const msgImageStyle = {marginRight: 12, width:24,height:24}
const msgStyle = {flex:1}
const msgTitleWrapStyle = {flexDirection:'row',justifyContent:'space-between',marginBottom:8}
const msgTitleStyle = {fontSize:15,color:'#666',flex:0.5}
const msgTimeStyle = {fontSize:13,color:'#999',flex:0.5,textAlign:'right'}
const msgContentStyle = {fontSize:13,color:'#999'}


class Message extends React.Component {
    
    render() {
        var { id, isRead, messagetitle, created, content } = this.props
        created = created.slice(0, 19).replace('T', ' ')

        return (
            <TouchableOpacity activeOpacity={0.8} style={msgContainerStyle} onPress={this.props.onPress.bind(this, this.props)}>
                <Image source={require('../images/ht-notify.png')} style={msgImageStyle} />
                <View style={msgStyle}>
                    <View style={msgTitleWrapStyle}>
                        <Text style={msgTitleStyle} numberOfLines={1}>{messagetitle}</Text>
                        <Text style={msgTimeStyle}>{created}</Text>
                    </View>
                    <Text style={msgContentStyle} numberOfLines={2}>{content}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

export default Notification