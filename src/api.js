import AsyncStorage from './AsyncStorage'

import request from './request'
import qs from 'qs'
import _ from 'lodash'
import { ApiError } from './request'

export const SOURCE = 1

function r(url, method, body, isUploadFile) {
  return AsyncStorage.getItem('source')
    .then(source => {    
      return AsyncStorage.getItem('userInfo')
        .then(userStr => {
          const options = {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "clienttype": "3",
              "source": source
            }
          }
        
          if (isUploadFile) {
            delete options.headers['Content-Type']
          }

          const user = userStr ? JSON.parse(userStr) : null

          if (user) {
            options.headers["token"] = user.token
          }
        
          if (method) {
            options["method"] = method
          }
        
          if (body) {
            options["body"] = isUploadFile ? body : JSON.stringify(body)
          }
        
          const lang = url.split('?').length > 1 ? `&lang=${window.LANG}` : `?lang=${window.LANG}`
        
          return request(url + lang, options)
        })
    }, error => {
      throw new ApiError(1299, 'data source missing')
    })
    .catch(error => {
      console.log('###', error)
      throw error
    })
}

function r2(url, method, body) {
  return AsyncStorage.getItem('source')
    .then(source => {
      return AsyncStorage.getItem('userInfo')
        .then(userStr => {
          const options = {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "clienttype": "3",
              "source": source
            }
          }
          
          const user = userStr ? JSON.parse(userStr) : null
          
            if (user) {
              options.headers["token"] = user.token
            }
          
            if (method) {
              options["method"] = method
            }
          
            if (body) {
              options["body"] = JSON.stringify(body)
            }
          
            return request(url, options)
        })
      
    })
    .catch(error => {
      throw new ApiError(1299, 'data source missing')
    })
}

/**
 * org
 */

export function getOrg(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/org/?' + qs.stringify(param))
}

export function addOrg(param) {
  return r('/org/?', 'POST', param)
}

export function editOrg(id, param) {
  return r('/org/' + id + '/', 'PUT', param)
}

export function deleteOrg(id) {
  return r('/org/' + id + '/', 'DELETE')
}

export function getOrgDetailLang(id, param) {
  return r('/org/' + id + '/?' + qs.stringify(param))
}

export function getOrgDetail(id, param) {
  return r2('/org/' + id + '/?' + qs.stringify(param))
}

export function getOrgRemark(param) {
  return r('/org/remark/?' + qs.stringify(param))
}

export function getOrgRemarkDetail(id) {
  return r('/org/remark/' + id + '/')
}

export function addOrgRemark(data) {
  return r('/org/remark/', 'POST', data)
}

export function editOrgRemark(id, data) {
  return r('/org/remark/' + id + '/', 'PUT', data)
}

export function deleteOrgRemark(id) {
  return r('/org/remark/' + id + '/', 'DELETE')
}

/**
 * proj
 */

export function getProj(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/proj/?' + qs.stringify(param))
}

export function favoriteProj(param) {
  return r('/proj/favorite/', 'POST', param)
}

export function createProj(param) {
  return r('/proj/', 'POST', param)
}

export function editProj(id, param) {
  return r('/proj/' + id + '/', 'PUT', param)
}

export function deleteProj(id) {
  return r('/proj/' + id + '/', 'DELETE')
}

export function getProjLangDetail(id) {
  return r('/proj/' + id + '/')
}

export function getProjDetail(id) {
  return r2('/proj/' + id + '/')
}

export function getShareToken(id) {
  return r('/proj/share/' + id + '/')
}

export function getShareProj(token) {
  return r(`/proj/shareproj/?token=${token}`)
}

/**
 * Favorite Proj
 */

export function getFavoriteProj(param) {
  return r('/proj/favorite/?' + qs.stringify(param))
}

export function projFavorite(param) {
  return r('/proj/favorite/', 'POST', param)
}

export function projCancelFavorite(param) {
  return r('/proj/favorite/', 'DELETE', param)
}

/**
 * Proj finance
 */

export function getProjFinance(proj) {
  return r('/proj/finance/?proj=' + proj)
}

