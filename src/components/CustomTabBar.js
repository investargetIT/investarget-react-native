import React from 'react';
import { View, Text } from 'react-native';

class CustomTabBar extends React.Component {
    routeToName = {
        project: '项目',
        service: '服务',
    }
    state = {
        active: 'project'
    }
    handleTabItemOnPress(route) {
        this.setState({ active: route.routeName });
        this.props.navigation.navigate(route.routeName);
    }
    render() {
        const { routes } = this.props.navigation.state;
        return (
            <View style={{ backgroundColor: '#10458F', flexDirection: 'row', justifyContent: 'center' }}>
                {routes.map(route => (
                    <View key={route.key} style={{ borderBottomWidth: this.state.active === route.routeName ? 2 : 0, borderBottomColor: 'white', padding: 10 }}>
                        <Text style={{ fontSize: 18, color: this.state.active !== route.routeName ? 'rgba(255, 255, 255, 0.8)' : 'white' }} onPress={this.handleTabItemOnPress.bind(this, route)}>{this.routeToName[route.routeName]}</Text>
                    </View>
                ))}
            </View>
        )
    }
}

export default CustomTabBar;