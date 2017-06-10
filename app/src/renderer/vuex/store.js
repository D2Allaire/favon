import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    path: '',
    files: [],
    parsedShows: {},
    isScrolling: false,
    selected: '',
    loading: false,
    ambiguousFiles: [],
    hasAmbiguousFiles: false,
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
    ADD_FILE: (state, file) => {
      state.files.push(file);
    },
    SET_SELECTED: (state, selected) => {
      if (state.selected === selected) state.selected = '';
      else state.selected = selected;
    },
    SET_LOADING: (state, val) => {
      state.loading = val;
    },
    ADD_AMBIGUOUS: (state, file) => {
      state.ambiguousFiles.push(file);
      state.hasAmbiguousFiles = true;
    },
    REMOVE_AMBIGUOUS: (state, index) => {
      state.ambiguousFiles.splice(index, 1);
    },
    EMPTY_AMBIGUOUS: (state) => {
      state.ambiguousFiles.length = 0;
      state.hasAmbiguousFiles = false;
    },
    ADD_PARSED_SHOW: (state, series) => {
      Vue.set(state.parsedShows, series.show, series);
    },
    UPDATE_PARSED_SHOW: (state, series) => {
      state.parsedShows[series.show] = series;
    },
    REMOVE_PARSED_SHOW: (state, name) => {
      Vue.delete(state.parsedShows, name);
    },
  },
  strict: process.env.NODE_ENV !== 'production',
});
