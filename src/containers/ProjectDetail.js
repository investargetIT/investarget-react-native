import React from 'react';
import { Image, Text, View, StatusBar } from 'react-native';

class ProjectDetail extends React.Component {
    
    static navigationOptions = {
        title: '项目详情',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    render() {
        return (
            <View>
                <Text>项目详情</Text>
            </View>
        )
    }
}

export default ProjectDetail;