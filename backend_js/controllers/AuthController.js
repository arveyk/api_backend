const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const crypto = require('crypto');
const {v4: uuidv4} = require('uuid');
const ObjectId = require('mongodb').ObjectId;


function getConnect(request, response) {
  const authStr = request.headers.authorization;
  if (!authStr) {
    response.status().send({'error': 'Missing Authorization header'});
  } else {
    const [basic, base64Cred] = authStr.split(' ');
    if (basic !== 'Basic') {
      response.status(401).send({'error': "Unauthorized"})
    } else {
      const shasum = crypto.createHash('sha1');
      const decodedCred = Buffer.from(base64Cred, 'base64').toString('ascii');
      const [email, password] = decodedCred.split(':');

      shasum.update(password);
      const hashPwd = shasum.digest('hex');

      (async () => {
        try {
          const user = await dbClient.userCollection.findOne({
            email: email,
            password: hashPwd
          });
          if (!user) {
            response.status(401).send({'error': 'Unauthorized'});
          } else {
	    const token = uuidv4();
            const key = 'auth_' + token;
            if (!user._id) {
	      throw new Error(`user._id undefined${user}`)
	    }
	    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
            response.status(200).send({'token': token});
	  }
	} catch (error) {
	  console.error(error);
	}
      })();
    }
  }
}

function getDisconnect(request, response) {
  const xtoken = request.headers['x-token'];
  if (!xtoken) {
    response.status(401).send({'error': 'Unauthorized'});
  } else {
    (async () => {
      try{
	const key = `auth_${xtoken}`;
        const userId = await redisClient.get(key);
	const user = await dbClient.userCollection.findOne({
	  _id: ObjectId(userId)
	});
        if (!user) {
	  response.status(401).send({'error': 'Unauthorized'});
	} else {
          redisClient.del(key);
	  response.status(204).send({'nice': 'All good'});
	}
      } catch(error) {
        console.log(error);
      }
    })();
  }
}

module.exports = {
  getConnect,
  getDisconnect
};
