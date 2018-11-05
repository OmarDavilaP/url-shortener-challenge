const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use JavaScript promises
const { Mongo } = require('../environment');

const uri = `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`;
/**
 , {
  auth: { authSource: Mongo.AUTH },
  user: Mongo.USER,
  pass: Mongo.PASS
}
 */
const db = mongoose.createConnection(uri);

module.exports = db;
