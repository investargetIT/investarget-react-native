import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import { connect } from 'react-redux'

import Cascader from '../components/Cascader'
import {
    receiveContinentsAndCountries, receiveIndustries, receiveTags,
    toggleFilter, searchProject, clearFilter, cloneTrueFilter } from '../../actions'
import * as api from '../api'


const tabStyle = {flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',flexDirection:'row',alignItems:'center'}
const tabTextStyle = {fontSize:16,color:'#333'}
const activeTabTextStyle = {...tabTextStyle,color:'#10458f'}
const imgStyle = {width:9,height:5,marginLeft:7}

const CATEGORY_1 = 'area', CATEGORY_2 = 'industry', CATEGORY_3 = 'tag'


class Filter extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params={} } = navigation.state
        return {
            headerTitle: (
                <View style={{flexDirection:'row',width:'100%',justifyContent:'center',alignItems:'center'}}>
                    <View style={{width:240,height:30,backgroundColor:'#fff',borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                        <Image source={require('../images/home/search.png')} style={{width:20,height:20,marginRight:8}} />
                        <TextInput
                            underlineColorAndroid="transparent"
                            selectionColor="#2269d4"
                            placeholderTextColor="#999"
                            style={{width:120,fontSize:15}}
                            placeholder="搜索项目标题"
                            value={params.value}
                            onChangeText={(value) => { params.onChange && params.onChange(value) }}
                        />
                    </View>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: <View style={{width:24,height:24}}></View>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0,
            search: '',
        }
    }

    handleChangeTab = (tab) => {
        this.setState({ activeTab: tab })
    }

    handleItemClick = (type, item) => {
        this.props.dispatch(toggleFilter({
            ...item,
            type,
            id: item.value,
            name: item.label,
        }))
    }

    handleChangeSearch = (value) => {
        this.setState({ search: value })
        this.props.navigation.setParams({ value: value })
    }

    reset = () => {
        this.setState({
            selectedCountries: [],
            selectedIndustries: [],
            selectedTags: [],
        })

        this.props.dispatch(clearFilter())
    }
    
    submit = () => {
        this.props.dispatch(searchProject(this.state.search))
        this.props.navigation.goBack()
    }

    componentDidMount() {
        // todo 从 redux 读取 filter 数据
        this.props.dispatch(cloneTrueFilter())
        
        api.getSource('country').then(data => {
            this.props.dispatch(receiveContinentsAndCountries(data))
        })
        api.getSource('industry').then(data => {
            this.props.dispatch(receiveIndustries(data))
        })
        api.getSource('tag').then(data => {
            this.props.dispatch(receiveTags(data))
        })

        this.props.navigation.setParams({ value: this.state.search, onChange: this.handleChangeSearch })
    }

    render() {
        const { countryOptions, industryOptions, tagOptions, filter } = this.props
        const { activeTab, selectedCountries, selectedIndustries, selectedTags } = this.state

        const filterDown = require('../images/home/filterDown.png')
        const filterUp = require('../images/home/filterUp.png')

        return (
            <View style={{flex:1}}>
                <View style={{flexDirection:'row',height:48}}>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 0)}
                    style={tabStyle}>
                        <Text style={activeTab == 0 ? activeTabTextStyle : tabTextStyle}>地区</Text>
                        <Image source={activeTab == 0 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 1)}
                    style={tabStyle}>
                        <Text style={activeTab == 1 ? activeTabTextStyle : tabTextStyle}>行业</Text>
                        <Image source={activeTab == 1 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 2)}
                    style={tabStyle}>
                        <Text style={activeTab == 2 ? activeTabTextStyle : tabTextStyle}>标签</Text>
                        <Image source={activeTab == 2 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                </View>
                {activeTab == 0 ? (
                    <Cascader
                        chosenItem={filter.filter(item => item.type === CATEGORY_1).map(item => item.value)} 
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_1)} 
                        options={countryOptions} />
                ) : null}
                {activeTab == 1 ? (
                    <Cascader
                        chosenItem={filter.filter(item => item.type === CATEGORY_2).map(item => item.value)}
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_2)}
                        options={industryOptions} />
                ) : null}
                {activeTab == 2 ? (
                    <TagList
                        chosenItem={filter.filter(item => item.type === CATEGORY_3).map(item => item.value)}
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_3)}
                        options={tagOptions} />
                ) : null}
                <View style={{height:60,backgroundColor:'#fff',paddingLeft:6,paddingRight:6,paddingTop:4,paddingBottom:4}}>
                    <Text style={{fontSize:14,color:'#333'}}>已选条件:</Text>
                    <Text numberOfLines={2} style={{fontSize:13,color:'#666',lineHeight:18}}>
                        {filter.map(item => item.label).join('，')}
                    </Text>
                </View>
                <View style={{flexDirection:'row',height:48}}>
                    <TouchableOpacity onPress={this.reset} style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#71a2e5'}}>
                        <Text style={{fontSize:16,color:'#fff'}}>清空</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.submit} style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#10458f'}}>
                        <Text style={{fontSize:16,color:'#fff'}}>确定</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}


const tagStyle = {width:'26.6667%',height:26,justifyContent:'center',marginTop:8,marginBottom:8,marginLeft:'3.3333%',marginRight:'3.3333%',borderWidth:1,borderColor:'#ccc',borderRadius:4}
const activeTagStyle = {...tagStyle, backgroundColor:'#10458f',borderColor:'#10458f'}
const tagTextStyle = {textAlign:'center',fontSize:14,color:'#555'}
const activeTagTextStyle = {...tagTextStyle, color:'#fff'}

function TagList({ chosenItem, onItemClick, options }) {
    return (
        <View style={{flex:1,width:'100%'}}>
            <ScrollView>
                <View style={{width:'100%',paddingTop:8,paddingBottom:8,backgroundColor:'#f6f6f6',flexDirection:'row',flexWrap:'wrap'}}>
                {options.map(item => (
                    <TouchableOpacity
                        key={item.value}
                        style={chosenItem.includes(item.value) ? activeTagStyle : tagStyle}
                        onPress={() => { onItemClick(item) }}
                    >
                        <Text
                            numberOfLines={1}
                            style={chosenItem.includes(item.value) ? activeTagTextStyle : tagTextStyle}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                </View>
            </ScrollView>
        </View>
    )
}



function mapStateToProps(state) {
    const { continentsAndCountries, industries, tags, filter } = state.app
    
    var countryOptions = continentsAndCountries.filter(item => item.parent == null)
        .map(item => ({ value: item.id, label: item.country }))
    countryOptions.forEach(pItem => {
        pItem['children'] = continentsAndCountries.filter(item => item.parent == pItem.value)
            .map(item => ({ value: item.id, label: item.country }))
    })

    var industryOptions = industries.filter(item => item.isPindustry)
        .map(item => ({ value: item.id, label: item.industry }))
    industryOptions.forEach(pItem => {
        pItem['children'] = industries.filter(item => item.Pindustry == pItem.value)
            .map(item => ({ value: item.id, label: item.industry }))
    })

    var tagOptions = tags.map(item => ({ value: item.id, label: item.name }))

    return { continentsAndCountries, industries, tags, filter, countryOptions, industryOptions, tagOptions }
}

export default connect(mapStateToProps)(Filter)
