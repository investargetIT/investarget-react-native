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

class MyFavoriteProject extends React.Component {
    
    static navigationOptions = ({navigation}) => {
        const { params } = navigation.state
        return {
            title: '收藏的项目',
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: (<TouchableOpacity style={{marginRight: 16}} onPress={() => { params.onPress && params.onPress() }}>
                            <Text style={{color: '#fff',fontSize: 15}}>推荐</Text>
                        </TouchableOpacity>)
        };
    }

    constructor(props) {
        super(props)
        this.state = {
            projects: [],
            page: 1,
            total: 0,
            loading: false,
            selecting: false,
            selected: [],
        }
    }

    getProjects = (page) => {
        const userId = this.props
        const param = { page_index: page, page_size: PAGE_SIZE, favoritetype: 4, user: userId }
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

    projectOnPress = (id) => {
        this.props.navigation.navigate('ProjectDetail', { projectID: id })
    }

    toggleSelect = (id) => {
        const { selected } = this.state
        if (selected.includes(id)) {
            let index = selected.indexOf(id)
            this.setState({ selected: [...selected.slice(0,index), ...selected.slice(index+1)] })
        } else {
            this.setState({ selected: [...selected, id] })
        }
    }

    cancelSelect = () => {
        this.setState({ selecting: false, selected: [] })
    }

    confirmSelect = () => {
        //
        this.setState({ selecting: false, selected: [] })
    }

    handleRecommend = () => {
        this.setState({ selecting: true })
    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.handleRecommend })

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
            obj['isMarketPlace'] = item.ismarketplace
            return obj
        }
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={this.state.projects}
                    keyExtractor={(item,index)=>item.id}
                    renderItem={({item, sparators}) => (
                        <_ProjectItem
                            {...t(item)}
                            onPress={this.projectOnPress.bind(this, item.id)}
                            selecting={this.state.selecting}
                            selected={this.state.selected.includes(item.id)}
                            onToggleSelect={this.toggleSelect.bind(this, item.id)}
                        />)}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    ListFooterComponent={() => {
                        return this.state.loading && this.state.total >= PAGE_SIZE ? (<Text style={loadingBottomStyle}>加载中...</Text>) : null
                    }}
                />
                {this.state.selecting ? (
                    <View style={{height:40,backgroundColor:'#10458f',flexDirection:'row',alignItems:'center'}}>
                        <TouchableOpacity style={{flex:1}} onPress={this.cancelSelect}>
                            <Text style={{textAlign:'center',fontSize:16,color:'#fff'}}>取消</Text>
                        </TouchableOpacity>
                        <Text style={{fontSize:16,color:'#fff'}}>|</Text>
                        <TouchableOpacity style={{flex:1}} onPress={this.confirmSelect}>
                            <Text style={{textAlign:'center',fontSize:16,color:'#fff'}}>确定</Text>
                        </TouchableOpacity>
                    </View>
                ):null}
            </View>
        )
    }
}


class _ProjectItem extends React.Component {
    render() {
        const { selecting, selected, onToggleSelect, onPress, ...extraProps } = this.props
        const imgSource = selected ? require('../images/ht-cellselected.png') : require('../images/ht-cellnormal.png')
        return (
            <View style={{flexDirection:'row', alignItems:'center'}}>
                {selecting? (
                    <View style={{width:60,backgroundColor:'#fff'}}>
                        <TouchableOpacity style={{flex: 1,justifyContent:'center',alignItems:'center'}} onPress={onToggleSelect}>
                            {selected ? <Image source={require('../images/ht-cellselected.png')} style={{width:24,height:24}} /> :
                                <Image source={require('../images/ht-cellnormal.png')} style={{width:24,height:24}} />
                            }
                        </TouchableOpacity>
                    </View>
                ):null}
                <ProjectItem {...extraProps} onPress={selecting ? null : onPress} />
            </View>
        )
    }
}


function mapStateToProps(state) {
    const { id } = state.app.userInfo
    return { userId: id }
}

export default connect(mapStateToProps)(MyFavoriteProject)
