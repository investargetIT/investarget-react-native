import React from 'react'
import { View, Text, ImageBackground, Image } from 'react-native'
import Toast from 'react-native-root-toast'

import * as api from '../api'


const rowStyle = {
    paddingLeft: 16,
    paddingRight: 16,
    height: 32,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
}
const textStyle = {
    fontSize: 15,
    color: '#333',
}



class UserInfo extends React.Component {

    static navigationOptions = {
        title: '个人信息',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    constructor(props) {
        super(props)
        this.state = {
            userId: this.props.navigation.state.params.userId,
            user: {},
        }
    }

    getUserDetail = () => {
        api.getUserDetailLang(this.state.userId).then(data => {
            console.log('@@@',data)
            this.setState({ user: data })
        }).catch(error => {
            Toast.show(error.message, Toast.positions.CENTER)
        })
    }

    componentDidMount() {
        this.getUserDetail()
    }

    render() {

        const {  photourl, username, org, title, mobile, email } = this.state.user
        const orgName = org ? org.orgname : ''
        const titleName = title ? title.name : ''

        return (
            <View style={{flex: 1}}>
                <ImageBackground
                    source={require('../images/userInfoBG.png')}
                    style={{width: '100%', height: 200, justifyContent:'space-between', alignItems:'center'}}>
                    <Image source={{ uri: photourl }} style={{width:80,height:80,borderRadius:40,marginTop:40}} />
                    <View style={{width: '100%',height: 60, backgroundColor: 'rgba(0,0,0,.3)'}}>
                        <Text style={{textAlign:'center',marginTop:10,fontSize:18,color:'#fff'}}>{username}</Text>
                    </View>
                </ImageBackground>
                <View style={{backgroundColor: '#fff', flex: 1}}>

                    <Text style={{color:'#999',fontSize:15,marginLeft: 16, marginRight: 16, marginTop: 12, marginBottom: 12}}>个人信息</Text>

                    <View style={rowStyle}>
                    <Text style={textStyle}>公司：{orgName}</Text>
                    </View>
                    <View style={rowStyle}>
                    <Text style={textStyle}>职位：{titleName}</Text>
                    </View>
                    <View style={rowStyle}>
                    <Text style={textStyle}>手机号码：{mobile}</Text>
                    </View>
                    <View style={rowStyle}>
                    <Text style={textStyle}>电子邮箱：{email}</Text>
                    </View>
                </View>
            </View>
        )
    }
}

export default UserInfo