import { prisma } from './prisma.js';

export const withTransaction = (callback, options) => prisma.$transaction(callback, options);
