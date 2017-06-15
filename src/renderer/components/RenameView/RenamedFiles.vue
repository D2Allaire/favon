<template>
  <div class="files files--renamed">
    <h2>Renamed Files</h2>
    <ul v-on:scroll="syncScroll" id="renamedScroll">
      <file v-for="(file, index) in files" :index="index" :key="file.path"></file>
    </ul>
  </div>
</template>

<script>
  import EventBus from '../../event-bus';
  import File from './RenamedFiles/File.vue';

  export default {
    name: 'renamedfiles',
    components: {
      File,
    },
    data() {
      return {
        renamedScroll: '',
      };
    },
    computed: {
      ipc() {
        return this.$electron.ipcRenderer;
      },
      files() {
        return this.$store.state.files;
      },
      selected() {
        return this.$store.state.selected;
      },
      isScrolling() {
        return this.$store.state.isScrolling;
      },
    },
    created() {
      EventBus.$on('system-scroll', this.scrollTo);
    },
    mounted() {
      this.renamedScroll = document.getElementById('renamedScroll');
    },
    methods: {
      toggleSelected(index) {
        this.$store.commit('SET_SELECTED', index);
      },
      syncScroll(e) {
        const tempScrollStatus = this.isScrolling;
        this.$store.commit('SET_SCROLLING', false);
        if (!tempScrollStatus) EventBus.$emit('renamed-scroll', e.srcElement.scrollTop);
      },
      scrollTo(value) {
        this.$store.commit('SET_SCROLLING', true);
        if (this.renamedScroll) this.renamedScroll.scrollTop = value;
      },
    },
  };
</script>

<style lang="scss">
  
</style>
