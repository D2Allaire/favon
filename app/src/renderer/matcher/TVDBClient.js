import axios from 'axios';

export default class TMDBClient {
  constructor(key) {
    this.key = key;
    this.url = 'https://api.thetvdb.com';
    this.token = '';
    this.getJWTToken();
  }

  getJWTToken() {
    axios.post(`${this.url}/login`, {
      key: this.key,
    })
    .then(response => {
      this.token = response.data.token;
    });
  }

  getTVDBConnection() {
    axios.create({
      baseURL: `${this.url}/search/series`,
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  search(series) {
    console.log(`Sending API-Request for ${series.renamed}.${series.format}`);
    return new Promise((resolve, reject) => {
      const show = encodeURI(series.show);
      const query = `?name=${show}`;
      this.getTVDBConnection().get(query)
      .then(response => {
        resolve(response.data.data);
      })
      .catch(e => {
        reject(e);
      });
    });
  }

}
