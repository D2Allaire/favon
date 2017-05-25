import fs from 'fs';
import MediaFile from '../models/MediaFile';
import Anime from '../models/Anime';
import Series from '../models/Series';


export default class FileRenamer {

  constructor(file) {
    this.file = file;
  }

  rename() {
    const result = MediaFile.FILEPATH.exec(this.file.path);
    if (result) {
      const path = result[1];
      let newName = this.file.name;
      if (this.file instanceof Anime) {
        if (this.file.season > 1) {
          newName = `${this.file.show} S${this.file.season} - ${this.file.episode}.${this.file.format}`;
        } else {
          newName = `${this.file.show} - ${this.file.episode}.${this.file.format}`;
        }        
      } else if (this.file instanceof Series) {
        newName = `${this.file.show} S${this.file.season}E${this.file.episode}.${this.file.format}`;
      }
      fs.rename(this.file.path, `${path}${newName}`, (err) => {
        if (err) console.log(`ERROR: ${err}`);
      });
    }
  }
}
