import React from 'react';
import { Image, Text, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux'
import FitImage from 'react-native-fit-image'
import ImagePicker from 'react-native-image-picker'


const containerStyle = {
    backgroundColor: '#fff',
    height: '100%',
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
    flex: 1,
    fontSize: 13
}


class ModifyBusinessCard extends React.Component {
    
    static navigationOptions = {
        title: '修改名片',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    handleClickImage = () => {
        Alert.alert('TODO', '如何打开相册')
    }

    render() {
        const { name, orgName, titleName, emailAddress, cardUrl } = this.props

        return (
            <View style={containerStyle}>
                <View>
                    <Cell label="姓名" content={name} />
                    <Cell label="公司" content={orgName} />
                    <Cell label="职位" content={titleName} />
                    <Cell label="邮箱" content={emailAddress} />
                </View>
                <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 8 }}>
                    <Text style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>我的名片<Text style={{color: 'red'}}>:(名片请横向放置)</Text></Text>
                    <TouchableOpacity style={{width: '100%'}} activeOpacity={0.8} onPress={this.handleClickImage}>
                        {
                            cardUrl ? <FitImage source={{ uri: cardUrl }} /> 
                                    : <Image source={require('../images/userCenter/emptyCardImage.png')} />
                        }
                    </TouchableOpacity>
                    
                    
                </View>
            </View>
        )
    }
}


class Cell extends React.Component {
    render() {
        const { label, content } = this.props
        return (
            <View style={cellStyle}>
                <Text style={cellLabelStyle}>{label}</Text>
                <Text style={cellContentStyle}>{content}</Text>
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { name, org, title, emailAddress, cardUrl } = state.app.userInfo
    const orgName = org ? org.name : ''
    const titleName = title ? title.titleName : ''
    return { name, orgName, titleName, emailAddress, cardUrl }
}

export default connect(mapStateToProps)(ModifyBusinessCard)