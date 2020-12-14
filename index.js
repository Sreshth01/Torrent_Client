'use strict';

const tracker = require('./tracker');     //To get the peers list from tracker
const torrentParser = require('./torrent-parser');  //contains code to get information out of a torrent file

const torrent = torrentParser.open('sample.torrent');

tracker.getPeers(torrent, peers => {
    console.log(peers);
});