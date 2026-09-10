// Peilige 主逻辑入口。
// 首页网站卡片由 window.PEILIGE_SITES 数据驱动生成，renderer 不感知具体站点。
(function () {
  'use strict';

  // 数据不存在或不是数组时返回空数组，保证页面不报错。
  function getSites() {
    return Array.isArray(window.PEILIGE_SITES) ? window.PEILIGE_SITES : [];
  }

  // 生成单张网站卡片。
  // 结构：article.site-card 下平级放置主链接与“了解更多”按钮，
  // 交互元素互不嵌套。
  function createSiteCard(site, index) {
    var card = document.createElement('article');
    card.className = 'site-card';

    var mainLink = document.createElement('a');
    mainLink.className = 'site-card__main';
    mainLink.href = site.url;
    mainLink.target = '_blank';
    mainLink.rel = 'noopener noreferrer';

    var name = document.createElement('h2');
    name.className = 'site-card__name';
    name.textContent = site.name;

    var title = document.createElement('p');
    title.className = 'site-card__title';
    title.textContent = site.title;

    var description = document.createElement('p');
    description.className = 'site-card__description';
    description.textContent = site.description;

    var enter = document.createElement('span');
    enter.className = 'site-card__enter';
    enter.textContent = '进入 →';
    enter.setAttribute('aria-hidden', 'true');

    mainLink.appendChild(name);
    mainLink.appendChild(title);
    mainLink.appendChild(description);
    mainLink.appendChild(enter);

    // “了解更多”按钮：仅建立 DOM hook（data-site-index），
    // Modal 行为在后续 Phase 中接入。
    var moreButton = document.createElement('button');
    moreButton.className = 'site-card__more';
    moreButton.type = 'button';
    moreButton.textContent = '了解更多';
    moreButton.setAttribute('data-site-index', String(index));

    card.appendChild(mainLink);
    card.appendChild(moreButton);

    return card;
  }

  function renderSites(sites) {
    var grid = document.getElementById('site-grid');
    if (!grid) {
      return;
    }

    grid.className = 'site-grid';
    grid.textContent = '';

    var fragment = document.createDocumentFragment();
    sites.forEach(function (site, index) {
      fragment.appendChild(createSiteCard(site, index));
    });
    grid.appendChild(fragment);
  }

  // ---------- 详情 Modal（全局唯一，所有卡片复用） ----------

  var modal = document.getElementById('site-modal');
  var modalDialog = modal ? modal.querySelector('.modal__dialog') : null;
  var modalBackdrop = modal ? modal.querySelector('.modal__backdrop') : null;
  var modalTitle = document.getElementById('site-modal-title');
  var modalSubtitle = document.getElementById('site-modal-subtitle');
  var modalDetail = document.getElementById('site-modal-detail');
  var modalFeatures = document.getElementById('site-modal-features');
  var modalEnter = document.getElementById('site-modal-enter');
  var modalClose = document.getElementById('site-modal-close');

  // 触发当前 Modal 的“了解更多”按钮，关闭时用于恢复焦点。
  var lastTrigger = null;

  // 将 site 数据写入 Modal：仅 textContent / setAttribute，不使用 innerHTML。
  function fillModal(site) {
    modalTitle.textContent = site.name;
    modalSubtitle.textContent = site.title;
    modalDetail.textContent = site.detail;

    // features 不是数组时安全回退为空数组；
    // 每次打开都清空重建，避免残留上一个站点的功能项。
    var features = Array.isArray(site.features) ? site.features : [];
    var items = document.createDocumentFragment();
    features.forEach(function (feature) {
      var item = document.createElement('li');
      item.textContent = feature;
      items.appendChild(item);
    });
    modalFeatures.replaceChildren(items);

    modalEnter.setAttribute('href', site.url);
  }

  function openModal(site, trigger) {
    if (!modal || !site) {
      return;
    }
    fillModal(site);
    lastTrigger = trigger || null;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    if (modalClose) {
      modalClose.focus();
    }
  }

  // 唯一关闭入口：关闭按钮、遮罩点击、Esc 都走这里。
  function closeModal() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTrigger && document.contains(lastTrigger)) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  // Modal 内可聚焦元素（关闭按钮与“进入网站”链接）。
  function getModalFocusables() {
    if (!modalDialog) {
      return [];
    }
    return Array.prototype.slice.call(
      modalDialog.querySelectorAll('a[href], button:not([disabled])')
    );
  }

  // 基础 focus trap：Tab / Shift+Tab 只在 Modal 内循环，不跑到背景页面。
  function handleModalTabKey(event) {
    var focusables = getModalFocusables();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    var activeIndex = focusables.indexOf(document.activeElement);
    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      }
    } else if (activeIndex === -1 || activeIndex === focusables.length - 1) {
      event.preventDefault();
      focusables[0].focus();
    }
  }

  // 点击“了解更多”：按 data-site-index 定位 site，打开统一 Modal。
  // 索引缺失 / 非数字 / 越界时安全 return。
  function handleGridClick(event) {
    var button = event.target.closest('.site-card__more');
    if (!button) {
      return;
    }
    event.preventDefault();

    var rawIndex = button.getAttribute('data-site-index');
    if (rawIndex === null || rawIndex.trim() === '') {
      return;
    }
    var index = Number(rawIndex);
    var sites = getSites();
    if (!Number.isInteger(index) || index < 0 || index >= sites.length) {
      return;
    }
    openModal(sites[index], button);
  }

  function setupModal() {
    if (!modal) {
      return;
    }

    var grid = document.getElementById('site-grid');
    if (grid) {
      grid.addEventListener('click', handleGridClick);
    }
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
      // 遮罩与正文是兄弟节点：正文内点击不会落到遮罩上，无需额外判断。
      modalBackdrop.addEventListener('click', closeModal);
    }
    document.addEventListener('keydown', function (event) {
      if (modal.hidden) {
        return;
      }
      if (event.key === 'Escape') {
        closeModal();
      } else if (event.key === 'Tab') {
        handleModalTabKey(event);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSites(getSites());
    setupModal();
  });
})();
