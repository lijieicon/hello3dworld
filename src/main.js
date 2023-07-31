import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
Vue.use(ElementUI)
Vue.prototype.$axios = axios;
Vue.config.productionTip = false
Vue.prototype.getData = async function(url, paramData, method) {
    var params = new URLSearchParams();
    if (paramData) {
        for (let p in paramData) {
            params.append(p, paramData[p]); //你要传给后台的参数值 key/value
        }
    }
    let token = '';
    if (method === "post") {

        for (let p in paramData) {
            params.append(p, paramData[p]);
        }
        if (token) {
            params.token = token;
        }
        axios({
                url: url,
                method: "post",
                data: params,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            .then(data => {
                return data.data;

            })
            .catch(error => {
                console.log("请求异常:" + error);
                return { ret: false, msg: error };
            });
    } else {
        paramData = paramData || {};
        if (token) {
            paramData.token = token;
        }
        axios
            .get(url, {
                params: paramData,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            .then(data => {
                return data.data;

            })
            .catch(error => {

                return { ret: false, msg: error };
            });
    }
};
new Vue({
    render: h => h(App),
}).$mount('#app')