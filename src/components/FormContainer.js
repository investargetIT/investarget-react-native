import React from 'react'
import { View, Image, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { isIPhoneX } from '../utils';
import StatusBar from './StatusBar'

const { height: HEIGHT, width } = Dimensions.get('window')


class FormContainer extends React.Component {
    
    render() {
        return (
            <KeyboardAwareScrollView style={{flex:1}}>
                <ImageBackground source={require('../images/login/backgroundImage.png')} style={{flex:1,height:HEIGHT,alignItems:'center'}}>
                    <StatusBar backgroundColor="rgba(0,0,0,0.0)" barStyle="dark-content" />
                    <View style={{ marginTop: isIPhoneX() ? 24 : undefined, width:'100%',height: 36,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                        <TouchableOpacity style={{marginLeft: 16,width:24,height:24,alignItems:'center',justifyContent:'center'}} onPress={this.props.onBack}>
                            <Image style={{width: 30, height: 30 }} source={require('../images/login/back.png')} />
                        </TouchableOpacity>
                        <Text style={{fontSize:16,color:'#333',backgroundColor:'transparent'}}>{this.props.title}</Text>
                        <View style={{marginRight: 16,width:24,height:24,alignItems:'center',justifyContent:'center'}}></View>
                    </View>
                    <View style={{width: '76.27%',marginTop: isIPhoneX() ? 200 : 160}}>
                        { this.props.children }
                    </View>
                </ImageBackground>
            </KeyboardAwareScrollView>
        )
    }
}

export default FormContainer