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
      if (this.file.season === 'Credits') {
        return `${this.file.show} - ${this.file.episode}`;
      }
      if (this.file.episode.indexOf('-') > -1) {
        const parts = this.file.episode.split('-');
        return `${this.file.show} - S${this.file.season}E${parts[0]}E${parts[1]}`;
      }
      return `${this.file.show} - S${this.file.season}E${this.file.episode}`;
    }

  },
  methods: {
    toggleSelected(index) {
      this.$store.commit('SET_SELECTED', index);
    },
  }
}
</script>