import * as fs from 'fs';
import { browser, element, by } from 'protractor';
const cheerio = require('cheerio');

import { classInfoObject } from './classInfo';
import { filterClassData } from './filterTeachers';
import { buildDayObjAndReturnCsvString } from './formatData';
import { RawClass } from '../types';

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
      const rowsObjects: RawClass[] = [];

      // Iterate over all rows in the table
      $('tbody > tr').each((idx: number, row: any) => {
        
        // Skip non class events
        const rowType: string = $(row).children('td').last().text();
        if (rowType.trim() === 'קורס') {

          // Iterate over columns in row and get each column's text
          const rowVals: string[] = $(row).children('td').map((_: number, cell: any) => $(cell).text());

          // Build class object and push to rows objects array 
          console.log(`row #${idx} created for class: ${rowVals[6]}`);
          rowsObjects.push(classInfoObject(rowVals));
        }
      });

      return rowsObjects;
    }

    const d: RawClass[] = $('body').getTableData();

    // Call filterTeachers.ts with rowsObjects
    const filteredData: RawClass[] = await filterClassData(d);
    console.log('Number of classes: ', filteredData.length);


    // Call formatData.ts with answer from filterTeachers.ts
    const csvString: string = buildDayObjAndReturnCsvString(filteredData);
      

    // Write to CSV file with answer from formatData.ts
    fs.writeFile(`../dist/AcTA/${new Date().getTime()}.csv`, csvString, (err: Error) => {
      if (err) {
        console.log('Error writing file', err)
      } else {
        console.log('Successfully wrote file')
      }
    });
  });
});