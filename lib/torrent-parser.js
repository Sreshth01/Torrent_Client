'use strict';

const fs = require('fs');   //To read the torrent file
const bencode = require('bencode');     //To decode the torrent file and return the buffer
const crypto = require('crypto');       //To create hash of torrent info
const bignum = require('bignum');   //As the torrent size can be a larger than 32Bit, used bignum to export as buffer of size 8 Byte 

module.exports.open = (file_path) => {
  return bencode.decode(fs.readFileSync(file_path));
};

module.exports.size = torrent => {
    
    //if only 1 file, then t_size=torrent.info.length, else we iterate over all files and sum the length
    const t_size = torrent.info.files ?
      torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
      torrent.info.length;
  
    return bignum.toBuffer(t_size, {size: 8});
};

module.exports.infoHash = torrent => {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();     //returns hash of torrent info
};