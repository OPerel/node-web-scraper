const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv');

const rawData = fs.readFileSync('../dist/jsonData.json');
const data = JSON.parse(rawData);

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

// Write to CSV file
const csv = new ObjectsToCsv(buildDayObj());
csv.toDisk('../dist/test.csv').then(() => console.log('file created'));

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