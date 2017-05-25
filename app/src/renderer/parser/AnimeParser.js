import SeriesParser from './SeriesParser';

export default class AnimeParser extends SeriesParser {

  /**
   * Matches anime credits. Examples:
   * Railgun S - NCOP
   * Hakkenden OP2
   */
  static get CREDITS() {
    return /((?:OP|ED|NCOP|NCED)(?:\d)?)(?:[^\\/]*$)/;
  }

  /**
   * Matches specials in the format OVA - 01. Examples:
   * [SHiN-gx] Fight Ippatsu! Juuden-chanls - Special 1 [720x480 AR h.264 FLAC][v2][FF09021F]
   * [MaverickSubs] Third Aerial Girls Squad - OVA 2 (Shirobako Vol.7 OVA) [1080p]
   */
  static get SPECIAL_BEFORE() {
    return /(Special|SP|OVA|OAV|Picture Drama|Movie)(?:\b|[\s-]+)(\d{1,3})(?:\s?v\d)?/;
  }

  /**
   * Matches specials in the format 01 - OVA. Example:
   * [MaverickSubs] Third Aerial Girls Squad - 02 - OVA (Shirobako Vol.7 OVA) [1080p]
   */
  static get SPECIAL_AFTER() {
    return /(\d{1,3})(?:\s?v\d)?(?:\b|[\s-]+)(?:Special|SP|OVA|OAV|Picture Drama|Movie)/;
  }


  cleanFileName() {
    return this.series.removeBrackets().removeDelimiters().removeKeywords();
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
    // Credits Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.CREDITS.source
    ).exec(this.series.renamed);
    if (result) {
      this.series.show = result[1];
      this.series.season = 'Credits';
      this.series.episode = result[2];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as CREDITS`);
      return this.series;
    }
    // Specials Before Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.SPECIAL_BEFORE.source, 'i'
    ).exec(this.series.renamed);
    if (result) {
      this.series.show = result[1];
      this.series.season = '00';
      this.series.episode = result[3];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as SPECIAL_BEFORE`);
      return this.series;
    }
    // Specials After Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.SPECIAL_AFTER.source, 'i'
    ).exec(this.series.renamed);
    if (result) {
      this.series.show = result[1];
      this.series.season = '00';
      this.series.episode = result[2];
      this.normalizeSeries();
      console.log(`Matched ${this.series.show} as SPECIAL_AFTER`);
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
