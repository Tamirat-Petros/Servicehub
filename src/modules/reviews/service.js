import { AppError } from '../../common/AppError.js';
import { reviewsRepository } from './repository.js';

export const reviewsService = {
  async listPublic(businessSlug) {
    const reviews = await reviewsRepository.listPublic({ businessSlug, limit: 50 });
    return reviews;
  },
  async create({ businessSlug, appointmentId, customerUserId, rating, comment }) {
    const review = await reviewsRepository.createForCompletedAppointment({ businessSlug, appointmentId, customerUserId, rating, comment });
    if (!review) throw new AppError('A completed appointment booked with this account is required to leave a review', { statusCode: 404, code: 'REVIEW_NOT_ALLOWED' });
    return review;
  },
};
