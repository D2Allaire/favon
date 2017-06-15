import FileMatcher from './FileMatcher';
import stringSimilarity from 'string-similarity';

export default class SeriesMatcher extends FileMatcher {

  matchFiles(series, callback) {
    let iterations = 0;
    const matchedFiles = {};
    series.forEach((file) => {
      this.match(file)
      .then(result => {
        matchedFiles[result.show] = result;
        if (++iterations === series.length) {
          callback(matchedFiles);
        }
      })
      .catch(() => {
        matchedFiles[file.show] = file;
        if (++iterations === series.length) {
          callback(matchedFiles);
        }
      });
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
          resultsBySimilarity[0].similarity > 0.95 ||
          (resultsBySimilarity[0].similarity > 0.90 &&
          (Math.abs((resultsBySimilarity[0].similarity - resultsBySimilarity[1].similarity)) > 0.2))
        ) {
          series.matchedShow = FileMatcher.cleanString(resultsBySimilarity[0].seriesName);
          series.id = resultsBySimilarity[0].id;
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

  requestEpisodes(id) {
    return new Promise((resolve, reject) => {
      const episodes = {};
      this.client.get(id)
      .then(data => {
        data.Episodes.forEach(episode => {
          episodes[`S${episode.airedSeason}E${episode.airedEpisodeNumber}`] = episode.episodeName;
        });
        resolve({
          id: data.id,
          show: data.seriesName,
          aliases: data.aliases,
          episodes,
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
      // Sort descending
      similarities.sort().reverse();

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
