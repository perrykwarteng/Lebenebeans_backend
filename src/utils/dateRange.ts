export const parseDateRange = (from?: string, to?: string) => {
  const now = new Date();

  let startDate: string;
  let endDate: string;

  // BOTH FROM AND TO
  if (from && to) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  // ONLY FROM
  else if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  // ONLY TO
  else if (to) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  // DEFAULT (current month)
  else {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  return { startDate, endDate };
};
