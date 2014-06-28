 /*jshint node: true, indent:2, loopfunc: true, asi: true, undef:true*/
/*global app: false, jQuery: false, $: false, window: false, _: false, document: false*/
"use strict";
exports.siteId = 'http://www.store.bikkembergs.com/'


exports.entranceUrls = function(page){
  var url = 'http://store.bikkembergs.com/';
  page.navigate(url);
  var a = page.evaluate(function() {
  	var a = jQuery("#sexSelection li:not(.fashionShow)").find("a");
  	var arr = [];
  	for(var i = 0; i < a.length; i++) {
  		arr.push(a[i].href);
  	}
  	return arr;
  });
  var ans = [];
  for(var i = 0; i < a.length; i++) {
  	ans.push({url: a[i], code: a[i]});
  }
  return ans;
}

exports.parse = function(url, page, saveFile) {
  page.navigate(url);
  var newUrls = null;
  var product = null;
   var isCatalog = page.evaluate(function(selector){
    var ans = jQuery("#container").find("#content");
    if(ans.length > 0) return false;
    return true;
  });
  if(isCatalog === false) {
  	product = {};
  	product.url = url;
  	product.id = app.helpers.hash(url);
    product.currency = 'EUR';
    product.country = 'EUROPA';
    product.name = page.evaluate(function(e) {
    	var name = jQuery("#container").find(".itemTitle").text();
    	return name;
    });
    product.brand = "dirk bikkembergs";
    product.variations = [];
    // return  color size price sellPrice available
    var items = page.evaluate(function(e) {
      function parsePrice(value) {
      	var pr = value.match(/(\d*)\.?(\d*)\,(\d*)/);
        var a = pr[0].split(".");        //if price = "1.123,09"
        var price = "";
        for(i = 0; i < a.length; i++) { price += a[i]; } 
        return window.parseFloat(price, 10);
      }

      var ans = {};
      ans.sizes = [];
      var color = jQuery(".colorBoxSelected").attr("title");
      if(color === undefined) {
      	color = "no color";
      	ans.sizes.push("0");
      	ans.available = false;
      } else {
      	var sizes = jQuery("#sizesContainer>li");
        if(sizes.length > 0) {
      	  for(var i = 0; i < sizes.length; i++) {
      		ans.sizes.push(jQuery(sizes[i]).text());
      	  } 
      	}
      	ans.available = true;	
      }
      var oldprice = jQuery(".itemBoxPrice").find(".oldprice");
      var newprice = jQuery(".itemBoxPrice").find(".newprice");
      newprice = jQuery(newprice[0]).text();
      oldprice = jQuery(oldprice[0]).text();
      ans.sellPrice = parsePrice(newprice);
      ans.price = parsePrice(oldprice);
      ans.color = color;
      return ans;
    });
 	for(var i = 0; i < items.sizes.length; i++) {
 		var v = {};
 		v.color = items.color;
 		v.price = items.price;
 		v.sellPrice = items.sellPrice;
 		v.size = items.sizes[i];
 		v.available = items.available;
 		product.variations.push(v);
 	}
 	product.description = page.evaluate(function(e) {
 		var ans;
 		ans = jQuery("#editorialDescription").text();
 		ans += "\n";
 		ans += p = jQuery("#descr_container").text();
 		return ans;
 	});
 	product.properties = page.evaluate(function(e) {
 		var ans = jQuery(".itemComposition").text();
 		return ans;
 	});

  } else {
  	newUrls = [];
  	var navBar = page.evaluate(function(e) {
  	  var ahref = jQuery("#mainmenu li.firstLevelItem").find("a");
  	  var ans = [];
  	  for(var i = 0; i < ahref.length; i++ ) {
  		ans.push(ahref[i].href);
  	  }
  	  return ans;
  	});
  	for(var i = 0; i < navBar.length; i++) {
      newUrls.push({url:navBar[i], code:navBar[i]});
  	}
  } 
    // p(product);
  // p("======= finish =======");
  return [newUrls, product];
  // return [newUrls, app.Product.parse(product)];
}