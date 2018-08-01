import React from 'react';
import {
  Text,
} from 'react-native';

class OrgBDList extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params && params.title,
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerBackTitle: null,
    }
  }

  constructor (props) {
    super (props);
    const { params } = props.navigation.state;
    this.proj = params.proj;
  }

  componentWillMount () {
    this.props.navigation.setParams({ title: this.proj.projtitle });
  }

  render () {
    return null;
  }
}

export default OrgBDList;