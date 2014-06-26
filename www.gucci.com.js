/*jshint node: true, indent:2, loopfunc: true, asi: true, undef:true*/
/*global app: false, jQuery: false, $: false, window: false, _: false, document: false*/
"use strict";
exports.siteId = 'www.gucci.com/it/home'


exports.entranceUrls = function(page){
  var url = 'http://www.gucci.com/it/home';
  page.navigate(url);
  var newUrls = page.evaluate(function(selector) {
      var ans = [];
      var url;
      var menu = $(".shell .mega_menu");
      for(var i = 0; i < (menu.length-1); i++) {
        var links = $(menu[i]).find('a');
        for(var j = 0; j < links.length; j++){
            url = links[j].href;
            ans.push({url:url, code:url});
        }
      }
      return ans;
    });
  return newUrls;
}

exports.parse = function(url, page, saveFile) {
 // p("0x42: parse run");
//  p("0x42: " + url)
  page.navigate(url);
  var newUrls = null;
  var product = null;
  var isCatalog = page.evaluate(function(selector){
    var ans = document.querySelectorAll("#product_card");
    //if(ans == null) return false;
    if(ans.length > 0) return false;
    return true;
  });

   // get selection and read size and available status
  function getSizeAvail(sizeN) {
    // p("get size")
    var ans = [];
    var i = 0;
    for(; i < (sizeN); i++) {
      var size = page.evaluate(function(i) {
        var select = $("#size_dropdown").find("#style_wrapper_dropdown");
        var level = select.find("option");
        $(level[i]).selected();
        $(select[0]).change();
        return $(level[i]).text();
      }, i);
      app.helpers.wait(50);
      var flag = page.evaluate(function(){
        var available = false;
        var txt = $('#container_availability > p').text();
          if(txt !== undefined)
            if(txt.search('disponibile') > -1) available = true;
        return available;
      });
      if(size.indexOf("seleziona") === -1)
        ans.push([size, flag]);
    }
    return ans;
  }

  function getVariation() {
    var variation = page.evaluate(function() {
      var ans = {};
      ans.img = [];
      //image
      var view = $("#view_thumbs_list>li.view");
      for(var vI = 0; vI < view.length; vI++) {
        
        $(view[vI]).click();
        $('.zoom_out').click();
        var viewImgSrc = $('#zoom_in_window img').attr('src');
        ans.img.push(viewImgSrc);   
      }
      
      // var imageTag = $("#zoom_view").find(".zoom_out img");
      
      // if(imageTag.length == 1)
      //   ans.img = imageTag.attr("src");
      // available
      var select = $("#size_dropdown").find("#style_wrapper_dropdown");
      if(select.length > 0 ) {
        var level = $(select[0]).find("option");
        ans.selectSize = level.length;
      }
      // price
      var pr = $('#product_card');
      var prPriceTag = $(pr).find('#price');
      if(prPriceTag.length == 1) {
        var prPrice = $(prPriceTag).text();
        prPrice = prPrice.substring(1, prPrice.length);
        ans.price = window.parseInt(prPrice, 10);
      }
      ans.color = $("#product_card").find("#description li:first").html();
      return ans;
    });
    if(variation.selectSize !== undefined && variation.selectSize > 0) {
      variation.sizes = getSizeAvail(variation.selectSize);
    }
    return variation;
  }

  function setParam(v) {
    if(v.img !== undefined) {
      var buff = [];
      for(var imgI = 0; imgI < v.img.length; imgI++) {
        var flag = false;
        for(var ii = 0; ii < buff.length; ii++) {
          if( buff[ii] == v.img[imgI]) {
            flag = true;
            break;
          }
        }
        if(flag === false) {
          buff.push(v.img[imgI]);
          var save = saveFile(product.id, v.img[imgI]);
          product.images.push({id:save[0], url: save[1], originalUrl: product.url});  
        }
          
      }
    }
    var obj = {};
    if(v.price !== undefined) obj.price = v.price;
    if(v.color !== undefined) obj.color = v.color;
    obj.available = v.available;
    if(v.sizes === undefined) {
      obj.size = "0";
      obj.available = page.evaluate(function() {
        var available = false;
        var txt = $('#container_availability > p').text();
          if(txt !== undefined)
            if(txt.search('disponibile') > -1) available = true;
        return available;
      });

      product.variations.push(obj);
    } else {
      var nSize = v.sizes.length;
      for(var k = 0; k < nSize; k++) {
        var buf = {};
        buf.price = obj.price;
        buf.color = obj.color;
        buf.size = v.sizes[k][0];
        buf.available = v.sizes[k][1];
        product.variations.push(buf);
      }
      // p("-------------------");
      // p("0x42 : PRODUCT -->");
      // p(product);
      // p("-------------------");
    }
  }

  // p("0x42 catalog = " + isCatalog);
  if(isCatalog === false) {
    // nativeNavigate
    product = {};
    var prod = null;
    // get main Url
    prod = page.evaluate(function(selector) {
      var ans = {};
      // is product page
      var pr = $('#product_card');
      if(pr.length > 0) {
        // breadcrumb
        var breadcrumb = $('#content #breadcrumb');
        var links = $(breadcrumb).find('a');

        if(links.length > 1) {
          // first link point at home page
          ans.category = [];
          for(var i = 1; i<links.length; i++) {
            ans.category.push(links[i].text);
          }
          ans.categoryUrl = links[links.length - 1].href;
        }
        // end breadcrumb
        // name
        var namePr = $(pr).find('.container_title h1');
        ans.name = $(namePr).text();
        // description
        ans.description = $(pr).find('#description').text();
                      // price
                      //var prPriceTag = $(pr).find('#price');
                      //if(prPriceTag.length == 1) {
                      //  var prPrice = $(prPriceTag).text();
                      //  prPrice = prPrice.substring(1, prPrice.length);
                      //  ans.price = window.parseInt(prPrice, 10);
                    // }
        // variations
        var vvTagN = $("#column_variations").find("#accord_variations a");
        if(vvTagN.length > 0) {
          var nVarStr = $(vvTagN).text();
          nVarStr = nVarStr.trim();
          // get count of variations and it urls
          var nVarNum = window.parseInt(nVarStr.match(/(\d*)/)[0], 10);
          //var allVar = $("#variations").find(".scrollable_variations li");
          ans.varUrlN = nVarNum;
        }
      }

      return ans;
    });
    if(prod.category === undefined) {
        product.category = ["home"];
        product.categoryUrl = url;
    } else {
      product.category = prod.category;
      product.categoryUrl = prod.categoryUrl;
    }

    product.name = prod.name;
    product.description = prod.description;
    product.url = url;
    product.id = app.helpers.hash(url);
    product.images = [];

    if(prod.varUrlN !== undefined) {
      product.variations = [];
      // p("N variation = " + prod.varUrlN);
      var nVar = Number(prod.varUrlN) + 1;
      var v = getVariation();
      setParam(v);
      for(var i = 1; i < nVar; i++) {
        //var prevUrl = page.url();
        page.evaluate(function(i) {
          var li = $(".scrollable_variations li");
          $(li[i]).click();
        }, i);
        app.helpers.wait(2000);
            //  app.helpers.waitUntil(function(prevUrl) {
            //    return page.url() != prevUrl;
            //   });
        var varThing = getVariation();
            //printVariation(v);
        setParam(varThing);
      }
    } else {
      var varBuf = getVariation();
      // image
      if(varBuf.img !== undefined) {
        var bufImg = [];
        for(var imgI=0; imgI<varBuf.img.length; imgI++) {
          var flag = false;
          for(var bI=0; bI< bufImg.length; bI++) {
            if(bufImg[bI] == varBuf.img[imgI]) { 
              flag = true; break; 
            }
          }
          if(flag === false) {
            bufImg.push(varBuf.img[imgI]);
            var save = saveFile(product.id, varBuf.img[imgI]);
            product.images.push({id:save[0], url: save[1], originalUrl: product.url});  
          }
        }
      }
      if(varBuf.sizes !== undefined) {
        product.variations = [];
        var nSize = varBuf.sizes.length;
        for(var ii = 1; ii < nSize; ii++) {
          var buf = {};
          buf.price = varBuf.price;
          buf.color = varBuf.color;
          buf.size = varBuf.sizes[ii][0];
          buf.available = varBuf.sizes[ii][1];
          product.variations.push(buf);
        }
      } else {
        product.price = varBuf.price;
        // product.color = varBuf.color;
      }
    }// end if(prod.varUrlN ...
    product.brand = 'gucci';
    product.currency = 'EUR';
    product.country = 'IT';
  } else {
    // read  new urls
    var U = {};
    U = page.evaluate(function() {
      var Urls = {};
      Urls.test = [];
      Urls.link = [];
      var ggpanel = document.querySelectorAll(".ggpanel");
      // var ggpanel = $("#content_slider").find(".ggpanel");
      if(ggpanel.length > 0 ) {
        var gg = $(".ggpanel");
        var li = $(gg).find("li");
        for(var j = 0; j < li.length; j++) {
          var img = $(li[j]).find("img");
          if(img.length > 0 ) {
            var txt = $(img[0]).attr("rel");  // in img rel get text
            if(txt !== "") {
              var buf = txt.split("href=");  // parse text get href
              var href = null;
              for(var s in buf) {
                if(buf[s].indexOf("http://") > 0) {
                  href = buf[s]; break;
                }
              }
              if(href !== null) {
                 var url = href.split("\"");
                 if(url.length > 0 && url[1].indexOf("www.gucci.com") > 0)
                   Urls.link.push({url:url[1], code:url[1]});
              }
            }
          }
          if($(li[j]).hasClass("no_quickview")) {
            //Urls.test.push(li[j]);
            var h = $(li[j]).find("a");
            if(h.length > 0) {
              var urlBuf = h[0].href;
              Urls.link.push({url:urlBuf, code:urlBuf});
            }
          }
        }
      } else {
        // http://www.gucci.com/it/looks/5322?extra=84
        var t = document.querySelector(".associated_styles_container");
        var A = t.getElementsByTagName("a");
        for(var i = 0; i < A.length; i++) {
          var hrefBuf = A[i].href;
          Urls.link.push({url:hrefBuf, code:hrefBuf});
        }
      }
      return Urls;
    });
    newUrls = U.link;
  //  p(U.link.length);
  }
  // p("===================");
  // p(product);
  // p("===================");
 // p("0x42 url.length = " + newUrls.length);
  return [newUrls, app.Product.parse(product)];
}
