import keywords from '../lib/keywords';

export default class MediaFile {

  constructor(path, name, format) {
    this.path = path;
    this.name = name;
    this.format = format;
    this.renamed = name;
  }

  static get FILEPATH() {
    return /^((?:[/\\]?[^/\\]+[/\\])*)(?:[^/\\]+)$/i;
  }

  static get KEY_BEFORE() {
    return /(?=^|\b|[[({\s_.-])/;
  }

  static get KEY_AFTER() {
    return /(?:-[^\s_.])?(?=[\s_.\-\])}]|$)/;
  }

  /**
   * Remove all Brackets and their content from filename.
   * Careful, since this also removes some legitimate brackets (`Gi(a)rlish Number`)
   * and also removes year info (`Avatar (2009)`)
   */
  removeBrackets() {
    this.renamed = this.renamed.replace(/(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})/g, '');
    return this;
  }

  /**
   * Remove all delimiters (e.g. _ or .) from filename.
   */
  removeDelimiters() {
    this.renamed = this.renamed.replace(/[_.]/g, ' ').trim();
    return this;
  }

  /**
   * Remove special keywords from filename.
   */
  removeKeywords() {
    // Remove general keywords
    keywords.general.forEach((keyword) => {
      this.renamed = this.renamed.replace(
        new RegExp(MediaFile.KEY_BEFORE.source + keyword + MediaFile.KEY_AFTER.source, 'ig'),
        '');
    });
  }

  getCleanPath() {
    let path = this.path.replace(/(?:\[[^\]]+\]|\{[^}]+\})/g, '');
    path = path.replace(/[_.]/g, ' ').trim();
    // Remove general keywords
    keywords.general.forEach((keyword) => {
      path = path.replace(
        new RegExp(MediaFile.KEY_BEFORE.source + keyword + MediaFile.KEY_AFTER.source, 'ig'),
        '');
    });
    return path;
  }

  getProperties() {
    return [
      this.path,
      this.name,
      this.format,
    ];
  }

}
