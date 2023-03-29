import { BadRequestException } from '@nestjs/common';

export const getPreviousMonth = (month: number, year: number) => {
  //try to get previous month
  let previousMonth = month - 1;
  let previousYear = year;
  if (previousMonth < 0) {
    previousMonth = 11;
    previousYear -= 1;
  }
  return { previousMonth, previousYear };
};
export const validateMonthAndYear = (month: number, year: number) => {
  if (month === undefined || year === undefined) {
    throw new BadRequestException('Month and year are required');
  }

  if (Number.isNaN(month) || Number.isNaN(year)) {
    throw new BadRequestException('Month and year are required');
  }

  if (month < 0 || month > 11) {
    throw new BadRequestException('Invalid month');
  }

  if (year < 0) {
    throw new BadRequestException('Invalid year');
  }
};
