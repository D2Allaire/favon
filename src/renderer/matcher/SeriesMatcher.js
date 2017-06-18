import stringSimilarity from 'string-similarity';
import FileMatcher from './FileMatcher';
import TVDBClient from './TVDBClient';
import Series from '../models/Series';

export default class SeriesMatcher extends FileMatcher {

  constructor() {
    super();
    this.client = new TVDBClient();
    this.matchedFiles = {
      // Successfully matched files
      matched: {},
      // Files that got no API result
      notMatched: [],
      // Files that received an ambigious API result
      ambigious: {},
    };
    this.showsWithEpisodes = [];
  }

  /**
   * Match an array of series against the TVDB API
   * @param {Array} series to be matched
   * @param {Functon} callback function when all files have been matched
   */
  matchFiles(series, callback) {
    let iterations = 0;
    series.forEach((file) => {
      this.match(file)
      .then((result) => {
        if (result instanceof Series) {
          this.matchedFiles.matched[result.show] = result;
        } else {
          this.matchedFiles.ambigious[result.original.name] = result;
        }
        if (++iterations === series.length) {
          callback(this.matchedFiles);
        }
      })
      .catch(() => {
        this.matchedFiles.notMatched.push(file);
        if (++iterations === series.length) {
          callback(this.matchedFiles);
        }
      });
    });
  }

  /**
   * Match a single Series instance
   * @param {Series} series to be matched
   */
  match(series) {
    return new Promise((resolve, reject) => {
      this.client.search(series)
      .then((results) => {
        if (results.length === 0) {
          reject('No matches found.');
        }
        const resultsBySimilarity = SeriesMatcher.compareSimilarity(series, results);
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
      .catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Request episodes for specified array of shows
   * @param {Array} shows
   * @param {Function} callback executed after all shows have been processed
   */
  requestEpisodes(shows, callback) {
    let iterations = 0;
    shows.forEach((show) => {
      const episodes = {};
      this.client.get(show.id)
      .then((data) => {
        data.Episodes.forEach((episode) => {
          episodes[`S${episode.airedSeason}E${episode.airedEpisodeNumber}`] = episode.episodeName;
        });
        this.showsWithEpisodes.push({
          id: data.id,
          show: show.show,
          seriesName: data.seriesName,
          aliases: data.aliases,
          episodes,
        });
        if (++iterations === shows.length) {
          callback(this.showsWithEpisodes);
        }
      });
    });
  }

  static compareSimilarity(series, results) {
    const scores = [];
    results.forEach((result) => {
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
