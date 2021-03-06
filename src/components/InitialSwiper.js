import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import Swiper from 'react-native-swiper';

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

class InitialSwiper extends Component {

    render() {
        return (
            <Swiper showsPagination={false} loop={false}>
                <View style={styles.slide}>
                    <Image source={require('../images/swiper1.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={styles.slide}>
                    <Image source={require('../images/swiper2.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={styles.slide}>
                    <Image source={require('../images/swiper3.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={styles.slide3}>
                    <TouchableWithoutFeedback onPress={this.props.onFinish}>
                        <Image source={require('../images/swiper4.png')} style={{ width: '100%', height: '100%' }} />
                    </TouchableWithoutFeedback>
                </View>
            </Swiper>
        );
    }
}

export default InitialSwiper;