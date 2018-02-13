import * as newApi from './api'
import { 
  Dimensions,
  Platform, 
} from 'react-native';

export function convertContinent(item) {
    const { areaCode, bucket, country, id, key, level, parent, url } = item
    return { continentName: country, id }
}

export function convertCountry(item) {
    const { areaCode, bucket, country, id, key, level, parent, url } = item
    return { areaCode, continentId: parent, countryName: country, id, url }
}

export function convertIndustry(item) {
    const { Pindustry, bucket, id, industry, isPindustry, key, url } = item
    return { bucket, id, imgUrl: url, industryName: industry, key, pIndustryId: Pindustry }
}

export function convertTag(item) {
    const { hotpoint, id, name } = item
    return { id, tagName: name }
}

export function convertTitle(item) {
    const { id, name } = item
    return { id, titleName: name }
}

export function convertOrg(item) {
    const { description, id, orgname } = item
    return { description, id, name: orgname }
}

export function convertOrgArea(item) {
    const { id, name } = item
    return { id, areaName: name }
}

// export function convertUserType(groups) {
//     const groupIds = groups.map(item => item.id)
//     if (groupIds.includes(3)) {
//         return 4 // 管理员
//     } else {
//         if (groupIds.includes(1) || groupIds.includes(4)) {
//             return 1 // 投资人
//         } else if (groupIds.includes(2) || groupIds.includes(5)) {
//             return 3 // 交易师
//         } else {
//             // 暂时不管
//         }
//     }
// }


export function convertProjStatus(item) {
    const { id, name } = item
    return { id, statusName: name }
}

export function convertProjIndustry(item) {
    const { bucket, industry, key, name, url } = item
    return { bucket, id: industry, imgUrl: url, industryName: name, key }
}

export function convertProjCharacter(item) {
    const { character, id } = item
    return { id, characterC: character }
}

export function converCurrency(item) {
    const { currency, id } = item
    return { id, currencyName: currency }
}


export function convertUserInfo(user_info, permissions) {
    var userType
    if (permissions.includes('usersys.as_admin')) {
        userType = 4
    } else {
        if (permissions.includes('usersys.as_trader')) {
            userType = 3
        } else {
            userType = 1
        }
    }

    return {
        auditStatus: user_info.userstatus.id,
        cardBucket: user_info.cardBucket,
        cardKey: user_info.cardKey,
        cardUrl: user_info.cardKey ? 'https://o79atf82v.qnssl.com/' + user_info.cardKey : null,
        // 使用 org 表示 company
        company: user_info.org && convertOrg(user_info.org).name,
        country: user_info.country && convertCountry(user_info.country) ,
        // creationTime
        departMent: user_info.department,
        emailAddress: user_info.email,
        // 没用用到这个字段，暂时不管 v2: 0,1,2  v3: false, true
        // gender: user_info.gender,
        // head
        // headId
        id: user_info.id,
        // isActive
        // lastLoginTime
        // mandate
        mobile: user_info.mobile,
        mobileAreaCode: user_info.mobileAreaCode,
        name: user_info.username,
        // name_en
        org: user_info.org && convertOrg(user_info.org),
        orgArea: user_info.orgarea && convertOrgArea(user_info.orgarea),
        // partnerId
        // partnerName
        password: user_info.password,
        photoBucket: user_info.photoBucket,
        photoKey: user_info.photoKey,
        photoUrl: user_info.photourl,
        // profession
        // professionId
        // refrences
        // referencesId
        // school
        // schoolId
        // sourceofinformation
        title: user_info.title && convertTitle(user_info.title),
        token: user_info.token,
        userTags: user_info.tags ? user_info.tags.map(i => convertTag(i)) : [],
        // 暂时使用用户组转换，后面加上权限后，这里可以删除了
        userType: userType,
        // 好像没用到
        // username: user_info.username,
        weChat: user_info.wechat,
        permissions
    }
}


export function convertFavoriteProject(proj) {

    const item = {
        id: proj.id,
        titleC: proj.projtitle,
        financedAmount: proj.financeAmount, // fix spell error
        country: proj.country && convertCountry(proj.country),
        industrys: proj.industries ? proj.industries.map(item => convertIndustry(item)) : [],
    }

    return {
        'id': item.id,
        'title': item.titleC,
        'amount': item.financedAmount,
        'country': item.country && item.country.countryName,
        'imgUrl': item.industrys[0] && item.industrys[0].imgUrl,
        'industrys': item.industrys ? item.industrys.map(i => i.industryName) : [],
    }
}


