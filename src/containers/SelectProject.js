import React from 'react';
import { 
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  FlatList,
  Keyboard,
} from 'react-native';
import ProjectItem from '../components/ProjectItem';
import * as api from '../api';
import { requestContents, hideLoading } from '../../actions';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';

class SelectProject extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '添加项目',
      headerStyle: {
        backgroundColor: '#10458f',
      },
      headerTintColor: '#fff',
      headerRight: (
        params.onPress ? 
        <TouchableOpacity style={{ marginRight: 16 }} onPress={params.onPress}>
          <Text style={{ fontSize: 15, color: '#fff' }}>确定</Text>
        </TouchableOpacity>
        : null
      )
    }
  }

  constructor (props) {
    super (props);
    this.state = {
      search: '',
      projects: [],
    }
    this.searchProject = debounce(this.searchProject, 1000);
  }
  
  componentDidMount () {
    // this.props.navigation.setParams({ onPress: this.handleSubmit });
  }
  
  handleSubmit = () => {}

  searchProject = () => {
    if (this.state.search.length < 2) return;
    Keyboard.dismiss();
    this.props.dispatch(requestContents());
    const params = {
      search: this.state.search
    };
    api.getProj(params)
    .then(result => {
      this.props.dispatch(hideLoading());
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

  handleSearchTextChange = value => {
    this.setState({ search: value }, this.searchProject);
  }

  handleSearchBtnPressed = () => {
    this.searchProject();
  }

  render() {
    return (
      <View>
        
        <View style={{ position: 'absolute', left: 0, right: 0, height: 48 }} >
          
          <View style={{ backgroundColor: 'white', paddingLeft: 8, paddingRight: 8, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{ flex: 1, fontSize: 15 }}
              placeholder="输入两个字自动检索"
              value={this.state.search}
              onChangeText={this.handleSearchTextChange}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }} onPress={this.handleSearchBtnPressed}>
              <Image
                source={require('../images/home/search.png')}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
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

export default connect()(SelectProject);
