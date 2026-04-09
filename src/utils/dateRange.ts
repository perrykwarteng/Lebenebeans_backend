export const parseDateRange = (from?: string, to?: string) => {
  const now = new Date();
  let startDate: string;
  let endDate: string;

  if (from && to) {
    startDate = new Date(from).toISOString();
    endDate = new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString();
  } else if (from) {
    startDate = new Date(from).toISOString();
    endDate = now.toISOString();
  } else if (to) {
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    endDate = new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString();
  } else {
    startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    ).toISOString();
    endDate = now.toISOString();
  }
  return { startDate, endDate };
};
