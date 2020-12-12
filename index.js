'use strict';

const fs = require('fs');   //To read the torrent file
const bencode = require('bencode');     //To decode the torrent file and return the buffer
const tracker = require('./tracker');     //To get the peers list from tracker

const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

tracker.getPeers(torrent, peers => {
    console.log(peers);
});