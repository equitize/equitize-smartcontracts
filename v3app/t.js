var {XSGD_address} = require('./config/XSGD.json');
var {equityToken} = require('./config/equitytoken.json');
var cf = require("./smart_contracts/crowdfunding.js")(XSGD_address,equityToken)
console.log(cf)