import React from 'react'
import { View, Text } from 'react-native'
import Toast from 'react-native-root-toast'

import * as api from '../api'



class UserInfo extends React.Component {

    static navigationOptions = {
        title: '机构信息',
        headerStyle: {
            backgroundColor: '#10458f',
        },
        headerTintColor: '#fff',
    };

    constructor(props) {
        super(props)
        this.state = {
            orgId: this.props.navigation.state.params.orgId,
            org: {},
        }
    }

    getOrgDetail = () => {
        api.getOrgDetailLang(this.state.orgId).then(data => {
            console.log('@@@',data)
            this.setState({ org: data })
        }).catch(error => {
            Toast.show(error.message, {position: Toast.positions.CENTER})
        })
    }

    componentDidMount() {
        this.getOrgDetail()
    }

    render() {

        var { orgname, orgtype, industry, currency, transactionAmountF, transactionAmountT,
             orgtransactionphase, fundSize, webSite, orgstatus, description, typicalCase,
             partnerOrInvestmentCommiterMember, decisionMakingProcess } = this.state.org
        
        orgtype = orgtype ? orgtype.name : ''
        industry = industry ? industry.industry : ''
        var currencySymbol = currency ? (currency.id == 2 ? '$' : '￥') : ''
        var transactionAmount = (transactionAmountF && transactionAmountT)
            ? (transactionAmountF + ' ~ ' + transactionAmountT + ' ' + currencySymbol) : 'N/A'
        fundSize = fundSize ? (fundSize + ' ' + currencySymbol) : 'N/A'
        orgtransactionphase = orgtransactionphase ? orgtransactionphase.map(item => item.name) : ''
        var currencyName = currency ? currency.currency : ''
        orgstatus = orgstatus ? orgstatus.name : ''

        return (
            <View style={{backgroundColor: '#fff', flex: 1, paddingTop: 16}}>
                <Row label="机构名称" content={orgname} />
                <Row label="机构类型" content={orgtype} />
                <Row label="机构行业" content={industry} />
                <Row label="交易金额" content={transactionAmount} />
                <Row label="交易阶段" content={orgtransactionphase} />
                <Row label="货币类型" content={currencyName} />
                <Row label="基金规模" content={fundSize} />
                <Row label="公司官网" content={webSite} />
                <Row label="审核状态" content={orgstatus} />
                <Row label="机构描述" content={description} />
                <Row label="典型投资案例" content={typicalCase} />
                <Row label="合伙人/投委会成员" content={partnerOrInvestmentCommiterMember} />
                <Row label="决策流程" content={decisionMakingProcess} />
            </View>
        )
    }
}


const rowStyle = {
    marginLeft: 16,
    marginRight: 16,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
}
const labelStyle = {
    width: 100,
    fontSize: 15,
    color: '#333',
}
const contentStyle = {
    flex: 1,
    fontSize: 15,
    color: '#333',
}

class Row extends React.Component {
    render() {
        return (
            <View style={rowStyle}>
                <Text style={labelStyle}>{this.props.label}：</Text>
                <Text style={contentStyle}>{this.props.content}</Text>                    
            </View>
        )
    }
}


export default UserInfo