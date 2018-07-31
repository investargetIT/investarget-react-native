import React from 'react';
import { 
  View, 
  Text,
  FlatList,
  TouchableHighlight,
  Image,
  ActionSheetIOS,
  Platform,
  ActivityIndicator, 
  RefreshControl, 
} from 'react-native';
import * as api from '../api';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-root-toast';
import { requestContents, hideLoading, SET_INVESTOR_REFRESH_FALSE } from '../../actions';
import ActionSheet from '../ActionSheet';
 
const PAGE_SIZE = 10;

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
    static navigationOptions = ({ navigation }) =>{
        const { params } = navigation.state
        return {
        title: params && params.title || '我的投资人',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
        headerBackTitle: null,
        headerRight: params && params.title ? undefined :
        <View  style={{marginRight:8, display:'flex',flexDirection:'row',alignItems:'center'}}>
                        <Text style={{color:'white'}} onPress={()=>{params.filter&&params.filter()}}>筛选</Text>
                    </View>
        }
    }

    constructor (props) {
      super(props);

      const { params } = props.navigation.state;
      if (params) {
        const { title, filter, disableAdd } = params;
        this.title = title; 
        this.filter = filter;
        this.disableAdd = disableAdd;
      }

      this.state = {
        data: [],
        loading: false,
        isLoadingAll: false,
        isLoadingMore: false, 
        page: 0,
        filter: this.filter && this.transoformParams(this.filter) || this.transoformParams(props.trueOrgFilter),
      }
    }

    handleFilter = () =>{
      this.props.navigation.navigate('OrgFilter')
    }

    componentWillMount () {
      this.props.navigation.setParams({ title: this.title });
    }

    componentDidMount() {
      const {trueOrgFilter} =this.props
      // if(trueOrgFilter){
      //   let filter = this.transoformParams(trueOrgFilter)
      //   console.log('fil', filter)
      //   this.setState({filter},this.getData)
      // }else{
        this.getData();
      // }
      this.props.navigation.setParams({ filter: this.handleFilter })
      
    }

    transoformParams = (filters)=>{
      let area=[],currencys=[],industrys=[],isOversea=null,orgtransactionphases=[],orgtypes=[],search=null,tags=[]
        filters.forEach(item=>{
          if(item.type=='currency')
            currencys.push(item.value)
          if(item.type=='area')
            area.push(item.value)
          if(item.type=='industry')
            industrys.push(item.value)
          if(item.type=='tag')
            tags.push(item.value)
          if(item.type=='phase')
            orgtransactionphases.push(item.value)
          if(item.type=='orgTypes')
            orgtypes.push(item.value)
          if(item.type=='overseas')
            isOversea=item.value
          if(item.type=='title')
            search=item.title
        })
        let newFilter={area, currencys,industrys,isOversea,orgtransactionphases,orgtypes,search,tags}
        return newFilter
    }

    componentWillReceiveProps(nextProps){
      let { myInvestorRefresh, trueOrgFilter } = nextProps     
      if (myInvestorRefresh) {
        let filter = this.transoformParams(trueOrgFilter)
        this.setState({filter},this.getData)
        this.props.dispatch({ type: SET_INVESTOR_REFRESH_FALSE })
      }
    }

    isThereAnyFilter = () => {
      const { area, currencys, industrys, isOversea, orgtransactionphases, orgtypes, search, tags } = this.state.filter;
      if (area.length === 0 && currencys.length === 0 && industrys.length === 0 && !isOversea && orgtransactionphases.length === 0 && orgtypes.length === 0 && !search && tags.length === 0) {
        return false;
      }
      return true;
    }

    getData = isLoadingMore => {
      const {filter} = this.state
      if (isLoadingMore === undefined) {
        this.setState({ loading: true });
      }
      let org = [];
      api.getOrg({ 
        trader: this.props.userInfo.id, 
        page_size: PAGE_SIZE, 
        page_index: isLoadingMore ?  this.state.page + 1 : 1,
        ...filter 
      })
      .then(data => {
        if (!isLoadingMore && !this.isThereAnyFilter()) {
          data.data.unshift({ orgname: '暂无机构', id: 'none' });
        }
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

        setTimeout(() => this.setState({
          data: isLoadingMore ? this.state.data.concat(data) : data,
          isLoadingAll: data.length < PAGE_SIZE,
          isLoadingMore: false,
          page: isLoadingMore ? this.state.page + 1 : 1,
          loading: false, 
        }), 1000);

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
            this.props.navigation.navigate('AddInvestor', { file: _file, imageData: response.data, onGoBack: this.getData })
            return
          }
          const parsedData = this.parseData(data)
          this.props.navigation.navigate('AddInvestor', { ...parsedData, file: _file, imageData: response.data, onGoBack: this.getData })
        }, error => {
          this.props.navigation.navigate('AddInvestor', { file: _file, imageData: response.data, onGoBack: this.getData })
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
          this.props.navigation.navigate('AddInvestor', {  onGoBack: this.getData });
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

  loadMore = () => {
    if (this.state.isLoadingAll || this.state.isLoadingMore || this.state.data.length === 0) return;
    this.setState({ isLoadingMore: true });
    this.getData(true);
  }

  renderFooter = () => {
    if (this.state.data.length < PAGE_SIZE) return null;
    if (this.state.isLoadingAll) return (
      <Text style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'gray' }}>---没有更多了---</Text>
    );

    return (
      <View
        style={{
          paddingVertical: 20,
          borderColor: "#CED0CE"
        }}>
        <ActivityIndicator animating size="small" />
      </View>
    );
  };

  render() {
    return <FlatList
      style={{ backgroundColor: 'white' }}
      data={this.state.data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <MyPartnerOrgCell data={item} onPress={this.handleItemPressed.bind(this, item)} />}
      refreshControl={
        <RefreshControl 
          refreshing={this.state.loading} 
          onRefresh={this.getData} 
          colors={['#10458f']} 
          tintColor="#10458f" 
        />
      }
      ItemSeparatorComponent={this.separator}
      ListHeaderComponent={this.disableAdd ? undefined : this.renderHeader}
      onEndReachedThreshold={0.01}
      onEndReached={this.loadMore}
      ListFooterComponent={this.renderFooter}
      ListEmptyComponent={() => <View style={{flex:1,alignItems:'center',paddingTop: 60}}>
            <Image style={{ width: 100, height: 86 }} source={require('../images/emptyBox.png')} />
        </View>
      }
    />
  }
}

function mapStateToProps(state) {
  const { userInfo, titles, myInvestorRefresh,trueOrgFilter } = state.app;
  return { userInfo, titles, myInvestorRefresh,trueOrgFilter };
}

export default connect(mapStateToProps)(MyPartnerOrg);