<template>
  <li>
    <a @click="toggleSelected(index)" :class="{ selected : selected === index }">
      {{ name }}
    </a>
  </li>
</template>

<script>
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
      if (!this.file.show || !this.file.season || !this.file.episode) return this.file.renamed;
      const season = this.file.season || '';
      const episode = this.file.episode || '';
      if (season === 'Credits') {
        return `${this.file.show} - ${episode}`;
      }
      if (episode.indexOf('-') > -1) {
        const parts = episode.split('-');
        return `${this.file.show} - S${season}E${parts[0]}E${parts[1]}`;
      }
      return `${this.file.show} - S${season}E${episode}`;
    }

  },
  methods: {
    toggleSelected(index) {
      this.$store.commit('SET_SELECTED', index);
    },
  }
}
</script>