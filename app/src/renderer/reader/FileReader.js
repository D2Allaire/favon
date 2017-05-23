import dir from 'node-dir';
import MediaFile from '../models/MediaFile';

export default class FileReader {

  constructor(path) {
    this.path = path;
    this.files = [];
  }

  static get MEDIAFORMATS() {
    return /^(.+)\.(mkv|mp4|m4v|mp[gev2]|mpeg|avi|mov|wmv|vob|flv|srt|sub|ass|ssa|idx)$/i;
  }

  readDirectory() {
    return dir.promiseFiles(this.path)
      .then((paths) => {
        paths.forEach((path) => {
          this.readFile(path);
        });
        if (this.files.length > 0) return Promise.resolve(this.files);
        return Promise.reject(new Error('No matching files found.'));
      })
      .catch((err) => Promise.reject(err));
  }

  readFile(path) {
    const result = FileReader.MEDIAFORMATS.exec(path);
    if (result) {
      // Get actual filename with stripped off directories.
      const name = result[1].replace(/^.*[\\/]/, '');
      const format = result[2].toLowerCase();
      this.files.push(new MediaFile(path, name, format));
    }
  }
}
