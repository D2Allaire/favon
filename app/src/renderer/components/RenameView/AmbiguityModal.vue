<template>
  <div class="lm-modal" :class="visibility" role="alert">
    <div class="lm-modal-container">
      <div class="lm-modal-title">
        Please select the correct movie/show.
        <a href="#0" class="lm-modal-close">Close</a>
      </div>
      <div class="lm-modal-body">
        <p>File: <strong>{{ ambiguousFiles.length > 0 ? ambiguousFiles[currentIndex].original.name : '' }}</strong></p>
        <ul v-if="ambiguousFiles.length > 0">
          <li v-for="(title, index) in ambiguousFiles[currentIndex].results">
            <a @click="toggleSelected(index)" :class="{ selected : selected === index }">
              {{ title.title }} ({{title.release_date.split('-')[0]}})
            </a>
          </li>
        </ul>
      </div>
      <div class="lm-modal-action">
        <div class="button-group">
          <button @click="cancelCheck" class="button is-outline is-narrow lm-close">Cancel</button>
          <button @click="resolveFile" class="button is-success is-narrow">Select</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { EventBus } from '../../event-bus';
  import Movie from '../../models/Movie';

  export default {
    name: 'ambiguityModal',
    data() {
      return {
        currentIndex: 0,
        selected: '',
        resolvedFiles: [],
      }
    },
    computed: {
      ambiguousFiles() {
        return this.$store.state.ambiguousFiles;
      },
      visibility() {
        return this.$store.state.hasAmbiguousFiles ? 'is-visible' : '';
      }
    },
    methods: {
      toggleSelected(index) {
        this.selected = index;
      },
      cancelCheck() {
        this.$store.commit('EMPTY_AMBIGUOUS');
      },
      resolveFile() {
        const original = this.ambiguousFiles[this.currentIndex].original;
        const selected = this.ambiguousFiles[this.currentIndex].results[this.selected];
        if (original instanceof Movie) {
          const movie = new Movie(
            original.path,
            original.name,
            original.format,
            selected.title,
            Number(selected.release_date.split('-')[0]),
          );
          movie.renamed = original.renamed;
          this.resolvedFiles.push(movie);
          if ((this.currentIndex + 1) < this.ambiguousFiles.length) {
            for (let i=this.currentIndex + 1; i < this.ambiguousFiles.length; i++) {
              if (original.name === this.ambiguousFiles[i].original.name) {
                const nextOriginal = this.ambiguousFiles[i].original;
                const nextMovie = new Movie(
                  nextOriginal.path,
                  nextOriginal.name,
                  nextOriginal.format,
                  selected.title,
                  Number(selected.release_date.split('-')[0]),
                );
                nextMovie.renamed = nextOriginal.renamed;
                this.resolvedFiles.push(movie);
                this.$store.commit('REMOVE_AMBIGUOUS', i);
              }
            }
          }
        }          
        if ((this.currentIndex + 1) >= this.ambiguousFiles.length) {
          for (let i = 0; i < this.resolvedFiles.length; i++) {
            this.$store.commit('ADD_FILE', this.resolvedFiles[i]);
          }
          this.$store.commit('EMPTY_AMBIGUOUS');
        } else {
          this.currentIndex++;
        }
      }
    }
  };
</script>

<style lang="scss">
.lm-modal{
  ul {
      width: 350px;
      height: 355px;
      margin: 0;
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
</style>
