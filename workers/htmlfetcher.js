// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.

var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var https = require('https');

module.exports = function() {
  archive.readListOfUrls(function(err, urls) {
    if (urls !== ['']) {
      archive.downloadUrls(urls, function() {
        https.get('https://' + urls[0], function(res) {
          var data = '';
          res.on('data', function(chunk) {
            data += chunk;
          }).on('end', function() {
            fs.writeFile(archive.paths.archivedSites + '/' + urls, data);
          });
        });
        fs.writeFile(archive.paths.list, '', 'utf8');
      });
    }
  });
};