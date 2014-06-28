 /*jshint node: true, indent:2, loopfunc: true, asi: true, undef:true*/
/*global app: false, jQuery: false, $: false, window: false, _: false, document: false*/
"use strict";
exports.siteId = 'http://www.westrags.com/'

exports.entranceUrls = function(page){
  var url = 'http://www.westrags.com/en/';
  return [{url: url, code: url}];
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
	product.variations = [];
	product.images = [];
  var addImg = page.evaluate(function(){
    var ans = null;
    var allImg = jQuery(".additional-images>a");  
    if(allImg !== undefined && allImg.length > 0 ) {
      ans = [];
      for(var i = 0; i < allImg.length; i++) {
        ans.push(allImg[i].href);
      }
    }  
    return ans;
  });
  if(addImg === null) {
    addImg = page.evaluate(function(){
      var ans = [];
      var img = jQuery(".imagemesquerda>a");
      if(img.length > 0) {
        ans.push(img[0].href);
      }
      return ans;
    });
  }
  
  if(addImg.length > 0) {
    for(var i = 0; i < addImg.length; i++) {
      var save = saveFile(product.id, addImg[i]);
      product.images.push({id:save[0], url: save[1], originalUrl: product.url});  
    }
  }  

	for(var i = 0; i < v.length; i++) {
		page.evaluate(function(tag) {
    	  var n = jQuery('#product_colors>div');
    	  jQuery(n[tag]).click();
  	}, i);	

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
  			var buf2 = psTxt.split(" ");
  			var b2 = buf2[1].split(",");
  			ans.sellPrice = window.parseFloat(b2[0]+"."+b2[1]);	
  		}
  		// size
  		var sArr = jQuery("#product_size>div:visible");
  		var s = [];
  		for(var sI = 0; sI < sArr.length; sI++) {
  			s.push(jQuery(sArr[sI]).text());
  		}
      if(c === "") c = "no color";
  		ans.color = c;
  		// ans.push(p);
  		ans.size = s;
  		return ans;
  	});
  	for(var it=0; it < items.size.length; it++) {
  		var buf = {}; 
  		buf.size = items.size[it];
      if(buf.size === '') buf.size = '0';
  		buf.color = items.color; 
  		buf.price = items.price;
      if(buf.size === '0') buf.available = false; 
  		else buf.available = true;
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
    // check start page or product catalog
    var startPage = page.evaluate(function(e) {
      var d = jQuery("#loja5_mainbody>div.row");
      if(d.length === 0) return true;
      else return false;
    });
    var urls = null;
    if(startPage) {
      // read menu urls
      urls = page.evaluate(function(e) { 
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
    } else {
      // scroll page
      var endPage = false;
      var nScroll = 0;
      while(endPage === false) {
        app.helpers.wait(300);
        endPage = page.evaluate(function(e) {
          var pos = jQuery("#loja5_baixo").offset().top;
          jQuery(document).scrollTop(pos);
          var end = jQuery(".mensage_products");
          if(end.length === 0) return false;
          else return true;
        });
        if(nScroll === 100) break; // long long page -> throw excep timeout
        nScroll++;  
      }
      // read all urls to datails off products
      urls = page.evaluate(function(e) {
        var d = jQuery("#loja5_mainbody>div.row");
        var ans = [];
        for(var dI = 0; dI < d.length; dI++) {
          var durls = jQuery(d[dI]).find(".sku>a");
          if(durls.length > 0) {
            for(var durlsI = 0; durlsI < durls.length; durlsI++) {
              ans.push(durls[durlsI].href);
            }
          }
        }
        return ans;
      });
    }
  	// p("======= URLS =======");

    if(urls.length > 0 ) newUrls = [];
    for(var j = 0; j < urls.length; j++) {
        if(urls[j].indexOf("www.westrags.com") > -1)
          newUrls.push({url:urls[j], code:urls[j]});
    }
  }
  // p(product);
  // p("======= finish =======");
  return [newUrls, app.Product.parse(product)];
}