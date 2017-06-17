import MediaFile from './MediaFile';

export default class Series extends MediaFile {

  constructor(path, name, format, season = '', episode = '', show = '', title = '') {
    super(path, name, format);
    this.season = season;
    this.episode = episode;
    this.show = show;
    this.title = title;
  }

  /**
   * Remove some special characters and delimiters from filename that might have
   * been left over from parsing.
   * E.g. `The Others -` -> `The Others`
   */
  normalizeShow() {
    this.show = this.show.replace(/[\s_.]/g, ' ').trim().replace(/\s?-$/, '');
    this.show = this.show.replace(/\b\w/g, l => l.toUpperCase());
    return this;
  }

  /**
   * Make sure the season marker is at least two characters long: `2` -> `02`
   */
  normalizeSeason() {
    if (this.season.toString().length < 2) return `0${this.season}`;
    return this.season;
  }

  /**
   * Make sure the episode marker is at least two characters long: `8` -> `08`
   */
  normalizeEpisode() {
    if (this.episode.toString().length < 2) return `0${this.episode}`;
    return this.episode;
  }

  cleanFileName() {
    this.removeDelimiters().removeKeywords();
  }

  getProperties() {
    return [
      this.path,
      this.name,
      this.format,
      this.season,
      this.episode,
      this.show,
      this.renamed,
    ];
  }

}