export function addProjFinance(data) {
  return r('/proj/finance/', 'POST', data)
}

export function editProjFinance(data) {
  const _data = { 'finances': [data] }
  return r('/proj/finance/', 'PUT', _data)
}

export function deleteProjFinance(id) {
  const data = { 'finances': [id] }
  return r('/proj/finance/', 'DELETE', data)
}

/**
 * proj attachment
 */

export function getProjAttachment(proj) {
  return r('/proj/attachment/?proj=' + proj)
}

export function addProjAttachment(data) {
  return r('/proj/attachment/', 'POST', data)
}

export function editProjAttachment(data) {
  return r('/proj/attachment/', 'PUT', data) // todo
}

export function deleteProjAttachment(id) {
  const data = { attachment: [id] }
  return r('/proj/attachment/', 'DELETE', data)
}

/**
 * service
 */

export function getExchangeRate(param) {
  return r('/service/currencyrate?' + qs.stringify(param))
}

export function downloadUrl(bucket, key) {
  const params = { bucket, key }
  return r('/service/downloadUrl', 'POST', params)
}

export function qiniuUpload(bucket, file) {

  return AsyncStorage.getItem('source')
    .then(source => {
      return AsyncStorage.getItem('userInfo')
        .then(userStr => {
          let headers = {
            "Accept": "application/json",
            "clienttype": "3",
            "source": source,
            "x-requested-with": "XMLHttpRequest",
          }
          const user = userStr ? JSON.parse(userStr) : null
          
          if (user) {
            headers["token"] = user.token
          }
          
          var formData = new FormData()
          formData.append('file', file)
          
          return fetch('http://192.168.1.251:8080/service/qiniubigupload?bucket=' + bucket, {
            headers,
            method: 'POST',
            body: formData,
          }).then(response => {
            return response.json()
          }).then(data => {
            return { data: data.result }
          })
        })
    })
    .catch(error => {
      throw new ApiError(1299, 'data source missing')
    })
}

/**
 * 在使用环信发送图片或语音等消息时需要先把这些文件上传给环信
 * WebSDK好像有直接发送图片的接口，先放这儿吧
 * 
 * @param {string} token 登录环信后获取的 token
 * @param {object} file 上传的文件
 */
export const easemobUpload = (token, file) => {
  const url = 'https://a1.easemob.com/investarget001/investarget/chatfiles'
  const headers = {
    'Authorization': token,
    'restrict-access': true,
  }
  const body = new FormData()
  body.append('file', file)
  const options = { headers, method: 'POST', body }
  return request(url, options)
}

export function sendSmsCode(body) {
  return r('/service/sms', 'POST', body)
}

/**
 * source
 */

export function getSource(sourceType) {
  return r(`/source/${sourceType}`)
}

/**
 * timeline
 */
export function addTimeline(params) {
  return r('/timeline/', 'POST', params)
}

export function editTimeline(id, params) {
  return r('/timeline/' + id + '/', 'PUT', params)
}

/**
 * 获取时间轴列表
 * @param {Object} params
 * @param {Number} params.proj - 项目id
 * @param {Number} params.investor - 投资人id
 * @param {Number} params.trader - 交易师id
 * @param {Boolean} params.isClose - 时间轴是否已关闭 
 * @param {Number} params.page_index
 * @param {Number} params.page_size
 */
export const getTimeline = params => r('/timeline/?' + qs.stringify(params))

export function getTimelineDetail(id) {
  return r('/timeline/' + id + '/')
}

export function deleteTimeline(id) {
  const params = { timelines: [id] }
  return r('/timeline/', 'DELETE', params)
}

export function closeTimeline(id, reason) {
  const params = { timelinedata: { isClose: true } }
  return r('/timeline/' + id + '/', 'PUT', params)
}

export function openTimeline(id) {
  const params = { timelinedata: { isClose: false } }
  return r('/timeline/' + id + '/', 'PUT', params)
}

