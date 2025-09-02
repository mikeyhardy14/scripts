// excel-filter-visible-only.js
(function () {
  const root = document.querySelector('.excel-filter');
  if (!root) return;

  const search   = root.querySelector('.ef-search');
  const btnAll   = root.querySelector('[data-action="select-all"]') || root.querySelector('.ef-actions .ef-link:nth-of-type(1)');
  const btnClear = root.querySelector('[data-action="clear"]')      || root.querySelector('.ef-actions .ef-link:nth-of-type(2)');

  function filterList() {
    const q = (search?.value || '').trim().toLowerCase();
    const rows = root.querySelectorAll('.ef-option');
    let visible = 0;

    rows.forEach(row => {
      const txt = (row.querySelector('.ef-text')?.textContent || '').toLowerCase();
      const show = !q || txt.includes(q);
      row.style.display = show ? '' : 'none';
      row.dataset._visible = show ? '1' : '0';
      if (show) visible++;
    });

    // Disable/enable action links when nothing matches
    [btnAll, btnClear].forEach(btn => {
      if (!btn) return;
      if (visible === 0) { btn.classList.add('is-disabled'); btn.setAttribute('aria-disabled','true'); }
      else { btn.classList.remove('is-disabled'); btn.removeAttribute('aria-disabled'); }
    });
  }

  // Always operate on VISIBLE rows only
  function toggleAllVisible(checked) {
    root.querySelectorAll('.ef-option').forEach(row => {
      if (row.dataset._visible !== '0') {
        const cb = row.querySelector('input[type="checkbox"]');
        if (cb && !cb.disabled) cb.checked = checked;
      }
    });
  }

  // Wire search (tiny debounce) + Esc to clear
  if (search) {
    let t;
    search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterList, 120); });
    search.addEventListener('keydown', e => { if (e.key === 'Escape') { search.value=''; filterList(); } });
  }

  // Wire actions
  btnAll?.addEventListener('click',  e => { e.preventDefault(); if (!btnAll.classList.contains('is-disabled'))   toggleAllVisible(true);  });
  btnClear?.addEventListener('click',e => { e.preventDefault(); if (!btnClear.classList.contains('is-disabled')) toggleAllVisible(false); });

  // Initial pass
  filterList();
})();
