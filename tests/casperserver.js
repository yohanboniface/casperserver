var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
require('../casperserver.js').create(casper, {port: 8007, responsesDir: './responses/'});

/*
 * Utils
 */

casper.sendGET = function (path) {
    // Need a callback
    this.evaluate(function(path) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);

        xhr.onload = function(e) {
            content = this.response;
            document.title = content;
            return content;
        };
        xhr.send();
    }, {path: path});
};

casper.sendPOST = function (path, data) {
    this.evaluate(function(path, data) {
        __utils__.sendAJAX(path, 'POST', data, true);
    }, {path: path, data: data});
};

casper.server.watchPath('^(/js/|/css/|/scripts/)', {
    filePath: function (request) {
        return '.' + request.url;
    },
    permanent: true
});

casper.server.start();

casper.start('http://localhost:8007', function (){
    this.test.assertTitle('Title from index.html', 'index.html is loaded and title is correct');
});

casper.then(function () {
    var actual = this.evaluate(function(){
        return window.this_is_a_dummy_function();
    });
    this.test.assertEquals(actual, "ok", "scripts/test.js has been loaded");
});

/*
 *  Define content from a string
 */

casper.then(function () {
    var path = '/123456/';
    this.server.watchPath(path, {content: "okok"});
    this.sendGET(path);
});

casper.then(function () {
    this.test.assertTitle("okok", "We can define a content response from a string.");
});

/*
 *  Define content from a function
 */

casper.then(function () {
    var path = '/azerty/';
    this.server.watchPath(path, {content: function (request) {return "Requested: " + request.url;}});
    this.sendGET(path);
});

casper.then(function () {
    this.test.assertTitle("Requested: /azerty/", "We can define a response content from a function.");
});

/*
 *  Define a filePath
 */

casper.then(function () {
    var path = '/a-simple-path/';
    this.server.watchPath(path, {filePath: "simple_response.txt"});
    this.sendGET(path);
});

casper.then(function () {
    this.test.assertTitle("Content from file simple_response.txt", "We can use a simple filePath to serve the response.");
});

/*
 *  Define a filePath from a function
 */

casper.then(function () {
    var path = '/another-path/';
    this.server.watchPath(path, {filePath: function (request) { return "simple_response.txt";}});
    this.sendGET(path);
});

casper.then(function () {
    this.test.assertTitle("Content from file simple_response.txt", "We can use a function to define the filePath to use as content.");
});

/*
 *  Use a regex to catch path
 */

casper.then(function () {
    this.server.watchPath('^/path/', {content: function (request) { return "path: " + request.url;}});
    this.server.watchPath('^/folder/', {content: function (request) { return "folder: " + request.url;}});
    this.sendGET("/path/22/");
});

casper.then(function () {
    this.test.assertTitle("path: /path/22/", "We can use a regex to catch paths.");
});

/*
 * Listen a request
 */

casper.then(function () {
    path = "/123/";
    this.server.watchPath(path, {content: "ok"});
    this.server.watchRequest(path);
    this.sendPOST(path, {myfield: "myvalue"});
});

casper.then(function () {
    var request = this.server.getWatchedRequest(path);
    this.test.assertTruthy(request, "Request has been catched");
    this.test.assertEqual(request.method, 'POST', 'POST received');
    this.test.assertEqual(request.post.myfield, "myvalue", 'POST myfield value is correct');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});