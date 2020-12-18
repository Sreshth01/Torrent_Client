'use strict';

const torrentParser = require('./lib/torrent-parser');  //contains code to get information out of a torrent file
const download = require("./lib/download")  //Get peers list and download from them

const torrent = torrentParser.open(process.argv[2]);    //Open the torrent file and store the buffer

download(torrent);