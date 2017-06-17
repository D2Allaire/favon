<template>
  <div class="renamepage">
    <header>
      <div class="container">
        <div class="header__left">
          <img src="./StartView/assets/logo.png" />
          <h1>Rename Files</h1>
        </div>
        <div class="header__right">
          <router-link to="settings" class="button is-warning is-narrow has-depth">Settings</router-link>
          <button @click="openFileDialog" class="button is-info has-depth">Open Folder</button>
        </div>
      </div>
    </header>
    <main>
      <div class="notification" :class="notificationClasses">
          <div class="alert" :class="alertClasses">
            <div class="status">{{ alertStatus }}</div>
            <div class="close">
              <button class="button is-outline is-light is-narrow" @click="closeNotification">Close</button></div>
          </div>
        </div>
      <div class="container">
        <ambiguity-modal v-if="hasAmbiguousFiles"></ambiguity-modal>
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
            :disabled="isMatching"
            :class="saveButtonClasses"
            @click="renameFiles">
              Save
            </button>
          </div>
        </div>
      </div>
    </main>
    
  </div>
</template>

<script>
  import EventBus from '../event-bus';
  import SystemFiles from './RenameView/SystemFiles.vue';
  import RenamedFiles from './RenameView/RenamedFiles.vue';
  import AmbiguityModal from './RenameView/AmbiguityModal.vue';
  import FileReader from '../reader/FileReader';
  import FileRenamer from '../renamer/FileRenamer';
  import AnimeParser from '../parser/AnimeParser';
  import SeriesParser from '../parser/SeriesParser';
  import MovieParser from '../parser/MovieParser';
  import MovieMatcher from '../matcher/MovieMatcher';
  import SeriesMatcher from '../matcher/SeriesMatcher';

  export default {
    components: {
      SystemFiles,
      RenamedFiles,
      AmbiguityModal,
    },
    name: 'rename',
    data() {
      return {
        isMatching: false,
        animeButtonClasses: '',
        movieButtonClasses: '',
        tvButtonClasses: '',
        saveButtonClasses: '',
        alertClasses: 'is-success',
        alertStatus: 'All files have been renamed.',
        notificationClasses: '',
        newFiles: {},
        uniqueSeriesAmount: 0,
        seriesCleared: 0,
        episodesCleared: 0,
        episodesCount: 0,
        updatedFiles: [],
      };
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
      },
      hasAmbiguousFiles() {
        return this.$store.state.hasAmbiguousFiles;
      },
      parsedShows() {
        return this.$store.state.parsedShows;
      },
    },
    mounted() {
      this.ipc.on('selected-directory', (event, path) => {
        this.$store.commit('SET_PATH', path[0]);
        this.readFiles();
      });
      EventBus.$on('series-ambiguity-cleared', this.requestEpisodes);
    },

    methods: {
      /**
       * Open folder select dialog
       */
      openFileDialog() {
        this.ipc.send('open-file-dialog');
      },

      /**
       * Read files from a given directory and update view
       */
      readFiles() {
        this.closeNotification();
        this.$store.commit('SET_LOADING', true);
        const reader = new FileReader(this.path);
        reader.readDirectory()
          .then((files) => {
            this.newFiles.length = 0;
            this.$store.commit('EMPTY_FILES');
            this.$store.commit('UPDATE_FILES', files);
            this.$store.commit('SET_LOADING', false);
            this.$store.commit('SET_SELECTED', '');
          })
          .catch(() => {
            this.$store.commit('SET_LOADING', false);
          });
      },

      /**
       * Delete an item from file list
       */
      removeItem() {
        this.$store.commit('REMOVE_FILE', this.selected);
      },

      /**
       * Parse files as anime
       */
      parseAnime() {
        this.setLoading('anime', true);
        const parser = new AnimeParser();

        const parsedFiles = parser.parseFiles(this.files);
        console.log(parsedFiles);
        // const newFiles = [];
        // this.files.forEach((file) => {
        //   const anime = new Anime(...file.getProperties());
        //   newFiles.push(new AnimeParser(anime).parse());
        // });
        // this.$store.commit('UPDATE_FILES', newFiles);
        // this.setLoading('anime', false);
      },

      /**
       * Parse files as movies
       */
      parseMovie() {
        this.setLoading('movie', true);
        const parser = new MovieParser();
        const matcher = new MovieMatcher();

        const parsedFiles = parser.parseFiles(this.files);
        matcher.matchFiles(parsedFiles, (matchedFiles) => {
          // Add ambigious files
          this.$store.commit('UPDATE_AMBIGIOUS', matchedFiles.ambigious);
          this.$store.commit('UPDATE_FILES', matchedFiles.matched);
          this.setLoading('movie', false);
        });
      },

      /**
       * Parse files as series
       */
      parseTV() {
        this.episodesCleared = 0;
        this.setLoading('tv', true);
        const parser = new SeriesParser();
        const matcher = new SeriesMatcher();

        const parsedFiles = parser.parseFiles(this.files);
        this.newFiles = parsedFiles.parsed;
        this.episodesCount = parsedFiles.episodeCount;
        this.$store.commit('SET_PARSED_SHOWS', parsedFiles.uniqueShows);


        // After matching shows, clear ambigous entries and request episodes from API.
        matcher.matchFiles(Object.values(this.parsedShows), (matchedFiles) => {
          this.$store.commit('UPDATE_AMBIGIOUS', matchedFiles.ambigious);
          this.episodesCleared += matchedFiles.notMatched.length;
          matcher.requestEpisodes(Object.values(matchedFiles.matched), (showsWithEpisodes) => {
            showsWithEpisodes.forEach((show) => {
              this.processSeriesFiles(show);
            });
            this.checkIfAllSeriesProcessed();
          });
        });
      },

      /**
       * Request episodes for a single show. Used by ambiguity check
       * @param {Object} series to be requested
       */
      requestEpisodes(series) {
        const matcher = new SeriesMatcher();
        matcher.requestEpisodes([series], (showsWithEpisodes) => {
          this.processSeriesFiles(showsWithEpisodes[0]);
          this.checkIfAllSeriesProcessed();
        });
      },

      /**
       * Assign title and show to series episodes for particular show
       * @param {Object} show to be processed
       */
      processSeriesFiles(show) {
        this.newFiles[show.show].forEach((file) => {
          if (show.episodes[`S${file.season}E${file.episode}`]) {
            file.title = FileRenamer.cleanString(show.episodes[`S${file.season}E${file.episode}`]);
            file.show = FileRenamer.cleanString(show.seriesName);
          }
          this.episodesCleared++;
        });
      },

      /**
       * Check if all series have been processed
       * If so, update store and reset loading button
       */
      checkIfAllSeriesProcessed() {
        if (this.episodesCleared === this.episodesCount) {
          const finishedSeries = Object.values(this.newFiles);
          for (let i = 0; i < finishedSeries.length; i++) {
            this.updatedFiles = this.updatedFiles.concat(finishedSeries[i]);
          }
          this.$store.commit('UPDATE_FILES', this.updatedFiles);
          this.setLoading('tv', false);
        }
      },

      /**
       * Manipulate the loading status of matching buttons
       * @param {String} type (`movie`, `tv`, `anime`)
       * @param {Boolean} status to indicate whether it's loading or not
       */
      setLoading(type, status) {
        if (status) {
          this.isMatching = true;
          this[`${type}ButtonClasses`] = 'is-empty is-loading';
        } else {
          this.isMatching = false;
          this[`${type}ButtonClasses`] = '';
        }
      },

      /**
       * Rename all files. Once done, display success notification
       */
      renameFiles() {
        this.saveButtonClasses = 'is-loading is-empty';
        this.files.forEach((file) => {
          FileRenamer.rename(file);
        });
        this.saveButtonClasses = '';
        this.notificationClasses = 'is-visible';
        this.alertClasses = 'is-success';
        this.alertStatus = 'All files have been renamed.';
      },

      /**
       * Close the success notification
       */
      closeNotification() {
        this.notificationClasses = '';
      },
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
    z-index: 999;
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

  .notification {
    position: absolute;
    top: 60px;
    opacity: 0;
    transition: opacity .5s, visibility .5s;
    visibility: hidden;
    width: 100%;

    .alert {
      display: flex;
      align-items: center;
      position: relative;
      transition: transform 1s;
      transform: translateY(0px);

      &.is-success {
        background-color: #6fed6f;
      }
    }

    &.is-visible {
      opacity: 0.9;
      visibility: visible;

      .alert {
        transform: translateY(10px);
        z-index: 10;
      }          
    }

    .close {
      margin-left: auto;

      .button.is-light {
      border-color: #4fb54f;
      color: #4fb54f;

      &:hover {
        border-color: #3f933f;
        color: #3f933f;
      }
    }
    }
  }
  .button.is-warning {
    margin-right: 20px;
  }
</style>
