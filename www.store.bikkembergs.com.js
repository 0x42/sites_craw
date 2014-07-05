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
	function isDown(param) {
  	  var isHref = page.evaluate(function(i) {
      	var r = jQuery("#elementsContainer div.row");
      	var atag = jQuery(r[i]).find("a");
		if(atag[0].href === "") return false;
		else return true;      	
      }, param);
      return isHref;	
  }
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
    product.country = 'IT';
    product.name = page.evaluate(function(e) {
    	var name = jQuery("#container").find(".itemTitle").text();
    	return name;
    });
    product.category = page.evaluate(function(){
    	var ans = [];
    	var atag = jQuery("#sexSelection").find("div.selected").find("a");
    	ans.push(jQuery(atag[0]).text());
    	return ans;
    });
    product.categoryUrl = page.evaluate(function() {
    	var atag = jQuery("#sexSelection").find("div.selected").find("a");
    	return atag[0].href;
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
      if(oldprice.length > 0 && newprice.length > 0) {
		newprice = jQuery(newprice[0]).text();
        oldprice = jQuery(oldprice[0]).text();
        ans.sellPrice = parsePrice(newprice);
        ans.price = parsePrice(oldprice);      	
      } else {
      	var price = jQuery(".itemBoxPrice").find(".priceValue").text();
      	ans.price = parsePrice(price);
      }

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
   		ans += jQuery("#descr_container").text();
   		return ans;
   	});

   	product.properties = page.evaluate(function(e) {
   	  var ans = [];
   	  var prop = jQuery(".itemComposition").text();
   	  ans.push(prop);
   	  return ans;
   	});

   	//image 
   	var nImg = page.evaluate(function(){
   		jQuery("#zoomDesc").click();
   		var n = jQuery("#viewContainerForZoom>div.thumbElement");
   		return n.length;
   	});
   	app.helpers.wait(100);
   	var arrImg = [];
   	for(var i = 0; i < nImg; i++) {
   		page.evaluate(function(val) {
   			var n = jQuery("#viewContainerForZoom>div.thumbElement");
   			jQuery(n[val]).click();
   		}, i);
   		app.helpers.wait(100);
   		var imgSrc = page.evaluate(function() {
   			var src = jQuery("#theZoomedImage").attr("src"); 			
   			return src;
   		});
   		arrImg.push(imgSrc);	
   	}
 	  product.images = [];
  	for(var i = 0; i < arrImg.length; i++) {
  		var save = saveFile(product.id, arrImg[i]);
        product.images.push({id:save[0], url: save[1], originalUrl: product.url});
  	}
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
  	// scroll page
    // p('test scroll -->')
    var d1, d0 = new Date();
  	
    var row = page.evaluate(function(e) {
  	  var r = jQuery("#elementsContainer div.row");
  	  return r.length;
  	});
  	for(var i = 0; i < row; i++) {
  	  page.evaluate(function(i) {
  	  	var r = jQuery("#elementsContainer div.row");
  	  	var pos = jQuery(r[i]).offset().top;
  	  	jQuery(document).scrollTop(pos);
  	  }, i);
  	  var maxWait = 10;
  	  while(maxWait > 0) {
  	  	if(isDown(i) === true) break;
  	  	app.helpers.wait(20);
  	  	// p(".");	
  	  	maxWait--;
  	  }
  	  if(isDown(i) === true) {
  	  	var linkProd = page.evaluate(function(e) {
  	    	var row = jQuery("#elementsContainer div.row")
  	    	var link = jQuery(row[e]).find("a");
  	    	var ans = [];
  	    	for(var i = 0; i < link.length; i++ ) {
  				ans.push(link[i].href);
  	  		}
  	  		return ans;
  		  }, i);	
    		for(var j = 0; j < linkProd.length; j++) {
    		  newUrls.push({url:linkProd[j], code: linkProd[j]});
    		}	
  	  }
  	}
    // d1 = new Date();
    // p("test time = ");
    // p(d1-d0); 
  } 
  // p("======= finish =======");
  // return [newUrls, product];
  return [newUrls, app.Product.parse(product)];
}