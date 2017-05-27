import fs from 'fs';
import MediaFile from '../models/MediaFile';
import Anime from '../models/Anime';
import Series from '../models/Series';
import Movie from '../models/Movie';


export default class FileRenamer {

  rename(file) {
    const result = MediaFile.FILEPATH.exec(file.path);
    if (result) {
      const path = result[1];
      let newName = file.name;
      if (file instanceof Anime) {
        if (file.season > 1) {
          newName = `${file.show} S${file.season} - ${file.episode}.${file.format}`;
        } else {
          newName = `${file.show} - ${file.episode}.${file.format}`;
        }
      } else if (file instanceof Series) {
        newName = `${file.show} S${file.season}E${file.episode}.${file.format}`;
      } else if (file instanceof Movie) {
        newName = `${file.title} (${file.year})`;
      }
      fs.rename(file.path, `${path}${newName}`, (err) => {
        if (err) console.log(`ERROR: ${err}`);
      });
    }
  }
}
