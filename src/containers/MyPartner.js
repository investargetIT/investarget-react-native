import React from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'

import * as api from '../api'
import PartnerCard from '../components/PartnerCard'


const headerRightStyle = {
    marginRight: 12,
    color: '#fff',
    fontSize: 15
}
const cardContainerStyle = {
    flex: 1,
    flexDirection:'row',
    flexWrap:'wrap',
    backgroundColor:'#fff'
}
const cardStyle = {
    width: '33%',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
}


class MyPartner extends React.Component {

    static navigationOptions = ({navigation}) => {
        const { params } = navigation.state
        const userType = params.userType
        return {
            title: userType == 1 ? '我的交易师' : '我的投资人',
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: userType == 1 ? null : (
                <TouchableOpacity style={{marginRight:12}} onPress={params.onPress && params.onPress()}><Image source={require('../images/plus.png')} style={{width: 24, height: 24}} /></TouchableOpacity>
            )
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            partners: []
        }
    }

    handleClickPartner = (id, name) => {
        this.props.navigation.navigate('Chat', { targetUserId: id, targetUserName: name })
    }

    getPartners = () => {
        const userId = this.props.userId
        const param = this.props.userType == 1 ? { investoruser: userId } : { traderuser: userId }
        api.getUserRelation(param).then(data => {
            const partners = data.data.map(item => {
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

    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.addInvestor })
        this.getPartners()
    }

    render() {
        return (
            <ScrollView style={{flex: 1}}>
                <View style={cardContainerStyle}>
                    {this.state.partners.map(item => (
                        <PartnerCard
                            key={item.id}
                            style={cardStyle}
                            photoUrl={item.photoUrl}
                            orgName={item.orgname}
                            userName={item.username}
                            onPress={this.handleClickPartner.bind(this, item.id, item.username)} />
                    ))}                
                </View>
            </ScrollView>    
        )
    }
}

function mapStateToProps(state) {
    const { userType, id } = state.app.userInfo
    return { userType, userId: id }
}

export default connect(mapStateToProps)(MyPartner)