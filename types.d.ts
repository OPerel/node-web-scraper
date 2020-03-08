export interface RawClass {
  date: string,
  faculty: string,
  startTime: string,
  endTime: string,
  building: string,
  room: string,
  subject: string,
  proffesor: string,
  notes: string,
  status: string,
  type: string
}

export interface Day {
  day: string,
  buildings: Building[]
}

export interface Building {
  name: string,
  courses: Course[]
}

export interface Course {
  name: string,
  teacherName: string,
  room: string,
  faculty: string,
  startTime: string | Date,
  endTime: string | Date,
}