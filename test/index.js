'use strict';
/* globals describe, it, beforeEach, afterEach*/

var whileConnected = require('../');
var assert = require('assert');
var Counter = require('jasonkuhrt-counter');
var sinon = require('sinon');




describe('whileConnected', function(){
  var sock, counter, clock, countSync, countAsync;

  beforeEach(function(){
    clock = sinon.useFakeTimers();
    counter = Counter(0);
    sock = mockSocket();
    countAsync = function(ms){
      return function(again){
        counter.inc();
        setTimeout(again, ms);
      };
    };
    countSync = function(){
      return function(again){
        counter.inc();
        again();
      };
    };
  });

  afterEach(function(){
    clock.restore();
  });



  it('callback is never invoked if socket is disconnected on arrival', function(){
    // Disconnect BEFORE invocation,
    sock.disconnect();
    whileConnected(sock, 1, countSync());
    clock.tick(100);
    assert.equal(counter.value(), 0);
  });



  describe('`again` invoked syncronously', function(){
    it('is noop after disconnect before loop', function(){
      var debounce = 10;

      whileConnected(sock, debounce, countSync());

      sock.disconnect();

      clock.tick(100);
      assert.equal(counter.value(), 1);
    });


    it('is noop after disconnect after loop', function(){
      var debounce = 10;
      var loops = 10;

      whileConnected(sock, debounce, countSync());

      clock.tick(debounce*loops);
      sock.disconnect();

      clock.tick(100);
      assert.equal(counter.value(), 1 + loops);
    });


    it('is debounced by given ms', function(){
      var debounce = 10;
      var loops = 10;

      whileConnected(sock, debounce, countSync());
      clock.tick(debounce * loops);
      assert.equal(counter.value(), 1 + loops);
    });

  });



  describe('`again` invoked asyncronously', function(){
    it('is noop after disconnect before loop', function(){
      var debounce = 10;
      var asyncTime = debounce + 1;

      whileConnected(sock, debounce, countAsync(asyncTime));

      sock.disconnect();

      clock.tick(100);
      assert.equal(counter.value(), 1);
    });


    it('is noop after disconnect after loop', function(){
      var debounce = 10;
      var loops = 10;
      var asyncTime = debounce + 1;

      whileConnected(sock, debounce, countAsync(asyncTime));

      clock.tick(asyncTime*loops);
      sock.disconnect();

      clock.tick(100);
      assert.equal(counter.value(), 1 + loops);
    });


    it('is debounced by given ms', function(){
      var debounce = 10;
      var loops = 10;
      var asyncTime = debounce - 1;

      whileConnected(sock, debounce, countAsync(asyncTime));
      clock.tick(debounce*loops);
      assert.equal(counter.value(), 1 + loops);
    });
  });

});






// Mock based on facts demonstrated by:
// https://gist.github.com/jasonkuhrt/9548208
function mockSocket(){
  var mock = {
    writable: true,
    readable: true,
    _handle: {}
  };
  mock.disconnect = function disconnect(){
    mock.writable = false;
    mock.readable = false;
    mock._handle = null;
  };
  return mock;
}