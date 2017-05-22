import dir from 'node-dir';

export default {
  readFiles(path) {
    const reg = /^(.+)\.(mkv|mp4|m4v|mp[gev2]|mpeg|avi|mov|wmv|vob|flv|srt|sub|ass|ssa|idx)$/i;
    return dir.promiseFiles(path)
      .then((paths) => {
        const files = [];
        paths.forEach((path) => {
          const result = reg.exec(path);
          if (result) {
            const name = result[1].replace(/^.*[\\/]/, '');
            files.push({
              path,
              name,
              format: result[2].toLowerCase(),
              season: '',
              episode: '',
              show: '',
            });
          }
        });
        if (files.length > 0) return Promise.resolve(files);
        return Promise.reject(new Error('No matching files found.'));
      })
      .catch((err) => Promise.reject(err));
  },
};
