import React from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'
import ImagePicker from 'react-native-image-picker'
 
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

const PAGE_SIZE = 200

class MyPartner extends React.Component {

    static navigationOptions = ({navigation}) => {
        const { params } = navigation.state
        const org = params.org
        const userType = params.userType
        return {
            title: userType == 1 ? '我的交易师' : org.org,
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            // headerRight: userType == 1 ? null : (
            //     <TouchableOpacity style={{marginRight:12}} onPress={ () => {params.onPress && params.onPress()} }><Image source={require('../images/plus.png')} style={{width: 24, height: 24}} /></TouchableOpacity>
            // ),
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
            param['orgs'] = this.org.id
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
                    this.props.navigation.navigate('AddInvestor', {...parsedData, file: _file})
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

    componentDidMount() {
        this.org = this.props.navigation.state.params.org;
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
    const { titles } = state.app
    return { userType, userId: id, titles }
}

export default connect(mapStateToProps)(MyPartner)