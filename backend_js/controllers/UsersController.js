const dbClient = require('../utils/db');
const request = require('request');
const crypto = require('crypto');


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

function getMe() {
}

module.exports = {
  getMe,
  postNew
};
