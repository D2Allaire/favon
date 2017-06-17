import keywords from '../lib/keywords';
import Series from './Series';
import MediaFile from './MediaFile';

export default class Anime extends Series {

  removeKeywords() {
    super.removeKeywords();

    // Remove type specific (anime/tv/movie) keywords
    keywords.anime.forEach((keyword) => {
      this.renamed = this.renamed.replace(
        new RegExp(MediaFile.KEY_BEFORE.source + keyword + MediaFile.KEY_AFTER.source, 'ig'),
        '');
    });
    return this;
  }

  cleanFileName() {
    this.removeBrackets().removeDelimiters().removeKeywords();
  }
}
