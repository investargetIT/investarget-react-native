import React from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  Image,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-root-toast'
import * as newApi from '../api'

const cardStyle = {
    alignItems: 'center',
    width: 84,
}
const avatarStyle = {
    width: 40,
    height: 40,
    marginBottom: 8,
    borderRadius: 20
}
const orgWrapStyle = {
    width: '100%',
    borderLeftColor: '#10458f',
    borderLeftWidth: 2,
    marginBottom: 4,
}
const orgStyle = {
    paddingLeft: 4-2,
    paddingRight: 4,
    fontSize: 13,
    color: 'rgb(51, 51, 51)',
    textAlign: 'center',
    backgroundColor: 'transparent',
}
const userStyle = {
    fontSize: 12,
    color: 'rgb(131, 131, 131)',
    textAlign: 'center',
    backgroundColor: 'transparent',
}

const Investor = props => {
  return (
    <View style={cardStyle}>
      <Image source={props.avatar || require('../images/userCenter/defaultAvatar.png')} style={avatarStyle} />
      <View style={orgWrapStyle}>
        <Text numberOfLines={1} style={orgStyle}>{props.orgName}</Text>
      </View>
      <Text numberOfLines={1} style={userStyle}>{props.userName}</Text>
    </View>
  )
}

const Remark = props => {
    return (
        <View style={{backgroundColor: 'white', padding: 10 }}>
            <View style={{ paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgb(16, 69, 143)'}}><Text>最新备注</Text></View>
            <Text style={{ marginBottom: 8, marginTop: 8, fontSize: 12, color: 'rgb(102, 102, 102)', lineHeight: 16 }}>{props.content}</Text>
            <Text style={{ fontSize: 11, color: 'rgb(119, 119, 119)', lineHeight: 13 }}>当前状态：{props.status}</Text>
        </View>
    )
}

class LatestRemark extends React.Component {

    static navigationOptions = {
        title: '最新备注',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    constructor(props) {
        super(props)
        this.state = {
            timelines: [],
        }
    }

    componentDidMount() {
      const timelines = this.props.navigation.state.params.investors;
      for (let a = 0; a < timelines.length; a++) {
        newApi.getTimelineRemark({ timeline: timelines[a].timeLineId, sort: false, page_size: 1 })
        .then(data => {
          timelines[a]['latestRemarkContent'] = data.count > 0 ? data.data[0].remark : '暂无';
          this.setState({ timelines })
        })
        // .catch(error => this.dispatch(handleError(error)));
  
        newApi.getUserDetailLang(timelines[a].investorId)
        .then(data => {
          timelines[a]['investorOrgName'] = data.org && data.org.orgname;
          this.setState({ timelines })
        })
        // .catch(error => this.dispatch(handleError(error)));
      }
    }

    render() {

        const content = this.state.timelines.map(item => (
            <View key={item.investorId} style={{ flexDirection: 'row', marginTop: 16 }}>
                <View style={{ flex: 3, alignItems: 'center' }}>
                    <Investor 
                    orgName={item.investorOrgName} 
                    userName={item.investorName} avatar={{uri: item.investorPhotoUrl }} />
                </View>
                <View style={{ flex: 7, paddingRight: 30 }}>
                    <Remark content={item.latestRemarkContent} status={'step' + item.transactionStatusId + '，' +  item.transactionStatusName} />
                </View>
            </View>
        ))
        return (
            <View style={{ flex: 1 }}>
                <Image source={require('../images/timeline/timeLineBG.png')} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                <ScrollView>{content}</ScrollView>
            </View>
        )
    }
}

export default LatestRemark