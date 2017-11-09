import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import ImageWithPlaceholder from './ImageWithPlaceholder';

const cardStyle = {
    width: 72,
    justifyContent: 'space-between',
}
const avatarStyle = {
    width: 72,
    height: 72,
    marginBottom: 8,
    borderRadius: 36
}
const orgWrapStyle = {
    borderLeftColor: '#10458f',
    borderLeftWidth: 2,
    marginBottom: 8,
}
const orgStyle = {
    paddingLeft: 4-2,
    paddingRight: 4,
    fontSize: 13,
    color: '#666',
    textAlign: 'center'
}
const userStyle = {
    fontSize: 12,
    color: '#999',
    textAlign: 'center'
}


class PartnerCard extends React.Component {
    
    render() {
        const { photoUrl, orgName, userName } = this.props
        const imgSource = photoUrl ? { uri: photoUrl } : require('../images/userCenter/defaultAvatar.png')


        return (
            <TouchableOpacity style={{...cardStyle, ...this.props.style}} onPress={this.props.onPress}>
                <ImageWithPlaceholder source={imgSource} style={avatarStyle} placeholder={require('../images/userCenter/defaultAvatar.png')} />
                <View style={orgWrapStyle}>
                    <Text numberOfLines={1} style={orgStyle}>{orgName}</Text>
                </View>
                <Text numberOfLines={1} style={userStyle}>{userName}</Text>
            </TouchableOpacity>
        )
    }
}

export default PartnerCard
