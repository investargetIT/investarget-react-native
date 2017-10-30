import React from 'react';
import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import Swipeout from 'react-native-swipeout'

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
            headerBackTitle: null,
            headerTintColor: '#fff',
            headerRight: (params && params.userType == 1 ? null : <TouchableOpacity style={{marginRight: 16}} onPress={() => { params.onPress && params.onPress() }}>
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
        const param = { page_index: page, page_size: PAGE_SIZE, favoritetype: 4 }
        return api.getFavoriteProj(param).then(data => {
            var { count: total, data: list } = data
            list = list.map(item => {
                var proj = item.proj
                proj['favorId'] = item.id
                return proj
            })
            return { total, list }
        })
    }

    loadMore = () => {
        if (this.state.page * PAGE_SIZE >= this.state.total) return // 已全部加载完毕

        let nextPage = this.state.page + 1
        this.setState({ loading: true, page: nextPage })
        this.getProjects(nextPage).then(({ total, list }) => {
            if (list.length == 0) {
                this.setState({ loading: false })
            } else {
                this.setState({
                    loading: false,
                    total: total,
                    projects: [...this.state.projects, ...list],
                })
            }
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    projectOnPress = project => {
        this.props.navigation.navigate('ProjectDetail', { project });
    }

    projectOnRemove = (id, favorId) => {
        Alert.alert(
            '提示',
            '你确定从收藏中移除该项目吗？',
            [
                {text:'取消', onPress:()=>{}},
                {text:'确定',onPress:()=>{this.cancelFavorite(id, favorId)}}
            ]
        )
    }

    cancelFavorite = (id, favorId) => {
        const { projects } = this.state
        const param = { favoriteids: [favorId] }
        api.projCancelFavorite(param).then(data => {
            this.setState({ projects: projects.filter(item => item.id !== id) })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
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
        const { selected } = this.state
        if (selected) {
            this.props.navigation.navigate('SelectUser', { title: '我的投资人', favoritetype: 3, projects: selected })
        } else {
            //
        }
    }

    handleRecommend = () => {
        this.setState({ selecting: true })
    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.handleRecommend, userType: this.props.userType })

        this.setState({ loading: true })
        this.getProjects(1).then(({ total, list }) => {
            this.setState({
                loading: false,
                total,
                projects: list,
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
                            onPress={this.projectOnPress.bind(this, item)}
                            selecting={this.state.selecting}
                            selected={this.state.selected.includes(item.id)}
                            onToggleSelect={this.toggleSelect.bind(this, item.id)}
                            onRemove={this.projectOnRemove.bind(this, item.id, item.favorId)}
                        />)}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    ListFooterComponent={() => {
                        return this.state.loading && this.state.total >= PAGE_SIZE ? (<Text style={loadingBottomStyle}>加载中...</Text>) : null
                    }}
                    ItemSeparatorComponent={() => (
                        <View style={{height:1,backgroundColor:'#f4f4f4'}}></View>
                    )}
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
        const { selecting, selected, onToggleSelect, onPress, onRemove, ...extraProps } = this.props
        const imgSource = selected ? require('../images/ht-cellselected.png') : require('../images/ht-cellnormal.png')
        
        if (selecting) {
            return (
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{width:60,backgroundColor:'#fff'}}>
                        <TouchableOpacity style={{flex: 1,justifyContent:'center',alignItems:'center'}} onPress={onToggleSelect}>
                            {selected ? <Image source={require('../images/ht-cellselected.png')} style={{width:24,height:24}} /> :
                                <Image source={require('../images/ht-cellnormal.png')} style={{width:24,height:24}} />
                            }
                        </TouchableOpacity>
                    </View>
                    <ProjectItem {...extraProps} />
                </View>
            )
        } else {
            return (
                <Swipeout
                    autoClose={true}
                    right={[{text: '删除',type:'delete',onPress: onRemove}]}
                >
                    <ProjectItem {...extraProps} onPress={onPress} />
                </Swipeout>
            )
        }
    }
}


function mapStateToProps(state) {
    const { id, userType } = state.app.userInfo
    return { userId: id, userType }
}

export default connect(mapStateToProps)(MyFavoriteProject)
