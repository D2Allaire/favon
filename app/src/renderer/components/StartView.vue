<template>
  <div class="startpage">
    <div class="startpage__content">
      <img src="./StartView/assets/logo.png" />
      <div v-if="loading" class="spinner">
        <div class="pulse"></div>
        <div class="pulse"></div>
      </div>
      <div v-show="!loading" class="actions">
        <p><em>Select a folder to start.</em></p>
        <div class="button-group">
          <button class="button is-info has-depth" @click="openFileDialog">Open Folder</button>
          <router-link to="settings" class="button is-warning has-depth">Settings</router-link>
        </div>
        <p v-if="error" class="is-warning">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import FileReader from '../reader/FileReader';
  import Anime from '../models/Anime';

  export default {
    name: 'start-page',
    mounted() {
      this.ipc.on('selected-directory', (event, path) => {
        this.$store.commit('SET_PATH', path[0]);
        this.readFiles();
      });
    },
    data() {
      return {
        error: ''
      }
    },
    computed: {
      ipc() {
        return this.$electron.ipcRenderer;
      },
      path() {
        return this.$store.state.path;
      },
      loading() {
        return this.$store.state.loading;
      },
    },
    methods: {
      openFileDialog() {
        this.ipc.send('open-file-dialog');
      },
      /**
       * Parse all files in the selected folder. Only match video and subtitle files.
       * Extract filename, extension and full path, and save in new object.
       * Add object to the files array in vuex.
       */
      readFiles() {
        this.$store.commit('SET_LOADING', true);
        const reader = new FileReader(this.path);
        reader.readDirectory()
          .then((files) => {
            this.$store.commit('UPDATE_FILES', files);
            this.$store.commit('SET_LOADING', false);
            this.$router.push('/rename');
          })
          .catch((err) => {
            this.$store.commit('SET_LOADING', false);
            this.error = err.message || err;
          });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .startpage {
    height: 100%;
    align-items: center;
    background: #1d2d51;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;

    p {
      color: #c6c6c6;
      margin: 7px 0 25px 0;
    }

    button:first-child {
      margin-right: 40px;
    }

    button:nth-child(2) {
      margin-left: auto;
      margin-right: 0;
    }

    .spinner {
      margin-top: 10px;
    }

    .pulse {
      background-color: antiquewhite;
    }
    
    p.is-warning {
      color: #ffdd57;
      margin-top: 5px;
    }

    &__content {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin-top: -50px;
    }
  }
</style>
