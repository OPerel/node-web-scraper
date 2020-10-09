import * as fs from 'fs';
import { browser, element, by } from 'protractor';
const cheerio = require('cheerio');

import * as CSV from 'csv-string';

import filterAtaClassData from '../utils/filterTeachers';
import sortByDay from '../utils/sortByDay';

export interface AtaClass {
  code: string,
  name: string,
  professor: string,
  time: string
}

describe('get class info', () => {

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
  });

  it('should go to the site and click the date search button', () => {
    const url = 'https://mtamn.mta.ac.il/yedion/fireflyweb.aspx?prgname=Enter_Search&_ga=2.124056077.64792284.1583424913-1750835995.1583424913';
    browser.get(url);
    element(by.css('span[data-select2-id="7"]')).click();
  });

  it('should select all days and hours', () => {
    element(by.id('select2-R1C5-results')).all(by.tagName('li')).last().click();
    element(by.xpath('/html/body/div[3]/div[3]/div/div/form/div[1]/table/tbody/tr[3]/td[3]/input')).click();
    
    browser.sleep(3000);
  });

  it('should click the num of rows scrolldown and choose all', () => {
    const dropDown = element(by.css('span[data-select2-id="2"]'));
    
    dropDown.click();
    browser.sleep(1000);
    element(by.xpath('/html/body/span[2]/span/span[2]/ul/li[4]')).click();
    browser.sleep(1000);
    expect(dropDown.getText()).toEqual('הכל');
  });

  it('should get data from table', async () => {

    const html = await browser.getPageSource();

    const $ = cheerio.load(html);
    $.prototype.getTableData = () => {
      const rowsObjects: AtaClass[] = [];

      // Iterate over all rows in the table
      $('tbody > tr').each((idx: number, row: any) => {

          // Iterate over columns in row and get each column's text
          const rowVals: string[] = $(row).children('td').map((_: number, cell: any) => $(cell).text());

          // Build class object and push to rows objects array 
          console.log(`row #${idx} created for class: ${rowVals[1]}`);
          
          // add additional time to last row if no code (rowVals[0])
          if (rowVals[0].trim() === '') {
            // make sure the code matches to last row entry
            if (rowsObjects[rowsObjects.length - 1].code === rowVals[1].match(/(\d+)/)[0]) {
              console.log('regexp code: ', rowVals[1].match(/(\d+)/)[0]);
              rowsObjects[rowsObjects.length - 1].time += `, ${rowVals[4].trim()} ${rowVals[5].trim()} ${rowVals[6].trim()}`;
              return;
            }
          }

          rowsObjects.push(ataClassInfo(rowVals));
      });

      return rowsObjects;
    }

    const rows: AtaClass[] = $('body').getTableData();

    // filter classes with no teacher
    const noTeacherClasses = rows.filter(row => !row.professor && row.code);

    // filter teachers
    const filteredClasses = await filterAtaClassData('ata_teachers', rows);
    console.log('Number of classes: ', filteredClasses.length);

    // sort by day
    const sortedClasses = sortByDay(filteredClasses);
    const sortedNoTeacherClasses = sortByDay(noTeacherClasses);
      
    // initialize CSV string with headers row
    let csvString: string = 'קוד, שיעור, מרצה, מועד\n';
    sortedClasses.forEach(c => csvString += CSV.stringify(c));

    // add classes with no teacher to csvString
    csvString += '\n, ,שיעורים ללא מרצה, ,\n';
    sortedNoTeacherClasses.forEach(c => csvString += CSV.stringify(c));
    
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

const ataClassInfo = (classVals: string[]): AtaClass => ({
  code: classVals[0].trim(),
  name: classVals[1].trim(),
  professor: classVals[7].trim(),
  time: `${classVals[4].trim()} ${classVals[5].trim()} ${classVals[6].trim()}`
});