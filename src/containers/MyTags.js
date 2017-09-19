import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import Select from '../components/BaseSelect'
import * as api from '../api'
import * as utils from '../utils'
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
        this.state = {
            loading: false
        }
    }

    handleChange = (value) => {
        this.setState({ loading: true })

        const userId = utils.getCurrentUserId()
        api.editUser([userId], { tags: items })
        .then(data => {
            this.setState({ loading: false })

            const userTags = this.props.tags.filter(item => items.includes(item.value))
            const newUserInfo = { ...this.props.userInfo, userTags }
            this.props.dispatch(modifyUserInfo(newUserInfo))

            Toast.show('关注的标签已更新', { position: Toast.positions.CENTER })
        })
        .catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, { position: Toast.positions.CENTER })
        })
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
            <Select
                value={this.props.userInfo.userTags.map(item => item.id)}
                onChange={this.handleChange}
                options={this.props.tagOptions}
                title="请选择您关注的标签"
                multiple={true}
            />
        )
    }
}


function mapStateToProps(state) {
    const { tags, userInfo } = state.app
    const tagOptions = tags.map(item => ({ label: item.name.trim(), value: item.id }))
    return { tagOptions, userInfo }
}

export default connect(mapStateToProps)(MyTags)
