'use strict';

var fs = require('fs');
var express = require('express');
var app = express();

app.use('/', express.static(process.cwd() + '/'));

let port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log(`Node.js listening on port ${port}...`);
});
