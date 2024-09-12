export const generateScheduleStats = (schedule) => {
  const activityCounts = schedule.reduce((acc, item) => {
    acc[item.activity] = (acc[item.activity] || 0) + 1;
    return acc;
  }, {});

  const mostFrequentActivity = Object.entries(activityCounts).reduce((a, b) => a[1] > b[1] ? a : b);
  const uniqueActivities = Object.keys(activityCounts).length;

  return {
    mostFrequentActivity: {
      name: mostFrequentActivity[0],
      hours: mostFrequentActivity[1]
    },
    uniqueActivities,
    productiveHours: activityCounts['Working'] || 0,
    sleepHours: activityCounts['Sleeping'] || 0
  };
};
