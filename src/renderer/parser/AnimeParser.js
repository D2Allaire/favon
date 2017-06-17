import SeriesParser from './SeriesParser';
import Anime from '../models/Anime';

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


  /**
   * Parse and array of files
   * @param {Array} files to be parsed
   * @return {Object} parsedFiles with information on unique shows and episode count
   */
  parseFiles(files) {
    files.forEach((file) => {
      const parsedEpisode = AnimeParser.parse(new Anime(...file.getProperties()));
      // Only add each show once
      if (parsedEpisode.show.length > 0 &&
      this.parsedFiles.uniqueShows[parsedEpisode.show] === undefined) {
        this.parsedFiles.uniqueShows[parsedEpisode.show] =
        new Anime(...parsedEpisode.getProperties());
      }
      // Make sure an array exists for this show
      if (!this.parsedFiles.parsed[parsedEpisode.show]) {
        this.parsedFiles.parsed[parsedEpisode.show] = [];
      }
      this.parsedFiles.parsed[parsedEpisode.show].push(parsedEpisode);
      this.parsedFiles.episodeCount++;
    });
    return this.parsedFiles;
  }

  static parse(series) {
    series.cleanFileName();
    // Explicit Pattern
    let result = new RegExp(
      SeriesParser.BASE.source + SeriesParser.EXPLICIT.source, 'i',
    ).exec(series.renamed);
    if (result) {
      series.show = result[1];
      series.season = result[2];
      series.episode = result[3];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as EXPLICIT`);
      return series;
    }
    // Credits Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.CREDITS.source,
    ).exec(series.renamed);
    if (result) {
      series.show = result[1];
      series.season = 'Credits';
      series.episode = result[2];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as CREDITS`);
      return series;
    }
    // Specials Before Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.SPECIAL_BEFORE.source, 'i',
    ).exec(series.renamed);
    if (result) {
      series.show = result[1];
      series.season = '00';
      series.episode = result[3];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as SPECIAL_BEFORE`);
      return series;
    }
    // Specials After Pattern
    result = new RegExp(
      SeriesParser.BASE.source + AnimeParser.SPECIAL_AFTER.source, 'i',
    ).exec(series.renamed);
    if (result) {
      series.show = result[1];
      series.season = '00';
      series.episode = result[2];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as SPECIAL_AFTER`);
      return series;
    }
    // Match explicit directory season marker
    result = new RegExp(
      SeriesParser.DIRECTORY.source, 'i',
    ).exec(series.getCleanPath());
    if (result) {
      series.show = result[1];
      series.season = result[2];
      series.episode = result[3];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as DIRECTORY`);
      return series;
    }
    // Default Parsing Pattern
    result = new RegExp(
      SeriesParser.BASE.source + SeriesParser.DEFAULT.source, 'i',
    ).exec(series.renamed);
    if (result) {
      series.show = result[1];
      series.season = result[2] || '01';
      series.episode = result[3];
      SeriesParser.normalizeSeries(series);
      console.log(`Matched ${series.show} as DEFAULT`);
      return series;
    }

    return series;
  }

}
