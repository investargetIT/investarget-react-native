import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view'
import { connect } from 'react-redux'

import FavoriteProjectList from '../components/FavoriteProjectList'

const headerRightStyle = {
    marginRight: 16,
}
const tabContainerStyle = {
    height:48,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    paddingLeft: 8,
    paddingRight: 8,
}
const tabStyle = {
    paddingLeft: 10,
    paddingRight: 10,
}
const tabTextStyle = {
    fontSize:16,
    color:'#666',
}
const activeTabTextStyle = {
    ...tabTextStyle,
    color: '#10458f',
}


class Chat extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: params.targetUserName || '聊天',
            headerTintColor: '#fff',
            headerStyle: {
                height: 48,
                backgroundColor: '#10458F',
            },
            headerRight: (<TouchableOpacity style={headerRightStyle} onPress={() => { params.onPress && params.onPress() }}>
                            <Image source={require('../images/delete.png')} style={{width:24,height:24}} />
                        </TouchableOpacity>)
        }
    }

    constructor(props) {
        super(props)
        const { targetUserId } = props.navigation.state.params
        this.state = {
            targetUserId: targetUserId,
            activeTab: 'chat'
        }
    }

    handleDelete = () => {
        //
    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.handleDelete })
    }

    render() {
        const { userType, userId, navigation } = this.props
        const { targetUserId } = this.props.navigation.state.params
        const isInvestor = userType == 1

        return (
            <View style={{flex:1}}>
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar style={{borderBottomColor: '#f4f4f4'}} tabStyle={{paddingBottom: 0}} />}
                    tabBarUnderlineStyle={{height:0}}
                    tabBarTextStyle={{fontSize:14}}
                    tabBarBackgroundColor="#fff"
                    tabBarActiveTextColor="#10458f"
                    tabBarInactiveTextColor="#666"
                >
                    <View tabLabel="聊天" style={{flex:1,backgroundColor:'#fff'}}></View>
                    <FavoriteProjectList tabLabel={isInvestor ? "感兴趣" : "Ta感兴趣"} navigation={navigation} favoritetype={5} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel={isInvestor ? "我的收藏" : "Ta的收藏"} navigation={navigation} favoritetype={4} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel={isInvestor ? "交易师推荐" : "推荐Ta的"} navigation={navigation} favoritetype={3} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel="系统推荐" navigation={navigation} favoritetype={1} userType={userType} userId={userId} targetUserId={targetUserId} />
                </ScrollableTabView>
            </View>
        )
    }
}





function mapStateToProps(state) {
    const { id, userType } = state.app.userInfo
    return { userId: id, userType }
}

export default connect(mapStateToProps)(Chat)