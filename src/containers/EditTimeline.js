import React from 'react'
import { View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, Alert } from 'react-native'
import Swipeout from 'react-native-swipeout'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import * as api from '../api'
import Picker from '../components/Picker'
import TimelineRemark from '../components/TimelineRemark'


const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}
const rowStyle = {
    flexDirection:'row',
    alignItems:'center',
    height:32,
    borderBottomColor:'#f4f4f4',
    borderBottomWidth:1,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
}


class EditTimeline extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return {
            title: '编辑进程',
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: <Text style={headerRightStyle} onPress={() => {params.handleSubmit && params.handleSubmit()}}>提交</Text>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            id: this.props.navigation.state.params.id,
            alertCycle: '', 
            transationStatus: null,
            transactionStatusOptions: [],
        }
    }

    handleChangeAlertCycle = (value) => {
        this.setState({ alertCycle: value })
    }

    handleChangeTransationStatus = (value) => {
        this.setState({ transationStatus: value })
    }

    handleSubmit = () => {
        const { id, alertCycle, transationStatus } = this.state
        const param = {
            timelinedata: { trader: null },
            statusdata: { alertCycle, transationStatus },
        }
        api.editTimeline(id, param).then(() => {
            Toast.show('进程修改成功', {position: Toast.positions.CENTER})
            this.props.navigation.goBack()
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    getTimeline = () => {
        api.getTimelineDetail(this.state.id).then(data => {
            const { alertCycle, transationStatus } = data.transationStatu
            this.setState({
                alertCycle: alertCycle + '',
                transationStatus: transationStatus.id
            })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleSubmit: this.handleSubmit })

        this.getTimeline()
        
        api.getSource('transactionStatus').then(data => {
            const transactionStatusOptions = data.map(item => ({ label: item.name, value: item.id }))
            this.setState({ transactionStatusOptions })
        })
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor: '#fff'}}>
                <View style={{...rowStyle,marginTop:8}}>
                    <Text style={{width: 120, fontSize: 15, color:'#333'}}>当前状态</Text>
                    <Picker
                        style={{flex: 1, height: 28}}
                        value={this.state.transationStatus}
                        onChange={this.handleChangeTransationStatus}
                        options={this.state.transactionStatusOptions} />
                </View>
                <View style={rowStyle}>
                    <Text style={{width: 120, fontSize: 15, color:'#333'}}>提醒周期/天</Text>
                    <TextInput
                        style={{flex:1,color:'#333',fontSize:15,height:28}}
                        underlineColorAndroid="transparent"
                        selectionColor="#2269d4"
                        value={this.state.alertCycle}
                        onChangeText={this.handleChangeAlertCycle} />
                </View>

                <TimelineRemark style={{flex: 1}} timelineId={this.state.id} />
               
            </View>
        )
    }
}

export default EditTimeline
