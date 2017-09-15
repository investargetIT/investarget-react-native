import { combineReducers } from 'redux'
import app from './app'
import nav from './nav'

const rootReducer = combineReducers({
    app,
    nav,
})

export default rootReducer
