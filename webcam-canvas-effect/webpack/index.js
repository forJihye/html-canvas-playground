const fs = require('fs');
const path = require('path');
const {fork} = require('child_process');
const tcpKill = require('kill-port');
const chalk = require('chalk');

const debounce = (f, ms) => {
  let timer;
  return (...props) => {
    clearTimeout(timer);
    timer = setTimeout(f, ms, ...props);
  };
};

const devServer = new class DevServer {
  #port;
  #server;
  run() {
    this.#server = fork(path.resolve(__dirname, './dev-server.js'), [], {stdio:'inherit'})
      .on('message', ([type, data]) => {
        if (type === 'port') this.#port = data;
        if (type === 'load') this.#server.send(['port', this.#port]);
      });
  };
  kill() {
    this.#server.kill();
    return tcpKill(this.#port, 'tcp')
      .then(() => this.run())
      .catch(console.log);
  }
}

const handleChange = (type, filename) => {
  if (['index.js'].indexOf(filename) !== -1) return;
  console.log(chalk.red('[ RESTART WEBPACK SERVER ]'));
  devServer.kill();
};
const main = async () => { try {
  const watcher = debounce(handleChange, 100);
  fs.watch(path.resolve(__dirname, '..', 'public'), watcher);
  fs.watch(path.resolve(__dirname, '..', 'providers'), watcher);
  fs.watch(path.resolve(__dirname, '..'), watcher);
  fs.watch(path.resolve(__dirname), watcher);
  devServer.run();
} catch (error) {
  throw error;
}};
main();
