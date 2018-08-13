import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const cellStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 16,
  minHeight: 40,
  borderBottomColor: '#f4f4f4',
  borderBottomWidth: 1
}
const cellLabelStyle = {
  width: 80,
  flex: 0,
  fontSize: 13,
  color: '#333'
}
const cellContentStyle = {
  fontSize: 13,
  width: '75%'
}

class Cell extends React.Component {

  render() {
    const { label, content } = this.props
    const isText = typeof content === 'string';
    return (
      <View style={cellStyle} >
        <Text style={cellLabelStyle}>{label}</Text>
        {isText ?
          <Text style={cellContentStyle} numberOfLines={2}>{content}</Text>
          : content}
      </View>
    )
  }
}

class BusinessCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showCardDetail: false,
    }
  }

  render() {
    const { cardUrl } = this.props;
    return (
      <View>

        <Cell
          label="名片"
          content={cardUrl ?
            <TouchableOpacity onPress={() => this.setState({ showCardDetail: true })}>
              <Image
                style={{ width: 40, height: 28 }}
                source={{ uri: cardUrl }}
              />
            </TouchableOpacity>
            : '暂无'}
        />

        {cardUrl ?
          <Modal visible={this.state.showCardDetail} transparent={true}>
            <ImageViewer
              imageUrls={[{ url: cardUrl }]}
              saveToLocalByLongPress={false}
              onClick={() => this.setState({ showCardDetail: false })}
            />
          </Modal>
          : null}

      </View>
    );
  }
}

export default BusinessCard;