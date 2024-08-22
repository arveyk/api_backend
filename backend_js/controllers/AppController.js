const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const request = require('request');


function getStatus(request, response) {
  if (redisClient.isAlive() && dbClient.isAlive()) {
    response.status(200).send({'redis': true, 'db': true});
  }
}

function getStats(request, response) {
  (async () => {
    try {
      const UsersCount = await dbClient.nbUsers();
      const FilesCount = await dbClient.nbFiles();
      response.status(200).send({'users': UsersCount, 'files': FilesCount});
    } catch (error) {
      console.error('dbClient error', error);
    }
  })();
}

module.exports = {
  getStats,
  getStatus
}
