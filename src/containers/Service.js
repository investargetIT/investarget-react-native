import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'

import * as api from '../api'


class Service extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            partners: []
        }
    }

    handleClickPartner = (id) => {

    }

    handleClickAll = () => {

    }

    handleClickNotification = () => {

    }

    componentDidMount() {
        const userId = this.props.userId
        const param = this.props.userType == 1 ? { investoruser: userId } : { traderuser: userId }
        api.getUserRelation(param).then(data => {
            const partners = data.data.slice(0, 3).map(item => {
                const user = this.props.userType == 1 ? item.traderuser : item.investoruser
                const { id, username, org, photourl } = user
                return { id, username, orgname: org ? org.orgname : '', photoUrl: photourl }
            })
            this.setState({ partners })
        }).catch(error => {
            Toast.show(error.message, Toast.positions.CENTER)
        })
    }

    render() {
        return (
            <View>
                <Image source={require('../images/serveBG.png')} />
                <View style={{padding: 16, backgroundColor: '#fff', marginBottom: 16}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={{fontSize: 15, color: '#666'}}>
                            { this.props.userType == 1 ? '我的投资人' : '我的交易师' }
                        </Text>
                        <TouchableOpacity onPress={this.handleClickAll}>
                            <Text style={{fontSize: 15, color: '#10458f'}}>ALL</Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.partners.length > 0 ? (
                        <View style={{flexDirection:'row',marginTop: 24}}>
                            {
                                this.state.partners.map(item => (
                                    <TouchableOpacity key={item.id} style={{width:72,marginRight: 16}} onPress={this.handleClickPartner.bind(this, item.id)}>
                                        <Image source={ item.photoUrl ? { uri: item.photoUrl } : require('../images/userCenter/defaultAvatar.png')} style={{width: 72, height: 72, marginBottom: 8,borderRadius: 36}} />
                                        <View style={{ borderLeftColor: '#10458f', borderLeftWidth: 2, marginBottom: 8 }}>
                                            <Text numberOfLines={1} style={{paddingLeft: 4-2, paddingRight: 4, fontSize: 13, color: '#666', textAlign: 'center'}}>{item.orgname}</Text>
                                        </View>
                                        <Text numberOfLines={1} style={{fontSize: 12, color: '#999', textAlign: 'center'}}>{item.username}</Text>
                                    </TouchableOpacity>
                                ))
                            }                      
                        </View>
                    ) : null}
                </View>
                <TouchableOpacity onPress={this.handleClickNotification} style={{backgroundColor: '#fff', padding: 16, flexDirection: 'row', alignItems: 'center'}}>
                    <Image style={{ marginRight: 8 }} source={require('../images/notifyMessage.png')} />
                    <Text style={{flex: 1,fontSize: 15, color: '#666'}}>通知消息</Text>
                    <Image source={require('../images/more.png')} />
                </TouchableOpacity>
            </View>
        )
    }
}

function mapStateToProps(state) {
    const { userType, id } = state.app.userInfo
    return { userType, userId: id }
}
export default connect(mapStateToProps)(Service)