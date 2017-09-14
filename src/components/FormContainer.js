import React from 'react'
import { View, ImageBackground, Dimensions } from 'react-native'


class FormContainer extends React.Component {
    render() {

        const { height, width } = Dimensions.get('window')

        return (
            <View style={{display: 'flex', height: height, width: width}}>
                <ImageBackground source={require('../images/login/backgroundImage.png')} style={{flex:1,alignItems:'center'}}>
                    <View style={{width: '76.27%',marginTop: 200}}>
                        { this.props.children }
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

export default FormContainer