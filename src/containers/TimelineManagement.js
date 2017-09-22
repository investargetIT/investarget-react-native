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

    }
    handleClickOrganizaiton = (id) => {

    }
    handleClickUser = (id) => {

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
            this.setState({ list: data.data })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
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
        const { isClose, proj, investor, trader, transationStatu, id } = this.props.item
        const projName = proj.projtitle
        const investorName = investor.username
        const traderName = trader.userame
        const statusName = transationStatu.transationStatus.name
        var day = parseFloat(transationStatu.remainingAlertDay)
        day = day > 0 ? Math.ceil(day) : 0

        return (
            <View style={cardStyle}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={projStyle} onPress={this.props.onClickProject.bind(this, proj.id)}>
                        <Text style={{fontSize: 15,color: '#fff'}}>{projName}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickUser.bind(this, investor.id)}>
                    <Text style={textStyle}>投资人：{investorName}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickOrganizaiton}>
                    <Text style={textStyle}>投资人所属机构：多维海拓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickUser.bind(this, trader.id)}>
                    <Text style={textStyle}>交易师：{traderName}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text style={textStyle}>当前状态：{statusName}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle}>
                    <Text style={textStyle}>是否结束：{isClose ? '已结束' : '未结束'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={itemStyle} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text style={textStyle}>剩余天数：{day}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...itemStyle, borderBottomWidth: 0}} onPress={this.props.onClickTimeline.bind(this, id)}>
                    <Text style={textStyle}>最新备注：是不是因为下雨</Text>
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
