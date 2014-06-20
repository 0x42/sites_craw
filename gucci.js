//require('coffee-script')
require('arachnid-shared')


var userName = 'boris'
var password = 'safdfeqwad'
//var siteId = 'www.ilgiocattolo.it'
var siteId = 'www.gucci.com';

app.sync.fiber(function(){
  arachnid = app.remote.connect(userName, password, '54.195.253.228', 5004);
  parser = require('./' + siteId)

// Inspecting url. 
// test url one thing
//  var urlT = 'http://www.ilgiocattolo.it/2/bici-senza-pedali/bici-pedagogica-senza-pedali-carabella-rolly-toys';
//var url = 'http://www.gucci.com/it/home';
var urlProduct = 'http://www.gucci.com/it/styles/354229AIZ1G7011#';
// without variations/size 
var urlProduct1 = 'http://www.gucci.com/it/styles/155148C54AT1060#';
// no variations but with change size
var urlProduct2 = 'http://www.gucci.com/it/styles/232781H90WG2061#';
var urlProduct2_1 = 'http://www.gucci.com/it/styles/352983Z41714379#';
// var = 12 + size
var urlProduct3 = 'http://www.gucci.com/it/styles/114984AA61N1000#';
// "catalog" is empty
var urlProduct4 = "http://www.gucci.com/it/styles/307929AB8001000#";
// catalog
var urlCatalog = 'http://www.gucci.com/it/category/u/watches#look74348lookA113';
var urlCatalog2 = 'http://www.gucci.com/it/category/m/hats___gloves';
// !!!
var urlCatalog3 = 'http://www.gucci.com/it/category/m/men_s_ready_to_wear';
var urlCatalog3_1 = 'http://www.gucci.com/it/looks/5322?extra=84';
var urlCatalog3_2 = 'http://www.gucci.com/it/styles/318144Z75901000';

var result = arachnid.inspectUrl(siteId, urlProduct2_1, parser);
// var uuu =  arachnid.inspectEntranceUrls(siteId, parser);
//var result = arachnid.crawl(siteId, parser);  
  p("urls:")
  p(result[0])
  p("product:")
  p(result[1]) 
  process.exit()
})

// http://alex-craft.com/documents/arachnid
//54.195.253.228/users/boris/sites/
// ====== can't process url 
// http://www.gucci.com/it/styles/208463KGDHG9643 categoria is empty
// http://www.gucci.com/it/styles/337078KJ51W9076

//http://www.gucci.com/it/styles/320834I16001402 
//http://www.gucci.com/it/styles/307929EC2001000 null find
//http://www.gucci.com/it/styles/211137KGDHR9643