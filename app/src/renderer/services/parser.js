import anime from './regex/anime';
import keywords from '../lib/keywords';

/**
 * 2 -> 02, 12->12
 * @param {*} number
 */
function normalizeSeasonOrEpisode(number) {
  if (number && number.length < 2) return `0${number}`;
  return number;
}

/**
 * 'Guilty_Crown_' -> 'Guilty Crown'
 * @param {*} name
 */
function normalizeShow(name) {
  return name.replace(/[\s_.]/g, ' ').trim().replace(/\s?-$/, '');
}

/**
 * If all other parse methods have failed, try to do some drastic cleanups and then
 * parse again.
 */
function animeFallback(file) {
  // First, if there are any brackets, remove them and their content:
  let name = file.name.replace(/(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})/g, '');
  // Replace all delimiting symbols with spaces:
  name = name.replace(/[_.]/g, ' ').trim();
  // Replace some common keywords, making sure they're not in the middle of words:
  keywords.general.forEach((keyword) => {
    name = name.replace(new RegExp(/(?=\b|[[({\s_.-])/.source + keyword + /(?=[\s_.\-\])}]|$)/.source, 'ig'), '');
  });
  keywords.anime.forEach((keyword) => {
    name = name.replace(new RegExp(/(?=\b|[[({\s_.-])/.source + keyword + /(?=[\s_.\-\])}]|$)/.source, 'ig'), '');
  });
  // Now try to just parse anime title, season and episode:
  const result = anime.fallback.exec(name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = normalizeSeasonOrEpisode(result[2]) || '01';
    file.episode = normalizeSeasonOrEpisode(result[3]);
  }
  return file;
}

function parseAnimeFile(file) {
  // First use the explicit pattern to match explicit S01E01 values.
  let result = anime.explicit.exec(file.name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = normalizeSeasonOrEpisode(result[2]);
    file.episode = normalizeSeasonOrEpisode(result[3]);
    return file;
  }
  // Filter out anime credits.
  result = anime.credits.exec(file.name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = 'Credits';
    file.episode = normalizeSeasonOrEpisode(result[2]);
    console.log(`Matched ${file.name} as Credit`);
    return file;
  }
  // Then match specials of the type 'OVA - 01' and assign season 0 by default.
  result = anime.specialBefore.exec(file.name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = '00';
    file.episode = normalizeSeasonOrEpisode(result[2]);
    console.log(`Matched ${file.name} as Special-Before`);
    return file;
  }
  // Then match specials of the type '01 - OVA' and assign season 0 by default.
  result = anime.specialAfter.exec(file.name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = '00';
    file.episode = normalizeSeasonOrEpisode(result[2]);
    console.log(`Matched ${file.name} as Special-After`);
    return file;
  }
  // Lastly, apply the default pattern to match show name, season and episode.
  result = anime.default.exec(file.name);
  if (result) {
    file.show = normalizeShow(result[1]);
    file.season = normalizeSeasonOrEpisode(result[2]) || '01';
    file.episode = normalizeSeasonOrEpisode(result[3]);
    console.log(`Matched ${file.name} as Default Pattern`);
    return file;
  }
  // Since some filenames have still not matched, provide a fallback to at least extract some information:
  result = animeFallback(file);
  console.log(`Matched ${file.name} as Fallback`);
  return file;
}

export default {
  parseAnime(files) {
    const newFiles = JSON.parse(JSON.stringify(files));
    newFiles.forEach((file) => parseAnimeFile(file));
    return newFiles;
  },
};
