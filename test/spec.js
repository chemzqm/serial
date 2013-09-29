/*global it,describe*/
var expect = require('chai').expect;
var Serial = typeof window !== 'undefined' ? require('serial') : require('..');

function square(n, done, ms) {
  setTimeout(function(){
    if (!n) return done(new Error('Need first argument'));
    done(null, n * n);
  }, ms || 5);
}

describe('Serial', function() {
  it('should return values in serial', function(done) {
    var s = new Date().getTime();
    var serial = new Serial();
    serial.add(function(cb, ctx) {
      square(2, cb, 10);
    })
    serial.add(function(cb, ctx) {
      square(ctx.res, cb, 10);
    })
    serial.done(function(err, ctx) {
      if (err) done(err);
      var e = new Date().getTime();
      expect(e - s).to.at.least(20);
      expect(ctx.res).to.equal(16);
      done();
    })
  })

  it('should throw a timeout error when timeout reached', function(done) {
    var serial = new Serial();
    serial.timeout(20);
    serial.add(function(cb, ctx) {
      square(1, cb);
    })
    serial.add(function(cb, ctx) {
      square(1, cb, 30);
    })
    serial.done(function(err, ctx) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Timeout/);
      done();
    })
  })

  it('should not throw a timeout error when each async call finish in timeout', function(done) {
    var serial = new Serial();
    serial.timeout(20);
    serial.add(function(cb, ctx) {
      square(1, cb, 18);
    })
    serial.add(function(cb, ctx) {
      square(1, cb, 18);
    })
    serial.done(function(err, ctx) {
      expect(err).to.be.not.an.instanceof(Error);
      done(err);
    })
  })

  it('should only call the callback once', function(done) {
    var serial = new Serial();
    for (var i = 0; i < 5; i++) {
      serial.add(function(cb, ctx) {
        square(1, cb, 1);
      })
    }
    var t = 0;
    serial.done(function(err, ctx) {
      t++;
      expect(t).to.equal(1);
      done(err);
    })
  })

  it('shound handle sync callbacks', function(done) {
    var serial = new Serial();
    serial.add(function(cb, ctx) {
      cb(null, 10);
    })
    serial.add(function(cb, ctx) {
      var res = ctx.res;
      cb(null, res * res);
    })
    serial.done(function(err, ctx) {
      expect(ctx.res).to.equal(100);
      done();
    })
  })

  it('should throw an error if another callback defined', function(done) {
    var serial = new Serial();
    serial.add(function(cb, ctx) {
      cb(null, 10);
    })
    serial.done(function(err, ctx) {});
    var fn = function() {
      serial.done(function(err, ctx) {});
    }
    expect(fn).to.throw(/^Callback/);
    done();
  })

  it('should be finished immediately when error occur', function(done) {
    var serial = new Serial();
    var s = new Date().getTime();
    serial.add(function(cb, ctx) {
      cb(new Error('custom error'), 10);
    })
    serial.add(function(cb, ctx) {
      setTimeout(function() {
        cb(null, 100);
      }, 50);
    })
    serial.done(function(err, ctx) {
      var e = new Date().getTime();
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^custom/);
      expect(e - s).to.be.below(50);
      done();
    })
  })

  it('should be able to save attribue on ctx', function(done) {
    var serial = new Serial();
    [1, 2, 3].forEach(function(){
      serial.add(function(cb, ctx){
        square( 1 + (ctx.res || 0), function (err ,res) {
          ctx.total = (ctx.total || 0) + res;
          cb(err, res);
        })
      })
    })
    serial.done(function(err, ctx) {
      expect(ctx.total).to.equal(30);
      done(err);
    })
  })
})

