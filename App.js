/* 太空侠首页宣传页 */

import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  WebView,
  Dimensions,
  ImageBackground,
  Image,
  AsyncStorage,
  Modal,
  TextInput,
  TouchableOpacity
} from 'react-native';
import VideoPlayer from './npm_package/react-native-video-player.js';
import QRCode from 'react-native-qrcode';
import HOST from './src/proxy.config';

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      qrcode:'',
      inputImei:'',
      modalVisible:false,
      showQrcode:false,
    }
    this.timeout = null;
  }

  componentDidMount() {
    this.handleStorageImei();
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
    this.timeout = null;
  }

  handleShowQrcode = async () => {
    this.setState({showQrcode:!this.state.showQrcode});
  }

  //本地存储的imei
  handleStorageImei = async () => {
    let storageImei = await AsyncStorage.getItem('imei');
    if(storageImei) {
      this.handleMakeQrcode(storageImei);
    }else {
      this.setState({modalVisible:true})
    }
  }

  // 保存输入的iemi
  handleSaveStorageImei = async () => {
    let { inputImei } = this.state;
    await AsyncStorage.setItem('imei',inputImei);
    this.setState({modalVisible:false});
    this.handleMakeQrcode(inputImei);
  }

  // 获取二维码
  handleMakeQrcode = async (imei) => {
    let res = await common.ajax({
      url:'/v1/app/scanningcode/',
      params:{imei}
    });
    if(res) {
      let qrcodeContent = HOST + '/' + res.imei;
      this.setState({qrcode:qrcodeContent});
      console.log(res);
      this.timeout = setTimeout(() => {
        this.handleMakeQrcode(res.imei || imei);
      }, 2*1000);
    }else {
      let qrcodeContent = HOST + '/' + imei;
      this.setState({qrcode:qrcodeContent});
      this.timeout = setTimeout(() => {
        this.handleMakeQrcode(imei);
      }, 2*1000);
    }
  }

  render() {
    let { height,width } = Dimensions.get('window');
    let { showQrcode } = this.state;
    return (
      <View>
          {
            !showQrcode ?
            <ImageBackground style={{height: height,flexDirection: 'row'}} source={require('./src/images/new_bg.png')} resizeMode="stretch">
              <TouchableOpacity activeOpacity={1} onPress={this.handleShowQrcode} style={{flex:1}}></TouchableOpacity>
            </ImageBackground>
            :
            <TouchableOpacity activeOpacity={1} onPress={this.handleShowQrcode} style={{height: height}}>
              <View style={{flex:1,justifyContent: 'center',alignItems: 'center',backgroundColor: '#000000'}}>
                <View style={{backgroundColor: '#ffffff',padding: 20}}>
                  <QRCode
                    value={this.state.qrcode}
                    size={230}/>
                </View>
              </View>
              <View style={{height: 0.15*height,justifyContent: 'center',alignContent: 'center'}}>
                <View style={{alignItems: 'center'}}>
                  <Text style={{fontSize: 30,fontWeight: 'bold'}}>点击屏幕显示二维码</Text>
                </View>
                <View style={{flexDirection: 'row',justifyContent: 'center',marginTop: 20}}>
                  <Image style={{width: 20,height: 20,marginRight: 10}} source={require('./src/images/space_logo.png')} resizeMode="contain"/>
                  <Text style={{fontSize: 18}}>客服电话：400-1094484</Text>
                </View>
              </View>
            </TouchableOpacity>
          }
          <Modal visible={this.state.modalVisible} transparent={true}>
            <View style={{backgroundColor: 'rgba(0,0,0,0.3)',flex:1,justifyContent: 'center',alignItems: 'center'}}>
              <View style={{backgroundColor: '#ffffff',width: width*0.8,marginTop: 100,padding: 20}}>
                <TextInput
                  placeholder="请输入设备的imei"
                  value={this.state.inputImei}
                  onChangeText={(inputImei) => this.setState({inputImei})}
                  style={{borderWidth: 1,borderColor: '#f7f7f7',marginBottom: 100,justifyContent: 'center',alignItems: 'center'}}/>
                <TouchableOpacity activeOpacity={0.7} onPress={this.handleSaveStorageImei}>
                  <Text style={{paddingVertical: 8,paddingHorizontal: 20,backgroundColor: '#4c76df',color:'#ffffff',alignSelf: 'center',borderRadius: 5}}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
