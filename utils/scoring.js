const S2C_PREFIX = 's2c:';

function normalizeLabel(label) {
  return String(label).trim().toLowerCase();
}

function separateLabels(labels) {
  const s2cLabels = [];
  const regularLabels = [];
  for (const label of labels) {
    const normalized = normalizeLabel(label);
    if (normalized.startsWith(S2C_PREFIX)) {
      s2cLabels.push(normalized);
    } else {
      regularLabels.push(normalized);
    }
  }
  return { s2cLabels, regularLabels };
}

function getHighestS2CTier(s2cLabels, rulesMap) {
  let highest = 0;
  let highestLabel = null;
  for (const label of s2cLabels) {
    const points = rulesMap.get(label) || 0;
    if (points > highest) {
      highest = points;
      highestLabel = label;
    }
  }
  return { label: highestLabel, points: highest };
}

function calculatePoints(prLabels, rulesMap) {
  if (!prLabels || prLabels.length === 0) {
    return { totalPoints: 0, labelBreakdown: [] };
  }

  const normalizedLabels = prLabels.map(l => ({
    original: typeof l === 'string' ? l : l.name,
    normalized: normalizeLabel(typeof l === 'string' ? l : l.name)
  }));

  const { s2cLabels, regularLabels } = separateLabels(
    normalizedLabels.map(l => l.normalized)
  );

  const labelBreakdown = [];
  let totalPoints = 0;

  for (const label of regularLabels) {
    const points = rulesMap.get(label) || 0;
    labelBreakdown.push({ name: label, points });
    totalPoints += points;
  }

  if (s2cLabels.length > 0) {
    const highest = getHighestS2CTier(s2cLabels, rulesMap);
    for (const label of s2cLabels) {
      const isHighest = label === highest.label;
      const points = isHighest ? highest.points : 0;
      labelBreakdown.push({
        name: label,
        points,
        suppressed: !isHighest && s2cLabels.length > 1
      });
    }
    totalPoints += highest.points;
  }

  return { totalPoints, labelBreakdown };
}

module.exports = { normalizeLabel, separateLabels, getHighestS2CTier, calculatePoints };
