# CasperServer

Simple utility server for mocking requests and responses in [CasperJS](http://casperjs.org/).

Warning: it's *experimental* and *work in progress*.

## Example

```javascript
var casper = require('casper').create();
require('casperserver.js').create(casper, {port: 8007});
casper.server.start();

// Loading default file index.html
casper.start('http://localhost:8007', function (){
    this.test.assertTitle('Title from index.html', 'index.html is loaded and title is correct');
});

casper.then(function () {
    // This will indicate the content of the response to serve to this path
    this.server.watchPath("/a-path-or-a-regex/", {content: "the content of the response"});
    // can be also:
    this.server.watchPath("/a-path-or-a-regex/", {content: function(request) {
        /* do something according to the request values*/
        return content
        }
    });
    // then do some tests of you application needing to access to the given path
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

More examples on the [server.js tests file](https://github.com/yohanboniface/casperserver/blob/master/tests/casperserver.js)

## Usage

You need to attach the server to the casper instance

```
require('casperserver.js').create(casper, {port: 8007});
```

You can optionaly watch path without having started the server

You must start the server

```
casper.server.start();
```

Now every request sent on port 8007 (for example) will be addressed by
our testserver.
The default behaviour is to look for files in the `responsesDir` corresponding to
the requested URL (after having replaced the `/` by `_`). For example, the content for the
path `/some/path/22/` will be looked into the file `some_path_22` in the `responsesDir` directory.

Then you can watchPath, for serving some path specifically, and watchRequest, to be able to
auscultate a request sent by your application (for exemple to check the post parameters values).


## API

### create(casper, options)

Options:

* port: (int, default: 8007) the port the server will listen to
* defaultStatusCode: (int, default: 200) the default status code of the response
* responsesDir: (string, default: "./") the path where to look for responses content

### watchPath(path, options)

Tell the server how to serve this specific path.

Note: **each option can be a string OR a function getting the request as parameter**

path: a string or a regex-like string to catch requests from their path

options:

* content: (string or function) content of the response to serve
* filePath: (string or function) path to a file where to get the content to server (can be relative to `responsesDir`
  or absolute)
* statusCode: (string or function) status code of the response to serve
* permanent: (boolean, default: false) if true, does not automatically unwatch served path

### unwatchPath(path)

Tell the server to forget some watched path.
Note that by default, if a watched path is not set to `permanent=true`, the path will be automatically
unwatched when it has matched once.

### watchRequest(path)

path: (string) the path to watch

### unwatchRequest(path)

Tell the server to forget some watched path.
