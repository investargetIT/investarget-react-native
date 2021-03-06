import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view'
import { connect } from 'react-redux'
import MessageScreen from '../easemob/Containers/MessageScreen';
import * as api from '../api';
import FavoriteProjectList from '../components/FavoriteProjectList'
import PersonalInfo from '../components/PersonalInfo'
const headerRightStyle = {
    marginRight: 16,
}

const tabStyle = {
    paddingLeft: 10,
    paddingRight: 10,
}

const containerStyle = {
    backgroundColor: '#fff',
    flex:1
}

class Chat extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        const { rightIcon, onPress } = params;
        
        return {
            title: params.targetUserName || '聊天',
            headerTintColor: '#fff',
            headerStyle: {
                backgroundColor: '#10458F',
            },
            headerRight: rightIcon && onPress ? (
                    <TouchableOpacity style={headerRightStyle} onPress={onPress}>
                        <Image source={rightIcon} style={{width:24,height:24}} />
                    </TouchableOpacity>
                ) :  null,
            headerBackTitle: null,
        }
    }

    constructor(props) {
        super(props)
        const { targetUserId } = props.navigation.state.params
        this.state = {
            targetUserId: targetUserId,
            isFriend: null,
        }
    }

    handleDelete = () => {
        // todo 删除聊天记录
    }

    handleRecommend = () => {
        this.props.navigation.navigate('MyFavoriteProject', { investorId: this.state.targetUserId })
    }

    handleChangeTab = tabLabel => {
        if (tabLabel === '推荐Ta的') {
            this.props.navigation.setParams({
                rightIcon: require('../images/plus.png'),
                onPress: this.handleRecommend,
            });
        } else if (tabLabel === '聊天') {
            this.props.navigation.setParams({
                rightIcon: require('../images/delete.png'),
                onPress: this.handleDelete,
            });
        } else {
            this.props.navigation.setParams({
                rightIcon: null,
                onPress: null,
            });
        }
    }

    componentDidMount() {
        api.checkUserFriend(this.state.targetUserId)
        .then(result => {
            this.setState({ isFriend: result });
            this.handleChangeTab(result ? '聊天' : null);
        })
        .catch(err => console.error(err));
    }

    render() {
        const { userType, userId, navigation } = this.props
        const { targetUserId } = this.props.navigation.state.params
        const isInvestor = userType == 1
        return (
            <View style={{flex:1}}>
                { this.state.isFriend !== null ? 
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar style={{borderBottomColor: '#f4f4f4'}} tabStyle={{paddingBottom: 0}} />}
                    tabBarUnderlineStyle={{height:0}}
                    tabBarTextStyle={{fontSize:14}}
                    tabBarBackgroundColor="#fff"
                    tabBarActiveTextColor="#10458f"
                    tabBarInactiveTextColor="#666"
                    onChangeTab={({ ref }) => { this.handleChangeTab(ref.props.tabLabel) }}
                >
                    { this.state.isFriend ? 
                      <View tabLabel="聊天" style={{flex:1,backgroundColor:'#fff'}}>
                        <MessageScreen id={targetUserId} chatType="chat" />
                      </View>
                    : null }
                    <PersonalInfo tabLabel="个人信息" userId={targetUserId} style={containerStyle}/>
                    <FavoriteProjectList tabLabel={isInvestor ? "感兴趣" : "Ta感兴趣"} navigation={navigation} favoritetype={5} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel={isInvestor ? "我的收藏" : "Ta的收藏"} navigation={navigation} favoritetype={4} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel={isInvestor ? "交易师推荐" : "推荐Ta的"} navigation={navigation} favoritetype={3} userType={userType} userId={userId} targetUserId={targetUserId} />
                    <FavoriteProjectList tabLabel="系统推荐" navigation={navigation} favoritetype={1} userType={userType} userId={userId} targetUserId={targetUserId} />
                </ScrollableTabView>
                : null }
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { id, userType } = state.app.userInfo
    return { userId: id, userType }
}

export default connect(mapStateToProps)(Chat)