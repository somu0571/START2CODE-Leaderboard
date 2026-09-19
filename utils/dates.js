function isWithinMarathonWindow(date) {
  const start = process.env.MARATHON_START;
  const end = process.env.MARATHON_END;
  if (!start || !end) return true;
  const d = new Date(date);
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T23:59:59Z');
  return d >= s && d <= e;
}

function shouldEnforceMarathonWindow() {
  return process.env.ENFORCE_MARATHON_WINDOW === 'true';
}

function getCurrentMarathonDay() {
  const start = process.env.MARATHON_START;
  if (!start) return null;
  const s = new Date(start + 'T00:00:00Z');
  const now = new Date();
  const diff = Math.floor((now - s) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0;
  const totalDays = getMarathonTotalDays();
  return Math.min(diff + 1, totalDays);
}

function getMarathonTotalDays() {
  const start = process.env.MARATHON_START;
  const end = process.env.MARATHON_END;
  if (!start || !end) return 7;
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function getDaysRemaining() {
  const end = process.env.MARATHON_END;
  if (!end) return null;
  const e = new Date(end + 'T23:59:59Z');
  const now = new Date();
  const diff = Math.ceil((e - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getEventDaysRemaining() {
  const end = '2026-09-27';
  const e = new Date(end + 'T23:59:59Z');
  const now = new Date();
  const diff = Math.ceil((e - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function hasMarathonStarted() {
  const start = process.env.MARATHON_START;
  if (!start) return false;
  return new Date() >= new Date(start + 'T00:00:00Z');
}

function hasMarathonEnded() {
  const end = process.env.MARATHON_END;
  if (!end) return false;
  return new Date() > new Date(end + 'T23:59:59Z');
}

function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatRelativeTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(d);
}

module.exports = {
  isWithinMarathonWindow,
  shouldEnforceMarathonWindow,
  getCurrentMarathonDay,
  getMarathonTotalDays,
  getDaysRemaining,
  getEventDaysRemaining,
  hasMarathonStarted,
  hasMarathonEnded,
  formatDate,
  formatRelativeTime
};