// export function convertListProject(project) {
//     return {
//         basic_Status: convertProjStatus(project.projstatus),
//         // code
//         // companyValuation
//         // companyValuation_USD
//         // companyYear
//         // contactPerson
//         country: project.country && convertCountry(project.country),
//         // creationTime
//         // currencyType
//         // eMail
//         // financeIsPublic
//         financedAmount: project.financedAmount,
//         financedAmount_USD: project.financedAmount_USD,
//         // finances
//         // hasPublicDataRoom
//         id: project.id,
//         industrys: project.industries ? project.industries.map(item => convertIndustry(item)) : [],
//         isMarketPlace: project.ismarketplace,
//         ishidden: project.isHidden,
//         // phoneNumber
//         // realNameC
//         // realNameE
//         tags: project.tags ? project.tags.map(item => convertTag(item)) : [],
//         titleC: project.projtitle,
//         // titleE
//         userId: project.supportUser.id,
//     }
// }

export function convertProjFinance(item) {
    return {
        ebitda: item.EBITDA,
        fYear: item.fYear,
        grossMerchandiseValue: item.grossMerchandiseValue,
        grossProfit: item.grossProfit,
        netIncome: item.netIncome,
        netIncome_USD: item.netIncome_USD,
        operationalCashFlow: item.operationalCashFlow,
        revenue: item.revenue,
        revenue_USD: item.revenue_USD,
        shareholdersequity: item.stockholdersEquity,
        totalAsset: item.totalAsset,
    }
}

export function convertProjAttachment(item) {
    return {
        bucket: item.bucket,
        fileName: item.filename,
        fileType: item.filetype,
        key: item.key,
    }
}

export function convertProjFormat(proj) {
    return {
        brandSalesChannelC: proj.brandChannel,
        businessModelC: proj.businessModel,
        financingRecordE: proj.financingHistory,
        managementC: proj.managementTeam,
        operatingFiguresC: proj.operationalData,
        partnersC: proj.Businesspartners,
        productTechnologyC: proj.productTechnology,
        targetMarketC: proj.targetMarket,
        useofProceedC: proj.useOfProceed,
    }
}


export function convertDetailProject(proj) {
    return {
        b_introducteC: proj.p_introducte,
        // b_introducteE
        basic_Status: convertProjStatus(proj.projstatus),
        c_DescriptionC: proj.c_description,
        // c_DescriptionE
        character: convertProjCharacter(proj.character),
        // code
        companyValuation: proj.companyValuation,
        companyValuation_USD: proj.companyValuation_USD,
        companyYear: proj.companyYear,
        contactPerson: proj.contactPerson,
        country: convertCountry(proj.country),
        creationTime: proj.createdtime,
        currencyType: converCurrency(proj.currency),
        eMail: proj.email,
        financeIsPublic: proj.financeIsPublic,
        financedAmount: proj.financeAmount,
        financedAmount_USD: proj.financeAmount_USD,
        finances: proj.finance ? proj.finance.map(item => convertProjFinance(item)) : [],
        // hasPublicDataRoom
        id: proj.id,
        industrys: proj.industries ? proj.industries.map(item => convertProjIndustry(item)) : [],
        isMarketPlace: proj.ismarketplace,
        ishidden: proj.isHidden,
        phoneNumber: proj.phoneNumber,
        projectAttachment: proj.attachment ? proj.attachment.map(item => convertProjAttachment(item)) : [],
        projectFormat: convertProjFormat(proj),
        // realNameC
        // realNameE
        tags: proj.tags ? proj.tags.map(item => convertTag(item)) : [],
        titleC: proj.projtitle,
        // titleE
        transactionTypes: proj.transactionType,
        userId: proj.supportUser.id,
    }
}


export function convertOrganization(org) {
    return {
        address: org.address,
        auditStatus: org.orgstatus.id,
        companyEmail: org.companyEmail,
        currency: org.currency.id,
        decisionCycle: org.decisionCycle,
        decisionMakingProcess: org.decisionMakingProcess,
        description: org.description,
        fundSize: org.fundSize,
        fundSize_USD: org.fundSize_USD,
        id: org.id,
        industry: org.industry && convertIndustry(org.industry),
        name: org.orgname,
        // nameEn:
        // orgAreas: [{areaName,id}]
        orgType: org.orgtype.id,
        overSeasProject: org.investoroverseasproject,
        partnerOrInvestmentComitteeMember: org.partnerOrInvestmentCommiterMember,
        phone: org.mobile, // ? org.areaCode
        stockCode: org.orgcode,
        transactionAmountF: org.transactionAmountF,
        transactionAmountF_USD: org.transactionAmountF_USD,
        transactionAmountT: org.transactionAmountT,
        transactionAmountT_USD: org.transactionAmountT_USD,
        transactionPhases: org.orgtransactionphase,
        typicalCase: org.typicalCase,
        weChat: org.weChat,
        webSite: org.webSite,
    }
}


