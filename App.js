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
import VideoPlayer from 'react-native-video-player';
import QRCode from 'react-native-qrcode';
import HOST from './src/proxy.config';

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      qrcode:'',
      inputImei:'',
      modalVisible:false
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
      this.timeout = setTimeout(() => {
        this.handleMakeQrcode(imei);
      }, 2*1000);
    }
  }

  render() {
    let { height,width } = Dimensions.get('window');
    return (
      <View>
        <VideoPlayer
          autoplay
          loop
          thumbnail={require('./src/images/video_first_screen.png')}
          video={require('./src/videos/propagation.mp4')}
          videoWidth={width}
          videoHeight={height*0.7}
          style={{backgroundColor: '#ffffff'}}
        />
      <ImageBackground style={{height: height*0.3,flexDirection: 'row'}} source={require('./src/images/bg_bottom.png')} resizeMode="stretch">
          <View style={{flex:1,justifyContent: 'center'}}>
            <View style={{flexDirection: 'row',marginLeft: 100}}>
              <Image style={{width: 50,height: 50,marginRight: 10}} source={require('./src/images/dianhua.png')} resizeMode="contain"/>
              <Text style={{fontSize: 45,color: '#ffffff'}}>4000574355</Text>
            </View>
            <View style={{flexDirection: 'row',marginLeft: 100,marginTop: 60}}>
              <Image style={{width: 50,height: 50,marginRight: 10}} source={require('./src/images/weixin.png')} resizeMode="contain"/>
              <Text style={{fontSize: 40,color: '#ffffff'}}>太空侠智能回收</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={() => null} onLongPress={() => null} style={{marginHorizontal: 50,justifyContent: 'center',alignItems: 'center'}}>
            <QRCode
              value={this.state.qrcode}
              size={230}/>
            <Text style={{marginTop: 15,color:'#ffffff',fontSize: 22}}>扫一扫二维码 进行关注</Text>
          </TouchableOpacity>
        </ImageBackground>
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
