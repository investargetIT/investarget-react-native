import React from 'react'
import { View, PickerIOS, Text, TouchableOpacity } from 'react-native'


const titleStyle = {
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    height:30,
    borderBottomWidth:1,
    borderBottomColor:'#eee',
}


class PickerIOS2 extends React.Component {
    constructor(props) {
        super(props)
        this.state ={
            value: props.value,
        }
    }

    handleValueChange = (value, index) => {
        this.setState({ value })
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    handleConfirm = () => {
        this.props.onConfirm(this.state.value)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            this.setState({ value: nextProps.value })
        }
    }

    render() {
        return (
            <View>
                <View style={titleStyle}>
                    <TouchableOpacity onPress={this.handleCancel} style={{marginLeft: 16}}>
                        <Text>取消</Text>
                    </TouchableOpacity>
                    <Text>{this.props.title}</Text>
                    <TouchableOpacity onPress={this.handleConfirm} style={{marginRight: 16}}>
                        <Text>确定</Text>
                    </TouchableOpacity>
                </View>
                <PickerIOS
                    style={{height: 200}}
                    itemStyle={{fontSize: 16}}
                    selectedValue={this.state.value}
                    onValueChange={this.handleValueChange}
                >
                    {
                        this.props.options.map(option => 
                            <PickerIOS.Item key={option.value} label={option.label} value={option.value} />
                        )
                    }
                </PickerIOS>
            </View>
        )
    }
}

export default PickerIOS2