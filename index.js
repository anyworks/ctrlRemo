'use strict';

var request = require( 'request' );
var rp = require( 'request-promise' );
var fs = require( 'fs' );
var encode = require( 'hashcode' ).hashCode;
var cachedRequest = require('cached-request')(request)
var cacheDirectory = "/tmp/cache";
cachedRequest.setCacheDirectory(cacheDirectory);
var headers = {
  "Authorization" : `Bearer ${process.env.ACTK_REMO}`
  ,"Content-Type" : "application/json"
};
var ps/*?*/ = process.argv[1];
console.log(process.cwd());
var version = "1";
var baseURL="api.nature.global";
var response;

function nrp(){
  return new Promise((resolve,reject)=>{
    resolve({done:"dummy"});
  });
}

function writeContent(you,hash,content){
  var dt = content || `{empty : ${you}`;
  fs.writeFile(`./cache/${hash}.json`, dt, 'utf8');
}

exports.get = function(event, context, callback) {
  var vapi = `${version}/${event.api}`;
  var url = `https://${baseURL}/${vapi}`;
  var hash = encode().value(url);
  if (!fs.existsSync(`./cache/${hash}.json`)) {
    nrp({
      url : url,
      method: "get",
      headers : headers,
      json: true
    }).then((res)=>{
      if (!fs.existsSync("./cache")) {
      var content = JSON.stringify(res,null,"\t");
        fs.mkdirSync("./cache", "0744");
      }
      callback(null,res);
      writeContent(content);
      return;
    });
  }else{
    var cache =  fs.readFileSync(`./cache/${hash}.json`, 'utf8');
    callback(null,JSON.parse(cache));
  }
};

exports.post = function(event, context, callback) {
  var vapi = `${version}/${event.api}`;
  var url = `https://${baseURL}/${vapi}`;
  var hash = encode().value(url);

  if (!fs.existsSync(`./cache/${hash}.json`)) {
    nrp({
      url : url,
      method: "post",
      headers : headers,
      json: true,
      form : event.params
    }).then((res)=>{
      if (!fs.existsSync("./cache")) {
        fs.mkdirSync("./cache", "0744");
      }
      var content = JSON.stringify(res,null,"\t");
      writeContent(content);
      callback(null,res);
      return;
    });
  }else{
    var cache =  fs.readFileSync(`./cache/${hash}.json`, 'utf8');
    callback(null,JSON.parse(cache));
  }

};
