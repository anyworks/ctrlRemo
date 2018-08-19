'use strict';
var index = require('../index.js');
var fs = require( 'fs' );

describe('appliances', function() {
  beforeEach(function() {
    var originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  it('generate IR list', function(done) {
    index.generateIRList({},{},done);
  });

  it('delayed request', function(done) {
    index.delayed({
      orders : [
      {
        delay : 3000,
        order : ["電気","オン"]
      },
      {
        delay : 3000,
        order : ["電気","暗く"]
      },
      {
        delay : 3000,
        order : ["電気","オフ"]
      }
    ]
    },{},(res)=>{
       done(res);
    });
  });

});
