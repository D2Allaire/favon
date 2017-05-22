<template>
  <div class="files files--system">
    <h2>System Files</h2>
    <ul v-on:scroll="syncScroll" id="systemScroll">
      <li v-for="(file, index) in files"><a @click="toggleSelected(index)" :class="{ selected : selected === index }">{{ file.name }} <span class="format">{{ file.format }}</span></a></li>
    </ul>
  </div>
</template>

<script>
  import { EventBus } from '../../event-bus';

  export default {
    name: 'systemfiles',
    data() {
      return {
        systemScroll: ''
      }
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
      isScrolling () {
        return this.$store.state.isScrolling;
      }
    },
    created() {
      EventBus.$on('renamed-scroll', this.scrollTo)
    },
    mounted() {
      this.systemScroll = document.getElementById('systemScroll');
    },
    methods: {
      toggleSelected(index) {
        this.$store.commit('SET_SELECTED', index);
      },
      syncScroll(e) {
        const tempScrollStatus = this.isScrolling;
        this.$store.commit('SET_SCROLLING', false);
        if (!tempScrollStatus) EventBus.$emit('system-scroll', e.srcElement.scrollTop);
      },
      scrollTo(value) {
        this.$store.commit('SET_SCROLLING', true);
        if (this.systemScroll) this.systemScroll.scrollTop = value;
      },
    }
  };
</script>

<style lang="scss">
  .files {
    h2 {
      width: 425px;
      height: 50px;
      background-color: #fff;
      box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.08);
      padding: 15px 30px 10px 23px; 
      font-weight: bold;
      font-size: 1.6rem;
      color: #1d2d51;
      margin: 0;
    }

    ul {
      width: 425px;
      height: 355px;
      background-color: #fff;
      box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.08);
      margin: 0;
      padding: 0 30px 10px 20px;
      list-style: none;
      overflow-y: auto;
    }

    li {
      list-style: none;

      a {
        display: block;
        padding: 5px 3px;
        font-size: 1.2rem;
        color: #777;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .format {
          font-size: 1.1rem;
          color: #999999;
          margin-left: 5px;
        }

        &:hover {
          background-color: #ededed;
        }

        &.selected {
          background-color: #3273dc;
          color: #fff;

          .format {
            color: #fff;
          }
          
        }
      }
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
  ::-webkit-scrollbar-thumb {
    background: #dedede; 
  }
</style>
