import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '../AsyncStorage';
import ProjectList from '../components/ProjectList';
import Service from './Service';
import { connect } from 'react-redux';
import RNCalendarEvents from 'react-native-calendar-events';
import Dashboard from './Dashboard';

class Home extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: '首页',
            headerBackTitle: null, 
            headerTitle: (
              <View style={{ alignSelf: 'center', backgroundColor: undefined, width: 180, height: Platform.OS === 'ios' ? 45 : 56 }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: undefined }}>
                  <Text onPress={() => params.onItemPressed('dashboard')} style={{fontSize: 18, color: params.active !== 'dashboard' ? 'rgba(255, 255, 255, 0.6)' : 'white'}}>Dashboard</Text>
                  <View style={{ flexBasis: 10, height: '100%', backgroundColor: undefined }} />
                  <Text onPress={() => params.onItemPressed('project')} style={{fontSize: 18, color: params.active !== 'project' ? 'rgba(255, 255, 255, 0.6)' : 'white'}}>项目</Text>
                  <View style={{ flexBasis: 10, height: '100%', backgroundColor: undefined }} />
                  <Text onPress={() => params.onItemPressed('service')} style={{fontSize: 18, color: params.active !== 'service' ? 'rgba(255, 255, 255, 0.6)' : 'white'}}>服务</Text>
                </View>
                <View style={{ flexBasis: 2, flexDirection: 'row' }}>
                  <View style={{ flexBasis: 2 }} />
                  <View style={{ flexBasis: 80, backgroundColor: params.active === 'dashboard' ? 'white' : undefined }} />
                  <View style={{ flex: 4 }} />
                  <View style={{ flexBasis: 30, backgroundColor: params.active === 'project' ? 'white' : undefined }} />
                  <View style={{ flex: 4 }} />
                  <View style={{ flexBasis: 30, backgroundColor: params.active === 'service' ? 'white' : undefined }} />
                  <View style={{ flexBasis: 3 }} />
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

    // 请求日历权限
    RNCalendarEvents.authorizeEventStore();
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

  determineSize = type => {
    if (this.state.active === type) {
      return { width: undefined, height: undefined, overflow: 'hidden' };
    }
    return { width: 0, height: 0, overflow: 'hidden' };
  }

  render() {
    return (
      <View style={{ flex: 1 }}>

        <View style={this.determineSize('dashboard')}> 
          <Dashboard {...this.props} />
        </View>

        <View style={{ ...this.determineSize('project'), flex: this.state.active === 'project' ? 1 : undefined }}>
          <ProjectList {...this.props} />
        </View>
        
        { this.props.currentUser ? 
        <View style={this.determineSize('service')}> 
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