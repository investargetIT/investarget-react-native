import React from 'react';
import { Image, Text, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux'
import FitImage from 'react-native-fit-image'
import { ImagePicker } from 'expo'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'

import { modifyUserInfo } from '../../actions'
import * as api from '../api'


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

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
        }
    }

    handleClickImage = () => {
        ImagePicker.launchImageLibraryAsync({
        }).then(result => {
            if (!result.cancelled) {
                return result.uri
            } else {
                throw new Error('已取消')
            }
        })
        .then((uri) => {
            this.setState({ loading: true })
            let file = { uri, type: 'application/octet-stream', name: 'avatar.jpg' }
            return api.qiniuUpload('image', file)
        })
        .then(result => {
            console.log('@@@@', result)
            const { userId, userInfo } = this.props
            const { key: cardKey, url: cardUrl } = result.data
            return api.editUser([userId], { cardKey, cardUrl }).then(data => {
                const newUserInfo = { ...userInfo, cardKey, cardUrl }
                this.props.dispatch(modifyUserInfo(newUserInfo))
                this.setState({ loading: false })
            }).catch(error => {
                throw error
            })
        })
        .catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    render() {
        const { name, orgName, titleName, emailAddress, cardUrl } = this.props

        return (
            <View style={containerStyle}>
                <Spinner visible={this.state.loading} />
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
    const { userInfo } = state.app
    const { name, org, title, emailAddress, cardUrl, id } = userInfo
    const orgName = org ? org.name : ''
    const titleName = title ? title.titleName : ''
    return { name, orgName, titleName, emailAddress, cardUrl, userId: id, userInfo }
}

export default connect(mapStateToProps)(ModifyBusinessCard)