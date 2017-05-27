export default class FileArray {
  constructor() {
    this.files = [];
  }

  containsMovie(file) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name) return true;
    }
    return false;
  }

  findMovie(file) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name) return this.files[i];
    }
    return null;
  }
}
