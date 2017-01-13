var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var fetcher = require('../workers/htmlfetcher');
// require more modules/folders here!
var header = {};

var handleGetFile = function(filePath, req, res) {
  //utf8 is character type
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
      // invalidUrl = true;
      console.log('error', err);
    } else {
      // console.log(data);
      res.end(data);
    }
  });
};

exports.handleRequest = function (req, res) {
  // var invalidUrl = false;
  console.log('Processing ' + req.method + ' request: ' + req.url);
  if (req.method === 'GET') {
    // console.log('requrl', req.url);
    header['Content-Type'] = 'text/html';
    res.writeHead(200, header);
    var archivedFile = archive.paths.archivedSites + '/' + req.url;
    if (req.url === '/') {
      handleGetFile(__dirname + '/public/index.html', req, res);
    } else if (req.url === '/styles.css' || req.url === '/loading.html') {
      handleGetFile(__dirname + '/public' + req.url, req, res);
    } else {
      fs.stat(archivedFile, function(err, stats) {
        if (err) {
          res.writeHead(404),
          res.end();
        } else {
          handleGetFile(archivedFile, req, res);
        }
      });
    }
  } else if (req.method === 'POST') {
    // Check to see if that websites exists in archives/sites
      // if yes, redirect to webpage
      // else, send them to loading page
    var dataCollection = '';
    res.writeHead(302);
    req.on('data', function(chunk) {
      dataCollection += chunk;
    }).on('end', function() {
      dataCollection = dataCollection.slice(4);
      archive.isUrlArchived(dataCollection, function(err, stats) {
        if (stats) {
          handleGetFile(archive.paths.archivedSites + '/' + dataCollection, req, res);
        } else {
          handleGetFile(archive.paths.siteAssets + '/loading.html', req, res);
          archive.isUrlInList(dataCollection, function (err, data) {
            if (!data) {
              archive.addUrlToList(dataCollection, function(err) {
                console.log('adding url to file!');
                fetcher();
                console.log('fetching');
              });
            }
          });
        }
      });
    });

    // updates the sites index
    // var dataCollection = '';
    // res.writeHead(302);
    // req.on('data', function(chunk) {
    //   dataCollection += chunk;
    // }).on('end', function() {
    //   dataCollection = dataCollection.slice(4) + '\n';
    //   fs.writeFile(archive.paths.list, dataCollection, function(err, data) {
    //     if (err) {
    //       console.log('error', err);
    //     } else {
    //       res.end();
    //     }
    //   });
    // });
  }
};