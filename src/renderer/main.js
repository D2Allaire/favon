import Vue from 'vue';
import Electron from 'vue-electron';
import Router from 'vue-router';
import dotenv from 'dotenv';
import './vendor/luma/luma.min.css';


import App from './App';
import routes from './routes';

Vue.use(Electron);
Vue.use(Router);
Vue.config.debug = true;
dotenv.config();

const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes,
});

/* eslint-disable no-new */
new Vue({
  router,
  ...App,
}).$mount('#app');
