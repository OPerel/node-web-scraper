import * as fs from 'fs';
import * as path from 'path';
import neatCsv from 'neat-csv';

import { RawClass } from '../types';

const rawTeachersData = fs.readFileSync(path.join(__dirname, '../sources/teachers.csv'));

const createTeachersList = async (): Promise<string[]> => {
  const teachersData = await neatCsv(rawTeachersData);
  return teachersData.map((teacher: any) => {
    return `${teacher['Last Name'].trim()} ${teacher['First Name'].trim()}`
  });
}

export const filterClassData = async (classData: RawClass[]): Promise<RawClass[]> => {
  const ls: string[] = await createTeachersList();
  return classData.filter((c: RawClass) => {
    return ls.includes(c.proffesor.split(' ').slice(1).join(' ').trim());
  });
}

