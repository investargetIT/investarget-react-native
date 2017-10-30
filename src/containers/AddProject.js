import React from 'react';
import { 
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import ProjectItem from '../components/ProjectItem';
import * as api from '../api';

class AddProject extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加项目',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => { params.onPress && params.onPress() }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>保存</Text>
        </TouchableOpacity>
      )
    }
  }

  constructor (props) {
    super (props);
    this.state = {
      search: '',
      projects: [],
    }
  }
  
  componentDidMount () {
    this.props.navigation.setParams({ onPress: this.handleSubmit });
  }
  
  handleSubmit = () => {
    const params = {
      search: this.state.search
    };
    api.getProj(params)
    .then(result => {
      const projects = result.data.map(item => {
        var obj = {}
        obj['id'] = item.id
        obj['title'] = item.projtitle
        obj['amount'] = item.financeAmount_USD
        obj['country'] = item.country.country
        obj['imgUrl'] = item.industries[0].url
        obj['industrys'] = item.industries.map(i => i.name)
        obj['isMarketPlace'] = item.ismarketplace
        obj['amount_cny'] = item.financeAmount
        obj['currency'] = item.currency.id
        return obj
      });
      this.setState({ projects });
    })
    .catch(err => console.error(err));
  };

  projectOnPress (item) {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelectProject(item);
  }

  render() {
    return (
      <View>
        
        <View style={{ position: 'absolute' }} >
          
          <View style={{ height: 48, backgroundColor: 'white', paddingLeft: 8, paddingRight: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../images/home/search.png')}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <TextInput
              style={{ width: '100%', fontSize: 15 }}
              placeholder="搜索项目"
              value={this.state.search}
              onChangeText={value => this.setState({ search: value })}
            />
          </View>

          <View style={{ height: 0.4, backgroundColor: "#CED0CE" }} />

        </View>

        <FlatList
          style={{ marginTop: 48.4 }}
          data={this.state.projects}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item, sparators }) => <ProjectItem {...item} onPress={this.projectOnPress.bind(this, item)} />}
          overScrollMode="always"
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#f4f4f4' }}></View>
          )}
        />

      </View>
    );
  }
}

export default AddProject;