import Movie from '../models/Movie';

export default class FileMacher {

  constructor() {
    this.matchedFilesIdentificators = {};
  }

  static cleanString(string) {
    string = string.replace(/[/?<>\\*|^"]/g, '');
    string = string.replace(/:/g, ' -');
    return string;
  }

  static comparator(a, b) {
    if (a.similarity < b.similarity) return 1;
    if (a.similarity > b.similarity) return -1;
    return 0;
  }

  static partComparator(a, b) {
    if (a instanceof Movie && b instanceof Movie) {
      if (a.similarity < b.similarity) return 1;
      if (a.similarity > b.similarity) return -1;
      return 0;
    } else if (!(a instanceof Movie) && b instanceof Movie) {
      if (a.results[0].similarity < b.similarity) return 1;
      if (a.results[0].similarity > b.similarity) return -1;
      return 0;
    } else if (a instanceof Movie && !(b instanceof Movie)) {
      if (a.similarity < b.results[0].similarity) return 1;
      if (a.similarity > b.results[0].similarity) return -1;
      return 0;
    }
    if (a.results[0].similarity < b.results[0].similarity) return 1;
    if (a.results[0].similarity > b.results[0].similarity) return -1;
    return 0;
  }
}
