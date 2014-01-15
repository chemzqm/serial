[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/chemzqm/serial/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![Build Status](https://secure.travis-ci.org/chemzqm/serial.png)](http://travis-ci.org/chemzqm/serial)
[![Coverage Status](https://coveralls.io/repos/chemzqm/serial/badge.png?branch=master)](https://coveralls.io/r/chemzqm/serial?branch=master)

# Serial

Serial provide a simple way for management of serial async call, so you can remember the API just by a glance.

If you think [async](https://github.com/caolan/async) and [promise](https://github.com/then/promise) is somehow complecated, consider to use [chemzqm/parallel](https://github.com/chemzqm/parallel) and [chemzqm/serial](https://github.com/chemzqm/serial) to make your life easier.

## Installation

Via npm:

    npm install node-serial

Via [component](https://github.com/component/component):

    component install chemzqm/serial

## Features

* Unified error handling.
* Timeout support for individual callback.
* Immediate finished when error occur.
* Get previous callback result through `ctx.res`.
* Save and get properties on `ctx` object.
* No magic on finished callback, just one function.

## Test on node and browser

You must have `component` installed for browser usage and `mocha`, `mocha-phantomjs` installed for testing.

``` bash
$ npm install -g component mocha mocha-phantomjs
$ git clone git@github.com:chemzqm/serial.git
$ cd serial && npm install
$ make
#run test on server side
$ make test
#run test on phantomjs
$ make phantomjs
```

## Example

``` js
function square(n, done) {
  setTimeout(function(){
    done(null, n * n);
  }, 100);
}
var Serial = require('serial'); //The name is 'node-serial' in node environment
var serial = new Serial();
serial.timeout(1000);
[1, 2, 3].forEach(function(){
  serial.add(function(done, ctx){
    square( 1 + (ctx.res || 0), function (err ,res) {
      done(err, res);
    })
  })
})
serial.done(function (err, ctx) {
  if (err) throw err;
  // ctx.res => 25
});
```

## API

### Serial()

Init new Serial instance.

### .timeout(Number)

Set the timeout to number `ms`, default is `10s`.

**Note** this timeout if for individual callback function.

### .add(Function)

Add Function to serial, the first argument is a callback function, it should be called with `error` as first argument and result you need as secound argument. the secound argument is a `ctx` obejct, it's `res` attribute contains the result of the previous function call, you can save any object on `ctx` as you need.

### .done(Function)

The callback function is called with `error` (null or undefined if not exist) and the result array when all the request get finished (or timeout reached).

**Note**, this function should only be called once.

## License

  MIT


