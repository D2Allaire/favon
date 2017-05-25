export default class SeriesParser {

  constructor(series) {
    this.series = series;
  }

  /**
   * Base pattern to match show name. Matches any string at the start of the filename
   * that is not immediately followed by ` S1` or a similar season indicator.
   */
  static get BASE() {
    // return /^((?:(?!\s[Ss]\d{1,3}).)*)(?:\b|[\s-])+/;
    return /^((?:(?!\sS(?:eason ?)?\d{1,3})(?!\s-\s).)*)(?:\b|[\s-])+/;
  }

  /**
   * Explicit tv show pattern. Matches explicit S01E01 values. Examples:
   * [HorribleSubs] Gi(a)rlish Number S01E12
   * [Coalgirls]_Owarimonogatari_S01E07_(1280x720_Blu-ray_FLAC)
   * outlander.s02e01.1080p.bluray.x264-shortbrehd.mkv
   */
  static get EXPLICIT() {
    return /S(\d{1,3})(?:\b|[\s\-x])*(?:E(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:\s?v\d)?)(?:[^\\/]*$)/;
  }

  /**
   * Match show name and season from directory structure if the files read
   * are in a `Season X` folder. In that case, only parse episode from file.
   */
  static get DIRECTORY() {
    return /((?:(?!\sS(?:eason ?)?\d{1,3})[^\\/])*)[\\/]S(?:eason ?)?(\d{1,3})[\\/](?:[^\\/]+[\\/])*.*(?:\b|[\sx-])+(?:(?:Ep?(?:isode[ ._])?[ _.]?)?(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:[_ ]?v\d)?)(?:[^\\/]*$)/i;
  }

  /**
   * Default pattern to parse show, season and episode. Example:
   * Spice and Wolf 13
   * Spice and Wolf - 13 - Romance 101
   * Spice and Wolf S2 15
   * Spice and Wolf S1x22.5v2
   */
  static get DEFAULT() {
    return /(?:(?:S(?:eason ?)?)?(\d{1,3}))?(?:\b|[\sx-])+(?:(?:Ep?(?:isode[ ._])?[ _.]?)?(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:[_ ]?v\d)?)(?:[^\\/]*$)/i;
  }

  normalizeSeries() {
    return this.series.normalizeShow().normalizeSeason().normalizeEpisode();
  }

  cleanFileName() {
    return this.series.removeDelimiters().removeKeywords();
  }

  parse() {
    this.cleanFileName();
    // Explicit Pattern
    let result = new RegExp(
      SeriesParser.BASE.source + SeriesParser.EXPLICIT.source, 'i'
    ).exec(this.series.renamed);
    if (result) {
      this.series.show = result[1];
      this.series.season = result[2];
      this.series.episode = result[3];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as EXPLICIT`);
      return this.series;
    }
    // Match explicit directory season marker
    result = new RegExp(
      SeriesParser.DIRECTORY.source, 'i'
    ).exec(this.series.getCleanPath());
    if (result) {
      this.series.show = result[1];
      this.series.season = result[2];
      this.series.episode = result[3];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as DIRECTORY`);
      return this.series;
    }
    // Default Parsing Pattern
    result = new RegExp(
      SeriesParser.BASE.source + SeriesParser.DEFAULT.source, 'i'
    ).exec(this.series.renamed);
    if (result) {
      this.series.show = result[1];
      this.series.season = result[2] || '01';
      this.series.episode = result[3];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as DEFAULT`);
      return this.series;
    }

    return this.series;
  }

}
