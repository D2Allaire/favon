import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    path: '',
    files: [],
    renamed: [],
    isScrolling: false,
    selected: '',
    loading: false,
  },
  mutations: {
    SET_SCROLLING: (state, scrolling) => {
      state.isScrolling = scrolling;
    },
    SET_PATH: (state, path) => {
      state.path = path;
    },
    UPDATE_FILES: (state, files) => {
      state.files = files;
    },
    EMPTY_FILES: (state) => {
      state.files.length = 0;
    },
    REMOVE_FILE: (state, index) => {
      state.files.splice(index, 1);
    },
    SET_SELECTED: (state, selected) => {
      if (state.selected === selected) state.selected = '';
      else state.selected = selected;
    },
    SET_LOADING: (state, val) => {
      state.loading = val;
    },
  },
  strict: process.env.NODE_ENV !== 'production',
});
