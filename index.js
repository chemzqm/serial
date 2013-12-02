var nextTick = require('next-tick');
/**
 * Parallel Class
 * @api public
 */
function Serial () {
  if (! (this instanceof Serial)) return new Serial();
  this.ctx = {};
  this.t = 10000;
  this.cbs = [];
  return this;
}

/**
 * Set timeout `ms`
 *
 * @param {Number} ms
 * @api public
 */
Serial.prototype.timeout = function(ms){
  this.t = ms;
  return this;
}

/**
 * add `fn` as a callback
 * `fn` is called with a `callback` and `ctx`
 * `callback` should be called like `done(err, res)` when `fn` finished.
 *
 * @param {String} fn
 * @api public
 */
Serial.prototype.add = function(fn){
  var self = this;
  this.cbs.push(function() {
    var cb = timeout(function(err, res) {
      if (err) return self.cb(err, self.ctx);
      self.ctx.res = res;
      self.next();
    }, self.t);
    fn(function() {
      var args = arguments;
      nextTick(function() {
        cb.apply(null, args);
      })
    }, self.ctx);
  })
  return this;
}

/**
 * `cb(err, ctx)` when serial finished
 *
 * @param {String} cb
 * @api public
 */
Serial.prototype.done = function(cb){
  if(this.cb) throw new Error('Callback exist');
  var self = this;
  this.cb = function() {
    self.finished = true;
    cb.apply(null, arguments);
    delete self.cbs;
  }
  this.next();
}

Serial.prototype.next = function() {
  if (this.finished) return;
  var fn = this.cbs.shift();
  if (fn) {
    fn();
  } else if (this.cb) {
    this.cb(null, this.ctx);
  }
}

function timeout (fn, ms) {
  var called;
  var id = setTimeout(function(){
    fn(new Error('Timeout ' + ms + ' reached'));
    called = true;
  }, ms);
  var cb = function() {
    if (called) return;
    clearTimeout(id);
    fn.apply(null, arguments);
  }
  return cb;
}

module.exports = Serial;
