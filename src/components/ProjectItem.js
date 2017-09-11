import React from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'

const styles = StyleSheet.create({
    item: {
        padding: 7,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F4F4F4',
        backgroundColor: '#fff',
    },
    itemLeft: {
        flex: 1,
    }
})


function ProjectItem(props) {
    return (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={{display:'flex',flexDirection:'row'}}>
                    <View style={{marginTop: 2,marginRight:2,flex:0}}>
                        <Image source={require('../images/tag.png')} style={{width:16,height:16}} />
                    </View>
                    <Text style={{fontSize: 15,lineHeight: 20,flex:1}}>
                        碧溪项目：领先的水环境治理技术装备供应商
                    </Text>
                </View>
                <View style={{marginTop: 8, display: 'flex', flexDirection: 'row'}}>
                    <View style={{width: 60}}><Text style={{fontSize: 13,color:'#999'}}>中国</Text></View>
                    <View><Text style={{fontSize: 13,color:'#999'}}>环保</Text></View>
                </View>
                <View style={{marginTop: 8}}>
                    <Text style={{fontSize:13,color:'#666'}}>
                        交易规模：<Text style={{color:'#ff8f40'}}>$21,230,720</Text>
                    </Text>
                </View>
            </View>
            <View style={{flex:0}}>
                <Image
                    source={{uri: 'https://o79atf82v.qnssl.com/Web-JNHB.png'}}
                    style={{width: 120, height: 100}}
                />
            </View>
        </View>
    )
}

export default ProjectItem