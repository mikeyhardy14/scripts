// excel-filter.js
// Adds Excel-like behavior to the .excel-filter UI:
// - Search-as-you-type
// - Select all / Clear (affects visible items by default)
// - Works with multiple widgets on the page

(function () {
  const VISIBLE_ONLY = true; // set to false if you want actions to affect ALL items, not just filtered/visible ones

  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getOptionNodes(root) {
    return Array.from(root.querySelectorAll('.ef-option'));
  }

  function getCheckbox(opt) {
    return opt.querySelector('input[type="checkbox"]');
  }

  function isVisible(opt) {
    // We track visibility via dataset + style set by filter()
    return opt.dataset._visible !== '0';
  }

  function filterList(root) {
    const q = (root.querySelector('.ef-search')?.value || '').trim().toLowerCase();
    const opts = getOptionNodes(root);
    let visibleCount = 0;

    for (const opt of opts) {
      const txt = (opt.querySelector('.ef-text')?.textContent || '').toLowerCase();
      const match = !q || txt.includes(q);
      opt.style.display = match ? '' : 'none';
      opt.dataset._visible = match ? '1' : '0';
      if (match) visibleCount++;
    }

    // Optional: disable action links if nothing visible
    const selectAllBtn = getSelectAllBtn(root);
    const clearBtn = getClearBtn(root);
    [selectAllBtn, clearBtn].forEach(btn => {
      if (!btn) return;
      if (visibleCount === 0) {
        btn.classList.add('is-disabled');
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.classList.remove('is-disabled');
        btn.removeAttribute('aria-disabled');
      }
    });
  }

  function toggleAll(root, checked) {
    const opts = getOptionNodes(root);
    for (const opt of opts) {
      if (!VISIBLE_ONLY || isVisible(opt)) {
        const cb = getCheckbox(opt);
        if (cb) {
          cb.checked = checked;
          // If you need reactive frameworks to notice:
          // cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }

  function getSelectAllBtn(root) {
    // Prefer explicit data-action, else fall back to first .ef-link
    return (
      root.querySelector('[data-action="select-all"]') ||
      root.querySelectorAll('.ef-actions .ef-link')[0] ||
      null
    );
  }

  function getClearBtn(root) {
    // Prefer explicit data-action, else fall back to second .ef-link
    return (
      root.querySelector('[data-action="clear"]') ||
      root.querySelectorAll('.ef-actions .ef-link')[1] ||
      null
    );
  }

  function initOne(root) {
    if (!root || root.__excelFilterInitialized) return;
    root.__excelFilterInitialized = true;

    const search = root.querySelector('.ef-search');
    const onSearch = debounce(() => filterList(root), 120);
    if (search) {
      search.addEventListener('input', onSearch);
      // ESC clears search
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          search.value = '';
          filterList(root);
        }
      });
    }

    const selectAllBtn = getSelectAllBtn(root);
    const clearBtn = getClearBtn(root);

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectAllBtn.classList.contains('is-disabled')) return;
        toggleAll(root, true);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (clearBtn.classList.contains('is-disabled')) return;
        toggleAll(root, false);
      });
    }

    // Initial visibility state
    filterList(root);
  }

  function initAll() {
    document.querySelectorAll('.excel-filter').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Optional global access if you dynamically add panels:
  window.ExcelFilter = { init: initAll, initOne };
})();
