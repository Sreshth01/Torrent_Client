'use strict';

const crypto = require('crypto');   //To generate random bytes

let id = null;      //Initialize id with null

//To generate random id of 20 bytes
module.exports.genId = () => {

  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-SA0001-').copy(id, 0);
  }
  return id;

};