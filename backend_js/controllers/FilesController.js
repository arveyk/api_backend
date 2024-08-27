const dbClient = require('../utils/db');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const fsProm = require('fs').promises;
const redisClient = require('../utils/redis');
const { v4: uuidv4 } = require('uuid');


function postUpload(request, response) {
  const xToken = request.headers['x-token'];
  if (!xToken) {
    response.status(401).send({'error': 'X-Token Missing'});
  } else {
    const key = `auth_${xToken}`;
    try {
      (async () => {
        let statCode = 200;
        let message = {};
        const userId = await redisClient.get(key);
        if (!userId) {
	  statCode = 401;
	  message = {'error': 'Unauthorized'};
        } 
        const user = await dbClient.userCollection.findOne({
          _id: ObjectId(userId)
        });
        if (!user) {
	  statCode = 401;
	  message = {'error': 'Unauthorized'};
        }
	const typeList = ['folder', 'file', 'image'];
        const { name, type, data} = request.body;
        const parentId = request.body.parentId || 0;
        const isPublic = request.body.isPublic || false;
        if (!name) {
          statCode = 400;
          message = {'error': 'Missing name'}
        }
        if (!type || typeList.includes(type) === false) {
          statCode = 400;
          message = {'error': 'Missing type'};
        } else if (!data && type !== 'folder') {
          statCode = 400;
          message = {'error': 'Missing data'};
        }
	let file;
        if (parentId) {
          const file = await dbClient.fileCollection.findOne({
	    _id: parentId
	  });
          if (!file) {
	    statCode = 400;
	    message = {'error': 'Parent not found'};
	    response.status(statCode).send(message)
	    return;
	  }
          if (file.type !== 'folder') {
	    statCode = 400;
	    message = {'error': 'Parent is not a folder'};
	  }
          await dbClient.updateOne(
            { _id: file._id },
            {  $set: {userId: ObjectId(userId)}}
          );
	}
        if (type === 'folder') {
          const insertedDoc = await dbClient.fileCollection.insertOne({
	    name,
	    type,
	    parentId,
            isPublic,
	  });
	  const insertedFile = await dbClient.fileCollection.findOne({
            _id: insertedDoc.insertedId
	  });
	  response.status(201).send(insertedFile);
        } else {
          const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
          const fileName = uuidv4();
          const localPath = `${folderPath}/${fileName}`;
          // const parId = parentId || 0;
	  // const access = isPublic || false;
          let fileDef = {
	    userId: user._id,
	    name,
            type, //'folder' || 'file' || 'image',
            isPublic, // Optional true or false
            parentId, // Optional
            localPath // for type = file | image Base64 of file content
	  }
          const instdFile = await dbClient.fileCollection.insertOne(fileDef);
	  const newFile = await dbClient.fileCollection.findOne({
            _id: instdFile.insertedId
	  });
          const decodedData = Buffer.from (data, 'base64').toString('ascii');
	  if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
	  }
          await fsProm.writeFile(`${localPath}`, decodedData, (error) => {
            console.log(error);
	  });
          statCode = 201;
	  message = newFile;

          response.status(statCode).send(newFile);
	}
      })();
    } catch(error) {
    console.log(error);
    }
  }
}

module.exports = { postUpload };
