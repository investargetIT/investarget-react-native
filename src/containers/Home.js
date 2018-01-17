import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '../AsyncStorage';
import ProjectList from '../components/ProjectList';
import Service from './Service';
import { connect } from 'react-redux';

class Home extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: '首页',
            headerBackTitle: null, 
            headerTitle: (
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ borderBottomWidth: params.active === 'project' ? 2 : 0, borderBottomColor: 'white', padding: 10 }}>
                       <Text onPress={() => params.onItemPressed('project')} style={{fontSize: 18, color: params.active !== 'project' ? 'rgba(255, 255, 255, 0.8)' : 'white'}}>项目</Text>
                    </View>
                    <View style={{ borderBottomWidth: params.active === 'service' ? 2 : 0, borderBottomColor: 'white', padding: 10 }}>
                        <Text onPress={() => params.onItemPressed('service')} style={{fontSize: 18, color: params.active !== 'service' ? 'rgba(255, 255, 255, 0.8)' : 'white'}}>服务</Text>
                    </View>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#10458f',
            },
            headerTintColor: '#fff',
            headerRight: <View style={{ width: 24, height: 24 }}></View>,
            headerLeft: <TouchableOpacity style={{ marginLeft: 18 }} onPress={params.onIconPressed}>
              <Image source={require('../images/usericon.png')} style={{ width: 18, height: 22 }} />
            </TouchableOpacity>
        }
    }

  constructor(props) {
    super(props);
    this.state = {
      active: 'project'
    };
    props.navigation.setParams({ 
      onIconPressed: this.handleIconPressed,
      onItemPressed: this.handleItemPressed,
      active: this.state.active
    });
  }

  handleIconPressed = () => AsyncStorage.getItem('userInfo')
    .then(data => this.props.navigation.navigate(data ? 'DrawerOpen' : 'Login'))
    .catch(error => console.error(error));

  handleItemPressed = name => {
    AsyncStorage.getItem('userInfo')
      .then(data => {
        if (!data && name === 'service') {
          this.props.navigation.navigate('Login');
        } else {
          this.props.navigation.setParams({ active: name });
          this.setState({ active: name });
        }
      })
      .catch(error => console.error(error));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser === undefined && this.props.currentUser !== undefined) {
      this.setState({ active: 'project' });
      this.props.navigation.setParams({ active: 'project' });
    }
  }

  render() {
    const size = this.state.active != 'service' ? 0 : undefined;
    return (
      <View style={{ flex: 1 }}>

        <View style={{ flex: this.state.active === 'project' ? 1 : undefined }}>
          <ProjectList {...this.props} />
        </View>
        
        { this.props.currentUser ? 
        <View style={{ width: size, height: size }}> 
          <Service {...this.props} />
        </View>
        : null }

      </View>
    );
  }
}

function mapStateToProps(state) {
   const { userInfo: currentUser } = state.app;
   return { currentUser }; 
}

export default connect(mapStateToProps)(Home);