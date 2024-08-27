const { MongoClient } = require('mongodb');

//console.log((MongoClient));
const url = 'mongodb://localhost:27017';

class DBClient {
  constructor() {
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    /*
     * database Users or clients?
     */
    this.connectStatus = false;
    const dbName = 'files_manager';
    this.connect(dbName).then(db => {
      this.db = db;
      this.fileCollection = this.db.collection('files');
      this.userCollection = this.db.collection('users');
      return true;
    }).then(() => true).catch((error) => {
      console.log(error);
    });
  }
  async connect(dbName) {
    try {
      await this.client.connect();
      const db = this.client.db(dbName);
      this.connectStatus = true;
      return db;
    } catch (error) {
	    console.error(error);
    }
  }

  isAlive() {
     return this.connectStatus;
  }

  async nbUsers() {
    const NoOfUsers = await this.userCollection.countDocuments();
    return NoOfUsers;
  }
  async nbFiles() {
    const NoOfFiles = await this.fileCollection.countDocuments();
    return NoOfFiles;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
