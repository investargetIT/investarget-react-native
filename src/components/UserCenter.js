import React from 'react'
import { View, ScrollView, Image, ImageBackground, Text, TouchableOpacity } from 'react-native'


const Seperator = function() {
    return <View style={{height:1,backgroundColor:'rgba(211,211,211,0.5)', marginLeft:22}}></View>
}

const SettingItem = function(props) {
    return (
        <TouchableOpacity onPress={props.onPress || function(){}}>
            <View style={{display:'flex',flexDirection:'row',alignItems:'center',backgroundColor:'#fff',height:44,paddingLeft:22,paddingRight:8}}>
                <Image source={props.icon} style={{width:20,height:20,flex:0,marginRight:24,resizeMode:'contain'}} />
                <Text style={{flex:1,fontSize:16,color:'#333'}}>{props.label}</Text>
                <Image source={require('../images/userCenter/ic_chevron_right_black_24px.png')} style={{width:24,height:24,flex:0}} />
            </View>
        </TouchableOpacity>
    )
}




class UserCenter extends React.Component {
    
    static navigationOptions = {
        title: '个人中心',
        tabBarIcon: ({ focused, tintColor }) => {
            const image = focused ? require('../images/tabbar/my_fill.png') : require('../images/tabbar/my.png')
            return <Image source={image} style={{width:24,height:24,resizeMode:'cover'}} />
        },
    }

    render() {
        return (
            <ScrollView style={{flex:1,backgroundColor:'#eef3f4'}}>
                <ImageBackground source={require('../images/userCenter/ht-usercenterheaderbg.png')} blurRadius={8} style={{display:'flex',marginBottom:20}}>
                    <View style={{padding: 40,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Image
                            source={{uri: 'https://o79atf82v.qnssl.com/2017-07-28 09-50.jpg'}}
                            style={{width:90,height:90,borderRadius:45}}
                        />
                        <Text style={{fontSize:18,margin:10,color:'#fff',backgroundColor:'transparent'}}>多维海拓test</Text>
                        <View style={{width:120,display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                            <Text style={{fontSize:15,color:'#fff',backgroundColor:'transparent'}}>马云</Text>
                            <Text style={{fontSize:15,color:'#fff',backgroundColor:'transparent'}}>总裁</Text>
                        </View>
                    </View>
                </ImageBackground>

                <View style={{marginBottom:20,backgroundColor:'#fff'}}>
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-6.png')} label="我的交易师"  onPress={() => {this.props.navigation.navigate('Login')}} />
                    <Seperator />
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-6.png')} label="通知消息" />
                </View>

                <View style={{marginBottom:20,backgroundColor:'#fff'}}>
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-1.png')} label="关注的标签" />
                    <Seperator />
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-6.png')} label="时间轴管理" />
                    <Seperator />
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-3.png')} label="收藏的项目" />
                </View>

                <View style={{marginBottom:20,backgroundColor:'#fff'}}>
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-5.png')} label="修改密码" />
                    <Seperator />
                    <SettingItem icon={require('../images/userCenter/name_card.png')} label="修改名片" />
                    <Seperator />
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-8.png')} label="联系我们" />
                </View>

                <View style={{marginBottom:20,backgroundColor:'#fff'}}>
                    <SettingItem icon={require('../images/userCenter/ht-usercenter-9.png')} label="退出登录" />
                </View>
                
            </ScrollView>
        )
    }
}

export default UserCenter