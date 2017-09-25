import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native'



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

    setActiveTab = (tab) => {
        this.setState({ activeTab: tab })
    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.handleDelete })
    }

    render() {
        const { activeTab } = this.state

        return (
            <View style={{flex:1}}>
                <View style={{width:'100%',height: 48}}>
                    <ScrollView
                        contentContainerStyle={{flexDirection:'row',alignItems:'center',backgroundColor:'#fff'}}
                        horizontal={true}
                    >
                        <TouchableOpacity style={tabStyle} onPress={this.setActiveTab.bind(this, 'chat')}>
                            <Text style={activeTab == 'chat' ? activeTabTextStyle : tabTextStyle}>聊天</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={tabStyle} onPress={this.setActiveTab.bind(this, 'interest')}>
                            <Text style={activeTab == 'interest' ? activeTabTextStyle : tabTextStyle}>Ta感兴趣</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={tabStyle} onPress={this.setActiveTab.bind(this, 'favorite')}>
                            <Text style={activeTab == 'favorite' ? activeTabTextStyle : tabTextStyle}>Ta的收藏</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={tabStyle} onPress={this.setActiveTab.bind(this, 'recommend')}>
                            <Text style={activeTab == 'recommend' ? activeTabTextStyle : tabTextStyle}>推荐Ta的</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={tabStyle} onPress={this.setActiveTab.bind(this, 'system')}>
                            <Text style={activeTab == 'system' ? activeTabTextStyle : tabTextStyle}>系统推荐</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                <View style={{flex:1}}>
                    <Text>TODO:// 内容区具体怎么实现呢？</Text>
                </View>
            </View>
        )
    }
}

export default Chat