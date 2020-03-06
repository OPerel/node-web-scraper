const fs = require('fs');
const cheerio = require('cheerio');

const classInfoObject = require('./classInfo').classInfoObject;

describe('get class info', () => {

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
  });

  it('should go to the site and click the date search button', () => {
    const url = 'https://mtamn.mta.ac.il/yedion/fireflyweb.aspx?prgname=Enter_Search&_ga=2.124056077.64792284.1583424913-1750835995.1583424913';
    browser.get(url);
    element(by.css('input[value="בצע חיפוש במערכת התאריכית"]')).click();
    browser.sleep(4000);
  });

  it('should click the num of rows scrolldown and choose all', () => {
    const scrollDown = element(by.css('.select2-selection__rendered'));
    
    scrollDown.click();
    browser.sleep(1000);
    element(by.xpath('/html/body/span[2]/span/span[2]/ul/li[4]')).click();
    browser.sleep(1000);
    expect(scrollDown.getText()).toEqual('הכל');
  });

  it('should get data from table', async () => {

    const html = await browser.getPageSource();

    const $ = cheerio.load(html);
    $.prototype.getTableData = () => {
      const rowsObjects = [];

      // Iterate over all rows in the table
      $('tbody > tr').each((idx, row) => {
        const rowType = $(row).children('td').last().text();

        // Skip non class events
        if (rowType.trim() === 'קורס') {

          // Iterate over columns in row
          const rowVals = $(row).children('td').map((_, cell) => {

            // Get each column's value and return to row's values array
            return $(cell).text(); 
          });

          // Build class object and push to rows objects array 
          console.log(`row #${idx} created for class: ${rowVals[6]} type: ${rowVals[10]}`)
          rowsObjects.push(classInfoObject(idx, rowVals));
        }
      });
      
      // Write to Json file
      const objArrString = JSON.stringify(rowsObjects);
      fs.writeFile('./dist/jsonData.json', objArrString, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log('Successfully wrote file')
        }
      });
    };

    $('body').getTableData();

    // Write to file
    // const csv = new ObjectsToCsv(allRowsVals);
    // csv.toDisk('../dist/test.csv').then(() => console.log('file created'));
  });
});