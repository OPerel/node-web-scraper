import { RawClass } from '../types';

export const classInfoObject = (vals: string[]): RawClass => {
  return {
    date: vals[0],
    faculty: vals[1],
    startTime: vals[2],
    endTime: vals[3],
    building: vals[4],
    room: vals[5],
    subject: vals[6],
    proffesor: vals[7],
    notes: vals[8],
    status: vals[9],
    type: vals[10]
  };
}