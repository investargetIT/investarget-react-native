import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import Spinner from 'react-native-loading-spinner-overlay'

import Select from '../components/BaseSelect'
import * as api from '../api'
import { receiveTags, modifyUserInfo } from '../../actions'


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

    handleChange = (value) => {
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

    render() {
        return (
            <View>
                <Spinner visible={this.state.loading} />
                <Select
                    value={this.state.tags}
                    onChange={this.handleChange}
                    options={this.props.tagOptions}
                    title="请选择您关注的标签"
                    multiple={true}
                />
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
