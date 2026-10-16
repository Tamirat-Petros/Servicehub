export function recordAuditLog(transaction, data) {
  return transaction.auditLog.create({ data });
}

export function createInAppNotifications(transaction, notifications) {
  if (notifications.length === 0) return Promise.resolve({ count: 0 });
  return transaction.notification.createMany({ data: notifications });
}
