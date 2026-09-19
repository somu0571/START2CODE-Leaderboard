(function () {
  const countdownEl = document.getElementById('countdown-text');
  if (!countdownEl) return;

  // Event marathon date range
  const startDate = new Date('2026-09-19T00:00:00+05:30');
  const endDate = new Date('2026-09-27T23:59:59+05:30');

  function updateCountdown() {
    const now = new Date();

    if (now < startDate) {
      const diff = startDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      countdownEl.textContent = `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (now <= endDate) {
      const diff = endDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    } else {
      countdownEl.textContent = 'Event Concluded';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
