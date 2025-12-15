import {
  isBusinessDay,
  isCanadianHoliday,
  isWeekend,
} from "./server/src/shared/utils/business-days";

const date = new Date(2023, 10, 1); // Nov 1, 2023
console.log(`Checking date: ${date.toString()}`);
console.log(`Is Weekend? ${isWeekend(date)}`);
console.log(`Is Canadian Holiday? ${isCanadianHoliday(date)}`);
console.log(`Is Business Day? ${isBusinessDay(date)}`);
