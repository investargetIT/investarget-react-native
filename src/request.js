import AsyncStorage from './AsyncStorage';
import { logout } from '../actions';
import { NavigationActions } from 'react-navigation'

let baseUrl = "http://apitest.investarget.com"
// baseUrl = "https://api.investarget.com";
let mobileUrl = 'http://mtest.investarget.com';
// mobileUrl = 'https://m.investarget.com';
export { baseUrl, mobileUrl };

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.toString = () => `name: ApiError, code: ${code}, message: ${message}`
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseErrorMessage(data) {
  const { code, errormsg } = data
  if (code !== 1000) {
    if (code === 3000) {
      // AsyncStorage.removeItem('userInfo')
        // .then(() => {
          // window.store.dispatch(logout());
          window.store.dispatch(NavigationActions.navigate({ routeName: 'Login' }));
        // });
    } 
    throw new ApiError(code, errormsg)
  }
  return  data
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options) {

  const isThirdPartyServer = /^http/.test(url);

  const fullUrl = isThirdPartyServer ? url : baseUrl + url;

  const response = await fetch(fullUrl, options);

  checkStatus(response);

  const data = await response.json();

  // console.log(fullUrl, data);

  if (isThirdPartyServer) return data;

  // Parse response with code 200 using our own rule is meaningless 
  // Only when request our own server should we parse response data
  parseErrorMessage(data);

  return data.result;

}
