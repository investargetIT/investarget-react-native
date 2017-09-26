import React from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import FitImage from 'react-native-fit-image'
import { connect } from 'react-redux'
import { ImagePicker } from 'expo'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'

import { modifyUserInfo } from '../../actions'
import * as api from '../api'


const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}


class Avatar extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '上传头像',
            headerTintColor: '#fff',
            headerStyle: {
                height: 48,
                backgroundColor: '#10458F',
            },
            headerRight: (
                <TouchableOpacity onPress={() => {params.handleUpload && params.handleUpload()}}>
                    <Image source={require('../images/plus.png')} style={{width: 24,height: 24, marginRight: 8}} />
                </TouchableOpacity>
            ),
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
        }
    }

    handleUpload = () => {
        ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
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
            const { key: photoKey, url: photoUrl } = result.data
            return api.editUser([userId], { photoKey, photoUrl }).then(data => {
                const newUserInfo = { ...userInfo, photoKey, photoUrl }
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

    componentDidMount() {
        this.props.navigation.setParams({ handleUpload: this.handleUpload })
    }

    render() {
        const { photoUrl } = this.props
        return (
            <View style={{marginTop: 16}}>
                <Spinner visible={this.state.loading} />
                {photoUrl ? (
                    <TouchableOpacity onPress={this.handleUpload}>
                        <FitImage source={{ uri: photoUrl }} />
                    </TouchableOpacity>
                ) : <Text>暂无头像</Text>}
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { userInfo } = state.app
    const { photoUrl, id } = userInfo
    return { photoUrl, userId: id, userInfo }
}

export default connect(mapStateToProps)(Avatar)