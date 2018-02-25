var cheerio = require('cheerio');
var request = require('request');

var baseUrl = 'https://www.austinhomebrew.com/';
var beerArray = [];
var mainUrl = baseUrl + 'Mini-Mash-IPA-Kits_c_220-1-2.html';

request(mainUrl, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var products = $('.product-item .img a');
    products.each(function(i, element){
      var productPage = $(this).attr('href');
      var productUrl = baseUrl + productPage;

      request(productUrl, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          var productName = $('.page_headers').text();
          var abvRegex = /Approximately [\s\S]*ABV/g;
          var productText = $('.item').text();
          var productAbvText = abvRegex.exec(productText);

          var productInfo = {
            productName: productName,
            productAbvText: productAbvText[0],
            productUrl: productUrl
          }
          console.log(productInfo);
          beerArray.push(productInfo);
        }
      });
    });
  }
});
