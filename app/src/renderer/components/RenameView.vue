<template>
  <div class="renamepage">
    <header>
      <div class="container">
        <div class="header__left">
          <img src="./StartView/assets/logo.png" />
          <h1>Rename Files</h1>
        </div>
        <div class="header__right">
          <button @click="openFileDialog" class="button is-info has-depth">Open Folder</button>
        </div>
      </div>
    </header>
    <main>
      <div class="container">
        <div class="panels">
          <system-files></system-files>
          <img src="./RenameView/assets/chevron.png">
          <renamed-files></renamed-files>
        </div>
        <div class="action">
          <button 
          class="button is-danger" 
          :disabled="removeDisabled"
          @click="removeItem">
            Remove
          </button>
          <div class="is-right">
            <span>Select a media type</span>
            <button
            class="button is-primary has-depth"
            :disabled="isMatching"
            :class="tvButtonClasses"
            @click="parseTV">
              TV Show
            </button>
            <button
            class="button is-primary has-depth"
            :disabled="isMatching"
            :class="movieButtonClasses"
            @click="parseMovie">
              Movie
            </button>
            <button 
            class="button is-primary has-depth"
            :disabled="isMatching"
            :class="animeButtonClasses"
            @click="parseAnime">
              Anime
            </button>
            <button
            class="button is-success has-depth"
            :disabled="isMatching">
              Save
            </button>
          </div>
        </div>
      </div>
    </main>
    
  </div>
</template>

<script>
  import SystemFiles from './RenameView/SystemFiles.vue';
  import RenamedFiles from './RenameView/RenamedFiles.vue';
  import reader from '../services/reader';
  import AnimeParser from '../parser/AnimeParser';
  import Anime from '../models/Anime';

  export default {
    components: {
      SystemFiles,
      RenamedFiles
    },
    name: 'rename',
    data() {
      return {
        isMatching: false,
        animeButtonClasses: '',
        movieButtonClasses: '',
        tvButtonClasses: '',
        error: '',
      }
    },
    computed: {
      ipc() {
        return this.$electron.ipcRenderer;
      },
      path() {
        return this.$store.state.path;
      },
      files() {
        return this.$store.state.files;
      },
      selected() {
        return this.$store.state.selected;
      },
      removeDisabled() {
        return this.isMatching || !Number.isInteger(this.selected); 
      }
    },
    mounted() {
      this.ipc.on('selected-directory', (event, path) => {
        this.$store.commit('SET_PATH', path[0]);
        this.readFiles();
      });
    },
    methods: {
      openFileDialog() {
        this.ipc.send('open-file-dialog');
      },
      readFiles() {
        this.$store.commit('SET_LOADING', true);
        reader.readFiles(this.path)
          .then((files) => {
            this.$store.commit('EMPTY_FILES');
            this.$store.commit('UPDATE_FILES', files);
            this.$store.commit('SET_LOADING', false);
            this.$store.commit('SET_SELECTED', '');
          })
          .catch((err) => {
            this.$store.commit('SET_LOADING', false);
            this.error = err.message || err;
          });
      },
      removeItem() {
        this.$store.commit('REMOVE_FILE', this.selected);
      },
      parseAnime() {
        this.isMatching = true;
        this.animeButtonClasses = 'is-loading is-empty';
        const newFiles = [];
        this.files.forEach((file) => {
          const anime = new Anime(...file.getProperties(), '', '', '');
          newFiles.push(new AnimeParser(anime).parse());
        })
        this.$store.commit('UPDATE_FILES', newFiles);
        this.isMatching = false;
        this.animeButtonClasses = '';
      },
      parseMovie() {
        this.isMatching = true;
        this.movieButtonClasses = 'is-loading is-empty';
      },
      parseTV() {
        this.isMatching = true;
        this.tvButtonClasses = 'is-loading is-empty';
      }
    },
  };
</script>

<style lang="scss" scoped>
  .renamepage {
    height: 100%;
  }

  header {
    height: 70px;
    background-color: #1d2d51;
    display: flex;
    align-items: center;
  }

  .header__left {
    float: left;

    img {
      display: inline-block;
      height: 24px;
    }

    h1 {
      display: inline-block;
      font-weight: 300;
      font-size: 1.4rem;
      text-transform: uppercase;
      margin: 0 0 0 24px;
      color: #c6c6c6;
    }
  }

  .header__right {
    float: right;
  }

  main {
    background-color: #f6f8fc;
    height: calc(100% - 70px);
    padding-top: 35px;
  }

  .panels {
    display: flex;
    align-items: center;
    justify-content: space-between;

    img {
      opacity: .5;
    }
  }
  .action {
    margin-top: 35px;
    display: flex;
    align-items: center;

    .button.is-primary:first-of-type {
      margin-left: 20px;
    }
    .button.is-primary:not(:last-of-type) {
      margin-right: 15px;
    }
    .button.is-success {
      margin-left: 40px;
    }
  }
</style>
