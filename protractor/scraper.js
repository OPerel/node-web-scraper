const classInfoObject = require('./classInfo').classInfoObject;
const ObjectsToCsv = require('objects-to-csv');

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

    // Array of all rows in data table
    const allRows = element(by.css('tbody')).all(by.css('tr'));
    const allRowsVals = [];

    // Iterate over all rows
    await allRows.each(async (row, index) => {
      const rowCells = row.all(by.css('td'));
      const rowType = await rowCells.last().getText();

      // Filter non class events
      if (rowType.trim() === 'קורס') {

        // Iterate over columns in row
        const rowVals = await rowCells.map(async (td) => {

          // Get each column's value and return to row's values array
          const value = await td.getText();
          return value.trim();
        });

        // Build class object and push to rows objects array 
        console.log(`row #${index} created for class: ${rowVals[6]} type: ${rowVals[10]}`)
        allRowsVals.push(classInfoObject(index, rowVals));
      }
    });

    // Write to file
    const csv = new ObjectsToCsv(allRowsVals);
    csv.toDisk('../dist/test.csv').then(() => console.log('file created'));
  });
});