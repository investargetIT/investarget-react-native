import React from 'react'
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  RefreshControl, 
  StatusBar, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  NativeModules,
  Platform, 
} from 'react-native';
import ProjectItem from './ProjectItem'
import { connect } from 'react-redux'
import * as newApi from '../api'
import { 
  updateProjectStructure, 
  receiveContents, 
  appendProjects, 
  SET_NEED_REFRESH_FALSE, 
  requestContents 
} from '../../actions';
import Login from '../containers/Login';
import fs from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import Spinner from 'react-native-loading-spinner-overlay';


class ProjectList extends React.Component {

    static navigationOptions = {
        title: 'Home',
        tabBarIcon: ({ focused, tintColor }) => {
            const image = focused ? require('../images/tabbar/home_fill.png') : require('../images/tabbar/home.png')
            return <Image source={image} style={{width:24,height:24,resizeMode:'cover'}} />
        },
        tabBarLabel: '主页',
    }

    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            projects: [],
            isLoadingAll: false, 
            isDownloading: false, 
        }
        this.isLoadingMore = false;
    }

    componentWillReceiveProps(nextProps) {
      const { needRefresh } = nextProps
      if (needRefresh) {
        this.onRefresh()
        this.props.dispatch({ type: SET_NEED_REFRESH_FALSE })
      }
    }

    componentDidMount() {
      if (Platform.OS === 'android') {
        this.checkUpdate();
      }
      if (this.props.projects.length === 0) {
       this.onRefresh(); 
      }
    }

    onRefresh = () => {
        this.setState({ refreshing: true, isLoadingAll: false });
        this.getProjects((projects, dataStructure) => {
          this.props.dispatch(updateProjectStructure(dataStructure))
          this.props.dispatch(receiveContents('', projects))
          this.setState({ refreshing: false })
      })
    }

    convertIntToArray(start, length) {
        const array = []
        for (var i = start; i < (start + length); i++) {
          array.push(i)
        }
        return array
      }
      intersectArray(array1, array2) {
        const result = []
        array1.forEach(item => {
          if (array2.includes(item)) {
            result.push(item)
          }
        })
        return result
      }
      getPublicProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: 4,
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getClosedProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: [6, 7, 8],
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getProjectsArray = [
        this.getPublicProjects,
        this.getClosedProjects,
      ]
    
      getProjects = callback => {
    
        const count = []
        let newArray = []
        this.getPublicProjects(0, 1)
        .then(data => {
          count.push(data.count);
          return this.getClosedProjects(0, 1);
        })
        .then(data => {
          count.push(data.count);
          newArray = count.reduce((acc, val) => {
            var startIndex = 0
            if (acc.length > 0) {
              for (var a = acc.length - 1; a >= 0; a--) {
                var startArr = acc[a]
                if (startArr.length > 0) {
                  startIndex = startArr[startArr.length - 1]
                  break
                }
              }
            }
            acc.push(this.convertIntToArray(startIndex + 1, val))
            return acc
          }, [])
          const intersect = newArray.map(item => this.intersectArray(item, this.convertIntToArray(1, 10)))
          const requestArr = []
          intersect.forEach((item, index) => {
            if (item.length > 0) {
              requestArr.push(this.getProjectsArray[index](item[0] - newArray[index][0], item.length))
            }
          })
          return Promise.all(requestArr)
        })
        .then(result => {
          const projects = result.map(item => item.data).reduce((acc, val) => acc.concat(val), []).map(item => {
            var obj = {}
            obj['id'] = item.id
            obj['title'] = item.projtitle
            obj['amount'] = item.financeAmount_USD
            obj['country'] = item.country.country
            obj['imgUrl'] = item.industries && item.industries.length > 0 ? item.industries[0].url : ''
            obj['industrys'] = item.industries ? item.industries.map(i => i.name) : []
            obj['isMarketPlace'] = false 
            obj['amount_cny'] = item.financeAmount
            obj['currency'] = item.currency.id
            return obj
          })
          callback(projects, newArray);
        })
        // .catch(error => this.props.dispatch(handleError(error)))
      }

      getMoreProjects = callback => {
        const intersect = this.props.projectStructure.map(item => this.intersectArray(item, this.convertIntToArray(this.props.projects.length + 1, 10)))
        const requestArr = []
        intersect.forEach((item, index) => {
          if(item.length > 0) {
            requestArr.push(this.getProjectsArray[index](item[0] - this.props.projectStructure[index][0], item.length))
          }
        })
        if (requestArr.length === 0) {
          requestArr.push(this.getClosedProjects(10000, 10))
        }
        Promise.all(requestArr)
          .then(result => {
            console.log(result);
            const projects = result.map(item => item.data).reduce((acc, val) => acc.concat(val), []).map(item => {
              var obj = {}
              obj['id'] = item.id
              obj['title'] = item.projtitle
              obj['amount'] = item.financeAmount_USD
              obj['country'] = item.country.country
              obj['imgUrl'] = item.industries && item.industries.length > 0 ? item.industries[0].url : ''
              obj['industrys'] = item.industries ? item.industries.map(i => i.name) : []
              obj['isMarketPlace'] = false 
              obj['amount_cny'] = item.financeAmount
              obj['currency'] = item.currency.id
              return obj
            })
            callback(projects)
          })
          // .catch(error => this.props.dispatch(handleError(error)))
      }

      loadMore = () => {
        if (this.isLoadingMore || this.props.projects.length === 0) return;
        this.isLoadingMore = true;
        this.getMoreProjects(projects => {
            if (projects.length > 0) {
              this.props.dispatch(appendProjects(projects))
            } else {
              this.setState({ isLoadingAll: true });
            }
            this.isLoadingMore = false;
        })
      }

      projectOnPress = item => {
        if (this.props.userInfo) {
          this.props.navigation.navigate('ProjectDetail', { project: item });
        } else {
          this.props.navigation.navigate('Login');
        }
        
      }

      renderFooter = () => {
        if (this.props.projects.length === 0) return null;
        if (this.state.isLoadingAll) return (
          <Text style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'gray' }}>---没有更多了---</Text>
        );
    
        return (
          <View
            style={{
              paddingVertical: 20,
              borderTopWidth: 1,
              borderColor: "#CED0CE"
            }}>
            <ActivityIndicator animating size="small" />
          </View>
        );
      };

      checkUpdate = () => {
        // const body = {
        //   build: 3, 
        //   path: 'https://www.investarget.com/downloadapp/android/android.apk', 
        //   version: 'v1.0.0', 
        //   description: '1.优化实际的的撒的你解答\n2.的撒的三角吃的舒服\n3.的撒的你坚持的是非得失'
        // };
        // newApi.addAndroidVersion(body)
        //   .then(result => console.log(result))
        //   .catch(error => console.error(error));
        // return;
        newApi.getAndroidVersion()
          .then(result => {
            const currentBuildNumber = DeviceInfo.getBuildNumber();
            const latestBuildNumber = result.map(m => m.build).reduce((a, b) => Math.max(a, b), 0);
            if (latestBuildNumber > currentBuildNumber) {
              const version = result.filter(f => f.build === latestBuildNumber)[0];
              Alert.alert(
                '下载最新版本' + (version.version || ''), 
                version.description || '',
                [
                  {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: '确定', onPress: () => this.downloadAndroidApk(version.path)},
                ],
                { cancelable: false }
              );
            }
          })
          .catch(error => console.error(error));
      }

      downloadAndroidApk = path => {
        this.setState({ isDownloading: true });
        var filePath = fs.DocumentDirectoryPath + '/com.investargetnative.apk';
        fs.downloadFile({
          fromUrl: path,
          toFile: filePath,
          progress: res => {
            console.log((res.bytesWritten / res.contentLength).toFixed(2));
          },
          progressDivider: 1
        }).promise.then(result => {
          this.setState({ isDownloading: false });
          if (result.statusCode == 200) {
            NativeModules.InstallApk.install(filePath);
          }
        })
      }
      
    render() {
        return (
            <View style={{flex:1}}>
                
                

                <View style={{height:45,backgroundColor: '#F4F4F4',display: 'flex',flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{marginLeft:8,borderLeftWidth:2,borderLeftColor:'#10458f',paddingLeft:8}}>
                        <Text>项目推荐</Text>
                    </View>
                    <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Filter')}} style={{marginRight:8, display:'flex',flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../images/home/filter.png')} style={{width:14,height:15,marginRight:7}} />
                        <Text>筛选</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    style={{backgroundColor: '#f4f4f4'}}
                    data={this.props.projects}
                    keyExtractor={(item,index)=>item.id}
                    renderItem={({item, sparators}) => <ProjectItem {...item} onPress={this.projectOnPress.bind(this, item)} />}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} colors={['#10458f']} tintColor="#10458f" />}
                    ItemSeparatorComponent={() => (
                        <View style={{height:1,backgroundColor:'#f4f4f4'}}></View>
                    )}
                    ListFooterComponent={this.renderFooter}
                />

            <Spinner visible={this.state.isDownloading} />

            </View>
        )
    }
}

function filterToObject(data) {
    const country = data.filter(item => item.type === 'area').map(item => item.id)
    const industries = data.filter(item => item.type === 'industry').map(item => item.id)
    const tags = data.filter(item => item.type === 'tag').map(item => item.id)
    const search = data.filter(item => item.type === 'title').map(item => item.title)[0]
    return { country, industries, tags, search }
}

function mapStateToProps(state) {
    const { projects, needRefresh, userInfo, isFetching, projectStructure, isLogin } = state.app
    const filter = state.app.trueFilter
    return { projects, filter, needRefresh, userInfo, isFetching, projectStructure, isLogin }
}

export default connect(mapStateToProps)(ProjectList)
