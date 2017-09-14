import React from 'react'
import { View, Text, Image, FlatList, RefreshControl, StatusBar } from 'react-native'
import ProjectItem from './ProjectItem'
import { connect } from 'react-redux'

import * as api from '../api'


class ProjectList extends React.Component {

    static navigationOptions = {
        title: 'Home',
        tabBarIcon: ({ focused, tintColor }) => {
            const image = focused ? require('../images/tabbar/home_fill.png') : require('../images/tabbar/home.png')
            return <Image source={image} style={{width:24,height:24,resizeMode:'cover'}} />
        },
        tabBarLabel: '主页',
    }

    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            projects: []
        }
    }

    componentDidMount() {
        api.getProj().then(data => {
            const { count: total, data: list } = data
            this.setState({ projects: list })
        })
    }

    onRefresh = () => {
        this.setState({ refreshing: true })
        setTimeout(() => {
            this.setState({ refreshing: false })
        }, 2000)
    }

    render() {
        const list = [1,2,3,4,5,6,7,8,9,10]
        return (
            <View style={{flex:1}}>
                
                

                <View style={{height:45,backgroundColor: '#F4F4F4',display: 'flex',flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{marginLeft:8,borderLeftWidth:2,borderLeftColor:'#10458f',paddingLeft:8}}>
                        <Text>项目推荐</Text>
                    </View>
                    <View style={{marginRight:8, display:'flex',flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../images/home/filter.png')} style={{width:14,height:15,marginRight:7}} />
                        <Text>筛选</Text>
                    </View>
                </View>
                <FlatList
                    style={{backgroundColor: '#f4f4f4'}}
                    data={list}
                    keyExtractor={(item,index)=>item}
                    renderItem={() => <ProjectItem />}
                    overScrollMode="always"
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} colors={['#10458f']} tintColor="#10458f" />}
                />
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { projects, needRefresh, userInfo, isFetching, projectStructure, isLogin } = state
    const filter = state.trueFilter
    return { projects, filter, needRefresh, userInfo, isFetching, projectStructure, isLogin }
}

export default connect(mapStateToProps)(ProjectList)
