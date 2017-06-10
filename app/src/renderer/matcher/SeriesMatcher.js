import FileMatcher from './FileMatcher';
import { syncLoop } from './utilities';
import stringSimilarity from 'string-similarity';

export default class SeriesMatcher extends FileMatcher {

  matchFiles(series, callback) {
    syncLoop(series.length, (loop) => {
      const file = series[loop.iteration()];
      this.match(file)
      .then(result => {
        this.matchedFiles.push(result);
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

  match(series) {
    return new Promise((resolve, reject) => {
      this.client.search(series)
      .then(results => {
        if (results.length === 0) {
          reject('No matches found.');
        }
        const resultsBySimilarity = this.compareSimilarity(series, results);
        if (
          results.length === 1 ||
          (resultsBySimilarity[0].similarity > 0.90 &&
          (Math.abs((resultsBySimilarity[0].similarity - resultsBySimilarity[1].similarity)) > 0.2))
        ) {
          series.matchedShow = FileMatcher.cleanString(results[0].seriesName);
          series.matchedId = results[0].id;
          resolve(series);
        }
        // Else there is ambiguity
        resolve({
          original: series,
          results: resultsBySimilarity,
        });
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  compareSimilarity(series, results) {
    const scores = [];
    results.forEach(result => {
      // Make sure to account for aliases too, and take highest similarity score
      const similarities = [];
      similarities.push(stringSimilarity.compareTwoStrings(series.show, result.seriesName));
      for (let i = 0; i < result.aliases.length; i++) {
        similarities.push(stringSimilarity.compareTwoStrings(series.show, result.aliases[i]));
      }
      similarities.sort();

      scores.push({
        seriesName: result.seriesName,
        id: result.id,
        similarity: similarities[0],
      });
    });
    // Sort scores by similarity
    scores.sort(FileMatcher.comparator);
    return scores;
  }

}
