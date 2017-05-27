
export default class MovieParser {

  constructor(movie) {
    this.movie = movie;
  }

  static get DEFAULT() {
    return /^((?:[^([])+)(?:(?:\b|\s)*\(?((?:19\d{2})|(?:20\d{2}))\)?)(?:.*)$/i;
  }

  cleanFileName() {
    return this.movie.removeDelimiters().removeKeywords();
  }

  parse() {
    this.cleanFileName();
    // Explicit Pattern
    const result = MovieParser.DEFAULT.exec(this.movie.renamed);
    if (result) {
      this.movie.title = result[1];
      this.movie.year = result[2];
      this.movie.normalizeTitle();
      console.log(`Matched ${this.movie.title} as DEFAULT`);
      return this.movie;
    }
    // Hope for the best!
    this.movie.title = this.movie.renamed.replace(/(?:\b|[\s.-])+([A-Z]{2,}[^\s.-]*)(?:\b|[\s.-])+/g, '').trim();
    this.movie.normalizeTitle();
    console.log(`Did not match ${this.movie.title} successfully.`);
    return this.movie;
  }

}
