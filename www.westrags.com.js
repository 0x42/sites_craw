 /*jshint node: true, indent:2, loopfunc: true, asi: true, undef:true*/
/*global app: false, jQuery: false, $: false, window: false, _: false, document: false*/
"use strict";
exports.siteId = 'www.gucci.com/it/home'


exports.entranceUrls = function(page){
  var sitemap = 'http://store.dolcegabbana.com/sitemap.asp?tskay=3B552831&site=DGGROUP';
  page.navigate(sitemap);
  var newUrls = page.evaluate(function() {
  	var ans = [];
  	var sm = $("#container").find(".sitemap");
  	var boxed = $(sm).find(".boxed");
  	for(var i = 0; i < 2; i++) {
  		var a = $(boxed[i]).find("a");
  		for(var j = 0; j < a.length; j++) {
  			var href = a[j].href;
  			ans.push({url:href, code:href});
  		}
  	}
  	return ans;
  });
  return newUrls;
}

exports.parse = function(url, page, saveFile) {
  page.navigate(url);
  var newUrls = null;
  var product = null;
  var isCatalog = page.evaluate(function(selector){
    var ans = document.querySelectorAll(".productdetails-view");
    if(ans.length > 0) return false;
    return true;
  });

  if(isCatalog === false) {
  	product = {};
  	product.url = url;
    product.id = app.helpers.hash(url);
    product.currency = 'EUR';
    product.country = 'PL';
    product.name = page.evaluate(function(e){
    	var tag = document.querySelector(".tituloprod");
    	if(tag === null) return "";
    	return tag.textContent;
    });
    product.brand = page.evaluate(function(e) {
    	var tag = document.querySelector(".fornecedor");
    	if(tag === null) return "no brand";
    	return tag.textContent;
    });
    // category
    var categoryAns = page.evaluate(function(){
 		var ans = [];
 		var cat = [];
    	var bread = document.querySelector('.breadcrumbscaminho');
    	var aTag = bread.byTag("a");
    	var lastInd = null;
    	for(var i = 0; i < aTag.length; i++) { 
    		var s = aTag[i].href; 
    		if(s.indexOf("http://www.westrags.com/loja/") > -1) {
    			cat.push(aTag[i].textContent);
    			lastInd = i;
    		} 
    			 
    	}
    	ans.push(cat);
    	ans.push(aTag[lastInd].href);
    	return ans;
    });
    product.category = categoryAns[0];
    product.categoryUrl = categoryAns[1];
    // variations
    var v = page.evaluate(function(s) {
    	// var item = document.querySelector(".addtocart-bar");
    	var item = jQuery(".addtocart-bar");
    	// var c_item = item.getElementById("product_colors");
    	var c_item = jQuery(item).find("#product_colors>div");
    	var color = [];
    	for(var i = 0; i < c_item.length; i++) {
    		color.push(jQuery(c_item[i]).attr("id"));
    	}
    	return color;
    });

    p(v);
    p(v.length);
	
	product.variations = [];
	product.images = [];    
	for(var i = 0; i < v.length; i++) {
		var imgSrc;
		if(v.length == 1) {
			imgSrc = page.evaluate(function(tag) {
	    		var src = null;
    	  		var n = jQuery('#product_colors>div');
	    	    jQuery(n[tag]).click();
    	  		var img = jQuery(".imagemesquerda>a");
    	  		if(img.length > 0) {
    	  			src = img[0].href;
    	  		}
	    	  return src;
	    	}, i);
		} else {
			imgSrc = page.evaluate(function(tag) {
	    	  var src = null;
	    	  var n = jQuery('#product_colors>div');
	    	  jQuery(n[tag]).click();
	    	  if(jQuery(n[tag]).hasClass("with_image")) {
	    	  	var img = jQuery(".imagemesquerda>a");
	    	  	if(img.length > 0) {
	    	  		src = img[0].href;
	    	  	}
	    	  }
	    	  return src;
	    	}, i);	
		}
    	
    	p(imgSrc);

    	if(imgSrc !== null) {
    		var save = saveFile(product.id, imgSrc);
        	product.images.push({id:save[0], url: save[1], originalUrl: product.url});
    	}
    	var items = page.evaluate(function(e) {
    		var ans = {};
    		// color
    		var c = jQuery("#product_colors_name>span").text();
    		// price
    		var  p = jQuery("span.PricebasePriceWithTax");
    		var pTxt = null;
    		var psTxt = null;
    		if( p.length > 0 ) {
    			pTxt = jQuery("span.PricebasePriceWithTax").text();
    			psTxt = jQuery("span.PricesalesPrice").text();
    		} else {
    			pTxt = jQuery("span.PricesalesPrice").text();
    		}
    		if(pTxt !== null) {
    			var buf = pTxt.split(" ");
    			var b = buf[1].split(",");
    			ans.price = window.parseFloat(b[0]+"."+b[1]);
    		}
    		if(psTxt !== null) {
    			var buf = psTxt.split(" ");
    			var b = buf[1].split(",");
    			ans.sellPrice = window.parseFloat(b[0]+"."+b[1]);	
    		}
    		// size
    		var sArr = jQuery("#product_size>div:visible");
    		var s = [];
    		for(var sI = 0; sI < sArr.length; sI++) {
    			s.push(jQuery(sArr[sI]).text());
    		}
    		ans.color = c;
    		// ans.push(p);
    		ans.size = s;
    		return ans;
    	});
    	for(var it=0; it < items.size.length; it++) {
    		var buf = {}; 
    		buf.size = items.size[it];
    		buf.color = items.color; 
    		buf.price = items.price;
    		buf.available = true;
    		if(items.sellPrice !== undefined)
    			buf.sellPrice = items.sellPrice;
    		product.variations.push(buf);	
    	} 
    }
    // description
    product.description = page.evaluate(function(e){
    	return jQuery("#descricao").text();
    });

  } else {
  	var urls = page.evaluate(function(e) { 
  		var menu = jQuery("#loja5_menu").find(".subTop");
	  	var links = [];
	  	for(var i = 1; i < (menu.length - 2); i++) {
	  		var arr = jQuery(menu[i]).find("a:not(.vertodas)");
	  		for(var ii = 1; ii < arr.length; ii++) {
	  			links.push(arr[ii].href);
	  		}
	  	}
	  	return links;
  	});
  	p("======= URLS =======");
  	p(urls);
  }
  // p(product);
  // p("======= finish =======");
  return [newUrls, app.Product.parse(product)];
}