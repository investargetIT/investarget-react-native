export const REQUEST_CONTENT = 'REQUEST_CONTENT'
export const RECEIVE_CONTENT = 'RECEIVE_CONTENT'
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO'
export const DISMISS_ERROR_MESSAGE = 'DISMISS_ERROR_MESSAGE'
export const READ_USER_INFO_FROM_LOCAL_STORAGE = 'READ_USER_INFO_FROM_LOCAL_STORAGE'
export const APPEND_PROJECTS = 'APPEND_PROJECTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const LOGOUT = 'LOGOUT'
export const HANDLE_ERROR = 'HANDLE_ERROR'
export const HIDE_LOADING = 'HIDE_LOADING'
export const RECEIVE_CONTINENTS_AND_COUNTRIES = 'RECEIVE_CONTINENTS_AND_COUNTRIES'
export const TOGGLE_FILTER = 'TOGGLE_FILTER'
export const TOGGLE_ORG_FILTER = 'TOGGLE_ORG_FILTER'
export const RECEIVE_INDUSTRIES = 'RECEIVE_INDUSTRIES'
export const RECEIVE_TITLES = 'RECEIVE_TITLES'
export const RECEIVE_TAGS = 'RECEIVE_TAGS'
export const RECEIVE_CURRENCYTYPE = 'RECEIVE_CURRENCYTYPE'
export const RECEIVE_ORGTYPES = 'RECEIVE_ORGTYPES'
export const RECEIVE_TRANSACTIONPHASES='RECEIVE_TRANSACTIONPHASES'
export const SEARCH_PROJECT = 'SEARCH_PROJECT'
export const FILTER_ORG='FILTER_ORG'
export const CLEAR_FILTER = 'CLEAR_FILTER'
export const CLEAR_ORG_FILTER = 'CLEAR_ORG_FILTER'
export const SET_NEED_REFRESH_FALSE = 'SET_NEED_REFRESH_FALSE'
export const SET_INVESTOR_REFRESH_FALSE='SET_INVESTOR_REFRESH_FALSE'
export const CLONE_TRUE_FILTER = 'CLONE_TRUE_FILTER'
export const CLONE_TRUE_ORG_FILTER = 'CLONE_TRUE_ORG_FILTER'
export const MODIFY_USER_INFO = 'MODIFY_USER_INFO'
export const SET_RECOMMEND_INVESTORS = 'SET_RECOMMEND_INVESTORS'
export const SET_RECOMMEND_PROJECTS = 'SET_RECOMMEND_PROJECTS'
export const CLEAR_RECOMMEND = 'CLEAR_RECOMMEND'
export const SHOW_TOAST = 'SHOW_TOAST'
export const HIDE_TOAST = 'HIDE_TOAST'
export const SAVE_REDIRECT_URL = 'SAVE_REDIRECT_URL'
export const UPDATE_PROJECT_STRUCTURE = 'UPDATE_PROJECT_STRUCTURE'

export function updateProjectStructure(structure) {
  return {
    type: UPDATE_PROJECT_STRUCTURE,
    structure
  }
}

export function requestContents(param) {
  return {
    type: REQUEST_CONTENT,
    param
  }
}

export function receiveContents(param, json) {
  return {
    type: RECEIVE_CONTENT,
    param,
    contents: json,
    reveivedAt: Date.now()
  }
}

export function receivePosts(posts) {
  return {
    type: RECEIVE_POSTS,
    posts
  }
}

export function appendProjects(projects) {
  return {
    type: APPEND_PROJECTS,
    projects
  }
} 

export function logout() {
  return {
    type: LOGOUT
  }
}

export function receiveCurrentUserInfo(token, object, username, password) {
  return {
    type: RECEIVE_USER_INFO,
    token,
    object,
    username,
    password
  }
}

export function dismissErrMsg() {
  return {
    type: DISMISS_ERROR_MESSAGE
  }
}

export function handleError(error) {
  return {
    type: HANDLE_ERROR,
    error
  }
}

export function readUserInfoFromLocalStorage() {
  return {
    type: READ_USER_INFO_FROM_LOCAL_STORAGE
  }
}

export function hideLoading() {
  return { type: HIDE_LOADING }
}

export function receiveContinentsAndCountries(continentsAndCountries) {
  return { 
    type: RECEIVE_CONTINENTS_AND_COUNTRIES,
    continentsAndCountries
  }
}

export function toggleFilter(filter) {
  return {
    type: TOGGLE_FILTER,
    filter
  }
}

export function toggleOrgFilter(filter) {
  return {
    type: TOGGLE_ORG_FILTER,
    filter
  }
}

export function receiveIndustries(industries) {
  return {
    type: RECEIVE_INDUSTRIES,
    industries
  }
}

export function receiveTags(tags) {
  return {
    type: RECEIVE_TAGS,
    tags
  }
}

export function receiveCurrencyType(currencyType) {
  return {
    type: RECEIVE_CURRENCYTYPE,
    currencyType
  }
}

export function receiveTransactionPhases(transactionPhases) {
  return {
    type: RECEIVE_TRANSACTIONPHASES,
    transactionPhases
  }
}

export function receiveOrgTypes(orgTypes) {
  return {
    type: RECEIVE_ORGTYPES,
    orgTypes
  }
}

export function receiveTitles(titles) {
  return {
    type: RECEIVE_TITLES,
    titles
  }
}


export function searchProject(title) {
  return { 
    type: SEARCH_PROJECT,
    title
  }
}

export function filterOrg(title) {
  return { 
    type: FILTER_ORG,
    title
  }
}

export function clearFilter() {
  return { type: CLEAR_FILTER }
}

export function clearOrgFilter() {
  return { type: CLEAR_ORG_FILTER }
}

export function cloneTrueFilter() {
  return { type: CLONE_TRUE_FILTER }
}

export function cloneTrueOrgFilter() {
  return { type: CLONE_TRUE_ORG_FILTER }
}

export function modifyUserInfo(userInfo) {
  return {
    type: MODIFY_USER_INFO,
    userInfo
  }
}

export function setRecommendInvestors(ids) {
  return {
    type: SET_RECOMMEND_INVESTORS,
    ids: ids
  }
}

export function setRecommendProjects(ids) {
  return {
    type: SET_RECOMMEND_PROJECTS,
    ids: ids
  }
}

export function clearRecommend() {
  return {
    type: CLEAR_RECOMMEND
  }
}

export function showToast(message) {
  return {
    type: SHOW_TOAST,
    message
  }
}

export function hideToast() {
  return {
    type: HIDE_TOAST
  }
}

export function saveRedirectUrl(url) {
  return {
    type: SAVE_REDIRECT_URL,
    url
  }
}
