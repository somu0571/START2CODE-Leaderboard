(function () {
  const searchInput = document.getElementById('leaderboard-search');
  const container = document.getElementById('leaderboard-container');
  if (!searchInput || !container) return;

  let debounceTimer = null;

  function renderTable(contributors) {
    if (!contributors || contributors.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <svg class="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <p class="text-surface-400 dark:text-surface-500">No matching contributors found.</p>
        </div>
      `;
      return;
    }

    const rows = contributors.map(c => {
      let rankBadge = `<span class="text-surface-400">${c.rank}</span>`;
      if (c.rank === 1) {
        rankBadge = `<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-sm">1</span>`;
      } else if (c.rank === 2) {
        rankBadge = `<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-bold text-sm">2</span>`;
      } else if (c.rank === 3) {
        rankBadge = `<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm">3</span>`;
      }

      return `
        <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer" onclick="window.location='/contributor/${c.githubUsername}'">
          <td class="table-cell font-mono font-bold text-center">
            ${rankBadge}
          </td>
          <td class="table-cell">
            <div class="flex items-center gap-3">
              <img src="${c.avatarUrl || 'https://github.com/' + c.githubUsername + '.png'}" alt="" class="w-8 h-8 rounded-full ring-2 ring-surface-200 dark:ring-surface-700" loading="lazy">
              <div>
                <div class="font-semibold text-surface-900 dark:text-white text-sm">${c.displayName || c.githubUsername}</div>
                <div class="text-xs text-surface-400">@${c.githubUsername}</div>
              </div>
            </div>
          </td>
          <td class="table-cell text-right">
            <span class="font-bold text-brand-600 dark:text-brand-400">${c.totalPoints}</span>
          </td>
          <td class="table-cell text-right hidden sm:table-cell">
            <span class="text-surface-600 dark:text-surface-300">${c.mergedPRs}</span>
          </td>
          <td class="table-cell text-right hidden md:table-cell">
            <span class="text-xs text-surface-400">${c.lastContributionAt ? new Date(c.lastContributionAt).toLocaleDateString() : '—'}</span>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="table-header px-4 py-3">Rank</th>
              <th class="table-header px-4 py-3">Contributor</th>
              <th class="table-header px-4 py-3 text-right">Points</th>
              <th class="table-header px-4 py-3 text-right hidden sm:table-cell">PRs</th>
              <th class="table-header px-4 py-3 text-right hidden md:table-cell">Last Active</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-800">
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  async function performSearch(query) {
    try {
      const res = await fetch(`/api/leaderboard?search=${encodeURIComponent(query)}&limit=100`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      renderTable(data.contributors || []);
    } catch (err) {
      console.error('Leaderboard search error:', err);
    }
  }

  searchInput.addEventListener('input', function (e) {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
})();
