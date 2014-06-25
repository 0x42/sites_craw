require('arachnid-shared')

// http://alex-craft.com/documents/arachnid
//54.195.253.228/users/boris/sites/
var userName = 'boris'
var password = 'safdfeqwad'
var siteId = 'www.westrags.com';

app.sync.fiber(function(){
  arachnid = app.remote.connect(userName, password, '54.195.253.228', 5004);
  parser = require('./' + siteId)
// Inspecting url. 
var urlProduct = 'http://www.westrags.com/en/loja/homem/8-textil/33-malhas/189187-malha-suki-calvin-k-detail.html';
var urlProduct2 = 'http://www.westrags.com/en/loja/homem/8-textil/1067-tee-slim/211981-boombap-faith-tee-slim-r-neck-detail.html';
// 1 size 1 color + description
var urlProduct3 = "http://www.westrags.com/en/loja/acessorios/208177-seiko-velatura-spc075p1-detail.html";
//sell price
var urlProduct4 = 'http://www.westrags.com/en/loja/homem/36-calcado/62-botas-e-botins/65170-botin--eylets-pepe-jeans-london-detail.html';
var urlProduct5 = 'http://www.westrags.com/pt/loja/mulher/10-textil/21-t-shirts/191665-boombap-lookback-tee-boat--women-detail.html';
var urlProduct6 = 'http://www.westrags.com/en/loja/25178-camisola-selected-detail.html';
// test
var urlCat = "http://www.westrags.com/en/";
var urlCat2 = "http://www.westrags.com/en/loja/mulher";
var urlCat3 = 'http://www.westrags.com/pt/loja/acessorios/1105-relogios';
// var result = arachnid.inspectUrl(siteId, urlProduct6, parser);
// var uuu =  arachnid.inspectEntranceUrls(siteId, parser);
var result = arachnid.crawl(siteId, parser);
   // p("urls:");
   // p(result[0]);
   // p("product:");
   // p(result[1]); 
   // process.exit();
});