'use strict';

const dgram = require('dgram');                       //To create socket instance
const Buffer = require('buffer').Buffer;              //To create empty Buffer of given size
const urlParse = require('url').parse;                //To parse the url
const crypto = require('crypto');                     //To generate random Bytes
const torrentParser = require('./torrent-parser');     //contains code to get information out of a torrent file
const util = require('./util');                       //Contains some utility User defined functions e.g. getID()

module.exports.getPeers = (torrent, callback) => {

    const socket = dgram.createSocket('udp4');      //create socket instance
    const url = torrent.announce.toString('utf8');    //Get url from torrent buffer


    udpSend(socket, buildConnReq(), url);     //Build and send connection request

    socket.on('message', response => {

        if (respType(response) === 'connect') {

            //Parse connect response
            const connResp = parseConnResp(response);

            //Build and send announce request
            udpSend(socket, buildAnnounceReq(connResp.connectionId, torrent), url);

        }
        else if (respType(response) === 'announce') {
            //Parse announce response
            const announceResp = parseAnnounceResp(response);

            //Return peers list
            callback(announceResp.peers);
        }
    });
};

function udpSend(socket, message, rawUrl, callback = () => { }) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
    const action = resp.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
}

function buildConnReq() {

    const buf = Buffer.alloc(16); // create an empty buffer of size 16 bytes

    //Write connection id in first 8 bits--(No function to write 8 bytes together)
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980, 4);

    //Write action=0 in next 4 bytes
    buf.writeUInt32BE(0, 8);

    //Write transaction id in next 4 bytes after generating 4 random bytes using crypto
    crypto.randomBytes(4).copy(buf, 12);

    return buf;
}

//Return the dictionary of Parsed message
function parseConnResp(resp) {

    return {
        action: resp.readUInt32BE(0),   //Parse action from first 4 bytes
        transactionId: resp.readUInt32BE(4),    //Parse Transaction id from next 4 bytes
        connectionId: resp.slice(8)     //Parse Connection id from next 4 bytes
    }
}

function buildAnnounceReq(connId, torrent, port = 6881) {   //Official Bittorent port [6881,6889]

    const buf = Buffer.allocUnsafe(98);     //98 bytes empty buffer

    // connection id
    connId.copy(buf, 0);

    // action=1
    buf.writeUInt32BE(1, 8);

    // transaction id-random 4 bytes
    crypto.randomBytes(4).copy(buf, 12);

    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);

    // Generate peer ID of 20 bytes 
    util.genId().copy(buf, 36);

    // downloaded
    Buffer.alloc(8).copy(buf, 56);

    // left
    torrentParser.size(torrent).copy(buf, 64);

    // uploaded
    Buffer.alloc(8).copy(buf, 72);

    // event=0 :- 0: none; 1: completed; 2: started; 3: stop
    buf.writeUInt32BE(0, 80);

    // ip address=0 : default
    buf.writeUInt32BE(0, 80);

    // key: random 4 bytes
    crypto.randomBytes(4).copy(buf, 88);

    // num_want=-1 : default
    buf.writeInt32BE(-1, 92);

    // port
    buf.writeUInt16BE(port, 96);

    return buf;
}

function parseAnnounceResp(resp) 
{
    function group(iterable, groupSize)     //Info of peers comes in group of 6 bytes i.e. it's of the form 6*n
    {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) 
        {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(address => {    //list of peers
            return{     //each peer has ip and port
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }
}