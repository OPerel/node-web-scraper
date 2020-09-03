import * as fs from 'fs';
import * as path from 'path';
import neatCsv from 'neat-csv';

/**
 * 
 */
export default async <T extends { professor: string }>(csvFile: string, classData: T[]): Promise<T[]> => {
  
  const rawTeachersData = fs.readFileSync(path.join(__dirname, `../sources/${csvFile}.csv`));

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
   * Format professor's name
   * 
   * @param profName
   */
  const formatProfsName = (profName: string): string => {
    const prof = `פרופ'`;
    const dr = `ד"ר`;

    if (profName) {
      const firstWord = profName.split(' ')[0];
      if (prof === firstWord || dr === firstWord) {
        return profName.split(' ').slice(1).join(' ').trim();
      }
    }

    return profName;
  }

  /**
   * Filter classes 
   * 
   * @description Filters the classes with teachers in the array created by createTeachersList()
   * @param classData Array of all classes from the HTML table
   */
  const filterClassData = async (): Promise<T[]> => {
    const ls: string[] = await createTeachersList();
    return classData.filter((c) => {
      return ls.includes(formatProfsName(c.professor));
    });
  }

  return await filterClassData();
}