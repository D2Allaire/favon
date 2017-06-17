import Movie from '../models/Movie';

export default class MovieParser {

  constructor() {
    this.parsedFiles = [];
  }

  /**
   * Default parsing pattern for movies. Check for title and year (19xx / 20xx).
   */
  static get DEFAULT() {
    return /^((?:[^([])+)(?:(?:\b|\s)*\(?((?:19\d{2})|(?:20\d{2}))\)?)(?:.*)$/i;
  }

  /**
   * Parse an array of files and return array of parsed movies.
   * @param {Array} files
   * @return {Array} parsedFiles
   */
  parseFiles(files) {
    files.forEach((file) => {
      const movie = new Movie(...file.getProperties());
      this.parsedFiles.push(MovieParser.parse(movie));
    });
    return this.parsedFiles;
  }

  /**
   * Parse a single movie instance
   * @param {Movie} movie
   * @return {Movie} movie
   */
  static parse(movie) {
    movie.cleanFileName();
    // Explicit Pattern
    const result = MovieParser.DEFAULT.exec(movie.renamed);
    if (result) {
      movie.title = result[1];
      movie.year = result[2];
      movie.normalizeTitle();
      return movie;
    }
    // Hope for the best! Remove all CAPSLOCKED words.
    movie.title = movie.renamed.replace(
      /(?:\b|[\s.-])+([A-Z]{2,}[^\s.-]*)(?:\b|[\s.-])+/g, '',
    ).trim();
    movie.normalizeTitle();
    return movie;
  }

}
