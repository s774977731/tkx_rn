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
      showQrcode:true,
      showMp4:true,
      userName:'',
      second:15,
    }
    this.timeout = null;
    this.intervalSecond = null;
  }

  componentDidMount() {
    this.handleStorageImei();
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
    this.intervalSecond && clearTimeout(this.intervalSecond);
    this.timeout = null;
    this.intervalSecond = null;
  }

  //点击显示mp4
  handlePressMp4 = async () => {
    let storageImei = await AsyncStorage.getItem('imei');
    this.intervalCloseQrcode();
    this.handleMakeQrcode(storageImei);
    this.setState({showMp4:!this.state.showMp4});
  }

  // 轮训倒计时返回mp4
  intervalCloseQrcode = () => {
    let { second } = this.state;
    if(second == 0) {
      this.timeout && clearTimeout(this.timeout);
      this.intervalSecond && clearTimeout(this.intervalSecond);
      this.timeout = null;
      this.intervalSecond = null;
      this.setState({second:15,showMp4:true,showQrcode:true});
    }else {
      this.setState({second:this.state.second - 1});
      this.intervalSecond = setTimeout(() => {
        this.intervalCloseQrcode();
      }, 1000);
    }
  }

  //本地存储的imei
  handleStorageImei = async () => {
    let storageImei = await AsyncStorage.getItem('imei');
    if(!storageImei) {
      this.setState({modalVisible:true})
    }
  }

  // 保存输入的iemi
  handleSaveStorageImei = async () => {
    let { inputImei } = this.state;
    await AsyncStorage.setItem('imei',inputImei);
    this.setState({modalVisible:false});
  }

  // 获取二维码
  handleMakeQrcode = async (imei) => {
    let res = await common.ajax({
      url:'/v1/app/scanningcode/',
      params:{imei}
    });
    console.log(imei);
    console.log(res);
    if(res) {
      let qrcodeContent = HOST + '/' + res.imei;
      this.setState({qrcode:qrcodeContent});
      console.log(res);
      if(res.code == 0) {
        this.setState({showMp4:true,showQrcode:true});
        this.timeout && clearTimeout(this.timeout);
        this.timeout = null;
        return false;
      }else if(res.code == 1) {
        this.intervalSecond && clearTimeout(this.intervalSecond);
        this.intervalSecond = null;
        this.setState({second:60,showQrcode:false,userName:res.name});
      }
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
    let { showQrcode,showMp4,second,userName } = this.state;
    return (
      <View>
          {
            showMp4 ?
              <View style={{width: width,height: height,justifyContent: 'center'}}>
                <View style={{flex:1,backgroundColor: '#000000'}}>
                  <VideoPlayer
                    autoplay
                    loop
                    hideControlsOnStart
                    thumbnail={require('./src/images/video_first_screen.png')}
                    video={require('./src/videos/propagation.mp4')}
                    videoWidth={width}
                    videoHeight={height}
                    style={{backgroundColor: '#ffffff'}}
                  />
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
                <TouchableOpacity activeOpacity={1} onPress={this.handlePressMp4} style={{position: 'absolute',left: 0,right: 0,top:0,bottom: 0}}></TouchableOpacity>
              </View>
            :
            <View>
              {
                !showQrcode ?
                <ImageBackground style={{height: height,flexDirection: 'row'}} source={require('./src/images/new_bg.png')} resizeMode="stretch">
                  <TouchableOpacity activeOpacity={1} style={{flex:1}}>
                    <View style={{position: 'absolute',top: '13%',left: '18%'}}>
                      <Text style={{color:'#ffffff',fontSize: common.scaleSize(36),fontWeight: 'bold'}}>您好！</Text>
                      <Text style={{color:'#ffffff',fontSize: common.scaleSize(36),fontWeight: 'bold'}}>{userName}</Text>
                    </View>
                  </TouchableOpacity>
                </ImageBackground>
                :
                <TouchableOpacity activeOpacity={1} style={{height: height}}>
                  <View style={{flex:1,justifyContent: 'center',alignItems: 'center',backgroundColor: '#000000'}}>
                    <View style={{backgroundColor: '#ffffff',padding: 20}}>
                      <QRCode
                        value={this.state.qrcode}
                        size={230}/>
                    </View>
                  </View>
                  <View style={{height: 0.15*height,justifyContent: 'center',alignContent: 'center'}}>
                    <View style={{alignItems: 'center'}}>
                      <Text style={{fontSize: 30,fontWeight: 'bold'}}>微信扫描屏幕二维码{second}s</Text>
                    </View>
                    <View style={{flexDirection: 'row',justifyContent: 'center',marginTop: 20}}>
                      <Image style={{width: 20,height: 20,marginRight: 10}} source={require('./src/images/space_logo.png')} resizeMode="contain"/>
                      <Text style={{fontSize: 18}}>客服电话：400-1094484</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              }
            </View>
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
