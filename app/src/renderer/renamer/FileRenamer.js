import fs from 'fs';
import Config from 'electron-config';
import MediaFile from '../models/MediaFile';
import Anime from '../models/Anime';
import Series from '../models/Series';
import Movie from '../models/Movie';


export default class FileRenamer {

  static cleanString(string) {
    string = string.replace(/[/?<>\\*|^"]/g, '');
    string = string.replace(/:/g, ' -');
    return string;
  }

  rename(file) {
    const result = MediaFile.FILEPATH.exec(file.path);
    if (result) {
      const path = result[1];
      let newName = file.name;
      if (file instanceof Anime) {
        newName = FileRenamer.getAnimeFileName(file);
      } else if (file instanceof Series) {
        newName = FileRenamer.getSeriesFileName(file);
      } else if (file instanceof Movie) {
        newName = FileRenamer.getMovieFileName(file);
      }
      fs.rename(file.path, `${path}${newName}.${file.format}`, (err) => {
        if (err) console.log(`ERROR: ${err}`);
      });
    }
  }

  static getAnimeFileName(file) {
    if (file.season > 1) {
      return `${file.show} S${file.season} - ${file.episode}`;
    }
    return `${file.show} - ${file.episode}`;
  }

  static getSeriesFileName(file) {
    const season = file.normalizeSeason();
    const episode = file.normalizeEpisode();
    if (file.title !== '') return `${file.show} S${season}E${episode} - ${file.title}`;
    return `${file.show} S${season}E${episode}`;
  }

  static getMovieFileName(file) {
    const config = new Config();
    let pattern = config.get('movie');
    // If pattern is bullshit use default one
    if (pattern && pattern.indexOf('%N') === -1) return `${file.title} (${file.year})`;
    pattern = pattern.replace('%N', file.title);
    pattern = pattern.replace('%Y', file.year);
    return pattern;
  }
}
