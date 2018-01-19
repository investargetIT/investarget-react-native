import React from 'react'
import { 
    View, 
    Text,
    ScrollView, 
    TouchableOpacity, 
} from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'
import Button from '../components/Button'
import Select from '../components/BaseSelect'
import * as api from '../api'
import { receiveTags, modifyUserInfo } from '../../actions'
import { isIPhoneX } from '../utils';

const buttonContainerStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 28,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 12,
    margin: 5,

}
const activeButtonContainerStyle = {
    ...buttonContainerStyle,
    borderColor: '#2269d4',
}
const buttonStyle = {
    color: '#999',
    fontSize: 13,   
    flex: 0, 
}
const activeButtonStyle = {
    ...buttonStyle,
    color: '#2269d4',
}
class MyTags extends React.Component {

    static navigationOptions = {
        title: '关注标签',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    }

    constructor(props) {
        super(props)

        const tags = props.userInfo.userTags.map(item => item.id)
        this.state = {
            loading: false,
            tags: tags || [],
        }
    }

    handleConfirm = (value) => {
        this.setState({ loading: true, tags: value })

        const userId = this.props.userInfo.id
        api.editUser([userId], { tags: value })
        .then(data => {
            this.setState({ loading: false })

            const userTags = this.props.tagOptions.filter(item => value.includes(item.value))
                                .map(item => ({ id: item.value, tagName: item.label })) // format in userInfo.userTags

            const newUserInfo = { ...this.props.userInfo, userTags }
            this.props.dispatch(modifyUserInfo(newUserInfo))

            Toast.show('关注的标签已更新', { position: Toast.positions.CENTER })
            this.props.navigation.goBack()
        })
        .catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    componentWillReceiveProps(nextProps) {
        const tags = nextProps.userInfo.userTags.map(item => item.id)
        this.setState({ tags })
    }

    componentDidMount() {
        api.getSource('tag').then(data => {
            this.props.dispatch(receiveTags(data))
        }).catch(error => {
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
    }

    handleChange = (itemValue) => {
        if (this.state.tags.includes(itemValue)) {
            let index = this.state.tags.indexOf(itemValue)
            this.setState({ tags: [...this.state.tags.slice(0, index), ...this.state.tags.slice(index + 1)] })
        } else {
            this.setState({ tags: [...this.state.tags, itemValue] })
        }
    }

    handleReset = () => {
        this.setState({ tags: [] })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Spinner visible={this.state.loading} />

                <Text style={{fontSize: 16,padding: 16}}>请选择您关注的标签</Text>
                <ScrollView style={{ marginBottom: isIPhoneX() ? 50 + 34 : 50 }}>
                    <View style={{padding: 10,display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                        {
                            this.props.tagOptions.map(option => {
                                const active = this.state.tags.includes(option.value)
                                return (
                                    <Button
                                        key={option.value}
                                        containerStyle={active ? activeButtonContainerStyle : buttonContainerStyle}
                                        style={active ? activeButtonStyle : buttonStyle}
                                        onPress={this.handleChange.bind(this, option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                )
                            })
                        }
                    </View>                      
                </ScrollView>


            <View style={{ position: 'absolute', left: 0, right: 0, bottom: isIPhoneX() ? 34 : 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                    <TouchableOpacity activeOpacity={0.8} style={{ flex: 1, height: 50, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center' }} onPress={this.handleReset}>
                        <Text style={{fontSize: 16, color: '#fff'}}>重置</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} style={{ flex: 1, height: 50, backgroundColor: '#2269d4', alignItems: 'center', justifyContent: 'center' }} onPress={this.handleConfirm.bind(this, this.state.tags)}>
                        <Text style={{fontSize: 16, color: '#fff'}}>确定</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}


function mapStateToProps(state) {
    const { tags, userInfo } = state.app
    const tagOptions = tags.map(item => ({ label: item.name.trim(), value: item.id }))
    return { tagOptions, userInfo }
}

export default connect(mapStateToProps)(MyTags)
