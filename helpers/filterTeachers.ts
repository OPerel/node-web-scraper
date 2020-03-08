import * as fs from 'fs';
import * as path from 'path';
import neatCsv from 'neat-csv';

import { RawClass } from '../types';

const rawTeachersData = fs.readFileSync(path.join(__dirname, '../sources/teachers.csv'));

const createTeachersList = async (): Promise<string[]> => {
  const teachersData = await neatCsv(rawTeachersData);
  console.log('teachersData: ', teachersData[0]);
  return teachersData.map((teacher: any) => {
    return `${teacher['Last Name'].trim()} ${teacher['First Name'].trim()}`
  });
}

export const filterClassData = (classData: RawClass[]): Promise<RawClass[]> => {
  return createTeachersList().then((ls: string[]) => {
    return classData.filter((c: RawClass) => {
      return ls.includes(c.proffesor.split(' ').slice(1).join(' ').trim());
    })
  })
}

