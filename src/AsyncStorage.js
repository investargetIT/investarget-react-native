import { AsyncStorage } from 'react-native'

const NS = '@Investarget'

function getItem(key) {
    return new Promise(function(resolve, reject) {
        AsyncStorage.getItem(NS + key, function(error, result) {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

function setItem(key, value) {
    return new Promise(function(resolve, reject) {
        AsyncStorage.setItem(NS + key, value, function(error, result) {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

function removeItem(key) {
    return new Promise(function(resolve, reject) {
        AsyncStorage.removeItem(NS + key, function(error, result) {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}


export default {
    getItem,
    setItem,
    removeItem,
}