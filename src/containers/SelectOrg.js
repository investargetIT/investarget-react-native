import React from 'react';
import { 
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import * as api from '../api';

function OrgItem({ orgname, description, onPress }) {
  return (
    <TouchableHighlight onPress={onPress}>
      <View style={{ backgroundColor: 'white', padding: 10 }}>
        <Text>{orgname}</Text>
        <Text style={{ marginTop: 6, color: '#999', fontSize: 12, lineHeight: 16 }} numberOfLines={2}>{description}</Text>
      </View>
    </TouchableHighlight>
  )
}

class SelectOrg extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: '选择或新增机构',
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
      orgs: [],
    }
  }
 
  componentDidMount() {
    this.searchProject();
  }

  searchProject = () => {
    const params = {
      search: this.state.search
    };
    api.getOrg(params)
    .then(result => {
      const orgs = result.data.map(item => {
        var obj = {}
        obj['id'] = item.id;
        obj['orgname'] = item.orgname;
        obj['description'] = item.description;
        return obj
      });
      this.setState({ orgs });
    })
    .catch(err => console.error(err));
  };

  projectOnPress (item) {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelectOrg(item);
  }

  handleSearchTextChange = value => {
    this.setState({ search: value }, this.searchProject);
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
              onChangeText={this.handleSearchTextChange}
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={{ height: 0.4, backgroundColor: "#CED0CE" }} />

        </View>

        <FlatList
          style={{ marginTop: 48.4 }}
          data={this.state.orgs}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item, sparators }) => <OrgItem {...item} onPress={this.projectOnPress.bind(this, item)} />}
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

export default SelectOrg;