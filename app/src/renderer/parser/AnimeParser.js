
export default class AnimeParser {

  constructor(anime) {
    this.anime = anime;
  }

  static get EXPLICIT() {
    return /^((?:(?!\sS\d{1,3}).)*)(?:\b|[\s-]*)+S(\d{1,3})(?:\b|[\s\-x])*(?:E(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:\s?v\d)?)(?:[^\\/]*$)/i;
  }

  cleanFileName() {
    return this.anime.removeBrackets().removeDelimiters().removeKeywords();
  }

  normalizeAnime() {
    return this.anime.normalizeShow().normalizeSeason().normalizeEpisode();
  }

  parse() {
    this.cleanFileName();
    const result = AnimeParser.EXPLICIT.exec(this.anime.renamed);
    if (result) {
      this.anime.show = result[1];
      this.anime.season = result[2];
      this.anime.episode = result[3];
      this.normalizeAnime();
    }
    return this.anime;
  }

}
