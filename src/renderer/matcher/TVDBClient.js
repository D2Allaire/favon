import axios from 'axios';

export default class TVDBClient {
  constructor() {
    this.key = 'D3039F313085C2BA';
    this.url = 'http://localhost:3000';
  }

  search(series) {
    console.log(`Sending API-Request for ${series.show} S${series.season}E${series.episode}.${series.format}`);
    return new Promise((resolve, reject) => {
      const show = encodeURI(series.show);
      axios.get(`${this.url}/shows/search?name=${show}`)
      .then((response) => {
        resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Get episodes by ID
   */
  get(id) {
    console.log(`Requesting episodes for show ${id}`);
    return new Promise((resolve, reject) => {
      axios.get(`${this.url}/show/${id}/episodes`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

}
