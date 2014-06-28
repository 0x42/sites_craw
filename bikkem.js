require('arachnid-shared')

// http://alex-craft.com/documents/arachnid
//54.195.253.228/users/boris/sites/
var userName = 'boris'
var password = 'safdfeqwad'
var siteId = 'www.store.bikkembergs.com';

app.sync.fiber(function(){
  arachnid = app.remote.connect(userName, password, '54.195.253.228', 5004);
  parser = require('./' + siteId)
// Inspecting url. 
var urlProduct = 'http://store.bikkembergs.com/ru/%D0%BA%D1%83%D1%80%D1%82%D0%BA%D0%B0_cod34390454bw.html';
// test
var urlCat = "www.store.bikkembergs.com";
// 
var result = arachnid.inspectUrl(siteId, urlCat, parser);
 // var uuu =  arachnid.inspectEntranceUrls(siteId, parser);
 // p(uuu);
// var result = arachnid.crawl(siteId, parser);
   p("urls:");
   p(result[0]);
   p("product:");
   p(result[1]); 
   process.exit();
});