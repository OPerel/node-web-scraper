import * as fs from 'fs';
import * as path from 'path';
import neatCsv from 'neat-csv';

/**
 * 
 */
export default async <T extends { professor: string | string[] }>(csvFile: string, classData: T[]): Promise<T[]> => {
  
  const rawTeachersData = fs.readFileSync(path.join(__dirname, `../sources/${csvFile}.csv`));

  /**
   * Create an array of teachers' names
   * 
   * @description Receive data from CSV and format teachers' names to go into the array. 
   */
  const createTeachersList = async (): Promise<string[]> => {
    const teachersData = await neatCsv(rawTeachersData);
    return teachersData.map((teacher: any) => {
      if (Object.keys(teacher).length > 1) {
        return `${teacher['Last Name'].trim()} ${teacher['First Name'].trim()}`;
      }
      return Object.values(teacher).join('');
    });
  }

  /**
   * Format professor's name
   * 
   * @param profName
   */
  const formatProfsName = (profName: string): string => {
    const titles = [`פרופ'`, `ד"ר` ,`מר`];
    const firstWord = profName.split(' ')[0];

    if (titles.includes(firstWord)) {
      return profName.split(' ').slice(1).join(' ').trim();
    }

    return profName;
  }

  /**
   * Filter classes by teachers
   * 
   * @description Filters the classes with teachers in the array created by createTeachersList()
   */
  const filterClassData = async (): Promise<T[]> => {
    const ls: string[] = await createTeachersList();
    console.log('ls: ', ls)
    let filtered: T[] = [];
    classData.forEach(c => {
      if (typeof c.professor === 'string') {
        if (ls.includes(formatProfsName(c.professor))) {
          filtered.push(c);
        }
      } else {
        const teachersInProfs = c.professor.filter(p => ls.includes(formatProfsName(p)));
        if (teachersInProfs.length) {
          c.professor = teachersInProfs.join(', ');
          filtered.push(c);
        }
      }
    });

    console.log('filtered: ', filtered);
    return filtered;
  }

  return await filterClassData();
}



/**
 * return classData.filter((c) => {
      if (typeof c.professor === 'string') {
        console.log('one professor: ', c.professor)
        return ls.includes(formatProfsName(c.professor));
      }
      const prof = c.professor.filter(p => ls.includes(formatProfsName(p))).join(', ');
      console.log('multiple professors: ', prof)
      return prof;
    });
 */