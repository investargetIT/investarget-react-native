import React from 'react'
import { View, Text, Image, TextInput, Picker, Modal, Platform, TouchableOpacity } from 'react-native'
import PickerIOS2 from './PickerIOS2'


const pickerContainerStyle = {
    display: 'flex',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth:1,
    borderTopColor:'#ddd'
}


class Picker2 extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    handleClick = () => {
        this.setState({ visible: true })
    }

    handleCancel = () => {
        this.setState({ visible: false })
    }

    handleConfirm = (value) => {
        this.setState({ visible: false })
        this.props.onChange(value)
    }

    render() {
        
        const selectedItem = this.props.options.filter(item => item.value == this.props.value)[0]
        const selectedLabel = selectedItem ? selectedItem.label : ''
        
        if (Platform.OS == 'android') {
            return (
                <Picker mode="dropdown" selectedValue={this.props.value} onValueChange={this.props.onChange} style={this.props.style}>
                    { this.props.options.map(option => <Picker.Item key={option.value} label={option.label} value={option.value} />) }
                </Picker>
            )
        } else if (Platform.OS == 'ios') {
            return (
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...this.props.style}}>
                    <TouchableOpacity style={{position: 'absolute',zIndex: 1,width: '100%',height:'100%'}} onPress={this.handleClick}>
                    </TouchableOpacity>
                    <TextInput
                        editable={false}
                        underlineColorAndroid="transparent"
                        selectionColor="#2269d4"
                        placeholderTextColor="#999"
                        placeholder={this.props.placeholder}
                        style={{flex: 1, height: 30, fontSize: 15, marginLeft: 8}}
                        value={selectedLabel}
                    />
                    <Image
                        source={require('../images/home/filterDown.png')}
                        style={{flex: 0, width: 8,marginLeft: 8,marginRight: 16}}
                    />
                    <Modal visible={this.state.visible} animationType="slide" transparent={true}>
                        <View style={pickerContainerStyle}>
                            <PickerIOS2
                                value={this.props.value || (this.props.options.length > 0 && this.props.options[0].value)}
                                options={this.props.options}
                                onCancel={this.handleCancel}
                                onConfirm={this.handleConfirm}
                                title={this.props.title || '选择'}
                            />
                        </View>
                    </Modal>
                </View>
            )
        } else {
            return null
        }
    }
}


export default Picker2