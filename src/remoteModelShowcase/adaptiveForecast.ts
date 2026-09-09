/**
 * Selects a conservative forecast with rolling-origin validation.
 * Reference limits are deliberately excluded from model fitting and clipping.
 */
export function adaptiveForecast(values: number[], steps: number, physicalMin = -Infinity) {
  const series = values.filter(Number.isFinite).slice(-720);
  const mean = (items: number[]) => items.reduce((sum, value) => sum + value, 0) / Math.max(1, items.length);
  const median = (items: number[]) => {
    const sorted = items.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : mean(sorted.slice(Math.max(0, middle - 1), middle + 1));
  };
  const quantile = (items: number[], probability: number) => {
    if (!items.length) return 0;
    const sorted = items.slice().sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * probability) - 1))];
  };

  type Candidate = { method: 'level' | 'damped-trend' | 'seasonal'; period: number; seasonalTrend?: boolean };

  const localLevel = (train: number[]) => {
    let level = median(train.slice(-Math.min(12, train.length)));
    const start = Math.max(0, train.length - 120);
    for (let index = start; index < train.length; index += 1) level = 0.22 * train[index] + 0.78 * level;
    return level;
  };

  const robustSlope = (train: number[]) => {
    const tail = train.slice(-Math.min(48, train.length));
    if (tail.length < 8) return 0;
    const block = Math.max(3, Math.floor(tail.length / 4));
    const first = median(tail.slice(0, block));
    const last = median(tail.slice(-block));
    return (last - first) / Math.max(1, tail.length - block);
  };

  const predict = (train: number[], candidate: Candidate, count: number): number[] => {
    const level = localLevel(train);
    if (candidate.method === 'level') return Array(count).fill(level);

    const slope = robustSlope(train);
    const damping = 0.96;
    const trendAt = (index: number) => slope * damping * (1 - damping ** (index + 1)) / (1 - damping);
    if (candidate.method === 'damped-trend') {
      return Array.from({ length: count }, (_, index) => level + trendAt(index));
    }

    const period = candidate.period;
    const cycles = Math.min(5, Math.floor(train.length / period));
    const tail = train.slice(-cycles * period);
    const template = Array.from({ length: period }, (_, phase) => median(
      Array.from({ length: cycles }, (_, cycle) => tail[cycle * period + phase]),
    ));
    const templateLevel = mean(template);
    const recentLevel = mean(train.slice(-period));
    return Array.from({ length: count }, (_, index) => (
      template[index % period] - templateLevel + recentLevel + (candidate.seasonalTrend ? trendAt(index) : 0)
    ));
  };

  const validationHorizon = Math.min(60, Math.max(3, Math.floor(series.length / 8)));
  const origins = [
    series.length - validationHorizon * 3,
    series.length - validationHorizon * 2,
    series.length - validationHorizon,
  ].filter((origin) => origin >= 12);
  const candidates: Candidate[] = [
    { method: 'level', period: 0 },
    { method: 'damped-trend', period: 0 },
  ];

  const correlation = (period: number) => {
    const length = Math.min(series.length - period, period * 4);
    if (length < period * 2) return 0;
    const current = series.slice(series.length - length);
    const previous = series.slice(series.length - length - period, series.length - period);
    const currentMean = mean(current);
    const previousMean = mean(previous);
    const covariance = current.reduce((sum, value, index) => sum + (value - currentMean) * (previous[index] - previousMean), 0);
    const denominator = Math.sqrt(
      current.reduce((sum, value) => sum + (value - currentMean) ** 2, 0)
      * previous.reduce((sum, value) => sum + (value - previousMean) ** 2, 0),
    );
    return denominator > 0 ? covariance / denominator : 0;
  };

  const maxPeriod = Math.min(180, Math.floor((origins[0] || series.length) / 3));
  for (let period = 4; period <= maxPeriod; period += 1) {
    if (correlation(period) >= 0.55) {
      candidates.push({ method: 'seasonal', period });
      candidates.push({ method: 'seasonal', period, seasonalTrend: true });
    }
  }

  const evaluate = (candidate: Candidate) => {
    const errors: number[] = [];
    for (const origin of origins) {
      const forecast = predict(series.slice(0, origin), candidate, validationHorizon);
      for (let step = 0; step < validationHorizon && origin + step < series.length; step += 1) {
        errors.push(Math.abs(series[origin + step] - Math.max(physicalMin, forecast[step])));
      }
    }
    return { candidate, errors, mae: mean(errors) };
  };

  const scored = candidates.map(evaluate);
  const baselines = scored.filter((item) => item.candidate.method !== 'seasonal').sort((a, b) => a.mae - b.mae);
  const baseline = baselines[0] || { candidate: candidates[0], errors: [], mae: 0 };
  const seasonal = scored
    .filter((item) => item.candidate.method === 'seasonal')
    .sort((a, b) => a.mae - b.mae)[0];
  const best = seasonal && seasonal.mae < baseline.mae * 0.92 ? seasonal : baseline;
  const rawForecast = predict(series, best.candidate, steps);
  const firstDifferences = series.slice(1).map((value, index) => Math.abs(value - series[index]));
  const validationWidth = quantile(best.errors, 0.9);
  const shortTermNoise = quantile(firstDifferences, 0.75);
  const baseWidth = Math.max(validationWidth, shortTermNoise * 0.5);

  return {
    method: best.candidate.method,
    period: best.candidate.period || null,
    trainingRecords: series.length,
    validationMae: best.errors.length ? best.mae : null,
    baselineMae: baseline.errors.length ? baseline.mae : null,
    validationPoints: best.errors.length,
    validationHorizon,
    points: rawForecast.map((value, index) => {
      const predicted = Math.max(physicalMin, value);
      const horizonScale = Math.sqrt(1 + (index + 1) / Math.max(1, validationHorizon));
      const radius = baseWidth * horizonScale;
      return {
        predicted,
        lower: Math.max(physicalMin, predicted - radius),
        upper: predicted + radius,
      };
    }),
  };
}

/** Only the latest contiguous, approximately regular, usable run informs forecasts. */
export function forecastTraining<T extends { timestamp: string; quality: string }>(records: T[], fallbackSeconds: number) {
  const sorted = records.slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-720);
  const intervals = sorted.slice(1)
    .map((record, index) => (Date.parse(record.timestamp) - Date.parse(sorted[index].timestamp)) / 1000)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  const interval = intervals.length >= 3 ? intervals[Math.floor(intervals.length / 2)] : fallbackSeconds;
  let start = sorted.length;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index].quality === 'bad') break;
    if (
      index < sorted.length - 1
      && Math.abs((Date.parse(sorted[index + 1].timestamp) - Date.parse(sorted[index].timestamp)) / 1000 - interval) > interval * 0.15
    ) break;
    start = index;
  }
  return { records: sorted.slice(start), interval };
}
