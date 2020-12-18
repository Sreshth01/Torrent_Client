'use strict';

const net = require('net');     //For TCP connection
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');   //To get the peers list from tracker

module.exports = torrent => {
  tracker.getPeers(torrent, peers => {      //Get the peers list
    peers.forEach(D_load);    //Establish connection with each peer and download
  });
};

function D_load(peer) {
  const socket = net.Socket();  //create socket instance
  socket.on('Error: Connection failed', console.log);      //Catch error if connection fails
  socket.connect(peer.port, peer.ip, () => {    //Establish Connection
    // socket.write(...) write a message here
  });
  socket.on('data', data => {
    // handle response here
  });
}