import stringSimilarity from 'string-similarity';
import FileMatcher from './FileMatcher';
import TMDBClient from './TMDBClient';
import { syncLoop } from './utilities';
import Movie from '../models/Movie';

export default class MovieMatcher extends FileMatcher {

  constructor() {
    super();
    this.client = new TMDBClient(process.env.TMDB_KEY);
    this.matchedFiles = {
      // Successfully matched files
      matched: [],
      // Files that received an ambigious API result
      ambigious: [],
    };
  }

  /**
   * Match an array of movies with the TMDB API
   * @param {Movie} movies
   * @param {Function} callback when all movies have been matched
   */
  matchFiles(movies, callback) {
    // Need to synchronously loop to avoid double API calls for e.g. movie and subtitles
    syncLoop(movies.length, (loop) => {
      const file = movies[loop.iteration()];
      this.match(file)
      .then((result) => {
        this.resolveResult(result);
        loop.next();
      })
      // No result came back from API. Try a fallback where we make a request by each
      // part of the filename separated by `-`. Example: `japhson-fargo-1080p`.
      .catch(() => {
        const parts = file.getNamePartsByDelimiter('-');
        const matchedParts = [];
        syncLoop(parts.length, (partsLoop) => {
          if (parts[partsLoop.iteration()].length < 3) partsLoop.next();
          const newMovie = new Movie(...file.getProperties());
          newMovie.title = parts[partsLoop.iteration()];
          console.log(`Attempting to match ${newMovie.title}`);
          this.match(newMovie)
          .then((result) => {
            matchedParts.push(result);
            partsLoop.next();
          })
          .catch(() => {
            partsLoop.next();
          });
        }, () => {
          // Sort matched parts by similarity to originally parsed title.
          matchedParts.sort(FileMatcher.partComparator);
          const result = matchedParts[0];
          this.resolveResult(result);
          loop.next();
        });
      });
    }, () => {
      callback(this.matchedFiles);
    });
  }

  /**
   * Correctly add the result to our matchedFiles array. Additionally, store the name so we
   * don't make unnecessary double API calls.
   * @param {Movie} result
   */
  resolveResult(result) {
    if (result instanceof Movie) {
      this.matchedFiles.matched.push(result);
      this.matchedFilesIdentificators[result.name] = result;
    } else {
      this.matchedFiles.ambigious.push(result);
      this.matchedFilesIdentificators[result.original.name] = result;
    }
  }

  /**
   * Check if a movie has already been matched before.
   * @param {Movie} movie
   * @return {*} returns either the already matched movie or FALSE
   */
  checkIfAlreadyMatched(movie) {
    if (this.matchedFilesIdentificators[movie.name] !== undefined) {
      return this.matchedFilesIdentificators[movie.name];
    }
    return false;
  }

  /**
   * Match a movie. Make API call, sort results by similarity to originally parsed title
   * and either select the correct one or return an object with the original and an array
   * of results in case there is ambiguity
   * @param {Movie} movie to be matched
   * @return {*} returns either the movie with matched information or an object with the
   * original and an array of results in case there is ambiguity
   */
  match(movie) {
    return new Promise((resolve, reject) => {
      const alreadyMatched = this.checkIfAlreadyMatched(movie);
      if (alreadyMatched) {
        // Can be either a movie or an ambiguity object
        if (alreadyMatched instanceof Movie) {
          movie.title = alreadyMatched.title;
          movie.year = alreadyMatched.year;
          resolve(movie);
        } else {
          resolve({
            original: movie,
            results: alreadyMatched.results,
          });
        }
      } else {
        this.client.search(movie)
        .then((results) => {
          if (results.length === 0) {
            reject('No matches found.');
          }
          const resultsBySimilarity = MovieMatcher.compareSimilarity(movie, results);
          if (
            results.length === 1 ||
            (resultsBySimilarity[0].similarity > 0.90 &&
            !(Math.abs((resultsBySimilarity[0].similarity -
            resultsBySimilarity[1].similarity)) < 0.2))
          ) {
            movie.title = FileMatcher.cleanString(resultsBySimilarity[0].title);
            movie.year = Number(resultsBySimilarity[0].release_date.split('-')[0]);
            movie.similarity = resultsBySimilarity[0].similarity;
            resolve(movie);
          }
          // Else there is ambiguity
          resolve({
            original: movie,
            results: resultsBySimilarity,
          });
        })
        .catch((error) => {
          reject(error);
        });
      }
    });
  }

  /**
   * Sort results by similarity to originally parsed title
   * @param {Movie} movie
   * @param {Array} results
   */
  static compareSimilarity(movie, results) {
    const scores = [];
    results.forEach((result) => {
      const similarity = stringSimilarity.compareTwoStrings(movie.title, result.title);
      scores.push({
        title: result.title,
        release_date: result.release_date,
        popularity: result.popularity,
        similarity,
      });
    });
    // Sort scores by a combination of similarity and popularity in descending order
    scores.sort(FileMatcher.comparator);
    return scores;
  }

}