export function convertUserBasic(user) {
    return {
        company: user.org && user.org.orgname,
        emailAddress: user.email,
        id: user.id,
        mobile: user.mobile,
        name: user.username,
        org: convertOrg(user.org),
        photoBucket: user.photoBucket,
        photoKey: user.photoKey,
        photoUrl: user.photourl,
        title: convertTitle(user.title),
        userTags: user.tags ? user.tags.map(item => convertTag(item)) : [],
        weChat: user.wechat,
    }
}


export function convertListTimeline(item) {
    return {
        alertCycle: item.transationStatu.alertCycle,
        closeDate: item.closeDate,
        investorId: item.investor.id,
        investorName: item.investor.username,
        investorOrg: item.org.orgname, // 额外请求
        investorOrgId: item.org.id,
        isClose: item.isClose,
        nextAlertTime: item.transationStatu.inDate,
        projectId: item.proj.id,
        projectName: item.proj.projtitle,
        remainingAlertDays: Math.ceil(item.transationStatu.remainingAlertDay), // 转成整数
        remark: item.remark.remark, // 额外请求
        supplierId: item.supportor.id,
        supplierName: item.supportor.username,
        timeLineId: item.id,
        transactionId: item.trader.id,
        transactionName: item.trader.username,
        transactionStatusId: item.transationStatu.transationStatus.id,
        transactionStatusName: item.transationStatu.transationStatus.name,
    }
}

export function convertDetailTimeline(item) {
    return {
        alertCycle: item.transationStatu.alertCycle,
        closeDate: item.closeDate,
        inDate: item.transationStatu.inDate,
        isClose: item.isClose,
        transactionStatusId: item.transationStatu.transationStatus.id,
    }
}


export function convertTimelineRemark(item) {
    return {
        creationTime: item.createdtime,
        id: item.id,
        remark: item.remark,
    }
}


export function convertMessage(item) {
    return {
        businessId: item.sourceid,
        creationTime: item.created,
        id: item.id,
        isread: item.isRead,
        messageType: item.sourcetype,
        readTime: item.readtime,
        receiver: item.receiver,
        sender: item.sender,
        // 设成和 id 一样
        tid: item.id,
        title: item.messagetitle,
        // 没有，加上
        content: item.content, 
    }
}


export function getContinentsAndCountries() {
    return newApi.getSource('country')
        .then(data => {
        
            const rawCountries = data.map(item => {
                const { areaCode, bucket, country, id, key, level, parent, url } = item
                if (level == 1) {
                    return { continentName: country, id }
                } else if (level == 2) {
                    return { areaCode, continentId: parent, countryName: country, id, url }
                }
            })
            
            const continentsAndCountries = rawCountries.filter(item => 'continentName' in item)
            continentsAndCountries.forEach(item => {
                item['countries'] = rawCountries.filter(subItem => subItem.continentId == item.id)
            })
            
            return continentsAndCountries
        })
        .catch(error => {
            console.error(error)
        })
}


export function getIndustries() {
    return newApi.getSource('industry')
        .then(data => {

            const rawIndustries = data.map(item => {
                const { Pindustry, bucket, id, industry, isPindustry, key, url } = item
                return { bucket, id, imgUrl: url, industryName: industry, key, pIndustryId: Pindustry }
            })

            const industries = rawIndustries.filter(item => item.id == item.pIndustryId)
            industries.forEach(item => {
                item['subIndustries'] = rawIndustries.filter(subItem => {
                return subItem.pIndustryId == item.id && subItem.id != item.id
                })
            })

            return industries
        })
        .catch(error => {
            console.error(error)
        })
}


export function getTags() {
    return newApi.getSource('tag')
        .then(data => {

            const tags = data.map(item => {
                const { hotpoint, id, name } = item
                return { id, tagName: name }
            })

            return tags
        })
        .catch(error => {
            console.error(error)
        })
}


export function getTitles() {
    return newApi.getSource('title')
        .then(data => {

            const titles = data.map(item => {
                const { id, name } = item
                return { id, titleName: name }
            })

            return titles
        })
        .catch(error => {
            console.error(error)
        })
}


export function getCurrentUserId() {
    var id
    var userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      id = userInfo.id
    }
    return id
}

const X_WIDTH = 375;
const X_HEIGHT = 812;

export const isIPhoneX = () => {
  const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

  return Platform.OS === 'ios' &&
    ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
      (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT));
}

export function checkMobile(mobile) {
  return /^\d{6,20}$/.test(mobile);
}