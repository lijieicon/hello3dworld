<template>
  <div>
    <div class="hello" id="map"></div>
    <div
      style="
        position: absolute;
        left: 42px;
        top: 0px;
        background-color: rgba(255, 255, 255, 0.5);
        height: 44px;
        line-height: 44px;
        padding: 0 4px;
        border-radius: 5px;
      "
    >
      <el-input
        style="width: 160px"
        v-model="input2"
        placeholder="请输入目的地"
      ></el-input>
      <el-button id="navibutton" @click="search">起飞</el-button>
    </div>
    <div class="position" @click="getPosition()">
      <div class="inpos" :style="{ background: pbg }"></div>
    </div>
    <div class="cfg" @click="showConfig = true">
      <i class="el-icon-user"></i>
    </div>
    <el-dialog title="用户设置" :visible.sync="showConfig" width="300px">
      <span>
        <el-tabs :tab-position="tabPosition" style="height: 200px">
          <el-tab-pane v-for="c in config" :key="c.group" :label="c.group">
            <el-card class="box-card">
              <div
                v-for="o in c.items"
                :key="o.key"
                class="text item"
                style="text-align: left"
              >
                <span>{{ o.name + "：" }}</span>
                <el-switch
                  v-if="o.type == 'ck'"
                  v-model="o.value"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                >
                </el-switch>
                <el-input
                  v-else-if="o.type == 'ip'"
                  v-model="o.value"
                  size="medium"
                  placeholder="请输入内容"
                >
                </el-input>
                <el-select
                  v-else-if="o.type == 'se'"
                  v-model="o.value"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in o.opts"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  >
                  </el-option>
                </el-select>

                <span v-if="o.tip">说明:{{ o.tip }}</span>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import "@cesium/widgets/Source/widgets.css";
