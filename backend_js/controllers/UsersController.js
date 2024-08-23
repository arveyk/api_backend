const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const ObjectId = require('mongodb').ObjectId;

function postNew(request, response) {
  const { email, password } = request.body;
  if (!email) {
    response.status(400).send({'error': 'Missing email'});
  } else if (!password) {
    response.status(400).send({'error': 'Missing password'});
  } else {
    (async () => {
      try {
        const user = await dbClient.userCollection.findOne({email: email});
        if (user) {
          response.status(400).send({'error': 'Already exist'});
        } else {
          const shaJen = crypto.createHash('sha1');
          shaJen.update(password);
          const pwdHash = shaJen.digest('hex');
          const newUser = await dbClient.userCollection.insertOne({
            email: email,
            password: pwdHash
          });
          response.status(201).send({'email': email, 'id': newUser.insertedId});
        }
      } catch (err) {
        console.log('db userCollection error', err);
      }
    })();
  }
}

function getMe(request, response) {
  const xtoken = request.headers['x-token'];
  if (!xtoken) {
    response.status(401).send({'error': 'X-Token missing'});
  } else {
    (async () => {
      try{
	const key = `auth_${xtoken}`;
	console.log(key);
        const userId = await redisClient.get(key);
	const user = await dbClient.userCollection.findOne({
	  _id: ObjectId(userId)
	});
        console.log(user);
	if (!user) {
	  response.status(401).send({'error': 'Unauthorized'});
	} else {
	  response.status(200).send({
	    email: user.email,
	    id: user._id
	  });
	}
      } catch(error) {
        console.log(error);
      }
    })();
  }
}

module.exports = {
  getMe,
  postNew
};
