import { MongoClient, ObjectId } from 'mongodb';

export class DatabaseClient {
  database: string;
  collection: string;
  client: MongoClient;
  
  constructor(uri: string, _database: string) {
    this.database = _database;
    this.collection = 'users';
    this.client = new MongoClient(uri)
  }

  async insert(data) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection(this.collection);
      const result = await users.insertOne(data); 
      return result.insertedId;
    } catch(err) {
      console.log(err);
    }
  }

  async select(id) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection(this.collection);
      const result = await users.findOne({_id: new ObjectId(id)}); 
      return result;
    } catch(err) {
      console.log(err);
    }
  }

  async update(id, data) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection(this.collection);
      const result = await users.replaceOne({_id: new ObjectId(id)}, data); 
    } catch(err) {
      console.log(err);
    }
  }

  async delete(id) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection(this.collection);
      const result = await users.deleteOne({_id: new ObjectId(id)}); 
    } catch(err) {
      console.log(err);
    }
  }
};
