const { ordinaryStatisticsJob, dailyStatisticsJob } = require('./collectStatistics');

ordinaryStatisticsJob.start();
dailyStatisticsJob.start();
