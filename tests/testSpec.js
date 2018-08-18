'use strict';
var index = require('../index.js');


describe('appliances', function() {

  xit('get', function(done) {
    index.get({ api : "appliances" }, {  }, (err, res) => {
        if(!err){
          expect(res).not.toBeNull();
          console.log(res,null,"\t");
          var ary = res.map((e)=>{ var h={};h[e.nickname]=e.id;return h; });
          console.log(ary);
        }
        else{
          console.log(err);
        }
        done();
    });
  });

  it("send signal air-con",(done)=>{
    var apiloc = `appliances/${process.env.AIRCON_ID}/aircon_settings`;
    var data = {
      "button" : "power-on", // or "power-off"
    };
    index.post({ api : apiloc , params : data }, {  }, (err, res) => {
      expect(res).not.toBeNull(res);
      console.log(res);
      done();
    });
  });




});
