import MediaFile from './MediaFile';

export default class Series extends MediaFile {

  constructor(path, name, format, season = '', episode = '', show = '') {
    super(path, name, format);
    this.season = season;
    this.episode = episode;
    this.show = show;
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
    if (this.season.length < 2) this.season = `0${this.season}`;
    return this;
  }

  /**
   * Make sure the episode marker is at least two characters long: `8` -> `08`
   */
  normalizeEpisode() {
    if (this.episode.length < 2) this.episode = `0${this.episode}`;
    return this;
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
