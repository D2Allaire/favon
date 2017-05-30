<template>
  <div class="settings">
    <div class="settings__conent">
      <h1>Favon Settings</h1>
      <div class="container">
        <div class="options">
          <p>Movie Pattern</p>
          <input type="text" v-model="movie">
          <p class="helper">Available options: %N: Name | %Y: Year</p>
          <p>Series Pattern</p>
          <input type="text" v-model="series">
          <p class="helper">Available options: %N: Name | %S: Season Number | %E: Episode Number | %T: Episode Title</p>
          <p>Anime Pattern</p>
          <input type="text" v-model="anime">
          <p class="helper">Available options: %N: Name | %E: Episode Number | %T: Episode Title</p>
          <div class="field">
            <input type="checkbox" id="truncate" name="truncate" v-model="truncate">
            <label for="truncate">Truncate long titles</label>
          </div>
          <div class="actions">
          <div class="button-group">
            <button @click="goBack" class="button is-outline is-light">Back</button>
            <button @click="saveSettings" class="button is-success has-depth">{{ saveButtonStatus }}</button>
          </div>
        </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import Config from 'electron-config';

export default {
  name: 'settings',
  data() {
    return {
      movie: '',
      series: '',
      anime: '',
      truncate: false,
      saveButtonStatus: 'Save'
    }
  },
  mounted() {
    const config = new Config();
    this.movie = config.get('movie') || '%N (%Y)';
    this.series = config.get('series') || '%N S%SE%E - %T';
    this.anime = config.get('anime') || '%N - %E - %T';
    this.truncate = config.get('truncate') || false;
  },
  methods: {
    saveSettings() {
      const config = new Config();
      config.set('movie', this.movie);
      config.set('series', this.series);
      config.set('anime', this.anime);
      config.set('truncate', this.truncate);
      this.saveButtonStatus = 'Saved';
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style lang="scss" scoped>
  .settings {
    height: 100%;
    background: #1d2d51;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 0 50px 0;
  }
  .options {
    max-width: 50%;
    margin: 0 auto;
  }
  h1 {
    margin-top: 30px;
    text-align: center;
  }
  input[type=text] {
    font-family: monospace;
    border: 1px solid mediumaquamarine;
    color: #fff;
  }
  .helper {
    font-size: 1.3rem;
    font-style: italic;
    opacity: .8;
  }
  .actions {
    margin-top: 20px;
  }
  input[type=checkbox]+label {
    color: #fff;
  }
  .button.is-light {
    margin-right: 20px;

    &:hover,
    &:active {
      border-color: darken(#e3e4e4, 20%);
      color: darken(#e3e4e4, 20%);
    }
  }
</style>
