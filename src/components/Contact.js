import React from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'


const containerStyle = {
    backgroundColor: '#fff'
}
const cellStyle = {
    flexDirection:'row',
    alignItems:'center',
    marginLeft: 16,
    height: 40,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1
}
const cellLabelStyle = {
    width: 80,
    flex: 0,
    fontSize: 13,
    color: '#333'
}
const cellContentStyle = {
    fontSize: 13
}


class Contact extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '联系我们',
            headerTintColor: '#fff',
            headerStyle: {
                backgroundColor: '#10458F',
            },
        }
    }

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={containerStyle}>
                <Cell label="客服电话：" content="021-31776196" onPress={()=>{ Linking.openURL('tel:01231776196')}} />
                <Cell label="客服邮箱：" content="customer@investarget.com" onPress={()=>{ Linking.openURL('mailto:customer@investarget.com') }} />
                <Cell label="联系地址：" content="中国上海市徐汇区虹桥路777号17楼7单元" />
            </View>
        )
    }
}

class Cell extends React.Component {

    render() {
        const { label, content, onPress } = this.props
        return (
            <View style={cellStyle}>
                <Text style={cellLabelStyle}>{label}</Text>
                <TouchableOpacity onPress={onPress} style={{flex: 1,justifyContent: 'center'}}>
                    <Text style={cellContentStyle}>{content}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

export default Contact
