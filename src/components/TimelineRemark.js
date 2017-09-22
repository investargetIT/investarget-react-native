import React from 'react'
import { View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, Alert } from 'react-native'
import Swipeout from 'react-native-swipeout'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import * as api from '../api'
import Picker from '../components/Picker'


const headStyle = {
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-between',
    height:32,
    borderBottomColor:'#f4f4f4',
    borderBottomWidth:1,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
}


class TimelineRemark extends React.Component {

    constructor(props) { // props.timelineId
        super(props)
        this.state = {
            id: props.timelineId,
            remarks: [],
            visible: false,
            remark: '',
            remarkId: null,
        }
    }

    handleChangeText = (value) => {
        this.setState({ remark: value })
    }

    _latestSubmitEditing = null
    handleSubmitEditing = (e) => {
        // 实现只响应第一次 onSubmitEditing 事件
        const latestSubmitEditing = this._latestSubmitEditing
        this._latestSubmitEditing = e.timeStamp
        if(latestSubmitEditing && e.timeStamp - latestSubmitEditing < 300) return

        this.handleChangeText(this.state.remark + '\n')
    }

    getRemark = () => {
        const param = { timeline: this.state.id, createuser: this.props.userId }
        api.getTimelineRemark(param).then(data => {
            this.setState({ remarks: data.data })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    addRemark = () => {
        this.setState({ remark: '', remarkId: null, visible: true })
    }

    editRemark = (id) => {
        const item = this.state.remarks.filter(item => item.id == id)[0]
        if (item) {
            this.setState({ remark: item.remark, remarkId: item.id, visible: true })
        }
    }

    deleteRemark = (id) => {
        Alert.alert('提示', '确定要删除该条备注吗？', [
            { text: '取消', onPress: () => {} },
            { text: '确定', onPress: () => { this.confirmDeleteRemark(id) } },
        ])
    }

    confirmDeleteRemark = (id) => {
        api.deleteTimelineRemark(id).then(() => {
            this.getRemark()
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    confirmSaveRemark = () => {
        this.setState({ visible: false })
        const param = { timeline: this.state.id, remark: this.state.remark }
        if (this.state.remarkId) {
            api.editTimelineRemark(this.state.remarkId, param).then(() => {
                this.getRemark()
            }).catch(error => {
                Toast.show(error.message, {position: Toast.positions.CENTER})
            })
        } else {
            api.addTimelineRemark(param).then(data => {
                this.getRemark()
            }).catch(error => {
                Toast.show(error.message, {position: Toast.positions.CENTER})
            })
        }
    }

    cancelSaveRemark = () => {
        this.setState({ visible: false })
    }

    componentDidMount() {
        this.getRemark()        
    }

    render() {
        return (
            <View style={this.props.style || {}}>
                <View style={headStyle}>
                    <Text style={{width: 120, fontSize: 15, color:'#333'}}>时间轴备注</Text>
                    <TouchableOpacity onPress={this.addRemark} style={{flex:0}}>
                        <Text style={{fontSize: 15,color:'#333'}}>添加备注</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={{flex:1}}>
                    <View>
                        {this.state.remarks.map(item => {
                            var time = item.lastmodifytime || item.createdtime
                            time = time.slice(0,19).replace('T',' ')
                            return (
                                <Swipeout
                                    key={item.id}
                                    autoClose={true}
                                    right={[{text: '删除',type:'delete',onPress: this.deleteRemark.bind(this, item.id)}]}
                                    style={{marginBottom: 12}}
                                >
                                    <TouchableOpacity 
                                        onPress={this.editRemark.bind(this, item.id)}
                                        style={{backgroundColor: '#f8f8f8', paddingLeft: 16,paddingRight: 16, paddingTop: 8, paddingBottom: 8}}>
                                        <Text style={{fontSize: 14,color: '#333',marginBottom: 8}} numberOfLines={1} >{item.remark}</Text>
                                        <Text style={{fontSize: 12,color: '#999',textAlign:'right'}}>{time}</Text>
                                    </TouchableOpacity>
                                </Swipeout>
                            )
                        })}
                    </View>
                </ScrollView>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.visible}
                    onRequestClose={()=>{}}
                >
                    <View style={{flex:1,backgroundColor:'rgba(0,0,0,.5)'}}>
                        <View style={{ marginTop:180, marginLeft: 16,marginRight:16, padding: 12,backgroundColor:'#fff',borderRadius:4,shadowColor:'skyblue',shadowOffset:{h:1,w:0},shadowRadius:3,shadowOpacity:0.5 }}>
                            <View style={{flexDirection:'row', justifyContent:'space-between', height:36,borderBottomColor:'#f4f4f4',borderBottomWidth:1}}>
                                <Text style={{fontSize: 16, color:'#10458f',marginTop: 4}}>备注信息</Text>
                                <TouchableOpacity onPress={this.cancelSaveRemark}>
                                    <Image source={require('../images/closeView.png')} style={{width:20,height:20}} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                multiline={true}
                                numberOfLines={5}
                                underlineColorAndroid="transparent"
                                selectionColor="#2269d4"
                                blurOnSubmit={false}
                                value={this.state.remark}
                                onChangeText={this.handleChangeText}
                                onSubmitEditing={this.handleSubmitEditing}
                                style={{height:100,color:'#333', fontSize:15,lineHeight:24,paddingTop:4,paddingBottom:4, marginBottom: 8,textAlign:'left', textAlignVertical:'top'}} />

                            <TouchableOpacity
                                onPress={this.confirmSaveRemark}
                                style={{alignSelf:'center', backgroundColor:'#10458f', width: 60, height:28, borderRadius: 4,alignItems:'center', justifyContent:'center'}}>
                                <Text style={{color:'#fff',fontSize:16}}>保存</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { id } = state.app.userInfo
    return { userId: id }
}

export default connect(mapStateToProps)(TimelineRemark)