import {Roaming} from  "@/assets/Roaming.js";
var currCity;
function BMapGeocoderService() {}
function AMapGeocoderService() {}
BMapGeocoderService.prototype.geocode = (kw) => {
  let ak = "bX2W2qktd5GnOp80H6leIL0py2LP9yey";
  let city = "四川";
  let url = `https://api.map.baidu.com/place/v2/search`;
  // 使用Cesium.Resource.fetchJsonp来调用服务
  return Cesium.Resource.fetchJsonp({
    url: url,
    queryParameters: {
      query: kw,
      region: city,
      output: "json",
      ak: ak,
      page_size: 50,
      page_num: 1,
    },
  }).then(function (results) {
    let re = [];
    results.results.forEach((element) => {
      if (
        element &&
        element.location &&
        isNaN(element.location.lng * element.location.lat) == false
      ) {
        re.push({
          displayName:
            element.name + "-" + (element.address ? element.address : ""),
          destination: Cesium.Cartesian3.fromDegrees(
            +element.location.lng - 0.008,
            +element.location.lat - 0.0043
          ),
        });
      }
    });
    return re;
  });
};
AMapGeocoderService.prototype.geocode = (kw) => {
  let ak = "c14d86231a9923405a258cd30c6410ff";
  let city = "四川";
  if (currCity) {
    city = currCity;
  }
  let url = `https://restapi.amap.com/v5/place/text`;
  // 使用Cesium.Resource.fetchJsonp来调用服务
  return Cesium.Resource.fetchJsonp({
    url: url,
    queryParameters: {
      keywords: kw,
      region: city,
      city_limit: false,
      output: "json",
      key: ak,
      page_size: 50,
      page_num: 1,
    },
  }).then(function (results) {
    let re = [];
    results.pois.forEach((element) => {
      if (element && element.location) {
        let arr = element.location.split(",");
        if (arr && arr.length == 2) {
          re.push({
            displayName:
              element.name + "-" + (element.address ? element.address : ""),
            destination: Cesium.Cartesian3.fromDegrees(
              +parseFloat(arr[0]),
              +parseFloat(arr[1])
            ),
          });
        }
      }
    });
    return re;
  });
};
var aMapKey = "c14d86231a9923405a258cd30c6410ff";
var mapViewer;
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      curPosition: [103.877011, 30.659098],
      curId: "hover_pos001",
      curCId: "hover_cpos001",
      pbg: "rgba(255,255,255,0.5)",
      changeColor: null,
      changeCount: 0,
      showConfig: false,
      tabPosition: "left",
      bs: 25,
      pheight: 500,
      autoLoc: null,
      input1: "成都白衣寺",
      input2: "成都市海伦春天",
      jplon:-0.0024,
      jplat:0.0027,
      config: [
        {
          group: "基本配置",
          items: [
            {
              name: "自动定位",
              value: false,
              key: "alocation",
              type: "ck",
            },
            {
              name: "定位间隔(秒)",
              value: 1,
              key: "apt",
              type: "ip",
            },
            {
              name: "上传轨迹",
              value: false,
              key: "uploadp",
              type: "ck",
            },
          ],
        },
        {
          group: "航行配置",
          items: [
            {
              name: "倍数",
              value: 25,
              key: "prate",
              type: "ip",
            },
            {
              name: "高度",
              value: 500,
              key: "pheight",
              type: "ip",
            },
            {
              name: "循环飞行",
              value: false,
              key: "aplay",
              type: "ck",
            },
          ],
        },
        {
          group: "服务地址",
          items: [
            {
              name: "GPS上传地址",
              value: "http://172.30.188.190:8091/oet/location",
              key: "uploadUrl",
              type: "ip",
              tip: "此地址需要通过zerotier(官网下载地址:https://www.zerotier.com/download/) 加入:12ac4a1e718a073d网络",
            },
          ],
        },
        {
          group: "POI服务",
          items: [
            {
              name: "GPS上传地址",
              value: "a",
              key: "poit",
              type: "se",
              opts: [
                {
                  key: "a",
                  name: "高德",
                },
                { key: "b", name: "百度" },
              ],
            },
          ],
        },
         {
          group: "地图纠偏",
          items: [
            {
              name: "经度",
              value: -0.0024,
              key: "jplon",
              type: "ip"              
            },{
              name: "纬度",
              value: 0.0027,
              key: "jplat",
              type: "ip"              
            },
          ],
        }
      ],
    };
  },
  mounted() {
    document.title = this.msg;
    this.initMap();
    setTimeout(() => {
      this.getPosition(this.refreshPosition);
    }, 2000);
    let old= localStorage.getItem('config4me');
    if(old){
      this.config.length=0;
      JSON.parse( old).forEach(d=>{
        this.config.push(d);
      });
    }
    this.speak({text:'hello'}, function() {
        console.log('语音播放结束');
    }, function() {
        console.log('语音开始播放');
    });
  },
  watch: {
    config: {
      handler() {
        let t = 1;
        for (let c in this.config) {
          for (let i in this.config[c].items) {
            if (this.config[c].items[i].key == "apt") {
              t = isNaN(this.config[c].items[i].value)
                ? 1
                : this.config[c].items[i].value;
            }
          }
        }
        for (let c in this.config) {
          for (let i in this.config[c].items) {
            if (this.config[c].items[i].key == "alocation") {
              if (this.config[c].items[i].value) {
                if (this.autoLoc) {
                  clearInterval(this.autoLoc);
                }
                this.autoLoc = setInterval(() => {
                  this.getPosition(this.refreshPosition);
                }, t * 1000);
              } else {
                if (this.autoLoc) {
                  clearInterval(this.autoLoc);
                  this.autoLoc = null;
                }
              }
            } else if (this.config[c].items[i].key == "prate") {
              this.bs = parseInt(this.config[c].items[i].value);
            } else if (this.config[c].items[i].key == "pheight") {
              this.pheight = parseInt(this.config[c].items[i].value);
            } else if (this.config[c].items[i].key == "aplay") {
              if (this.config[c].items[i].value) {
                mapViewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
              } else {
                mapViewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
              }
            }else if (this.config[c].items[i].key == "jplon") {
              this.jplon = parseFloat(this.config[c].items[i].value);
            } else if (this.config[c].items[i].key == "jplat") {
              this.jplat = parseFloat(this.config[c].items[i].value);
            }
          }
        }
        localStorage.setItem('config4me',JSON.stringify(this.config));
      },
      deep: true,
    },
  },
  methods: {
    /**
 * @description 文字转语音方法
 * @public
 * @param { text, rate, lang, volume, pitch } object
 * @param  text 要合成的文字内容，字符串
 * @param  rate 读取文字的语速 0.1~10  正常1
 * @param  lang 读取文字时的语言
 * @param  volume  读取时声音的音量 0~1  正常1
 * @param  pitch  读取时声音的音高 0~2  正常1
 * @returns SpeechSynthesisUtterance
 */
 speak({ text, speechRate, lang, volume, pitch }, endEvent, startEvent) {
    if (!window.SpeechSynthesisUtterance) {
        console.warn('当前浏览器不支持文字转语音服务')
        return;
    }

    if (!text) {
        return;
    }

    const speechUtterance = new SpeechSynthesisUtterance();
    speechUtterance.text = text;
    speechUtterance.rate = speechRate || 1;
    speechUtterance.lang = lang || 'zh-CN';
    speechUtterance.volume = volume || 1;
    speechUtterance.pitch = pitch || 1;
    speechUtterance.onend = function() {
        endEvent && endEvent();
    };
    speechUtterance.onstart = function() {
        startEvent && startEvent();
    };
    speechSynthesis.speak(speechUtterance);
    
    return speechUtterance;
},
    getPosition(callback) {
      let that = this;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            //alert('精度:'+position.coords.accuracy+',方向:'+position.coords.heading+',速度:'+position.coords.speed);
            let loc = [position.coords.longitude, position.coords.latitude];
            let more = {
              acc: position.coords.accuracy,
              heading: position.coords.heading,
            };
            that.curPosition = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            if (undefined == callback) {
              that.refreshPosition(loc, more);
            } else {
              callback(loc, more);
            }
            that.pbg = "rgba(255,255,255,0.5)";
            clearInterval(that.changeColor);
            that.changeColor = null;
          },
          (error) => {
            let msg;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                msg = "未授予定位权限";
                break;
              case error.POSITION_UNAVAILABLE:
                msg = "定位结果无效";
                break;
              case error.TIMEOUT:
                msg = "定位超时";
                break;
              case error.UNKNOWN_ERROR:
                msg = "未知异常.";
                break;
            }
            //alert(msg);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
        if (this.changeColor) {
          clearInterval(this.changeColor);
          this.changeColor = null;
        }
        this.changeColor = setInterval(() => {
          this.changeCount++;
          this.pbg =
            this.changeCount % 2 == 0
              ? "rgba(255,0,0,0.5)"
              : "rgba(0,255,0,0.5)";
        }, 200);
      }
    },
    initMap() {
      let config = {
        DATADIR: ".",
      };
      let token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMWJlMDk2My0xN2Y1LTQ5NTAtODg4OS01MDc1OTQ4NTQyNjIiLCJpZCI6ODY1OSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImFzc2V0cyI6WzFdLCJpYXQiOjE1NTI0NjIyMjl9.QPT92mutlw-Pjr-FTGhVq4svbkRzXvkKkk8u-Ev1BfE";
      Cesium.Ion.defaultAccessToken = token;
      let terrainProvider = new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1),
      });
      let dt = new Cesium.WebMapTileServiceImageryProvider({
        url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml", //服务地址，如：'http://localhost:8080/geoserver/gwc/service/wmts'
        layer: "High Resolution 30cm Imagery", //图层名称，如：'tasmania'
        style: "",
        format: "image/png",
        tileMatrixSetID: "GoogleMapsCompatible",
        //  proxy: new this.Cesium.DefaultProxy('/proxy/')
      });
      let epsg = "EPSG:900913";
      let _matrixIds = [];
      for (let i = 0; i < 22; i++) {
        _matrixIds.push(epsg + ":" + i);
      }

      mapViewer = new Cesium.Viewer("map", {
        terrainProvider: terrainProvider,
        imageryProvider: dt,
        shouldAnimate: true,
        animation: false, //是否创建动画小器件，左下角仪表
        baseLayerPicker: false, //是否显示图层选择器
        fullscreenButton: false, //是否显示全屏按钮
        geocoder: new AMapGeocoderService(),
        homeButton: false, //是否显示Home按钮
        sceneModePicker: false, //是否显示3D/2D选择器
        sceneMode: Cesium.SceneMode.SCENE3D, //SCENE2D SCENE3D COLUMBUS_VIEW
        selectionIndicator: false, //是否显示选取指示器组件鼠标绿色框
        timeline: false, //是否显示时间轴
        navigationHelpButton: false, //是否显示右上角的帮助按钮
        vrButton: false, //是否显示双屏
        infoBox: false, //是否显示点击要素之后的显示信息
        //scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        fullscreenElement: document.body,
        //requestRenderMode: false, //性能调节
        skyBox: new Cesium.SkyBox({
          //用于渲染星空的SkyBox对象
          sources: {
            positiveX: config.DATADIR + "/SkyBox/00h+00.jpg",
            negativeX: config.DATADIR + "/SkyBox/12h+00.jpg",
            positiveY: config.DATADIR + "/SkyBox/06h+00.jpg",
            negativeY: config.DATADIR + "/SkyBox/18h+00.jpg",
            positiveZ: config.DATADIR + "/SkyBox/06h+90.jpg",
            negativeZ: config.DATADIR + "/SkyBox/06h-90.jpg",
          },
        }),
      });
      mapViewer.scene.debugShowFramesPerSecond = false;
      mapViewer.scene.moon.show = true;
      mapViewer.scene.skyBox.show = true;
      mapViewer.scene.fog.enabled = true;
      mapViewer.scene.requestRender();
      mapViewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
      mapViewer.scene.screenSpaceCameraController.maximumZoomDistance = 59000000;
      mapViewer.resolutionScale = 1;
      mapViewer.scene.postProcessStages.fxaa.enabled = true;
      mapViewer.scene.globe.depthTestAgainstTerrain = true; //影响军标绘制  倾斜摄影模型加载
      mapViewer.automaticallyTrackDataSourceClocks = false; //如果设置为true，将自动跟踪新添加数据源的时钟设置，如果数据源的时钟变更，则更新。如需单独设置时钟，请将此项设置为false。
      mapViewer.scene.skyAtmosphere.show = true; //关闭大气层
      mapViewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0.5);
      mapViewer._cesiumWidget._creditContainer.style.display = "none"; //取消版权信息
      mapViewer.geocoder._form.children[0].placeholder = "请输入关键字";
      window.mapViewer = mapViewer;
      window.Cesium=Cesium;
      this.setView(103.877011, 30.659098);      
    },
    setView(x, y, heading) {
      mapViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(x, y - 0.005, 1000),
        orientation: {
          heading: Cesium.Math.toRadians(
            null == heading || isNaN(heading) ? 0 : heading
          ), //方位角旋转
          pitch: Cesium.Math.toRadians(-45.0), //水平俯仰将
          roll: 0.0,
        },
      });
    },
    refreshPosition(loc, more) {
      mapViewer.entities.removeById(this.curId); //curCId
      mapViewer.entities.removeById(this.curCId); //
      this.addPointIcon({
        lon: loc[0],
        lat: loc[1],
        icon: "./icon/position.png",
        text: "",
        id: this.curId,
        scale: 0.2,
      });
      if (isNaN(more.acc) == false) {
        this.addCircle(this.curCId, loc, more.acc);
      }
      this.setView(loc[0], loc[1], more.heading);
    },
    addModel(id, lon, lat, height) {
      mapViewer.entities.removeById(id);
      const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
      const heading = Cesium.Math.toRadians(-90);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      mapViewer.entities.add({
        id: id,
        position: position,
        orientation: orientation,
        model: {
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          uri: "./model/zhanji.glb",
          minimumPixelSize: 32,
          maximumScale: 2,
          scale: 0.1,
        },
      });
      //mapViewer.trackedEntity = entity;
    },
    addPointIcon({
      lon,
      lat,
      url,
      text,
      id,
      scale,
      horizontalOrigin,
      fillColor,
    }) {
      let m = {
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        billboard: {
          image: url || "./icon/position.png",
          scale: scale || 1,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: horizontalOrigin
            ? horizontalOrigin
            : Cesium.HorizontalOrigin.CENTER,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        },
      };
      if (id) {
        m.id = id;
      }
      if (text) {
        m.label = {
          text: text,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          font: "normal 16px MicroSoft YaHei",
          fillColor: fillColor || Cesium.Color.RED,
          //pixelOffset : new Cesium.Cartesian2(100.0, 900)
          pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
          // eyeOffset: new Cesium.Cartesian3(20.0, 0.0, 0.0), // default
        };
      }
      return mapViewer.entities.add(m);
    },
    addCircle(id, center, r) {
      let color;
      if (r >= 50) {
        color = Cesium.Color.RED.withAlpha(0.5);
      } else if (r > 30 && r < 50) {
        color = Cesium.Color.BLUE.withAlpha(0.5);
      } else {
        color = Cesium.Color.GREEN.withAlpha(0.5);
      }
      mapViewer.entities.add({
        id: id,
        position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
        name: "",
        type: "tool",
        ellipse: {
          semiMinorAxis: r,
          semiMajorAxis: r,
          material: color,
          outline: true,
        },
      });
    },

    createpolyline(positons, color = "#ff0") {
      let id = "jroute";
      mapViewer.entities.removeById(id);
      const polyline = mapViewer.entities.add({
        id,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positons),
          clampToGround: true,
          width: 6,
          material: Cesium.Color.fromCssColorString(color),
        },
      });
      mapViewer.flyTo(polyline);
      return polyline;
    },
    // 倾斜摄影数据上添加lable的方法
    putLables(_datas, _parent) {
      for (let i = 0; i < _datas.length; i++) {
        let data = _datas[i];

        mapViewer.entities.add({
          //参数顺序：经度、纬度
          position: Cesium.Cartesian3.fromDegrees(
            data.lon,
            data.lat,
            data.height
          ), //标签的位置
          //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          parent: _parent,
          polyline: {
            //竖线
            show: true,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              data.lon,
              data.lat,
              0,
              data.lon,
              data.lat,
              data.height - 2,
            ]),
            //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1500),//高于多少m的时候，不可见
            width: 5,
            material: Cesium.Color.fromCssColorString("#ffffff"),
            outlineColor: Cesium.Color.fromCssColorString("#3ab70b"),
            outlineWidth: 2,
          },
          label: {
            text: data.name,
            font: "14pt monospace",
            //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            //showBackground:true,                //是否显示背景颜色
            style: Cesium.LabelStyle.FILL,
            fillColor: Cesium.Color.fromCssColorString("#f90808"),
            outlineColor: Cesium.Color.fromCssColorString("#67360d"),
            //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1500),
            //scaleByDistance : new Cesium.NearFarScalar(100, 2, 500, 0.0),
            outlineWidth: 3,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            pixelOffset: new Cesium.Cartesian2(0, 0), //此属性为设置偏移量
          },
          type: "text", //自定义属性
        });
      }
    },

    async search() {
      console.log(this.input1, this.input2);
      if (this.input1 == "" || this.input2 == "") {
        alert("输入框不能为空！");
        return;
      }
      this.$axios
        .all([
          this.$axios.get(
            `https://restapi.amap.com/v3/geocode/geo?address=${this.input2}&key=${aMapKey}`
          ),
        ])
        .then(
          this.$axios.spread((res2) => {
            this.input2 = res2.data.geocodes[0].formatted_address;
            const data_string1 = [this.curPosition[0]-this.jplon,this.curPosition[1]-this.jplat] .join(",");
            const data_string2 = res2.data.geocodes[0].location.split(",");
            this.$axios
              .get(
                `https://restapi.amap.com/v3/direction/driving?origin=${data_string1}&destination=${data_string2}&output=json&key=${aMapKey}`
              )
              .then((response) => {
                const resArr = [];
                const fr = [];
                if (response.status == 200) {
                  let ans = [];
                  let p = 0,
                    ap = 0;
                  let startx;
                  let starty;
                  let pts=[];
                  let duration = response.data.route.paths[0].duration;
                  response.data.route.paths[0].steps.map((item) => {
                    const stringArr = item.polyline.split(";");
                    let nj, nw;
                    stringArr.forEach((i) => {
                      let ps = i.split(",");
                      let lon = parseFloat(ps[0]) + this.jplon,
                        lat = parseFloat(ps[1]) + this.jplat;
                      if (undefined == nj) {
                        (nj = lon), (nw = lat);
                      }
                      if (undefined == startx) {
                        (startx = lon), (starty = lat);
                      }
                      resArr.push(...[lon, lat]);
                      pts.push([lon,lat,500]);
                      fr.push(...[ap, lon, lat, this.pheight]);
                      ap += 10;
                    });
                    p++;
                    let an = {
                      lon: nj,
                      lat: nw,
                      height: this.pheight,
                      name: p + " . " + item.instruction,
                    };
                    ans.push(an);
                  });
                //   const options = {
                //     data: pts, // url 或者直接数据，格式和以前一样
                //     view: { pitch: -45, range:4700 }, // 默认不传
                //     model: {
                //         url: './model/zhanji.glb'// 和cesium中model的配置一致
                //     },
                //     isPathShow: true, // 漫游路径是否显示
                //     speed: '', // 默认可不传
                //     time: duration// 此次漫游所需要的总时间，单位：秒
                // };
                // let play=new Roaming(mapViewer,options);
                // play.init(options);
                  let rnid = "routean";
                  let old = mapViewer.entities.getById(rnid);
                  if (old) {
                    mapViewer.entities.removeById(rnid);
                    old._children.forEach((r) => {
                      mapViewer.entities.remove(r);
                    });
                  }
                  let labels = mapViewer.entities.add(
                    new Cesium.Entity({ id: rnid })
                  );
                  this.putLables(ans, labels);
                  //this.addModel('fly',startx,starty,50);
                  let now = new Date();
                  let end = now.getTime() + parseInt(duration)*1000;
                  let endTime = new Date(end);
                  var czml = [
                    {
                      id: "document",
                      name: "CZML Path",
                      version: "1.0",
                      clock: {
                        interval:
                          now.toISOString() + "/" + endTime.toISOString(),
                        currentTime: now.toISOString(),
                        multiplier: this.bs,
                      },
                    },
                    {
                      id: "path",
                      name: "path with GPS flight data",
                      description: "Created by wangyu",
                      availability:
                        now.toISOString() + "/" + endTime.toISOString(),
                      path: {
                        material: {
                          polylineOutline: {
                            color: {
                              rgba: [255, 0, 255, 127],
                            },
                            outlineColor: {
                              rgba: [255, 0, 255, 127],
                            },
                            outlineWidth: 3,
                          },
                        },
                        width: 5,
                        leadTime: 36000, //路径前面提前多少秒的路径显示出来
                        trailTime: 36000, //路径后面延后多少秒的路径显示出来
                        resolution: 3,
                      },
                      model: {
                        gltf: "./model/zhanji.glb",
                        scale: 0.1,
                        minimumPixelSize: 128,
                      },
                      position: {
                        epoch: now.toISOString(),
                        cartographicDegrees: fr,
                      },
                    },
                  ];

                  var airModel;
                  mapViewer.dataSources
                    .add(Cesium.CzmlDataSource.load(czml))
                    .then(function (ds) {
                      airModel = ds.entities.getById("path");
                      // 设置模型可以随路径方向转向
                      airModel.orientation =
                        new Cesium.VelocityOrientationProperty(
                          airModel.position
                        );
                      airModel.model.alignedAxis =
                        new Cesium.VelocityVectorProperty(
                          airModel.position,
                          true
                        );
                      mapViewer.trackedEntity = airModel;
                    });

                  labels.show = true;
                }
              });
          })
        );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.position {
  cursor: pointer;
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid #fff;
  border-radius: 50%;
  right: 15px;
  bottom: 15px;
}
.inpos {
  left: 4px;
  bottom: 4px;
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid #fff;
  border-radius: 50%;
}
.cfg {
  left: 4px;
  top: 4px;
  position: absolute;
  width: 32px;
  height: 32px;
  font-size: 30px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
</style>
<style>
.cesium-viewer-toolbar {
  right: 4px !important;
}
.el-dialog__body {
  padding: 0px !important;
}
</style>

