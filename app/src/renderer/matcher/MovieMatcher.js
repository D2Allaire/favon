import FileMatcher from './FileMatcher';
import { syncLoop } from './utilities';
import stringSimilarity from 'string-similarity';
import Movie from '../models/Movie';

function comparator(a, b) {
  // B is MORE similar than A
  if (a.similarity < b.similarity) return 1;
  if (a.similarity > b.similarity) return -1;
  return 0;
  // {
  //   if ((b.similarity - a.similarity) > 0.5) return 1;
  //   if ((a.popularity - b.popularity) > 2) return -1;
  //   return 1;
  // }
  // A is MORE similar than B
  // if (a.similarity > b.similarity) {
  //   if ((a.similarity - b.similarity) > 0.5) return -1;
  //   if ((b.popularity - a.popularity) > 2) return 1;
  //   return -1;
  // }
  // // They are both equally similar, sort by popularity
  // if (a.popularity > b.popularity) return -1;
  // if (b.popularity > a.popularity) return 1;
  // return 0;
}

export default class MovieMatcher extends FileMatcher {

  matchFiles(movies, callback) {
    syncLoop(movies.length, (loop) => {
      const file = movies[loop.iteration()];
      this.match(file)
      .then(result => {
        this.matchedFiles.push(result);
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
        if (alreadyMatched instanceof Movie) {
          movie.title = alreadyMatched.title;
          movie.year = alreadyMatched.year;
          resolve(movie);
        } else resolve(alreadyMatched);
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
    scores.sort(comparator);
    return scores;
  }

}
