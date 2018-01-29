import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image, TextInput, Switch } from 'react-native'
import { connect } from 'react-redux'
import { isIPhoneX } from '../utils';
import Cascader from '../components/Cascader'
import {
    receiveContinentsAndCountries, receiveIndustries, receiveTags,receiveCurrencyType,receiveTransactionPhases,receiveOrgTypes,
    filterOrg,toggleOrgFilter, clearOrgFilter, cloneTrueOrgFilter, toggleOrgFilterMultiple } from '../../actions'
import * as api from '../api'
import Select from '../components/Select'


const tabStyle = {flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',flexDirection:'row',alignItems:'center'}
const tabTextStyle = {fontSize:16,color:'#333'}
const activeTabTextStyle = {...tabTextStyle,color:'#10458f'}
const imgStyle = {width:9,height:5,marginLeft:7}
const cellStyle = {backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingLeft: 16,height: 40,borderBottomColor: '#f4f4f4',borderBottomWidth: 1}
const cellLabelStyle = {width: 80,flex: 0,fontSize: 13,color: '#333'}
const cellContentStyle = {fontSize: 13,width:'75%'}
const CATEGORY_1 = 'currency', CATEGORY_2 = 'area', CATEGORY_3 = 'industry', CATEGORY_4 = 'tag', CATEGORY_5 = 'phase', CATEGORY_6 = 'orgTypes', CATEGORY_7 ='overseas'

class OrgFilter extends React.Component {
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
                            style={{width:120,fontSize:15,padding:0}}
                            placeholder="搜索机构标题"  
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
            search: ''
        }
    }

    componentDidMount(){
    	this.props.dispatch(cloneTrueOrgFilter())
    	api.getSource('currencyType').then(data=>{
    		this.props.dispatch(receiveCurrencyType(data))
    	})
    	api.getSource('transactionPhases').then(data=>{
    		this.props.dispatch(receiveTransactionPhases(data))
    	})
    	api.getSource('orgtype').then(data=>{
    		this.props.dispatch(receiveOrgTypes(data))
    	})
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

    handleChangeSearch = (value) => {
        this.setState({ search: value })
        this.props.navigation.setParams({ value: value })
    }

    submit = () =>{
    	this.props.dispatch(filterOrg(this.state.search))
        this.props.navigation.goBack()

    }

    reset = () => {
        this.setState({
            selectedCountries: [],
            selectedIndustries: [],
            selectedTags: [],
        })

        this.props.dispatch(clearOrgFilter())
    }

    handleChangeTab = (tab) => {
        this.setState({ activeTab: tab })
    }

    changeSwitch = (value) =>{
    	this.props.dispatch(toggleOrgFilter({
    		type:'overseas',
    		id:0,
    		value
    	}))
    }

    handleChange = (type, values) => {
    	let items
    	if(type==CATEGORY_1){
    		items=this.props.currenyOptions.filter(data=>values.includes(data.value))
    	}
    	if(type==CATEGORY_5){
    		items=this.props.phasesOptions.filter(data=>values.includes(data.value))
    	}
    	if(type==CATEGORY_6){
    		items=this.props.orgTypesOptions.filter(data=>values.includes(data.value))
    	}
    	items=items.map(item=>({...item,type,id: item.value,name: item.label}))
    	this.props.dispatch(toggleOrgFilterMultiple(items))
    }

    handleItemClick = (type, item) => {
        this.props.dispatch(toggleOrgFilter({
            ...item,
            type,
            id: item.value,
            name: item.label,
        }))
    }

    render(){
    	const {countryOptions,industryOptions, tagOptions, orgFilter, currenyOptions, phasesOptions, orgTypesOptions } = this.props
    	const {activeTab} = this.state
    	const filterDown = require('../images/home/filterDown.png')
        const filterUp = require('../images/home/filterUp.png')
        const overseasItem= orgFilter.find(item=>item.type==CATEGORY_7)
    	return(
    		<View style={{flex:1}}>
                <View style={{flexDirection:'row',height:48}}>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 0)}
                    style={tabStyle}>
                        <Text style={activeTab == 0 ? activeTabTextStyle : tabTextStyle}>基本信息</Text>
                        <Image source={activeTab == 0 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 1)}
                    style={tabStyle}>
                        <Text style={activeTab == 1 ? activeTabTextStyle : tabTextStyle}>地区</Text>
                        <Image source={activeTab == 1 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 2)}
                    style={tabStyle}>
                        <Text style={activeTab == 2 ? activeTabTextStyle : tabTextStyle}>行业</Text>
                        <Image source={activeTab == 2 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={this.handleChangeTab.bind(this, 3)}
                    style={tabStyle}>
                        <Text style={activeTab == 3 ? activeTabTextStyle : tabTextStyle}>标签</Text>
                        <Image source={activeTab == 3 ? filterUp : filterDown} style={imgStyle} />
                    </TouchableOpacity>
                </View>
                {activeTab == 0 ? (
                	<View style={{flex:1,width:'100%'}}>
						<View style={cellStyle}>
							<Text style={cellLabelStyle}>投海外项目</Text>
							<Switch value={overseasItem ? overseasItem.value:null} onValueChange={this.changeSwitch.bind(this)}></Switch>
						</View>
						<View style={cellStyle}>
							<Text style={cellLabelStyle}>货币</Text>
							<Select
			                    title="请选择货币"
			                    value={orgFilter.filter(item => item.type === CATEGORY_1).map(item => item.value)}
			                    onChange={this.handleChange.bind(this,CATEGORY_1)}
			                    options={currenyOptions}
			                    multiple={true}
			                    placeholder="点击选择货币"
			                    containerStyle={{ flex: 1, height: '100%' }}
			                    style={{fontSize: 15, color: '#333'}}
			                /> 							
						</View>
						<View style={cellStyle}>
							<Text style={cellLabelStyle}>轮次</Text>
							<Select
			                    title="请选择轮次"
			                    value={orgFilter.filter(item => item.type === CATEGORY_5).map(item => item.value)}
			                    onChange={this.handleChange.bind(this,CATEGORY_5)}
			                    options={phasesOptions}
			                    multiple={true}
			                    placeholder="点击选择轮次"
			                    containerStyle={{ flex: 1, height: '100%' }}
			                    style={{fontSize: 15, color: '#333'}}
			                /> 							
						</View>
						<View style={cellStyle}>
							<Text style={cellLabelStyle}>机构类型</Text>
							<Select
			                    title="请选择机构类型"
			                    value={orgFilter.filter(item => item.type === CATEGORY_6).map(item => item.value)}
			                    onChange={this.handleChange.bind(this,CATEGORY_6)}
			                    options={orgTypesOptions}
			                    multiple={true}
			                    placeholder="点击选择机构类型"
			                    containerStyle={{ flex: 1, height: '100%' }}
			                    style={{fontSize: 15, color: '#333'}}
			                /> 							
						</View>
					</View>
                    
                ) : null}
                {activeTab == 1 ? (
                    <Cascader
                        chosenItem={orgFilter.filter(item => item.type === CATEGORY_2).map(item => item.value)} 
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_2)} 
                        options={countryOptions} />
                ) : null}
                {activeTab == 2 ? (
                    <Cascader
                        chosenItem={orgFilter.filter(item => item.type === CATEGORY_3).map(item => item.value)}
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_3)}
                        options={industryOptions} />
                ) : null}
                {activeTab == 3 ? (
                    <TagList
                        chosenItem={orgFilter.filter(item => item.type === CATEGORY_4).map(item => item.value)}
                        onItemClick={this.handleItemClick.bind(this, CATEGORY_4)}
                        options={tagOptions} />
                ) : null}
                <View style={{height:60,backgroundColor:'#fff',paddingLeft:6,paddingRight:6,paddingTop:4,paddingBottom:4}}>
                    <Text style={{fontSize:14,color:'#333'}}>已选条件:</Text>
                    <Text numberOfLines={2} style={{fontSize:13,color:'#666',lineHeight:18}}>
                        {orgFilter.map(item => item.label).join('，')}
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
    const { continentsAndCountries,industries, tags, currencyType, orgFilter, transactionPhases, orgTypes} = state.app
    
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
    var currenyOptions = currencyType.map(item=>({value:item.id, label:item.currency}))
    var phasesOptions = transactionPhases.map(item => ({ value: item.id, label: item.name }))
    var orgTypesOptions = orgTypes.map(item => ({ value: item.id, label: item.name }))

    return {
    	continentsAndCountries, 
    	transactionPhases,
    	industries, 
    	tags, 
    	orgTypes,
    	currencyType,
    	orgFilter,
    	countryOptions,
    	industryOptions, 
    	tagOptions,
    	currenyOptions,
		phasesOptions,
		orgTypesOptions,
    }
}
export default connect(mapStateToProps)(OrgFilter)