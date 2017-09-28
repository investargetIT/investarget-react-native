import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'



const pCellStyle = {flexDirection:'row',alignItems:'center',height:40,paddingTop:10,paddingBottom:10,paddingLeft:40,paddingRight:40}
const pActiveCellStyle = {...pCellStyle, backgroundColor:'#fff'}
const pTextStyle = {fontSize:14,color:'#333'}
const cellStyle = {paddingTop:4,paddingBottom:4,borderBottomWidth:2,borderBottomColor:'#fff'}
const activeCellStyle = {...cellStyle,borderBottomColor:'#10458f'}
const textStyle = {fontSize:14,color:'#333'}
const activeTextStyle = {...textStyle, color:'#10458f'}

class Cascader extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            activeIndex: 0,
        }
    }

    handlePressPItem = (index) => {
        this.setState({ activeIndex: index })
    }
    
    render() {
        const { activeIndex } = this.state
        const { chosenItem, onItemClick, options } = this.props
        
        const pItem = options[activeIndex]
        const subOptions = pItem ? pItem.children : []

        return (
            <View style={{flex:1,flexDirection:'row'}}>
                <View style={{flex:1,backgroundColor:'#f6f6f6'}}>
                    <ScrollView>
                        {options.map((item, index) => (
                            <TouchableOpacity
                                key={item.value}
                                onPress={this.handlePressPItem.bind(this, index)}
                                style={activeIndex == index ? pActiveCellStyle : pCellStyle}
                            >
                                <Text style={pTextStyle}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={{flex:1,backgroundColor:'#fff'}}>
                    <ScrollView style={{paddingLeft:40,paddingRight:40}}>
                        {subOptions.map(item => (
                            <TouchableOpacity
                                key={item.value}
                                style={{flexDirection:'row',height:40,alignItems:'center'}}
                                onPress={() => onItemClick(item)}>
                                <View
                                    style={chosenItem.includes(item.value) ? activeCellStyle : cellStyle}
                                >
                                    <Text numberOfLines={2} style={chosenItem.includes(item.value) ? activeTextStyle : textStyle}>{item.label}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        )
    }
}


export default Cascader
