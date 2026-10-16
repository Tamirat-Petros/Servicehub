import { z } from 'zod';

const intervalSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
}).refine(({ startMinute, endMinute }) => startMinute < endMinute, {
  message: 'End time must be after start time',
  path: ['endMinute'],
});

export const replaceScheduleSchema = z.object({ intervals: z.array(intervalSchema).max(42) }).superRefine(({ intervals }, context) => {
  for (let i = 0; i < intervals.length; i += 1) {
    for (let j = i + 1; j < intervals.length; j += 1) {
      const a = intervals[i];
      const b = intervals[j];
      if (a.weekday === b.weekday && a.startMinute < b.endMinute && a.endMinute > b.startMinute) {
        context.addIssue({ code: 'custom', path: ['intervals', j], message: 'Schedule intervals cannot overlap on the same day' });
      }
    }
  }
});
