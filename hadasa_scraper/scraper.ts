import * as fs from 'fs';
import { browser, element, by, ElementFinder } from 'protractor';
import cheerio from 'cheerio';
import * as CSV from 'csv-string';

import filterHitClassData from '../utils/filterTeachers';
import SortByDay from '../utils/sortByDay';

interface HadasaClass {
  name: string,
  professor: string | string[],
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
    let nextPage: ElementFinder | null;
    nextPage = element(by.css('a[title="Go to next page"]'));
    
    let allClasses: HadasaClass[] = [];

    while (nextPage) {
      const html = await browser.getPageSource();
      const $ = cheerio.load(html);
        
      $('.list_items_all > li').each((idx, item) => {
        const name = $(item).find('h3').text().trim();

        const rawProfessor = $(item).find('a').text().trim();
        let professor: string | string[];
        if (rawProfessor.includes('\n')) {
          professor = rawProfessor.split('\n').map(prof => prof.trim()).filter(prof => prof);
        } else {
          professor = rawProfessor;
        }

        const rawTime = $(item).find('.list_td_study').last().children('div').eq(1).text().trim().split('\n');
        const time = rawTime[rawTime.length - 1].trim();

        console.log(`class ${idx}: `, {name, professor, time});
        allClasses.push({
          name, professor, time
        });
      });

      // nextPage = null;
      try {
        await browser.executeScript("arguments[0].scrollIntoView();", nextPage);
        await nextPage.click();
        await browser.sleep(1000)
      } catch (err) {
        console.log('**** Last page ****\n', err);
        nextPage = null;
      }
    }

    console.log('allClasses: ', allClasses, allClasses.length);

    // filter teachers
    const filteredClasses = await filterHitClassData('hadasa_teachers', allClasses);
    console.log('filteredClasses: ', filteredClasses, filteredClasses.length);

    // sort by day
    const sortedClasses = SortByDay(filteredClasses);

    // initialize CSV string with headers row
    let csvString: string = 'שיעור, מרצה, מועד\n';
    sortedClasses.forEach(c => csvString += CSV.stringify(c));
    

    // Write to CSV file with csvString
    // fs.writeFile(`../dist/Hadasa/${new Date().getTime()}.csv`, csvString, (err: Error) => {
    //   if (err) {
    //     console.log('Error writing file', err);
    //     return;
    //   }
    //   console.log('Successfully wrote file');
    // });
  });
 
});
