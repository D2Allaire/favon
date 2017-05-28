
export default class FileMacher {

  constructor(client) {
    this.client = client;
    this.matchedFiles = [];
    this.matchedFilesIdentificators = [];
  }

  static cleanString(string) {
    string = string.replace(/[/?<>\\*|^"]/g, '');
    string = string.replace(/:/g, ' -');
    return string;
  }
}
