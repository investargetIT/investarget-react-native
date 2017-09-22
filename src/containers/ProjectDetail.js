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

    constructor(props) {
      super(props);
      const { state } = this.props.navigation;
      const { projectID } = state.params;

      this.state = {
        projectID
      }
    }

    render() {
        return (
            <View>
                <Text>项目详情{this.state.projectID}</Text>
            </View>
        )
    }
}

export default ProjectDetail;