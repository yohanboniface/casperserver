# CasperServer

Simple utility server for mocking requests in [CasperJS](http://casperjs.org/).

Warning: it's *experimental* and *work in progress*.

## Example

```javascript
var casper = require('casper').create();
require('casperserver.js').create(casper, {port: 8007});
casper.server.start();

// Loading default file index.html
casper.start('http://localhost:1337', function (){
    this.test.assertTitle('Title from index.html', 'index.html is loaded and title is correct');
});

casper.then(function () {
    // This will indicate the content of the response to serve to this path
    this.server.watchPath("/a-path-or-a-regex/", {content: "the content of the response"});
    // do some tests needing to access to the watched path
});


casper.then(function () {
    path = "/123/";
    // again, define what to respond to path /123/
    this.server.watchPath(path, {content: "ok"});
    // Indicate to store the request
    this.server.watchRequest(path);
    // Do something that POST to "/123/"

    // Then get the request
    var request = this.server.getWatchedRequest(path);
    // And check it
    this.test.assertTruthy(request, "Request has been catched");
    this.test.assertEqual(request.method, 'POST', 'POST received');
    this.test.assertEqual(request.post.myfield, "myvalue", 'POST myfield value is correct');
});

```

More examples on the [server.js tests file](./tests/servers.js)