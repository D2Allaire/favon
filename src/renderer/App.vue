<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import store from './vuex/store';
  export default {
    store,
  };
</script>

<style>

  * {
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #app { height: 100%; }

  .container {
    width: 95%;
    max-width: 1020px;
  }

  :not(input):not(textarea),
  :not(input):not(textarea)::after,
  :not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
  }
  input, button, textarea, :focus {
    outline: none;
  }
  a:not([draggable=true]), img:not([draggable=true]) {
    -webkit-user-drag: none;
    user-drag: none; /* Technically not supported in Electron yet */
  }
  a[href^="http://"],
  a[href^="https://"],
  a[href^="ftp://"] {
      -webkit-user-drag: auto;
      user-drag: auto; /* Technically not supported in Electron yet */
  }
</style>
