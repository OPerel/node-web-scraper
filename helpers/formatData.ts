const fs = require('fs');

class FormatData {
  data: any;
  days: string[];
  fData: Day[];

  constructor() {
    fs.readFile('../dist/jsonData.json', (err: Error ,data) => {
      if (err) {
        console.log('Error: ', err);
      } else {
        const parsedData = JSON.parse(data);
        this.data = parsedData;
        this.getDays(parsedData);
      }
    });
  }

  getDays(dates: string[]): void {
    // console.log('this.data[0]: ', this.data[0]);
    const filteredDates = this.data.map((c => c.date.trim()))
      .filter((value: never, index: number, self: []) => { 
        return self.indexOf(value) === index;
      });
    this.days = filteredDates
    this.makeBuildingObj();
  }

  makeBuildingObj() {
    const filteredBuildings = this.data.map((c => c.room.trim().split(' ')[0]))
      .filter((value: never, index: number, self: []) => { 
        return self.indexOf(value) === index;
      });

    const buildings = [];
    filteredBuildings.forEach((building: string) => {

      const courses = [];
      // let date = '';
      this.data.forEach((c: any) => {
        if (building === c.room.trim().split(' ')[0]) {
          // date = c.date.trim();
          courses.push({
            name: c.subject.trim(),
            teacherName: c.proffesor.trim(),
            room: c.room.trim(),
            faculty: c.faculty.trim(),
            startTime: c.startTime.trim(),
            endTime: c.endTime.trim(),
          })
        }
      });
      buildings.push({
        name: building,
        // date,
        courses
      });
    });
    // this.buildDayObj(buildings);
    console.log('buildings[0]: ', buildings[0]);
  }

  buildDayObj(buildings: any) {

    const days = [];
    this.days.forEach((date: string) => {

      const builds = [];
      buildings.forEach((build: any) => {
        if (date === build.date) {
          builds.push(build)
        }
      })
      days.push({
        day: date,
        buildings: builds
      })
    });
    console.log('days[1]: ', days[1]);
  } 

}

const test = new FormatData();

interface Day {
  day: string | Date,
  buildings: [
    {
      name: string,
      date: string;
      courses: [
        {
          name: string,
          teacherName: string,
          room: string,
          faculty: string,
          startTime: string | Date,
          endTime: string | Date,
        }
      ]
    }
  ]
}

/**const obj: any = {
            day: date,
            buildings: [
              {
                name: '',
                courses: [
                  {
                    name: '',
                    teacherName: '',
                    room: '',
                    faculty: '',
                    startTime: '',
                    endTime: '',
                  }
                ]
              }
            ]
          } */