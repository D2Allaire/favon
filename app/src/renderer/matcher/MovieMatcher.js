import FileMatcher from './FileMatcher';
import { syncLoop } from './utilities';
import stringSimilarity from 'string-similarity';
import Movie from '../models/Movie';

export default class MovieMatcher extends FileMatcher {

  matchFiles(movies, callback) {
    syncLoop(movies.length, (loop) => {
      const file = movies[loop.iteration()];
      this.match(file)
      .then(result => {
        this.matchedFiles.push(result);
        // To make sure only one API call gets made for both .mkv and .srt for example
        if (result instanceof Movie) {
          this.matchedFilesIdentificators.push(result.name);
        } else {
          this.matchedFilesIdentificators.push(result.original.name);
        }
        loop.next();
      })
      .catch(() => {
        this.matchedFiles.push(file);
        loop.next();
      });
    }, () => {
      callback(this.matchedFiles);
    });
  }

  checkIfAlreadyMatched(movie) {
    for (let i = 0; i < this.matchedFilesIdentificators.length; i++) {
      if (this.matchedFilesIdentificators[i] === movie.name) {
        return this.matchedFiles[i];
      }
    }
    return false;
  }

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
        .then(results => {
          if (results.length === 0) {
            reject('No matches found.');
          }
          const resultsBySimilarity = this.compareSimilarity(movie, results);
          if (
            results.length === 1 ||
            (resultsBySimilarity[0].similarity > 0.90 &&
            !(Math.abs((resultsBySimilarity[0].similarity - resultsBySimilarity[1].similarity)) < 0.2))
          ) {
            movie.title = FileMatcher.cleanString(results[0].title);
            movie.year = Number(results[0].release_date.split('-')[0]);
            resolve(movie);
          }
          // Else there is ambiguity
          resolve({
            original: movie,
            results: resultsBySimilarity,
          });
        })
        .catch(error => {
          reject(error);
        });
      }
    });
  }

  compareSimilarity(movie, results) {
    const scores = [];
    results.forEach(result => {
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
