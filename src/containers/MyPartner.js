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

const PAGE_SIZE = 20

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
            ),
            headerBackTitle: null,
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            partners: [],
            total: 0,
            page: 1,
            loading: false,
        }
    }

    handleClickPartner = (id, name) => {
        this.props.navigation.navigate('Chat', { targetUserId: id, targetUserName: name })
    }

    getPartners = (page) => {
        const { userId, userType } = this.props
        var param = { page_size: PAGE_SIZE, page_index: page }
        if (userType == 1) {
            param['investoruser'] = userId
        } else {
            param['traderuser'] = userId
        }
        return api.getUserRelation(param).then(data => {
            var { count: total, data: list } = data
            list = list.map(item => {
                const user = userType == 1 ? item.traderuser : item.investoruser
                const { id, username, org, photourl } = user
                return { id, username, orgname: org ? org.orgname : '', photoUrl: photourl }
            })
            return { total, list }
        })
    }

    loadMore = () => {
        const { page, total, partners } = this.state
        if (page * PAGE_SIZE >= total) return // 已全部加载完毕
        
        let nextPage = page + 1
        this.setState({ loading: true, page: nextPage })
        this.getPartners(nextPage).then(({ total, list }) => {
            this.setState({
                loading: false,
                total: total,
                list: [...partners, ...list],
            })
        }).catch(error => {
            this.setState({ loading: false })
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    addInvestor = () => {
        // todo
    }

    componentDidMount() {
        this.props.navigation.setParams({ onPress: this.addInvestor })
        this.getPartners(1).then(({ total, list }) => {
            this.setState({ total, partners: list })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
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