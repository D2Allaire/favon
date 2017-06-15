function syncLoop(iterations, process, exit) {
  let index = 0;
  let done = false;
  let shouldExit = false;
  const loop = {
    next() {
      if (done) {
        if (shouldExit && exit) {
          exit();
        }
      }
      if (index < iterations) {
        index++;
        process(loop);
      } else {
        done = true;
        if (exit) exit();
      }
    },
    iteration() {
      return index - 1;
    },
    break(end) {
      done = true;
      shouldExit = end;
    },
  };
  loop.next();
  return loop;
}

export { syncLoop };
export default syncLoop;
