const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('lodash');
const request = require('request');

const baseUrl = 'https://www.austinhomebrew.com/';
const beerArray = [];
const mainUrl = `${baseUrl}Mini-Mash-IPA-Kits_c_220-1-2.html`;
const resultsFileName = './results/beerResults.json';
const lagerText = {
  leadingText: 'Scraping Beer #',
  beerCount: 1,
  beerName: '',
  beerEmoji: '',
};

function writeFile(file, data) {
  fs.writeFileSync(file, data);
}

request(mainUrl, (error, response, html) => {
  console.log(`🚀  Starting Quick Scrape of
${mainUrl}`);

  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    const products = $('.product-item .img a');

    products.each(function (i, element) {
      const productPage = $(this).attr('href');
      const productUrl = baseUrl + productPage;

      request(productUrl, (error, response, html) => {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          const productName = $('.page_headers').text();
          const abvRegex = /Approximately [\s\S]*ABV/g;
          const productText = $('.item').text();
          const productAbvText = abvRegex.exec(productText);
          const productAbvTextKeep = productAbvText[0].replace(/Approximately|%|ABV/g, '').trim();
          const productPriceEl = $('.yourprice.price');
          const productPrice = productPriceEl.text().replace('Your Price:', '');
          const priceAbv = Number(productPrice.replace('$', '')) / Number(productAbvTextKeep);
          const productInfo = {
            productName,
            productAbvText: productAbvTextKeep,
            productPrice,
            priceAbv,
            productUrl,
          };

          console.log(`${lagerText.leadingText}${lagerText.beerCount++}: ${productName}
${lagerText.beerEmoji += '🍺 '}
`);

          beerArray.push(productInfo);

          if (lagerText.beerCount === products.length + 1) {
            console.log(`🍻  Cheers, We Found: ${products.length} Beers!
Saving file: ${resultsFileName}`);

            const sorted = _.orderBy(beerArray, ['priceAbv'], ['asc']);

            fs.writeFileSync(resultsFileName, JSON.stringify(sorted, null, 2));

            console.log(`
Finished Quick Scrape of
${mainUrl}`);
          }
        }
      });
    });
  }
});
