import axios from 'axios';
import {
  AsyncStorage
} from 'react-native';
import HOST from './proxy.config';
/**
 *网络请求函数
 *@param {string} url 网络请求的url
 *@param {string} method 网络请求的方法
 *@param {string} contentType 网络请求的类型
 *@param {bool} loading 是否显示loading弹框
 *@param {object} params 网络请求的参数
 */
export async function ajax(options) {
  try {
    let url = options.url;
    let method = options.method || 'post';
    let contentType = options.contentType || 'application/json';
    let loading = options.loading === undefined ? true : false;
    let noToken = options.noToken || false;
    let tempobj = '';
    let finalParams = options.params;
    let finalUrl = HOST + url;
    let token = await AsyncStorage.getItem('token');
    // if (loading) global.handleEmitEvent('loading', true);
    let headers = noToken ? {'Content-Type': contentType} : {'Content-Type': contentType,'AUTHORIZATION': token};
    return axios({
      method,
      url: finalUrl,
      headers,
      timeout: 20000,
      data: finalParams
    }).then((res) => {
      console.log('请求的url地址：' + finalUrl);
      console.log(res.data);
      return res.data;
    }).catch((error) => {
      console.log('请求的url地址：' + finalUrl);
      console.log(error);
      return false;
    });
  } catch (e) {
    console.log('catch',e );
    return false;
  }
}
