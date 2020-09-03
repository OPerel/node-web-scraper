import * as fs from 'fs';
import { browser, element, by } from 'protractor';
const cheerio = require('cheerio');
// import cheerio from 'cheerio';
import * as CSV from 'csv-string';

import filterHitClassData from '../utils/filterTeachers';

export interface HitClass {
  name: string;
  professor: string;
  time: string;
}

describe('get HIT class info', () => {

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
  });

  it('should go to url', () => {
    const url = 'https://webrashim.hit.ac.il/Michlol3/Utils/SearchCourses/SearchCourses.aspx';
    browser.get(url);
    browser.sleep(1000);
  });

  it('should look only for semester A', () => {
    expect(element(by.className('Table_Title')).getText()).toBe('חפש שיעורים לפי הקריטריונים הבאים...')

    element(by.id('ctl00_idMasterContentPlaceHolder_idSmsB')).click();
    element(by.id('ctl00_idMasterContentPlaceHolder_idSmsK')).click();
    element(by.id('ctl00_idMasterContentPlaceHolder_idSmsS')).click();
    element(by.id('ctl00_idMasterContentPlaceHolder_idFind')).click();

    browser.sleep(3000);
  });

  it('should get html table', async () => {
    const html = await browser.getPageSource();
    // console.log('html: ', html)

    const $ = cheerio.load(html);
    const getTableData = (): HitClass[] => {
      const rowsObjects: HitClass[] = [];

      // Iterate over all rows in the table
      $('#ctl00_idMasterContentPlaceHolder_idResult_GridData > table > tbody > tr').each((idx, row) => {

        // Iterate over columns in row and get each column's text
        const rowVals: string[] = $(row).children('td').map((_: number, cell: any) => $(cell).text());

        // Build class object and push to rows objects array 
        // console.log(`row #${idx} created for class: ${rowVals[1]}`);
        rowsObjects.push(hitClassInfo(rowVals));
      });

      return rowsObjects;
    }

    const rows = getTableData();

    // filter teachers
    const filteredClasses = await filterHitClassData('hit_teachers', rows);

    // sort by day
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];
    const sortedClasses = filteredClasses.sort((a, b) => days.indexOf(a.time[0]) - days.indexOf(b.time[0]));

    // initialize CSV string with headers row
    let csvString: string = 'שיעור, מרצה, מועד\n';

    sortedClasses.forEach(c => csvString += CSV.stringify(c));
    

    // Write to CSV file with csvString
    fs.writeFile(`../dist/HIT/${new Date().getTime()}.csv`, csvString, (err: Error) => {
      if (err) {
        console.log('Error writing file', err)
      } else {
        console.log('Successfully wrote file')
      }
    });
  })
})


const hitClassInfo = (classVals: string[]): HitClass => ({
  name: classVals[1],
  professor: classVals[2],
  time: classVals[7]
});