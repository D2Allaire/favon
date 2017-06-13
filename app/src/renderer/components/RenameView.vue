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
  import SystemFiles from './RenameView/SystemFiles.vue';
  import RenamedFiles from './RenameView/RenamedFiles.vue';
  import AmbiguityModal from './RenameView/AmbiguityModal.vue';
  import FileReader from '../reader/FileReader';
  import AnimeParser from '../parser/AnimeParser';
  import Anime from '../models/Anime';
  import SeriesParser from '../parser/SeriesParser';
  import Series from '../models/Series';
  import Movie from '../models/Movie';
  import MovieParser from '../parser/MovieParser';
  import FileRenamer from '../renamer/FileRenamer';
  import TMDBClient from '../matcher/TMDBClient';
  import MovieMatcher from '../matcher/MovieMatcher';
  import TVDBClient from '../matcher/TVDBClient';
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
      },
      hasAmbiguousFiles() {
        return this.$store.state.hasAmbiguousFiles;
      },
      parsedShows() {
        return this.$store.state.parsedShows;
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
        this.closeNotification();
        this.$store.commit('SET_LOADING', true);
        const reader = new FileReader(this.path);
        reader.readDirectory()
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
        this.setLoading('anime', true);
        const newFiles = [];
        this.files.forEach((file) => {
          const anime = new Anime(...file.getProperties());
          newFiles.push(new AnimeParser(anime).parse());
        });
        this.$store.commit('UPDATE_FILES', newFiles);
        this.setLoading('anime', false);
      },
      parseMovie() {
        this.setLoading('movie', true);;
        const newFiles = [];
        const matcher = new MovieMatcher(new TMDBClient(process.env.TMDB_KEY));
        this.files.forEach((file) => {
          const movie = new Movie(...file.getProperties());
          const parsedMovie = new MovieParser(movie).parse();
          newFiles.push(parsedMovie);
        });
        matcher.matchFiles(newFiles, matchedFiles => {
          const matchedMovies = [];
          for (let i = 0; i < matchedFiles.length; i++) {
            if (!(matchedFiles[i] instanceof Movie)) {
              this.$store.commit('ADD_AMBIGUOUS', matchedFiles[i]);
            } else {
              matchedMovies.push(matchedFiles[i]);
            }
          }
          this.$store.commit('UPDATE_FILES', matchedMovies);
        });
        this.setLoading('movie', false);
      },
      parseTV() {
        this.setLoading('tv', true);
        const newFiles = [];
        const matcher = new SeriesMatcher(new TVDBClient(process.env.TVDB_KEY));
        this.files.forEach((file) => {
          const series = new Series(...file.getProperties());
          const parsedSeries = new SeriesParser(series).parse();
          // Only add each show once
          if (parsedSeries.show.length > 0 
            && this.parsedShows[parsedSeries.show] === undefined) {
            this.$store.commit('ADD_PARSED_SHOW', new Series(...parsedSeries.getProperties()));
          }
          newFiles.push(parsedSeries);
        });
        // After matching show, clear ambigous entries and request episodes from API.
        matcher.matchFiles(Object.values(this.parsedShows), matchedFiles => {
          for (let series in matchedFiles) {
            if (!(matchedFiles[series] instanceof Series)) {
              console.log('Ambigious.');
              this.$store.commit('ADD_AMBIGUOUS', matchedFiles[series]);
            } else {
              matcher.requestEpisodes(matchedFiles[series].matchedId)
              .then((episodes) => {
                newFiles.forEach(file => {
                  if (episodes[`S${file.season}E${file.episode}`]) {
                    file.title = FileRenamer.cleanString(episodes[`S${file.season}E${file.episode}`].episodeName);
                    file.show = matchedFiles[series].matchedShow;
                  }
                });
                this.$store.commit('UPDATE_FILES', newFiles);
                this.setLoading('tv', false);
              })
              .catch(error => {
                console.error(error.message);
              });
            }
          }
        });
      },
      setLoading(type, status) {
        if (status) {
          this.isMatching = true;
          this[`${type}ButtonClasses`] = 'is-empty is-loading';
        } else {
          this.isMatching = false;
          this[`${type}ButtonClasses`] = '';
        }
        
      },
      renameFiles() {
        this.saveButtonClasses = 'is-loading is-empty';
        const renamer = new FileRenamer();
        this.files.forEach((file) => {
          renamer.rename(file);
        });
        this.saveButtonClasses = '';
        this.notificationClasses = 'is-visible';
        this.alertClasses = 'is-success';
        this.alertStatus = 'All files have been renamed.';
      },

      closeNotification() {
        this.notificationClasses = '';
      },

      showAlreadyParsed(name) {
        return (this.parsedShows.indexOf(name) > -1);
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
