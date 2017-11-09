import React from 'react';
import {
    View,
    Image,
} from 'react-native';

class ImageWithPlaceholder extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            isLoaded: false
        }
    }
    render () {
        return (
            <View style={{ position: 'relative' }}>
                { !this.state.isLoaded ? 
                <Image {...this.props} source={this.props.placeholder} />
                : null }
                <Image 
                {...this.props}
                style={{ ...this.props.style, position: this.state.isLoaded ? 'relative' : 'absolute' }}
                onLoad={() => this.setState({ isLoaded: true })}
                />
            </View>
        );
    }
}

export default ImageWithPlaceholder;