/**
 * timeline remark
 */

 /**
  * 获取时间轴备注列表
  * @param {Object} params
  * @param {Number} params.timeline - 时间轴id
  * @param {Boolean} params.sort - 排序方式，true为正序，false为倒序，默认为倒序
  * @param {Number} params.page_index
  * @param {Number} params.page_size
  */
export const getTimelineRemark = params => r('/timeline/remark/?' + qs.stringify(params))

export function getTimelineRemarkDetail(id) {
  return r('/timeline/remark/' + id + '/')
}

export function addTimelineRemark(data) {
  return r('/timeline/remark/', 'POST', data)
}

export function editTimelineRemark(id, data) {
  return r('/timeline/remark/' + id + '/', 'PUT', data)
}

export function deleteTimelineRemark(id) {
  return r('/timeline/remark/' + id + '/', 'DELETE')
}

/**
 * email
 */

export function getEmailList(params) {
  return r('/mongolog/email?' + qs.stringify(params))
}

export function getEmail(params) {
  return r('/emailmanage/?' + qs.stringify(params))
}

/**
 * user
 */

export function getUser(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/user/?' + qs.stringify(param))
}

export function addUser(param) {
  return r('/user/', 'POST', param)
}

export function editUser(idArr, param) {
  const data = {
    'userlist': idArr,
    'userdata': param,
  }
  return r('/user/', 'PUT', data)
}

export function getUserBase(id) {
  return r('/user/' + id + '/')
}

/**
 * 获取单个用户详情
 * @param {Number} id - 用户id 
 */
export const getUserDetailLang = id => r('/user/detail/' + id + '/')

export const getUserDetail = id => r2('/user/detail/' + id + '/')

export function login(values) {
  const param = {
    account: values.username,
    password: values.password,
    datasource: 1
  }
  return r('/user/login/', 'POST', param)
}

// { mobile, mobilecode, password, mobilecodetoken }
export function retrievePassword(param) {
  return r('/user/password/', 'POST', param)
}

export function get({ page }) {
  return r(`/user/?page_index=${page}&page_size=5`)
}

export function addFriend(token, param) {
  return r('/user/friend/', 'POST', param)
}

export function deleteUser(id) {
  return r('/user/', 'DELETE', { users: [id] })
}

export function register(user) {
  // const mobilecode = '375104'
  const mobilecode = user.code
  // const mobilecodetoken = '4871ace7028c4dc76c260adff9386e4f'
  const mobilecodetoken = user.smstoken
  // const mobile = '18004092637'
  const usernameC = user.username
  const orgname = user.organization
  const mobileAreaCode = user.prefix
  const param = {...user, mobilecode, mobilecodetoken, usernameC, orgname, mobileAreaCode}
  return r('/user/register/', 'POST', param)
}

export function queryLogList(pageIndex, pageSize) {
  return r(`/log/api?page_index=${pageIndex}&page_size=${pageSize}`)
}

export function queryPermList() {
  return r('/user/perm/')
}

export const queryUserGroup = param => r('/user/group/?' + qs.stringify(param))

export function updateUserGroup(groupId, body) {
  return r(`/user/group/${groupId}/`, 'PUT', body)
}

export function deleteUserGroup(groupId) {
  return r(`/user/group/${groupId}/`, 'DELETE')
}

export function createGroup(name) {
  const body = {
    name: name,
    permissions: []
  }
  return r('/user/group/', 'POST', body)
}

export function createUser(user) {
  return r('/user/', 'POST', user)
}

export const modifyPassword = (id, oldpassword, newpassword) => r(`/user/password/${id}/`, 'PUT', {oldpassword, newpassword})
export const addUnreachUser = body => r('/user/unuser/', 'POST', body)
export const getUnreachUser = param => r('/user/unuser/?' + qs.stringify(param))
export const deleteUnreachUser = id => r('/user/unuser/' + id, 'DELETE')
export const checkUserExist = mobileOrEmail => r('/user/checkexists/?account=' + mobileOrEmail)
export const getUserFriend = () => r('/user/friend/')
export const editUserFriend = (id, isaccept) => r(`/user/friend/${id}/`, 'PUT', { isaccept })
export const addUserFriend = friend => r('/user/friend/', 'POST', { friend })

