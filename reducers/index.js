import { combineReducers } from 'redux'
import app from './app'
import nav from './nav'
import easemob from './easemob'

const rootReducer = combineReducers({
    app,
    nav,
    easemob,
})

export default rootReducer
