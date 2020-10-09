export default <T extends { time: string }>(classArray: T[]): T[] => {
  const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];
  return classArray.sort((a, b) => days.indexOf(a.time[0]) - days.indexOf(b.time[0]));
};
