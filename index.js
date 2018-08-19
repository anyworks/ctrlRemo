'use strict';

var request = require( 'request' );
var rp = require( 'request-promise' );
var fs = require( 'fs' );
var encode = require( 'hashcode' ).hashCode;
var cachedRequest = require('cached-request')(request) //reserve
var cacheDirectory = "/tmp/cache"; //reserve
cachedRequest.setCacheDirectory(cacheDirectory);

var headers = {
  "Authorization" : `Bearer ${process.env.ACTK_REMO}`
  ,"Content-Type" : "application/json"
};
//for debugging
var ps/*?*/ = process.argv[1];
console.log(process.cwd());

//global settings
var version = "1";
var baseURL="api.nature.global";

exports.generateIRList = function(event, context, callback) {
  this.get({ url : "https://api.nature.global/1/appliances"},{},(err,res)=>{

    var contents = res.filter((e)=>{return e.type === "IR"}).reduce((prev,c)=>{
      prev[c.nickname] = c.signals.reduce((p,c)=>{p[c.name]=c.id;return p;},{});
      return prev;
    },{});

    var dt = JSON.stringify(contents,null,"\t");
    console.log(dt);
    fs.writeFile(`./ir.json`, dt, 'utf8');
    callback(null,dt);
  });

}
//This function is for switching to dummy a behavior of requesting to actual server.
function nrp(){
  return new Promise((resolve,reject)=>{
    resolve({done:"dummy"});
  });
}

function writeContent(you,name,content){
  var dt = content || `{empty : ${you}}`;
  fs.writeFile(`./cache/${name}.json`, dt, 'utf8');
}

var urlfactroy= function(type,id,order)
{
  var base = `https://${baseURL}/`;
  var fmt = {
    url : "",
    data : ""
  };

  if(type === "IR"){
    fmt.url = `1/signals/${id}/send`;
  }

  if(type === "AC"){
    fmt.url = `appliances/${id}/aircon_settings`;
//    fmt.data = (order===false) ? "power-off" : "power-on";
  }
  fmt.url = base + fmt.url;
  return fmt;
};

exports.delayed = function(event, context, callback) {
  var irs = fs.readFileSync("./ir.json","utf-8");
  irs = JSON.parse(irs);
  console.log(irs);
  var promises = [];
  event.orders.forEach((e,idx)=>{
    var id = irs[e.order[0]][e.order[1]];

    var orderObj = urlfactroy("IR",id);
    console.log(e.delay);
    console.log(orderObj);
    setTimeout((i)=>{
      promises.push(postImpl(orderObj.url));
      if(event.orders.length == (i+1)){
        Promise.all(promises).then((res)=>{
            console.log("sending ok");
            callback(null,res);
        });
      }
    },e.delay*(idx+1),idx);
  });
};

exports.get = function(event, context, callback) {
  getImpl(event.url).then((res)=>{callback(null,res)});
}

var getImpl = function(url,data) {
  console.log(url);
  return new Promise((resolve,reject)=>{
    var hash = encode().value(url);
    console.log(hash);
    if (!fs.existsSync(`./cache/${hash}.json`)) {
      rp({   //### need to change### Default behavior is as dummy mode(using cache file).
        url : url,
        method: "get",
        headers : headers,
        json: true
      }).then((res)=>{
        if (!fs.existsSync("./cache")) {
          var content = JSON.stringify(res,null,"\t");
          fs.mkdirSync("./cache", "0744");
        }

        console.log(content);
        writeContent("get",hash,content);
        resolve(res);
      });
    }else{
      var cache =  fs.readFileSync(`./cache/${hash}.json`, 'utf8');
      resolve(JSON.parse(cache));
    }
  });

};

exports.post = function(event, context, callback) {
  postImpl(event.url,event.data).then((res)=>{
    callback(null,res);
  }).catch((err)=>{
    callback(null,err)
  });
};

function postImpl(url,data){
  console.log("############# sending ###################");
  console.log(url);
  console.log(data);
  return new Promise((resolve,reject)=>{
    var hash = encode().value(url);
      rp({     //### need to change### Default behavior is as dummy mode(using cache file).
        url : url,
        method: "post",
        headers : headers,
        json: true,
        form : data
      }).then((res)=>{
        resolve(res);
      }).catch((err)=>{
        reject(err);
      });
  });

}
