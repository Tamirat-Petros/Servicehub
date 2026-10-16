export const businessesService = {
  getCurrent(tenant) {
    return { ...tenant.business, role: tenant.role };
  },
};
