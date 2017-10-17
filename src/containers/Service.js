import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import ImagePicker from 'react-native-image-picker'
import * as api from '../api'
import PartnerCard from '../components/PartnerCard'


class Service extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            partners: []
        }
    }

    handleClickPartner = (id, name) => {
        this.props.navigation.navigate('Chat', { targetUserId: id, targetUserName: name })
    }

    handleClickAll = () => {
        this.props.navigation.navigate('MyPartner', { userType: this.props.userType })
    }

    handleClickNotification = () => {
        this.props.navigation.navigate('Notification')
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
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    addInvestor = () => {
        var _file = null

        const options = {
            title: '选择名片',
            cancelButtonTitle: '取消',
            mediaType: 'photo',
        }
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                Toast.show('已取消', {position: Toast.positions.CENTER})
            } else if (response.error) {
                Toast.show(response.error, {position: Toast.positions.CENTER})
            } else {
                let file = { uri: response.uri, type: 'application/octet-stream', name: 'businessCard.jpg' }
                _file = file
                var formData = new FormData()
                formData.append('file', file)

                api.ccUpload(formData).then(data => {
                    try {
                        data = JSON.parse(data)
                    } catch (e) {
                        this.props.navigation.navigate('AddInvestor', {file: _file})
                        return
                    }
                    const parsedData = this.parseData(data)
                    this.props.navigation.navigate('AddInvestor', {...parsedData, file: _file, imageData: response.data})
                }, error => {
                    this.props.navigation.navigate('AddInvestor', {file: _file})
                })
            }
        })
    }

    parseData(data) {
        const name = data.formatted_name ? data.formatted_name[0].item : null
        const email = data.email ? data.email[0].item : null
        let title
        if (data.title) {
          const index = this.props.titles.map(item => item.titleName).indexOf(data.title[0].item)
          if (index > -1) {
            title = this.props.titles[index].id
          }
        }
        let mobile
        if (data.telephone) {
          const mobileArr = data.telephone.filter(f => /1[34578]\d{9}/.exec(f.item.number))
          if (mobileArr.length > 0) {
            mobile = /1[34578]\d{9}/.exec(mobileArr[0].item.number)[0]
          }
        }
        let company = null
        if (data.organization) {
          const companyObj = data.organization[0].item
          company = companyObj.name || companyObj.positional || companyObj.unit
        }
        return { name, email, title, mobile, company }
    }

    render() {
        return (
            <View>
                <Image source={require('../images/serveBG.png')} />
                <View style={{padding: 16, backgroundColor: '#fff', marginBottom: 16}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={{fontSize: 15, color: '#666'}}>
                            { this.props.userType == 1 ? '我的交易师' : '我的投资人' }
                        </Text>
                        <TouchableOpacity onPress={this.handleClickAll}>
                            <Text style={{fontSize: 15, color: '#10458f'}}>ALL</Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.partners.length > 0 ? (
                        <View style={{flexDirection:'row',marginTop: 24}}>
                            <TouchableOpacity style={{marginRight:12}} onPress={this.addInvestor}>
                                <Image source={require('../images/add.png')} style={{width: 72, height: 72}} />
                            </TouchableOpacity>
                            {
                                this.state.partners.map(item => (
                                    <PartnerCard
                                        key={item.id}
                                        style={{marginRight: 16}}
                                        photoUrl={item.photoUrl}
                                        orgName={item.orgname}
                                        userName={item.username}
                                        onPress={this.handleClickPartner.bind(this, item.id, item.username)} />
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
    const { titles } = state.app
    return { userType, userId: id, titles }
}
export default connect(mapStateToProps)(Service)