// user remark

export function getUserRemark(param) {
  return r('/user/remark/?' + qs.stringify(param))
}

export function getUserRemarkDetail(id) {
  return r('/user/remark/' + id + '/')
}

export function addUserRemark(data) {
  return r('/user/remark/', 'POST', data)
}

export function editUserRemark(id, data) {
  return r('/user/remark/' + id + '/', 'PUT', data)
}

export function deleteUserRemark(id) {
  return r('/user/remark/' + id + '/', 'DELETE')
}


/**
 * dataroom
 */
export function queryDataRoom(param) {
  return r('/dataroom/?' + qs.stringify(param))
}

export function createDataRoom(body) {
  return r('/dataroom/', 'POST', body)
}

export function getDataRoomFile(param) {
  return r('/dataroom/file/?' + qs.stringify(param))
}

export function queryDataRoomDetail(id) {
  return r('/dataroom/' + id)
}
export const deleteDataRoom = body => r('/dataroom/', 'DELETE', body)
export const editDataRoom = body => r('/dataroom/', 'PUT', body)
export const addToDataRoom = body => r('/dataroom/file/', 'POST', body)
export const deleteFromDataRoom = body => r('/dataroom/file/', 'DELETE', body)
export const editInDataRoom = body => r('/dataroom/file/', 'PUT', body)

/**
 * User Relation
 */
export function getUserRelation(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/user/relationship/?' + qs.stringify(param))
}

/**
 * 在投资人和交易师之间建立关系
 * @param {Object} body
 * @param {Number} body.investoruser - 投资人id
 * @param {Number} body.traderuser - 交易师id
 * @param {Boolean} body.relationtype - 关系类型，true为强关系，false为弱关系
 */
export const addUserRelation = body => r('/user/relationship/', 'POST', body)

export function deleteUserRelation(idArr) {
  const param = {'relationlist': idArr}
  return r('/user/relationship/', 'DELETE', param)
}

export const checkUserRelation = (investor, trader) => r('/user/checkrelation/', 'POST', { investor, trader })
export const editUserRelation = body => r('/user/relationship/', 'PUT', body)

/**
 * msg
 */
export const getMsg = param => r('/msg/?' + qs.stringify(param))
export const readMsg = id => r('/msg/' + id + '/', 'POST')

/**
 * remark
 */

export function getRemark(type, param) {
  return r(`/${type}/remark/?` + qs.stringify(param))
}

export function getRemarkDetail(type, id) {
  return r(`/${type}/remark/${id}/`)
}

export function addRemark(type, data) {
  return r(`/${type}/remark/`, 'POST', data)
}

export function editRemark(type, id, data) {
  return r(`/${type}/remark/${id}/`, 'PUT', data)
}

export function deleteRemark(type, id) {
  return r(`/${type}/remark/${id}/`, 'DELETE')
}

/**
 * log
 */
export function getLogOfUserUpdate(param) {
    return r('/log/userupdate?' + qs.stringify(param))
}

/**
 * mongolog
 */
export const getChatMsg = param => r('/mongolog/chatmsg?' + qs.stringify(param))

/**
 * 直接上传
 * @param {Object} formData - 包含了 File 对象的 FormData 对象
 * @param {String} bucket - 上传到的空间，image 或者 file 
 */
export const basicUpload = (formData, bucket) => r(`/service/qiniubigupload?bucket=${bucket}`, 'POST', formData, true)
/**
 * 覆盖上传
 * @param {String} key - 文件的key
 * @param {Object} formData - 包含了 File 对象的 FormData 对象
 * @param {String} bucket - 上传到的空间，image 或者 file 
 */
export const coverUpload = (key, formData, bucket) => r(`/service/qiniucoverupload?bucket=${bucket}&key=${key}`, 'POST', formData, true)
/**
 * 名片解析
 * @param {Object} formData - 包含了 File 对象的 FormData 对象
 */
export const ccUpload = formData => r('/service/ccupload', 'POST', formData, true);
/**
 * 获取智库文章列表和活动地址
 */
export const getPostsAndEvent = () => r('/activity/');
