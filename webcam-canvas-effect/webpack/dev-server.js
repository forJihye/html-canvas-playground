const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const fs = require('fs');

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const net = require('net');

let {port} = require('./config');

const log = console.log;

const getPort = async (defaultPort = 0, defaultHost = '::') => {
  try {
    const port = await new Promise((resolve, reject) => net.createServer()
      .once('error', err => reject(err))
      .once('listening', function () {
        resolve(this.address().port);
        this.close();
      })
      .listen(defaultPort, defaultHost));
    return port;
  } catch (err) {
    return getPort(0, defaultHost);
  }
};
const pc = globalThis.process.send ? globalThis.process : {
  on() {},
  send() {},
};
async function runServer() {
  const options = {
    computedPort: port,
  }
  const config = require('./webpack.dev.config.js');
  const compiler = webpack(config);
  compiler.hooks.done.tap('ProgressPlugin', (context, entry) => {
    console.clear();
    log(chalk.green('Server running at :', chalk.underline(`http://localhost:${options.computedPort}`)));
  });
  
  const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
    stats: 'minimal',
    historyApiFallback: true,
  });
  const webpackHotMiddleware = WebpackHotMiddleware(compiler);
  // const expressStaticMiddleware = express.static(path.resolve(compiler.outputPath, '..'));
  const RESULT_FILE = path.join(compiler.outputPath, 'index.html');
  const staticMiddleware = async (req, res, next) => {
    if (!req.method === 'GET') return next();
    
    // console.log(path.join(compiler.outputPath, '..', req.url));
    // if (fs.existsSync(path.join(compiler.outputPath, '..', req.url))) {
    //   return expressStaticMiddleware(req, res, next);
    // }
    compiler.outputFileSystem.readFile(RESULT_FILE, (err, result) => {
      if (err) return next(err);
  
      res.set('content-type','text/html');
      res.send(result);
      res.end();
    });
  };

  const app = express();
  app.use(webpackDevMiddleware);
  app.use(webpackHotMiddleware);
  app.use(staticMiddleware);
  const server = app.listen(options.computedPort = await getPort(port), () => {
    pc.send(['port', options.computedPort]);
  });
  return server;
};

pc.on('message', ([type, data]) => {
  if (type === 'port') runServer(data);
});

pc.send(['load']);

!globalThis.process.send && runServer(port);
