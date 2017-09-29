import React from 'react';
import { 
  Image, 
  Text, 
  View, 
  StatusBar, 
  ImageBackground, 
  Platform, 
  ScrollView, 
  TouchableWithoutFeedback
} from 'react-native';
import * as newApi from '../api';
import AsyncStorage from '../AsyncStorage';

const TimelineStep = props => {
  return (
    <View style={{ marginLeft: 37 }}>
      <View style={{ marginLeft: 12, paddingLeft: 30, paddingTop: 10, paddingRight: 48, paddingBottom: 10, borderLeftWidth: 1, borderLeftColor: 'white' }}>
        <Image source={require('../images/timeline/Triangle.png')} style={{ width: 10, height: 10, position: 'absolute', left: 21, top: 16 }} />
        <TouchableWithoutFeedback onPress={() => props.handleStepClicked(props.investors)}>
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: 4, paddingBottom: 4, borderRadius: 4 }}>
          <Text style={{ marginLeft: 8, color: 'rgb(16, 69, 143)', marginBottom: 5, marginTop: 5, marginRight: 8 }}>{props.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.isArray(props.investors) ? props.investors.map((item, index) =>
            <Image key={index} source={{uri: item.investorPhotoUrl}} style={{ width: 30, height: 30, marginLeft: 8, marginTop: 5, borderRadius: 15 }} />
          ) : null}
          </View>
        </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={{ backgroundColor: props.color, width: 24, height: 24, position: 'absolute', top: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
        
          <Image source={props.icon} style={{ width: 14, height: 14 }} />
       
      </View>
    </View>
  )
}

class Timeline extends React.Component {
    
  static navigationOptions = {
    title: '项目进程',
    headerStyle: {
      backgroundColor: '#10458f',
      marginTop: Platform.OS === 'android' ? 24 : 0,
    },
    headerTintColor: '#fff',
    headerBackTitle: null,
  };

  constructor(props) {
    super(props);
    const entireTitle = props.navigation.state.params.entireTitle;
    var titleArr = entireTitle.split('：')
    var title = titleArr.length > 0 ? titleArr[0] : entireTitle
    this.state = {
      title: title,
      timelines: [],
      myInvestor: [],
    }
    this.handleStepClicked = this.handleStepClicked.bind(this);
  }

  componentDidMount() {
    newApi.getTimeline({ proj: this.props.navigation.state.params.id, page_size: 10000 })
    .then(data => {
      const timelines = data.data.map(m => {
        const transactionStatusId = m.transationStatu.transationStatus.index;
        const investorPhotoUrl = m.investor.photourl;
        const investorId = m.investor.id;
        const timeLineId = m.id;
        const transactionStatusName = m.transationStatu.transationStatus.name;
        const investorName = m.investor.username;
        return { transactionStatusId, investorPhotoUrl, investorId, timeLineId, transactionStatusName, investorName };
      });
      this.setState({ timelines });
    })
    AsyncStorage.getItem('userInfo')
    .then(data => newApi.getUserRelation({ traderuser: data.id, page_size: 10000 }))
    .then(data => {
      const myInvestor = data.data.map(item => {
        const { id, username, org, photourl } = item.investoruser
        return { id, name: username, org: org ? org.orgname : '', photoUrl: photourl }
      })
      this.setState({ myInvestor })
    })
  }

  handleStepClicked(investors) {
    const myInvestorId = this.state.myInvestor.map(item => item.id)
    const investorIds = investors.map(item => item.investorId)
    var result = []
    for (var a = 0; a < myInvestorId.length; a++) {
      var index = investorIds.indexOf(myInvestorId[a])
      if (index > -1) {
        result.push(index)
      }
    }
    if (result.length > 0) {
      this.props.navigation.navigate(
        'LatestRemark', 
        { investors: result.map(item => investors[item])}
      );
    }
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        
        <Image source={require('../images/timeline/timeLineBG.png')} style={{ position: 'absolute', width: '100%', height: '100%' }}/>

        <ScrollView>
        <View style={{ marginLeft: 44 }}>
          <View style={{ marginLeft: 5, paddingLeft: 10, paddingTop: 10, paddingRight: 48, paddingBottom: 10, borderLeftWidth: 1, borderLeftColor: 'white', }}>
            <Image source={require('../images/timeline/timeline-title-bg.png')} style={{ position: 'relative', backgroundColor: 'transparent', height: 25, width: 120 }}>
              <Text style={{ position: 'absolute', backgroundColor: 'orange', left: 16, top: Platform.OS === 'android' ? 2 : 4, color: 'white', fontSize: 16, backgroundColor: 'transparent' }}>{this.state.title}</Text>
            </Image>
          </View>
          <View style={{ width: 10, height: 10, backgroundColor: 'white', borderWidth: 1, borderColor: 'orange', borderRadius: 5, position: 'absolute', top: 18 }}></View>
        </View>

        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage1.png")} color="#FF6900" title="step1，获取项目概要" investors={this.state.timelines.filter(item=>item.transactionStatusId===1)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage2.png")} color="#2AA0AE" title="step2，签署保密协议" investors={this.state.timelines.filter(item=>item.transactionStatusId===2)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage3.png")} color="#5649B9" title="step3，获取投资备忘录" investors={this.state.timelines.filter(item=>item.transactionStatusId===3)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage4.png")} color="#F94545" title="step4，进入一期资料库" investors={this.state.timelines.filter(item=>item.transactionStatusId===4)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage5.png")} color="#0B87C1" title="step5，签署投资意向书/投资条款协议" investors={this.state.timelines.filter(item=>item.transactionStatusId===5)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage6.png")} color="#F5C12D" title="step6，进入二期资料库" investors={this.state.timelines.filter(item=>item.transactionStatusId===6)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage7.png")} color="#EB090A" title="step7，进场尽职调查" investors={this.state.timelines.filter(item=>item.transactionStatusId===7)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage8.png")} color="#2AA0AE" title="step8，签署约束性报告" investors={this.state.timelines.filter(item=>item.transactionStatusId===8)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage9.png")} color="#5649B9" title="step9，起草法律协议" investors={this.state.timelines.filter(item=>item.transactionStatusId===9)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage10.png")} color="orange" title="step10，签署法律协议" investors={this.state.timelines.filter(item=>item.transactionStatusId===10)} />
        <TimelineStep handleStepClicked={this.handleStepClicked} icon={require("../images/timeline/stepImage11.png")} color="#10458F" title="step11，完成交易" investors={this.state.timelines.filter(item=>item.transactionStatusId===11)} />
        </ScrollView> 
      </View>
    );
  }
}

export default Timeline;