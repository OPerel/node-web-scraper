import * as fs from 'fs';
import { browser, element, by, ElementFinder } from 'protractor';
import cheerio from 'cheerio';
import * as CSV from 'csv-string';

import filterHitClassData from '../utils/filterTeachers';
import SortByDay from '../utils/sortByDay';

interface HadasaClass {
  name: string,
  professor: string,
  time: string
}

describe('get Hadasa class info', () => {

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
  });

  it('should go to start point URL and see headline', () => {
    const url = `https://www.hac.ac.il/%D7%9C%D7%9C%D7%9E%D7%95%D7%93-%D7%90%D7%A6%D7%9C%D7%A0%D7%95/%D7%A7%D7%95%D7%A8%D7%A1%D7%99-%D7%94%D7%9C%D7%99%D7%9E%D7%95%D7%93/%D7%9B%D7%9C-%D7%94%D7%A7%D7%95%D7%A8%D7%A1%D7%99%D7%9D/`;
    browser.get(url);
    expect(element(by.css('h1.title_study_list_h1')).getText()).toBe('רשימת הקורסים')
  });

  it('should iterate until the last page', async () => {
    let nextPage: ElementFinder;
    try {
        nextPage = element(by.css('a[title="Go to next page"]')) || null;
      } catch (err) {
        console.log('Last page: ', err)
      }
    
    // expect(nextPage.getText()).toBe('>');

    let allClasses: HadasaClass[] = [];

    while (nextPage) {
      const html = await browser.getPageSource();
      const $ = cheerio.load(html);
        
      $('.list_items_all > li').each((idx, item) => {
        const name = $(item).find('h3').text().trim();
        // console.log('name: ', name);

        const professor = $(item).find('a').text().trim();
        // console.log('professor: ', professor);

        const rawTime = $(item).find('.list_td_study').last().children('div').eq(1).text().trim().split('\n');
        const time = rawTime[rawTime.length - 1].trim();
        // console.log('time: ', time);

        console.log(`class ${idx}: `, {name, professor, time});
        allClasses.push({
          name, professor, time
        });
      });

      browser.executeScript("arguments[0].scrollIntoView();", nextPage);
      nextPage.click();
      browser.sleep(1000)
    }

    console.log('allClasses: ', allClasses.length, allClasses);
    // const filteredClasses = await filterHitClassData('hit_teachers', allClasses);

    // sort by day
    // const sortedClasses = SortByDay(filteredClasses);

    // initialize CSV string with headers row
    let csvString: string = 'שיעור, מרצה, מועד\n';
    allClasses.forEach(c => csvString += CSV.stringify(c));
    

    // Write to CSV file with csvString
    fs.writeFile(`../dist/HIT/${new Date().getTime()}.csv`, csvString, (err: Error) => {
      if (err) {
        console.log('Error writing file', err)
      } else {
        console.log('Successfully wrote file')
      }
    });
  });
 
});


/**
 * const classListLi = element(by.css('.list_items_all')).all(by.tagName('li'));
      classListLi.each(async item => {
        const itemClass = await item.getAttribute('class')
        if (!itemClass.includes('title')) {
          // console.log('li: ', await item.getText())
          // await clickThis.click();
          const name = await item.element(by.tagName('h3')).getText();
          const html = await item.
          console.log('name: ', name)
          
          // const classInfo = await item.all(by.css('.list_td_study')).get(0);
          // const professorDiv = await classInfo.get(0).getText()//.all(by.tagName('div'));
          const professor = await item.element(by.tagName('a')).getText();
          console.log('professor: ', professor);

          // await clickThis.click();
        }
        
      });
 */