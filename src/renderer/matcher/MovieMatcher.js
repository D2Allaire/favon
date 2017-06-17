import stringSimilarity from 'string-similarity';
import FileMatcher from './FileMatcher';
import { syncLoop } from './utilities';
import Movie from '../models/Movie';

export default class MovieMatcher extends FileMatcher {

  matchFiles(movies, callback) {
    syncLoop(movies.length, (loop) => {
      const file = movies[loop.iteration()];
      this.match(file)
      .then((result) => {
        this.matchedFiles.push(result);
        // To make sure only one API call gets made for both .mkv and .srt for example
        if (result instanceof Movie) {
          this.matchedFilesIdentificators[result.name] = result;
        } else {
          this.matchedFilesIdentificators[result.original.name] = result;
        }
        loop.next();
      })
      // No result came back from API.
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
          matchedParts.sort(FileMatcher.partComparator);
          console.log(matchedParts);
          this.matchedFiles.push(matchedParts[0]);
          const result = matchedParts[0];
          // To make sure only one API call gets made for both .mkv and .srt for example
          if (result instanceof Movie) {
            this.matchedFilesIdentificators[result.name] = result;
          } else {
            this.matchedFilesIdentificators[result.original.name] = result;
          }
          loop.next();
        });
      });
    }, () => {
      callback(this.matchedFiles);
    });
  }

  checkIfAlreadyMatched(movie) {
    if (this.matchedFilesIdentificators[movie.name] !== undefined) {
      return this.matchedFilesIdentificators[movie.name];
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