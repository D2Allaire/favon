import MediaFile from './MediaFile';

export default class Movie extends MediaFile {

  constructor(path, name, format, title = '', year = '') {
    super(path, name, format);
    this.title = title;
    this.year = year;
  }

  /**
   * Remove some special characters and delimiters from filename that might have
   * been left over from parsing.
   * E.g. `The Others -` -> `The Others`
   */
  normalizeTitle() {
    this.title = this.title.replace(/[\s_.]/g, ' ').trim().replace(/\s?-$/, '');
    this.title = this.title.replace(/\b\w/g, l => l.toUpperCase());
    return this;
  }

  getProperties() {
    return [
      this.path,
      this.name,
      this.format,
      this.title,
      this.year,
      this.renamed,
    ];
  }

}
