import React from 'react';
import { 
  View, 
  Text,
  FlatList,
  TouchableHighlight,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as api from '../api';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-root-toast';
import { requestContents, hideLoading } from '../../actions';
import ActionSheet from '../ActionSheet';

function MyPartnerOrgCell (props) {
  const { org, count, data } = props.data;
  return (
    <TouchableHighlight onPress={props.onPress} underlayColor={'lightgray'}>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 16, color: 'black' }}>{org} ({count})</Text>
        <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 14, marginTop: 4, color: 'grey' }}>{data.map(m => m.investoruser.username).join(', ')}</Text>
      </View>
    </TouchableHighlight>
  )
}

class MyPartnerOrg extends React.Component {
    static navigationOptions = {
        title: '我的投资人',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
        headerBackTitle: null,
    }

    constructor (props) {
      super(props);
      this.state = {
        data: [],
        loading: false,
      }
    }

    componentDidMount() {
      let org = [];
      api.getOrg({ trader: this.props.userInfo.id, page_size: 10000 })
      .then(data => {
        org = data.data;
        return Promise.all(
          org.map(item => api.getUserRelation({ traderuser: this.props.userInfo.id, orgs: item.id, page_size: 10 }))
        )
      })
      .then(data => {
        data.forEach(function(element, index) {
          element['id'] = org[index]['id'];
          element['org'] = org[index]['orgname'];
        }, this);
        this.setState({ data })
      })
      .catch(err => console.error(err));
    }

    separator = () => <View style={{ height: 0.3, backgroundColor: "#CED0CE", marginLeft: 10 }} />;

    renderHeader = () => (
      <TouchableHighlight onPress={this.handleAddButtonPressed} underlayColor={'lightgray'}>
      <View>
        <View style={{ flexDirection: 'row', paddingLeft: 16, paddingTop: 20, paddingBottom: 20, alignItems: 'center' }}>
        <Image source={require('../images/addwithcolor.png')} style={{width: 16, height: 16, marginRight: 10}} />
        <Text style={{ color: '#10458f', fontSize: 16 }}>添加投资人</Text>
        </View>
        <View style={{ height: 0.3, backgroundColor: "#CED0CE", marginLeft: 10 }} />
      </View>
      </TouchableHighlight>
    );

    handleItemPressed (org) {
      const { userType } = this.props.userInfo;
      this.props.navigation.navigate('MyPartner', { org, userType });
    }

    handleAddButtonPressed = () => {
      if (Platform.OS === 'ios') {
        var BUTTONS = [
          '用相机拍摄名片',
          '从相册选取名片',
          '手工录入',
          '取消',
        ];
        var CANCEL_INDEX = BUTTONS.length - 1;

        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: BUTTONS,
            cancelButtonIndex: CANCEL_INDEX,
            title: '上传名片自动添加或手工录入',
          },
          this.handleActionButtonPressed,
        );
      } else if (Platform.OS === 'android') {
        ActionSheet.showActionSheetWithOptions({
          title: '上传名片自动添加或手工录入',
          options: [
            '用相机拍摄名片',
            '从相册选取名片',
            '手工录入',
          ],
        },
        this.handleActionButtonPressed,
      );
      }
    }
  
    imagePickerCallback = response => {
      var _file = null
      if (response.didCancel) {
        // Toast.show('已取消', {position: Toast.positions.CENTER})
      } else if (response.error) {
        Toast.show(response.error, { position: Toast.positions.CENTER })
      } else {
        this.props.dispatch(requestContents());
        let file = { uri: response.uri, type: 'application/octet-stream', name: 'businessCard.jpg' }
        _file = file
        var formData = new FormData()
        formData.append('file', file)

        api.ccUpload(formData).then(data => {
          this.props.dispatch(hideLoading());
          try {
            data = JSON.parse(data)
          } catch (e) {
            this.props.navigation.navigate('AddInvestor', { file: _file })
            return
          }
          const parsedData = this.parseData(data)
          this.props.navigation.navigate('AddInvestor', { ...parsedData, file: _file, imageData: response.data })
        }, error => {
          this.props.navigation.navigate('AddInvestor', { file: _file })
        })
      }
    }

    handleActionButtonPressed = buttonIndex => {
      switch (buttonIndex) {
        case 0:
          ImagePicker.launchCamera({}, this.imagePickerCallback);
          break;
        case 1:
          ImagePicker.launchImageLibrary({}, this.imagePickerCallback);
          break;
        case 2:
          this.props.navigation.navigate('AddInvestor');
          break;
      }
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
    return <FlatList
      style={{ backgroundColor: 'white' }}
      data={this.state.data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <MyPartnerOrgCell data={item} onPress={this.handleItemPressed.bind(this, item)} />}
      ItemSeparatorComponent={this.separator}
      ListHeaderComponent={this.renderHeader}
    />
  }
}

function mapStateToProps(state) {
  const { userInfo, titles } = state.app;
  return { userInfo, titles };
}

export default connect(mapStateToProps)(MyPartnerOrg);