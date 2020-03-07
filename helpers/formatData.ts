const fs = require('fs');

const rawData = fs.readFileSync('../dist/jsonData.json');
const data = JSON.parse(rawData);

import * as CSV from 'csv-string';

function getDays(): string[] {
  return data.map(c => c.date.trim())
    .filter((value: never, index: number, self: []) => { 
      return self.indexOf(value) === index;
    });
}

function getBuildings(): string[] {
  return data.map(c => {
    const building = c.room.trim().split(' ')[0];
    return building;
  })
    .filter((value: never, index: number, self: []) => { 
      return self.indexOf(value) === index;
    });
}

function buildDayObj(): Day[] {
  return getDays().map((date: string): Day => ({
    day: date,
    buildings: getBuildings().map((b: string): Building => ({
      name: b,
      courses: data.filter((c: any) => c.date.trim() === date && c.room.trim().split(' ')[0] === b)
        .map((fc: any): Course => ({
          name: fc.subject,
          teacherName: fc.proffesor,
          room: fc.room,
          faculty: fc.faculty,
          startTime: fc.startTime,
          endTime: fc.endTime,
        }))
    }))
  }));
}

const toCsv = (data: Day[]): string => {
  let csvString: string = '';
  data.forEach((day: Day) => {
    csvString += `*********** תאריך ${day.day} ***********\n`;
    day.buildings.forEach((building: Building) => {
      csvString += `********** בנין ${building.name} **********\n`;
      if (building.courses[0]) csvString += Object.keys(building.courses[0]).join(', ') + '\n';
      building.courses.forEach((course: Course) => {
        csvString += CSV.stringify(course);
      });
    });
  });
  return csvString;
}

const daysObjects = buildDayObj();

// Write to csv string to file
const objArrString = toCsv(daysObjects);
fs.writeFile('../dist/csvTest.csv', objArrString, err => {
  if (err) {
    console.log('Error writing file', err)
  } else {
    console.log('Successfully wrote file')
  }
});



// Write to Json file
// const objArrString = JSON.stringify(buildDayObj());
// fs.writeFile('../dist/formatJsonData.json', objArrString, err => {
//   if (err) {
//     console.log('Error writing file', err)
//   } else {
//     console.log('Successfully wrote file')
//   }
// });

interface Day {
  day: string,
  buildings: Building[]
}

interface Building {
  name: string,
  courses: Course[]
}

interface Course {
  name: string,
  teacherName: string,
  room: string,
  faculty: string,
  startTime: string | Date,
  endTime: string | Date,
}