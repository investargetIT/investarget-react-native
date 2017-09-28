import {
    REQUEST_CONTENT, 
    RECEIVE_CONTENT, 
    RECEIVE_USER_INFO, 
    DISMISS_ERROR_MESSAGE,
    READ_USER_INFO_FROM_LOCAL_STORAGE,
    APPEND_PROJECTS,
    RECEIVE_POSTS,
    LOGOUT,
    HANDLE_ERROR,
    HIDE_LOADING,
    RECEIVE_CONTINENTS_AND_COUNTRIES,
    TOGGLE_FILTER,
    RECEIVE_INDUSTRIES,
    RECEIVE_TAGS,
    RECEIVE_TITLES,
    SEARCH_PROJECT,
    CLEAR_FILTER,
    CLONE_TRUE_FILTER,
    SET_NEED_REFRESH_FALSE,
    MODIFY_USER_INFO,
    SET_RECOMMEND_INVESTORS,
    SET_RECOMMEND_PROJECTS,
    CLEAR_RECOMMEND,
    SHOW_TOAST,
    HIDE_TOAST,
    SAVE_REDIRECT_URL,
    UPDATE_PROJECT_STRUCTURE,
  } from '../actions'
  import AsyncStorage from '../src/AsyncStorage'
  
  const initialState = {
    isLogin: false,
    isFetching: false,
    isError: false,
    projects: [],
    projectStructure: [],
    posts: [],
    eventUrl: 'https://www.baidu.com/',
    continentsAndCountries: [],
    filter: [],
    industries: [],
    tags: [],
    titles: [],
    trueFilter: [],
    needRefresh: false,
    recommendProcess: {
      investorIds: [],
      projectIds: []
    },
    showToast: false,
    toastMessage: '',
    redirectUrl: null,
    
	im: [],
	// 数据实体
	entities: {
		message: {
      byId: {},
      chat: {},
		}
  }
  
  }
  
  export default function (state = initialState, action) {
    switch (action.type) {
      case REQUEST_CONTENT:
        return Object.assign({}, state, {
          isFetching: true
        })
      case RECEIVE_CONTENT:
        return Object.assign({}, state, {
          isFetching: false,
          projects: action.contents,
          needRefresh: false
        })
      case RECEIVE_POSTS: 
        const events = action.posts.filter(post => !post.isNews)
        const eventUrl = events.length > 0 ? events[0].detailUrl : initialState.eventUrl
        return Object.assign({}, state, {
          posts: action.posts.filter(post => post.isNews),
          eventUrl: eventUrl
        })
      case APPEND_PROJECTS:
        return Object.assign({}, state, {
          isFetching: false,
          projects: state.projects.concat(action.projects),
        })
      case RECEIVE_USER_INFO:
        const userInfo = Object.assign({}, action.object, {
          token: action.token,
          username: action.username,
          password: action.password
        })
        return Object.assign({}, state, {
          isLogin: true,
          userInfo: userInfo
        })
      case DISMISS_ERROR_MESSAGE:
        var newObj = Object.assign({}, state, {
          isError: false
        })
        delete newObj.errorMsg
        return newObj
      case LOGOUT:
        var newObj1 = Object.assign({}, state, {
          isLogin: false
        })
        delete newObj1.userInfo
        return newObj1
      case READ_USER_INFO_FROM_LOCAL_STORAGE:
        var currentUserInfo = localStorage.getItem('userInfo')
        var nextState = currentUserInfo ?  Object.assign({}, state, {
            isLogin: true,
            userInfo: JSON.parse(currentUserInfo)
          }) : Object.assign({}, state)
        return nextState
      case HANDLE_ERROR:
        return Object.assign({}, state, {
          isFetching: false,
          isError: true,
          error: action.error
        })
      case HIDE_LOADING:
        return Object.assign({}, state, {
          isFetching: false
        })
      case RECEIVE_CONTINENTS_AND_COUNTRIES:
        return Object.assign({}, state, {
          continentsAndCountries: action.continentsAndCountries
        })
      case TOGGLE_FILTER:
        const itemIndex = state.filter.map(item => item.type + item.id).indexOf(action.filter.type + action.filter.id)
        if (itemIndex > -1) {
          var newFilter = state.filter.slice()
          newFilter.splice(itemIndex, 1)
          return Object.assign({}, state, {
            filter: newFilter
          })
        } else {
          return Object.assign({}, state, {
            filter: state.filter.concat(action.filter)
          })
        }
      case RECEIVE_INDUSTRIES:
        return Object.assign({}, state, {
          industries: action.industries
        })
      case RECEIVE_TAGS:
        return Object.assign({}, state, {
          tags: action.tags
        })
      case RECEIVE_TITLES:
        return Object.assign({}, state, {
          titles: action.titles
        })
      case SEARCH_PROJECT:
        return Object.assign({}, state, {
          trueFilter: state.filter.concat({
            type: 'title',
            title: action.title
          }),
          needRefresh: true
        })
      case CLEAR_FILTER:
        return Object.assign({}, state, {
          filter: []
        })
      case CLONE_TRUE_FILTER:
        var filter = state.trueFilter.filter(item => item.type !== 'title')
        return Object.assign({}, state, {
          trueFilter: filter,
          filter: filter
        })
      case SET_NEED_REFRESH_FALSE:
        return Object.assign({}, state, {
          needRefresh: false,
        })
      case MODIFY_USER_INFO:
        AsyncStorage.setItem('userInfo', JSON.stringify(action.userInfo))
        return Object.assign({}, state, {
          userInfo: action.userInfo
        })
      case SET_RECOMMEND_INVESTORS:
        return Object.assign({}, state, {
          recommendProcess: {
            investorIds: action.ids,
            projectIds: state.recommendProcess.projectIds
          }
        })
      case SET_RECOMMEND_PROJECTS:
        return Object.assign({}, state, {
          recommendProcess: {
            investorIds: state.recommendProcess.investorIds,
            projectIds: action.ids
          }
        })
      case CLEAR_RECOMMEND:
        return Object.assign({}, state, {
          recommendProcess: {
            investorIds: [],
            projectIds: []
          }
        })
      case SHOW_TOAST:
        return Object.assign({}, state, {
          showToast: true,
          toastMessage: action.message
        })
      case HIDE_TOAST:
        return Object.assign({}, state, {
          showToast: false,
          toastMessage: '',
        })
      case SAVE_REDIRECT_URL:
        return Object.assign({}, state, {
      redirectUrl: action.url
        })
      case UPDATE_PROJECT_STRUCTURE:
        return Object.assign({}, state, {
          projectStructure: action.structure
        })
      default:
        return state
    }
  }
  