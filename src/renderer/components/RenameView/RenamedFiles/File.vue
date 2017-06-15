<template>
  <li>
    <a @click="toggleSelected(index)" :class="{ selected : selected === index }">
      {{ name }}
    </a>
  </li>
</template>

<script>
import Config from 'electron-config';
import Anime from '../../../models/Anime';
import Series from '../../../models/Series';
import Movie from '../../../models/Movie';
import FileRenamer from '../../../renamer/FileRenamer';

const config = new Config();

export default {
  name: 'file',
  props: ['index'],
  computed: {
    selected() {
      return this.$store.state.selected;
    },
    file() {
      return this.$store.state.files[this.index];
    },
    name() {
      let newName = this.file.renamed;
      if (this.file instanceof Anime) {
        if (!this.file.show || !this.file.episode) return newName;
        newName = FileRenamer.getAnimeFileName(this.file);
      } else if (this.file instanceof Series) {
        if (!this.file.show || !this.file.season || !this.file.episode) return newName;
        newName = FileRenamer.getSeriesFileName(this.file);
      } else if (this.file instanceof Movie) {
        if (!this.file.title || !this.file.year) return newName;
        newName = FileRenamer.getMovieFileName(this.file, config);
      }
      return newName;
    },
  },

  methods: {
    toggleSelected(index) {
      this.$store.commit('SET_SELECTED', index);
    },
  },
};

</script>
