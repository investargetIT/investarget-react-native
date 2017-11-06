import React from 'react'
import { View, Image, Text, TouchableOpacity, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import ImagePicker from 'react-native-image-picker'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'

import { modifyUserInfo } from '../../actions'
import * as api from '../api'


const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}

const {height, width} = Dimensions.get('window')
const SCREEN_WIDTH = width


class Avatar extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '上传头像',
            headerTintColor: '#fff',
            headerStyle: {
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
        const options = {
            title: '选择头像',
            cancelButtonTitle: '取消',
            mediaType: 'photo',
            allowsEditing: true,
            maxWidth: 200,
            maxHeight: 200,
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '从相册中选择',
        }
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                // Toast.show('已取消', {position: Toast.positions.CENTER})
            } else if (response.error) {
                Toast.show(response.error, {position: Toast.positions.CENTER})
            } else {
                let file = { uri: response.uri, type: 'application/octet-stream', name: 'avatar.jpg'}
                api.qiniuUpload('image', file).then((result) => {
                    const { userId, userInfo } = this.props
                    const { key: photoKey, url: photoUrl } = result.data
                    return api.editUser([userId], { photoKey, photoUrl }).then(data => {
                        const newUserInfo = { ...userInfo, photoKey, photoUrl }
                        this.props.dispatch(modifyUserInfo(newUserInfo))
                        this.setState({ loading: false })
                    })
                }).catch(error => {
                    this.setState({ loading: false })
                    Toast.show(error.message, {position: Toast.positions.CENTER})
                })
            }
        })
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleUpload: this.handleUpload })
    }

    render() {
        const { photoUrl } = this.props
        return (
            <View style={{flex: 1,marginTop: 16}}>
                <Spinner visible={this.state.loading} />
                {photoUrl ? (
                    <TouchableOpacity style={{width:SCREEN_WIDTH,backgroundColor:'#fff'}} onPress={this.handleUpload}>
                        <Image style={{width:SCREEN_WIDTH,height:SCREEN_WIDTH}} resizeMode="contain" source={{ uri: photoUrl }} />
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