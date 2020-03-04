import React from 'react';
import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import ProjectItem from '../components/ProjectItem'
import * as api from '../api'


const loadingBottomStyle = {
    fontSize:15,
    color:'#999',
    textAlign:'center',
    paddingTop:8,
    paddingBottom:8,
    backgroundColor:'#fff'
}

const PAGE_SIZE = 10


class FavoriteProjectList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            projects: [],
            page: 1,
            total: 0,
            loading: false,
        }
    }

    getProjects = (page) => {
        const { favoritetype, userType, userId, targetUserId } = this.props
        const isInvestor = userType == 1
        var param = { page_index: page, page_size: PAGE_SIZE, favoritetype }

        if (favoritetype == 1) {
            if (!isInvestor) {
                param['user'] = targetUserId
            }
        } else if (favoritetype == 3) {
            if (isInvestor) {
                param['trader'] = targetUserId
            } else {
                param['user'] = targetUserId
            }
        } else if (favoritetype == 4) {
            if (!isInvestor) {
                param['user'] = targetUserId
            }
        } else if (favoritetype == 5) {
            if (isInvestor) {
                param['trader'] = targetUserId
            } else {
                param['user'] = targetUserId
            }
        }
        
        return api.getFavoriteProj(param)
    }

    loadMore = () => {
        if (this.state.page * PAGE_SIZE >= this.state.total) return // 已全部加载完毕

        let nextPage = this.state.page + 1
        this.setState({ loading: true, page: nextPage })
        this.getProjects(nextPage).then(data => {
            const { count: total, data: list } = data
            if (list.length == 0) {
                this.setState({ loading: false })
            } else {
                this.setState({
                    loading: false,
                    total: total,
                    projects: [...this.state.projects, ...list.map(item => item.proj)],
                })
            }
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    projectOnPress = project => {
        this.props.navigation.navigate('ProjectDetail', { project })
    }

    componentDidMount() {
        this.setState({ loading: true })
        this.getProjects(1).then(data => {
            const { count: total, data: list } = data
            this.setState({
                loading: false,
                total,
                projects: list.map(item => item.proj)
            })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    render() {
        function t(item) {
            var obj = {}
            obj['id'] = item.id
            obj['title'] = item.projtitle
            obj['amount'] = item.financeAmount_USD
            obj['country'] = item.country.country
            obj['imgUrl'] = item.industries[0].url
            obj['industrys'] = item.industries.map(i => i.name)
            obj['isMarketPlace'] = false 
            return obj
        }
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={this.state.projects}
                    keyExtractor={(item,index)=>item.id}
                    renderItem={({item, sparators}) => (
                        <ProjectItem
                            {...t(item)}
                            onPress={this.projectOnPress.bind(this, item)}
                        />)}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    ListFooterComponent={() => {
                        return this.state.loading && this.state.total >= PAGE_SIZE ? (<Text style={loadingBottomStyle}>加载中...</Text>) : null
                    }}
                    ListEmptyComponent={() => (
                        <View style={{flex:1,alignItems:'center',paddingTop: 60}}>
                            <Image source={require('../images/emptyBox.png')} />
                        </View>
                    )}
                    ItemSeparatorComponent={() => (
                        <View style={{height:1,backgroundColor:'#f4f4f4'}}></View>
                    )}
                />
            </View>
        )
    }
}

export default FavoriteProjectList
