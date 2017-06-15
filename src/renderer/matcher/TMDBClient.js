import axios from 'axios';

export default class TMDBClient {
  constructor(key) {
    this.key = key;
  }

  getTMDBConnection() {
    return axios.create({
      baseURL: `https://api.themoviedb.org/3/search/movie?api_key=${this.key}&language=en-US&page=1`,
    });
  }

  search(movie) {
    console.log(`Sending API-Request for ${movie.title}.${movie.format}`);
    return new Promise((resolve, reject) => {
      const title = encodeURI(movie.title);
      const year = movie.year ? Number(movie.year) : '';
      let query = '';
      if (year) {
        query = `&query=${title}&year=${year}`;
      } else {
        query = `&query=${title}`;
      }
      this.getTMDBConnection().get(query)
      .then((response) => {
        resolve(response.data.results);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

}
