const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    // Check whether the Origin in the req.header is in the whitelist
    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = {origin: true};
    } else {
        corsOptions = {origin: false}; // the ACCESS ALLOW ORIGIN will not be return from the server side
    }
    callback(null, corsOptions);
};

exports.cors = cors(); // this will return ACCESS CONTROL ALLOW ORIGIN: *, good for get operation
exports.corsWithOptions = cors(corsOptionsDelegate); 