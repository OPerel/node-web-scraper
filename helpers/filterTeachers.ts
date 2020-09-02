import * as fs from 'fs';
import * as path from 'path';
import neatCsv from 'neat-csv';

import { RawClass } from '../types';

const rawTeachersData = fs.readFileSync(path.join(__dirname, '../sources/teachers.csv'));

/**
 * Create an array of teachers' names
 * 
 * @description Receive data from CSV and format teachers' names to go into the array. 
 */
const createTeachersList = async (): Promise<string[]> => {
  const teachersData = await neatCsv(rawTeachersData);
  return teachersData.map((teacher: any) => {
    return `${teacher['Last Name'].trim()} ${teacher['First Name'].trim()}`
  });
}

/**
 * Filter classes 
 * 
 * @description Filters the classes with teachers in the array created by createTeachersList()
 * @param classData Array of all classes from the HTML table
 */
export const filterClassData = async (classData: RawClass[]): Promise<RawClass[]> => {
  const ls: string[] = await createTeachersList();
  return classData.filter((c: RawClass) => {
    return ls.includes(c.proffesor.split(' ').slice(1).join(' ').trim());
  });
}

