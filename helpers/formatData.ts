import * as CSV from 'csv-string';

import { RawClass, Day, Building, Course } from '../types';


const getDays = (filteredData: RawClass[]): string[] => {
  return filteredData.map((c: RawClass) => c.date.trim())
    .filter((value: never, index: number, self: []) => { 
      return self.indexOf(value) === index;
    });
}

const getBuildings = (filteredData: RawClass[]): string[] => {
  return filteredData.map((c: RawClass) => {
    const building = c.room.trim().split(' ')[0];
    return building;
  })
    .filter((value: never, index: number, self: []) => { 
      return self.indexOf(value) === index;
    });
}

export const buildDayObjAndReturnCsvString = (filteredData: RawClass[]): string => { 
  const dayObjects = getDays(filteredData).map((date: string): Day => ({
    day: date,
    buildings: getBuildings(filteredData).map((b: string): Building => ({
      name: b,
      courses: filteredData.filter((c: RawClass) => c.date.trim() === date && c.room.trim().split(' ')[0] === b)
        .map((fc: RawClass): Course => ({
          name: fc.subject,
          teacherName: fc.proffesor,
          room: fc.room,
          faculty: fc.faculty,
          endTime: fc.endTime,
          startTime: fc.startTime
        }))
    }))
  }));
  return toCsvString(dayObjects);
}

const toCsvString = (data: Day[]): string => {
  let csvString: string = '';
  data.forEach((day: Day) => {
    csvString += `\n*********** תאריך ${day.day} ***********\n`;
    day.buildings.forEach((building: Building) => {
      csvString += `\n********** בנין ${building.name} **********\n`;
      if (building.courses[0]) csvString += 'שיעור, מרצה, כיתה, פקולטה, שעת סיום, שעת התחלה\n';
      building.courses.forEach((course: Course) => {
        csvString += CSV.stringify(course);
      });
    });
  });
  return csvString;
}


