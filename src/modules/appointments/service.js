import { AppError } from '../../common/AppError.js';
import { appointmentsRepository } from './repository.js';

const bookingErrors = {
  'business-not-found': [404, 'BUSINESS_NOT_FOUND', 'Business not found'],
  'staff-not-found': [404, 'STAFF_NOT_FOUND', 'Staff member not found'],
  'service-not-assigned': [400, 'SERVICE_NOT_ASSIGNED', 'The selected staff member does not offer this service'],
  'invalid-start-time': [400, 'INVALID_START_TIME', 'Choose a future start time on a whole minute'],
  'outside-business-hours': [409, 'SLOT_UNAVAILABLE', 'The appointment is outside the staff member schedule'],
  'slot-taken': [409, 'SLOT_TAKEN', 'That appointment time is no longer available'],
};

export const appointmentsService = {
  async publicAvailability(input) {
    const slots = await appointmentsRepository.findPublicAvailability(input);
    if (slots === null) throw new AppError('Business or active service not found', { statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    return slots;
  },
  async book(input) {
    const result = await appointmentsRepository.book(input);
    if (result.kind !== 'booked') {
      const [statusCode, code, message] = bookingErrors[result.kind] ?? [500, 'BOOKING_FAILED', 'The appointment could not be booked'];
      throw new AppError(message, { statusCode, code });
    }
    return result.appointment;
  },

  async list(query) {
    const rows = await appointmentsRepository.list(query);
    if (!rows) throw new AppError('Appointment page cursor not found for this business', { statusCode: 400, code: 'INVALID_CURSOR' });
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: rows.length > query.limit ? items.at(-1).id : null };
  },

  async updateStatus({ businessId, appointmentId, status, actorUserId }) {
    const result = await appointmentsRepository.updateStatus({ businessId, appointmentId, status, actorUserId });
    if (result.kind === 'not-found') throw new AppError('Appointment not found', { statusCode: 404, code: 'APPOINTMENT_NOT_FOUND' });
    if (result.kind === 'invalid-transition') throw new AppError('That appointment status change is not allowed', { statusCode: 409, code: 'INVALID_APPOINTMENT_TRANSITION' });
    return result.appointment;
  },
};
