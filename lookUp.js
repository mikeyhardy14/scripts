/*!
 * excel-filter.js (no hidden-field aggregation)
 * - Search-as-you-type
 * - Select all / Clear buttons (default: affect only VISIBLE rows)
 * - Works with multiple .excel-filter blocks on a page
 *
 * HTML inside each .excel-filter:
 *   <input class="ef-search" ...>
 *   <div class="ef-actions">
 *     <a data-action="select-all">Select all</a>
 *     <a data-action="clear">Clear</a>
 *   </div>
 *   <div class="ef-list">
 *     <label class="ef-option">
 *       <input type="checkbox" name="SelectedIds" value="...">
 *       <span class="ef-check"></span>
 *       <span class="ef-text">Label</span>
 *     </label>
 *     ...
 *   </div>
 *
 * Optional on .excel-filter:
 *   data-visible-only="true|false"   // default true (affect only visible options)
 */

(function () {
  const ROOT_SEL = '.excel-filter';
  const SEARCH_SEL = '.ef-search';
  const ACTIONS_SEL = '.ef-actions';
  const OPTION_SEL = '.ef-option';
  const TEXT_SEL = '.ef-text';
  const CHECKBOX_SEL = 'input[type="checkbox"]';

  // ---------- utils ----------
  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getConfig(root) {
    const attr = root.getAttribute('data-visible-only');
    // default true if not specified
    const visibleOnly = attr == null ? true : String(attr).toLowerCase() !== 'false';
    return { visibleOnly };
  }

  function options(root) {
    return Array.from(root.querySelectorAll(OPTION_SEL));
  }

  function optionText(opt) {
    return (opt.querySelector(TEXT_SEL)?.textContent || '').trim();
  }

  function setVisible(opt, show) {
    opt.dataset._visible = show ? '1' : '0';
    opt.style.display = show ? '' : 'none';
  }

  function isVisible(opt) {
    return opt.dataset._visible !== '0';
  }

  function selectAllButton(root) {
    return root.querySelector('[data-action="select-all"]') ||
           root.querySelectorAll(`${ACTIONS_SEL} .ef-link`)[0] || null;
  }

  function clearButton(root) {
    return root.querySelector('[data-action="clear"]') ||
           root.querySelectorAll(`${ACTIONS_SEL} .ef-link`)[1] || null;
  }

  // ---------- behaviors ----------
  function filterList(root) {
    const q = (root.querySelector(SEARCH_SEL)?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    for (const opt of options(root)) {
      const txt = optionText(opt).toLowerCase();
      const match = !q || txt.includes(q);
      setVisible(opt, match);
      if (match) visibleCount++;
    }

    // Toggle disabled style on action links when nothing is visible
    [selectAllButton(root), clearButton(root)].forEach(btn => {
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
    const { visibleOnly } = getConfig(root);
    for (const opt of options(root)) {
      if (!visibleOnly || isVisible(opt)) {
        const cb = opt.querySelector(CHECKBOX_SEL);
        if (cb && !cb.disabled) {
          cb.checked = checked;
          // If something listens for changes:
          // cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }

  function initOne(root) {
    if (!root || root.__excelFilterInit) return;
    root.__excelFilterInit = true;

    // Search
    const search = root.querySelector(SEARCH_SEL);
    if (search) {
      const onInput = debounce(() => filterList(root), 120);
      search.addEventListener('input', onInput);
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          search.value = '';
          filterList(root);
        }
      });
    }

    // Actions
    const btnAll = selectAllButton(root);
    const btnClear = clearButton(root);

    if (btnAll) {
      btnAll.addEventListener('click', (e) => {
        e.preventDefault();
        if (btnAll.classList.contains('is-disabled')) return;
        toggleAll(root, true);
      });
    }
    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.preventDefault();
        if (btnClear.classList.contains('is-disabled')) return;
        toggleAll(root, false);
      });
    }

    // Initial render
    filterList(root);
  }

  function initAll() {
    document.querySelectorAll(ROOT_SEL).forEach(initOne);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Public API (optional)
  window.ExcelFilter = { init: initAll, initOne, filterList, toggleAll };
})();
