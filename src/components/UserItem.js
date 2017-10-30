import React from 'react';
import {
    TouchableOpacity,
    View,
    Image,
    Text,
} from 'react-native';

function UserItem(props) {
    const { username, photoUrl, org, title } = props
    const imgSource = photoUrl ? { uri: photoUrl } : require('../images/userCenter/defaultAvatar.png')

    return (
        <TouchableOpacity onPress={props.onSelect}>
            <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 16, paddingTop: 24 }}>
                <Image source={imgSource} style={{ width: 50, height: 50, marginRight: 16, borderRadius: 25 }} />
                <View style={{ justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, color: '#333' }} numberOfLines={1}>{org}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 120, marginRight: 20, fontSize: 16, color: '#333' }} numberOfLines={1}>{username}</Text>
                        <Text style={{ fontSize: 13, color: '#999' }} numberOfLines={1}>{title}</Text>
                    </View>
                </View>
            </View>
            {props.selected ? (
                <View style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.3)', zIndex: 1 }}></View>
            ) : null}
        </TouchableOpacity>
    )
}

export default UserItem;