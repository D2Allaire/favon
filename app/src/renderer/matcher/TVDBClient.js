import axios from 'axios';

export default class TVDBClient {
  constructor(key) {
    this.key = key;
    this.url = 'http://localhost:3000';
  }

  search(series) {
    console.log(`Sending API-Request for ${series.show} S${series.season}E${series.episode}.${series.format}`);
    return new Promise((resolve, reject) => {
      const show = encodeURI(series.show);
      axios.get(`${this.url}/series/search?name=${show}`)
      .then(response => {
        resolve(response.data.data);
      })
      .catch(e => {
        reject(e);
      });
    });
  }

}
