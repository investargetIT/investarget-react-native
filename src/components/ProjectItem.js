import React from 'react'
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback } from 'react-native'

const styles = StyleSheet.create({
    item: {
        padding: 7,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    itemLeft: {
        flex: 1,
    }
})


function ProjectItem(props) {
    return (
        <TouchableWithoutFeedback onPress={props.onPress}>
        <View style={styles.item}>

            <View style={{ marginTop: 2, marginRight: 2, flex: 0 }}>
                <Image source={require('../images/tag.png')} style={{ width: 16, height: 16 }} />
            </View>

            <View style={styles.itemLeft}>
                <View style={{display:'flex',flexDirection:'row'}}>
                    <Text style={{fontSize: 15,lineHeight: 20,flex:1}}>
                        {props.title}
                    </Text>
                </View>
                <View style={{marginTop: 8, display: 'flex', flexDirection: 'row'}}>
                    <View style={{width: 60}}><Text style={{fontSize: 13,color:'#999'}}>{props.country}</Text></View>
                    <View><Text style={{fontSize: 13,color:'#999'}}>{props.industrys}</Text></View>
                </View>
                <View style={{marginTop: 8}}>
                    <Text style={{fontSize:13,color:'#666'}}>
                        交易规模：<Text style={{color:'#ff8f40'}}>
                            {props.country !== '中国' ? props.amount > 0 ? "$" + formatNumber(props.amount) : "N/A" : props.amount_cny > 0 ? "¥" + formatNumber(props.amount_cny) : "N/A"}
                            </Text>
                    </Text>
                </View>
            </View>
            <View style={{flex:0}}>
                <Image
                    source={{uri: props.imgUrl}}
                    style={{width: 120, height: 100}}
                />
            </View>
        </View>
        </TouchableWithoutFeedback>
    )
}

function formatNumber(number) {
    const reverseStrArr = (number + "").split("").reverse()
    const arr = reverseStrArr.reduce((pre, cur) => {
        if (pre.length > 0 && pre[pre.length - 1].length < 3) {
            const maxIndexValue = pre[pre.length - 1]
            pre[pre.length - 1] = maxIndexValue + cur
        } else {
            pre.push(cur)
        }
        return pre
    }, [])
    return arr.map(m => m.split("").reverse().join("")).reverse().join(",")
}


export default ProjectItem