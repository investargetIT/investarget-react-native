import React from 'react'
import { View, Image, Text, TouchableOpacity, Alert } from 'react-native'
import FitImage from 'react-native-fit-image'
import { connect } from 'react-redux'


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
            )
        }
    }

    handleUpload = () => {
        // TODO 打开相册
        Alert.alert('TODO', '打开相册')
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleUpload: this.handleUpload })
    }

    render() {
        const { photoUrl } = this.props
        return (
            <View style={{marginTop: 16}}>
                {
                    photoUrl ? <FitImage source={{ uri: photoUrl }} />
                             : <Text>暂无头像</Text>
                }
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { photoUrl } = state.app.userInfo
    return { photoUrl }
}

export default connect(mapStateToProps)(Avatar)