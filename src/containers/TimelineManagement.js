import React from 'react';
import { Image, ImageBackground, Text, View, FlatList, TouchableOpacity } from 'react-native';
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'

import * as api from '../api'


const titleStyle = {
    marginTop: 16,
    marginBottom: 16,
    height: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    shadowColor:'skyblue',
    shadowOffset:{h:1,w:0},
    shadowRadius:3,
    shadowOpacity:0.5,
}

class TimelineManagement extends React.Component {

    static navigationOptions = {
        title: '项目进程',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    constructor(props) {
        super(props)
        this.state = {
            list: [],
        }
    }

    handleClickProject = (id) => {
        console.log('proj>>',id)
    }
    handleClickOrganizaiton = (id) => {
        console.log('org>>',id)
        this.props.navigation.navigate('OrganizationInfo', { orgId: id })
    }
    handleClickUser = (id) => {
        if (id == this.props.userId) {
            this.props.navigation.navigate('UserInfo', { userId: id })
        } else {
            // go to chat
        }
    }
    handleClickTimeline = (id) => {
        this.props.navigation.navigate('EditTimeline', { id })
    }


    getData = () => {
        const { userType, userId } = this.props
        var param = { isClose: false, page_index: 1, page_size: 10 }
        if (userType == 1) {
            param['investor'] = userId
        } else if (userType == 3) {
            param['trader'] = userId
        }
        api.getTimeline(param).then(data => {

            const timelines = data.data
            const investorIds = timelines.map(item => item.investor.id)
            const ids = timelines.map(item => item.id)

            Promise.all([this.getInvestorOrganization(investorIds), this.getLatestRemark(ids)])
                .then(data => {
                    const [orgs, remarks] = data
                    timelines.forEach((item, index) => {
                        item['org'] = orgs[index]
                        item['remark'] = remarks[index]
                    })
                    this.setState({ list: timelines })
                })

        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    getInvestorOrganization = (investorIds) => {
        const q = investorIds.map(id => {
            return api.getUserDetailLang(id).then(user => user.org)
        })
        return Promise.all(q)
    }

    getLatestRemark = (timelineIds) => {
        const q = timelineIds.map(id => {
            const param = { timeline: id, createuser: this.props.userId }
            return api.getTimelineRemark(param).then(result => {
                const { count, data } = result
                return count > 0 ? data[0].remark : ''
            })
        })
        return Promise.all(q)
    }


    componentDidMount() {
        this.getData()
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ImageBackground style={{flex: 1}} source={require('../images/timeline/timeLineBG.png')}>
                    <View style={titleStyle}>
                        <Text style={{color: '#333', textAlign: 'center', fontSize: 16, fontWeight:'bold'}}>时间轴总数：1个</Text>
                    </View>

                    <FlatList
                        data={this.state.list}
                        keyExtractor={(item, index) => item.id}
                        renderItem={(item) => (
                            <Card
                                {...item}
                                onClickProject={this.handleClickProject}
                                onClickOrganizaiton={this.handleClickOrganizaiton}
                                onClickUser={this.handleClickUser}
                                onClickTimeline={this.handleClickTimeline} />
                        )}
                    />
                </ImageBackground>
            </View>
        )
    }
}


const cardStyle = {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingTop: 8,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor:'skyblue',
    shadowOffset:{h:1,w:0},
    shadowRadius:3,
    shadowOpacity:0.5,
}

const itemStyle = {
    height: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    justifyContent: 'flex-end'
}
const projStyle = {
    flex: 0,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius:4,
    backgroundColor:'#10458F',
}
const textStyle = {
    fontSize: 14,
    color: '#333',
}

class Card extends React.Component {

    render() {
        const { id, isClose, proj, investor, org, trader, transationStatu, remark } = this.props.item

        var remainingAlertDay = parseFloat(transationStatu.remainingAlertDay)
        remainingAlertDay = remainingAlertDay > 0 ? Math.ceil(remainingAlertDay) : 0

        return (
            <View style={cardStyle}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={projStyle} onPress={this.props.onClickProject.bind(this, proj.id)}>
                        <Text style={{fontSize: 15,color: '#fff'}}>{proj.projtitle}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickUser.bind(this, investor.id)}>
                    <Text style={textStyle}>投资人：{investor.username}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickOrganizaiton.bind(this, org.id)}>
                    <Text style={textStyle}>投资人所属机构：{org.orgname}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickUser.bind(this, trader.id)}>
                    <Text style={textStyle}>交易师：{trader.username}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text style={textStyle}>当前状态：{transationStatu.transationStatus.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle}>
                    <Text style={textStyle}>是否结束：{isClose ? '已结束' : '未结束'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text style={textStyle}>剩余天数：{remainingAlertDay}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...itemStyle, borderBottomWidth: 0}} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text numberOfLines={1} style={textStyle}>最新备注：{remark}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { userType, id } = state.app.userInfo
    return { userType, userId: id }
}

export default connect(mapStateToProps)(TimelineManagement)
