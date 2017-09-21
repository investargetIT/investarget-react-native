import React from 'react'
import { View, Text, Image, FlatList, RefreshControl, StatusBar } from 'react-native'
import ProjectItem from './ProjectItem'
import { connect } from 'react-redux'
import * as newApi from '../api'
import { updateProjectStructure, receiveContents, appendProjects } from '../../actions';


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
            projects: []
        }
    }

    componentDidMount() {
        // api.getProj().then(data => {
        //     const { count: total, data: list } = data
        //     this.setState({ projects: list })
        // })
        this.getProjects((projects, dataStructure) => {
            this.props.dispatch(updateProjectStructure(dataStructure))
            this.props.dispatch(receiveContents('', projects))
        })
    }

    onRefresh = () => {
        this.setState({ refreshing: true })
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
      getPublicAndNotMarketPlaceProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: 4,
            ismarketplace: false,
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getPublicAndMarketPlaceProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: 4,
            ismarketplace: true,
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getClosedAndNotMarketPlaceProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: 8,
            ismarketplace: false,
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getClosedAndMarketPlaceProjects = (skipCount, maxSize) => newApi.getProj(
        Object.assign(
          filterToObject(this.props.filter),
          {
            projstatus: 8,
            ismarketplace: true,
            skip_count: skipCount,
            max_size: maxSize,
          },
        )
      )
      getProjectsArray = [
        this.getPublicAndNotMarketPlaceProjects,
        this.getPublicAndMarketPlaceProjects,
        this.getClosedAndNotMarketPlaceProjects,
        this.getClosedAndMarketPlaceProjects,
      ]
    
      getProjects = callback => {
    
        const count = []
        let newArray = []
        this.getPublicAndNotMarketPlaceProjects(0, 1)
        .then(data => {
          count.push(data.count);
          return this.getPublicAndMarketPlaceProjects(0, 1);
        })
        .then(data => {
          count.push(data.count);
          return this.getClosedAndNotMarketPlaceProjects(0, 1);
        })
        .then(data => {
          count.push(data.count);
          return this.getClosedAndMarketPlaceProjects(0, 1);
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
            obj['imgUrl'] = item.industries[0].url
            obj['industrys'] = item.industries.map(i => i.name)
            obj['isMarketPlace'] = item.ismarketplace
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
          requestArr.push(this.getClosedAndMarketPlaceProjects(10000, 10))
        }
        Promise.all(requestArr)
          .then(result => {
            const projects = result.map(item => item.data).reduce((acc, val) => acc.concat(val), []).map(item => {
              var obj = {}
              obj['id'] = item.id
              obj['title'] = item.projtitle
              obj['amount'] = item.financeAmount_USD
              obj['country'] = item.country.country
              obj['imgUrl'] = item.industries[0].url
              obj['industrys'] = item.industries.map(i => i.name)
              obj['isMarketPlace'] = item.ismarketplace
              return obj
            })
            callback(projects)
          })
          // .catch(error => this.props.dispatch(handleError(error)))
      }

      loadMore = () => {
        this.getMoreProjects(projects => {
            if (projects.length > 0) {
              this.props.dispatch(appendProjects(projects))
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
                    <View style={{marginRight:8, display:'flex',flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../images/home/filter.png')} style={{width:14,height:15,marginRight:7}} />
                        <Text>筛选</Text>
                    </View>
                </View>
                <FlatList
                    style={{backgroundColor: '#f4f4f4'}}
                    data={this.props.projects}
                    keyExtractor={(item,index)=>item.id}
                    renderItem={({item, sparators}) => <ProjectItem {...item} />}
                    overScrollMode="always"
                    onEndReachedThreshold={0.5}
                    onEndReached={this.loadMore}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} colors={['#10458f']} tintColor="#10458f" />}
                />
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
