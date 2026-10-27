/* ============================================================
   Act Product — կայքի տրամաբանությունը
   1. Helpers & texts   2. Toast   3. Menu
   4. Cart (store + UI) 5. Catalog (search/filter)
   6. Contact form      7. Anchors & back-to-top
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Helpers & texts ---------- */
  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  };


  /* ---------- Պատկերակներ (SVG, ոչ թե սիմվոլներ/էմոջիներ) ---------- */
  function svgIcon(inner, size, extra) {
    return '<svg class="ic" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra || '') + '>' + inner + '</svg>';
  }
  var ICONS = {
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>'
  };
  function iconHTML(name, size) { return svgIcon(ICONS[name], size || 16); }
  var STAR_PATH = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
  function starHTML(on, size) {
    return '<svg class="star ' + (on ? 'on' : 'off') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' + STAR_PATH + '</svg>';
  }
  function starsRowHTML(value, size) {
    var h = '';
    for (var i = 1; i <= 5; i++) h += starHTML(i <= value, size || 16);
    return h;
  }
  function markHTML(picked) {
    return picked ? iconHTML('check', 14) + '<span>' + t('marked').replace('✓', '').trim() + '</span>'
                  : iconHTML('plus', 14) + '<span>' + t('markAdd').replace('+', '').trim() + '</span>';
  }

  var CART_KEY = 'act-product-cart';
  var PROMO_KEY = 'act-promo';
  var LANG_KEY = 'act-lang';
  var PROMOS = { STUDENT10: 10 };

  var STR = window.ACT_TRANSLATIONS;

  /* Browser storage with a session fallback when persistent storage is blocked. */
  var MEM_STORE = {};
  var storeTested = false;
  var storeAvailable = false;
  function canUseStore() {
    if (!storeTested) {
      storeTested = true;
      try {
        localStorage.setItem('__act_test', '1');
        localStorage.removeItem('__act_test');
        storeAvailable = true;
      } catch (e) { storeAvailable = false; }
    }
    return storeAvailable;
  }
  function storeGet(key) {
    if (!canUseStore()) return (key in MEM_STORE) ? MEM_STORE[key] : null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    if (!canUseStore()) { MEM_STORE[key] = String(value); return true; }
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  var lang = 'hy';
  try {
    var urlLangM = /(?:\?|&)lang=(hy|en)(?:&|#|$)/.exec(location.search);
    var savedLang = storeGet(LANG_KEY);
    if (urlLangM) {
      lang = urlLangM[1];
      storeSet(LANG_KEY, lang);
    } else if (savedLang === 'hy' || savedLang === 'en') {
      lang = savedLang;
    }
  } catch (e) {}

  function t(key, vars) {
    var s = (STR[lang] && STR[lang][key]) || STR.hy[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === '') return t('pricePending');
    return Number(value).toLocaleString(lang === 'en' ? 'en-US' : 'hy-AM') + ' ֏';
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { fn.apply(null, args); }, delay);
    };
  }

  /* ---------- DOM cache ---------- */
  var cartToggle = $('#cartToggle');
  var cartSidebar = $('#cartSidebar');
  var cartOverlay = $('#cartOverlay');
  var cartClose = $('#cartClose');
  var cartBadge = $('#cartBadge');
  var cartItems = $('#cartItems');
  var cartFooter = $('#cartFooter');
  var cartTotal = $('#cartTotal');
  var cartCheckout = $('#cartCheckout');
  var productSearch = $('#productSearch');
  var searchClear = $('#searchClear');
  var productCards = $$('.product-card');
  var filterButtons = $$('.filter-btn');
  var noResults = $('#noResults');
  var resultsCount = $('#resultsCount');
  var doneOverlay = $('#doneOverlay');
  var doneModal = $('#doneModal');
  var doneClose = $('#doneClose');
  var backToTop = $('#backToTop');
  var toastContainer = $('#toastContainer');
  var langToggle = $('#langToggle');
  var promoInput = $('#promoInput');
  var promoApply = $('#promoApply');
  var promoMsg = $('#promoMsg');
  var promoLine = $('#promoLine');
  var promoLabel = $('#promoLabel');
  var promoAmount = $('#promoAmount');
  var sortSelect = $('#sortSelect');
  var qvOverlay = $('#qvOverlay');
  var qvModal = $('#qvModal');
  var qvClose = $('#qvClose');
  var qvMedia = $('#qvMedia');
  var qvImg = $('#qvImg');
  var qvType = $('#qvType');
  var qvName = $('#qvName');
  var qvPrice = $('#qvPrice');
  var qvSpecs = $('#qvSpecs');
  var qvAvail = $('#qvAvail');
  var qvBadge = $('#qvBadge');
  var qvAdd = $('#qvAdd');
  var coOverlay = $('#coOverlay');
  var coModal = $('#coModal');
  var coClose = $('#coClose');
  var coForm = $('#coForm');
  var coTotal = $('#coTotal');
  var coName = $('#coName');
  var coPhone = $('#coPhone');
  var coAddress = $('#coAddress');
  var coComment = $('#coComment');
  var activeFilter = 'all';
  var activeSort = 'default';

  /* ---------- 2. Toast ---------- */
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add('out');
      window.setTimeout(function () { toast.remove(); }, 220);
    }, 2200);
  }

  /* ---------- 4. Cart ---------- */
  function loadCart() {
    try {
      var saved = JSON.parse(storeGet(CART_KEY));
      return Array.isArray(saved) ? saved.filter(function (item) { return item && typeof item.name === 'string' && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0; }) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    storeSet(CART_KEY, JSON.stringify(cart));
  }

  var cart = loadCart();

  function getCartCount() {
    return cart.reduce(function (total, item) { return total + item.quantity; }, 0);
  }

  function getCartTotal() {
    return cart.reduce(function (total, item) { return total + item.price * item.quantity; }, 0);
  }

  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    cartSidebar.setAttribute('aria-hidden', 'false');
    cartOverlay.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    cartClose.focus();
  }

  function closeCart(restoreFocus) {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartSidebar.setAttribute('aria-hidden', 'true');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (restoreFocus !== false) cartToggle.focus();
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', function () { closeCart(true); });
  cartOverlay.addEventListener('click', function () { closeCart(true); });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!$('#productPickerPanel').hidden) { closeFinder(true); return; }
    if (sharePanel && !sharePanel.hidden) { closeSharePanel(true); return; }
    if (coModal && coModal.classList.contains('open')) { closeCheckout(); return; }
    var ordMd = $('#ordModal');
    if (ordMd && ordMd.classList.contains('open')) { closeOrders(); return; }
    if (doneModal.classList.contains('open')) closeDone();
    if (qvModal.classList.contains('open')) closeQuickView(true);
    if (cartSidebar.classList.contains('open')) closeCart(true);

  });

  function updateCartBadge() {
    var count = getCartCount();
    cartBadge.textContent = count;
    cartBadge.style.display = count ? 'grid' : 'none';
    cartToggle.setAttribute('aria-label',
      count ? t('cartOpenCount', { c: count }) : t('cartOpenEmpty'));
  }

  function buildCartItem(item, index) {
    var el = document.createElement('article');
    el.className = 'cart-item';

    var top = document.createElement('div');
    top.className = 'cart-item-top';

    var info = document.createElement('div');
    var nameEl = document.createElement('p');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = displayName(item.name);
    var priceEl = document.createElement('p');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = formatPrice(item.price) + ' / ' + t('perItem');
    info.appendChild(nameEl);
    info.appendChild(priceEl);

    var removeBtn = document.createElement('button');
    removeBtn.className = 'cart-item-remove';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', t('removeItem'));
    removeBtn.textContent = t('remove');
    removeBtn.addEventListener('click', function () { removeCartItem(index); });

    top.appendChild(info);
    top.appendChild(removeBtn);

    var controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    var qty = document.createElement('div');
    qty.className = 'quantity-control';
    qty.setAttribute('aria-label', t('quantity'));

    var minus = document.createElement('button');
    minus.className = 'quantity-minus';
    minus.type = 'button';
    minus.setAttribute('aria-label', t('decreaseQty'));
    minus.innerHTML = iconHTML('minus', 16);
    minus.addEventListener('click', function () { changeQuantity(index, -1); });

    var count = document.createElement('span');
    count.textContent = item.quantity;

    var plus = document.createElement('button');
    plus.className = 'quantity-plus';
    plus.type = 'button';
    plus.setAttribute('aria-label', t('increaseQty'));
    plus.innerHTML = iconHTML('plus', 16);
    plus.addEventListener('click', function () { changeQuantity(index, 1); });

    qty.appendChild(minus);
    qty.appendChild(count);
    qty.appendChild(plus);

    var subtotal = document.createElement('strong');
    subtotal.className = 'cart-item-subtotal';
    subtotal.textContent = formatPrice(item.price * item.quantity);

    controls.appendChild(qty);
    controls.appendChild(subtotal);

    el.appendChild(top);
    el.appendChild(controls);
    return el;
  }

  function renderCart() {
    updateCartBadge();
    cartItems.innerHTML = '';

    if (!cart.length) {
      var empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = t('cartEmpty');
      cartItems.appendChild(empty);
      cartFooter.hidden = true;
      return;
    }

    cart.forEach(function (item, index) {
      cartItems.appendChild(buildCartItem(item, index));
    });

    var subtotal = getCartTotal();
    var discount = getDiscountAmount(subtotal);
    cartTotal.textContent = formatPrice(subtotal - discount);
    cartFooter.hidden = false;

    if (discount > 0 && appliedPromo) {
      promoLabel.textContent = t('promoLabel', { c: appliedPromo, p: PROMOS[appliedPromo] });
      promoAmount.textContent = '−' + formatPrice(discount);
      promoLine.hidden = false;
    } else {
      promoLine.hidden = true;
    }

  }

  function getDiscountAmount(subtotal) {
    if (!appliedPromo || !PROMOS[appliedPromo]) return 0;
    return Math.round(subtotal * PROMOS[appliedPromo] / 100);
  }


  function addToCart(name, price, category, silent) {
    if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price))) { showToast(t('pricePending')); return; }
    var existing = cart.find(function (item) { return item.name === name; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: name, price: Number(price), category: category, quantity: 1 });
    }
    saveCart();
    renderCart();
    if (!silent) showToast(t('inCart', { n: displayName(name) }));
  }

  function changeQuantity(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function removeCartItem(index) {
    var removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showToast(t('removedFromCart', { n: displayName(removedName) }));
  }


  // Event delegation: WB-style — add button adds directly, card/media opens quick view
  var productsGrid = $('#productsGrid');
  if (productsGrid) {
    productsGrid.addEventListener('click', function (event) {
      var markBtn = event.target.closest('.btn-mark');
      if (markBtn) {
        var mcard = markBtn.closest('.product-card');
        var mbtn = mcard ? mcard.querySelector('.btn-add-cart') : null;
        var mname = mbtn ? mbtn.dataset.name : '';
        if (mname) {
          if (isSelected(mname)) {
            delete selected[mname];
            mcard.classList.remove('picked');
            markBtn.classList.remove('picked');
            markBtn.innerHTML = markHTML(false);
          } else {
            selected[mname] = true;
            mcard.classList.add('picked');
            markBtn.classList.add('picked');
            markBtn.innerHTML = markHTML(true);
          }
          delete mcard._t; delete mcard._l; delete mcard._d;
          if (activeFilter === 'sel') {
            if (!selectedCount()) {
              activeFilter = 'all';
              filterButtons.forEach(function (item) {
                var isA = item.dataset.filter === 'all';
                item.classList.toggle('active', isA);
                item.setAttribute('aria-pressed', String(isA));
              });
              refreshCatTitle();
            }
            filterProducts();
          }
          updateSelBar();
        }
        return;
      }
      var favBtn = event.target.closest('.fav-btn');
      if (favBtn) {
        var fcard = favBtn.closest('.product-card');
        var fbtn = fcard ? fcard.querySelector('.btn-add-cart') : null;
        var fname = fbtn ? fbtn.dataset.name : '';
        if (fname) {
          toggleFav(fname);
          var on = isFav(fname);
          favBtn.classList.toggle('on', on);
          favBtn.setAttribute('aria-pressed', String(on));
          if (activeFilter === 'fav' && !on) filterProducts();
        }
        return;
      }
      var addBtn = event.target.closest('.btn-add-cart');
      if (addBtn) {
        addToCart(addBtn.dataset.name, addBtn.dataset.price, addBtn.dataset.category);
        return;
      }
      var card = event.target.closest('.product-card');
      if (card) openQuickView(card);
    });
    productsGrid.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var media = event.target.closest('.product-media');
      if (media && event.target === media) {
        event.preventDefault();
        var card = media.closest('.product-card');
        if (card) openQuickView(card);
      }
    });
  }

  var selAdd = $('#selAdd'), selClear = $('#selClear');
  if (selAdd) selAdd.addEventListener('click', function () {
    var names = Object.keys(selected);
    if (!names.length) return;
    var added = 0;
    names.forEach(function (n) {
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].hy.name === n) { addToCart(n, PRODUCTS[i].price, PRODUCTS[i].cat, true); added++; break; }
      }
    });
    clearSelection();
    showToast(t('addedMany', { n: added }));
  });
  if (selClear) selClear.addEventListener('click', clearSelection);

  cartCheckout.addEventListener('click', function () {
    if (!cart.length) return;
    openCheckout();
  });

  /* ---------- 5. Catalog: 50 products, data-driven ---------- */
  var PRODUCTS = (window.ACT_PHOTO_PRODUCTS || []).concat(window.ACT_CATALOG_PRODUCTS || []);
  var productByName = {};
  PRODUCTS.forEach(function (p) { productByName[p.hy.name] = p; });
  function displayName(name) { var p = productByName[name]; return p ? p[lang].name : name; }


  /* Favorites */
  var FAV_KEY = 'act-product-favs';
  function loadFavs() {
    try { var a = JSON.parse(storeGet(FAV_KEY)); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  var favs = loadFavs();
  function isFav(n) { return favs.indexOf(n) !== -1; }
  function saveFavs() { storeSet(FAV_KEY, JSON.stringify(favs)); }
  function toggleFav(n) {
    var i = favs.indexOf(n);
    if (i === -1) favs.push(n); else favs.splice(i, 1);
    saveFavs();
    updateFavBtn();
  }
  function updateFavBtn() {
    var b = document.querySelector('[data-filter="fav"]');
    if (!b) return;
    var label = t('fFav').replace('♡', '').trim();
    b.innerHTML = iconHTML('heart', 16) + '<span>' + label + '</span>' + (favs.length ? ' <span class="fav-count">' + favs.length + '</span>' : '');
    b.setAttribute('aria-label', label + (favs.length ? ': ' + favs.length : ''));
    b.title = label;
    b.classList.toggle('has-favs', favs.length > 0);
  }

  /* Multi-select: mark 2,3,4... products, add them together */
  var selected = {};
  function isSelected(name) { return !!selected[name]; }
  function selectedCount() { return Object.keys(selected).length; }
  function updateSelBar() {
    var bar = $('#selBar'), cnt = $('#selCount'), tot = $('#selTotal');
    var names = Object.keys(selected);
    var sum = 0;
    names.forEach(function (n) {
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].hy.name === n) { sum += PRODUCTS[i].price; break; }
      }
    });
    if (bar) bar.hidden = names.length === 0;
    if (cnt) cnt.textContent = t('selectedCount', { n: names.length });
    if (tot) tot.textContent = formatPrice(sum);
  }
  function clearSelection() {
    selected = {};
    $$('#productsGrid .btn-mark.picked').forEach(function (b) { b.classList.remove('picked'); b.innerHTML = markHTML(false); });
    $$('#productsGrid .product-card.picked').forEach(function (c) { c.classList.remove('picked'); });
    if (activeFilter === 'sel') {
      activeFilter = 'all';
      filterButtons.forEach(function (item) {
        var isActive = item.dataset.filter === 'all';
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      refreshCatTitle();
      filterProducts();
    }
    updateSelBar();
  }
  var selView = $('#selView');
  if (selView) selView.addEventListener('click', function () {
    if (!selectedCount()) return;
    activeFilter = 'sel';
    filterButtons.forEach(function (item) {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });
    refreshCatTitle();
    applySort();
    filterProducts();
    var sec = $('#products');
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function productRating(name) {
    var votes = [];
    try { var r = Number(loadRatings()[name]); if (r) votes.push(r); } catch (e) {}
    try { ((loadRevs()[name]) || []).forEach(function (rv) { if (rv.stars) votes.push(rv.stars); }); } catch (e) {}
    if (!votes.length) return '<p class="card-rating new">' + starHTML(false, 14) + ' ' + t('isNew') + '</p>';
    var avg = votes.reduce(function (a, b) { return a + b; }, 0) / votes.length;
    return '<p class="card-rating">' + starHTML(true, 14) + ' ' + avg.toFixed(1).replace('.', ',') + ' · ' + votes.length + '</p>';
  }

  function buildCard(p, index) {
    var d = (lang === 'en') ? p.en : p.hy;
    var card = document.createElement('article');
    card.className = 'product-card' + (isSelected(p.hy.name) ? ' picked' : '');
    card.dataset.category = p.cat;
    card.dataset.index = index;
    card.dataset.badge = p.badge;
    card.dataset.pending = p.price == null ? 'true' : 'false';
    if (p.gallery) card.classList.add('photo-product');
    var badgeText = t(p.badge);
    var stockClass = p.badge === 'bMade' ? 'avail-made' : (p.badge === 'bUnique' ? 'avail-last' : 'avail-in');
    var safeName = d.name.replace(/"/g, '&quot;');
    var disc = (p.old && p.old > p.price) ? Math.round((1 - p.price / p.old) * 100) : 0;
    card.innerHTML =
      '<div class="product-media" tabindex="0" role="button" aria-label="' + safeName + '"><span class="product-badge">' + badgeText + '</span>' +
      (disc ? '<span class="product-discount">−' + disc + '%</span>' : '') +
      '<button class="fav-btn' + (isFav(p.hy.name) ? ' on' : '') + '" type="button" aria-pressed="' + isFav(p.hy.name) + '" aria-label="' + t('favAria') + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true"><path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z"/></svg></button>' +
      '<img class="product-art" src="' + (p.thumb || p.img) + '" alt="' + safeName + '" width="480" height="480" loading="lazy" decoding="async">' + (p.gallery ? '<span class="gallery-count">' + t(p.gallery.some(function (m) { return m.type === 'video'; }) ? 'galleryMedia' : p.gallery.length === 1 ? 'galleryImage' : 'galleryImages', { n: p.gallery.filter(function (m) { return m.type === 'image'; }).length }) + '</span>' : '') + '</div>' +
      '<div class="product-info"><h3 class="product-name">' + d.name + '</h3>' +
      '<p class="product-type">' + d.type + '</p>' +
      '<p class="product-specs">' + d.specs + '</p>' +
      '<p class="price">' + formatPrice(p.price) + (p.old && p.old > p.price ? '<s class="old-price">' + formatPrice(p.old) + '</s>' : '') + '</p>' +
      productRating(p.hy.name) +
      '<p class="availability ' + stockClass + '"><span class="dot" aria-hidden="true"></span>' + d.avail + '</p>' +
      '<div class="product-actions"><button class="btn-add-cart" type="button" aria-label="' + t('add') + ': ' + safeName + '">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>' +
      '<span>' + t('add') + '</span></button>' +
      '<button class="btn-mark' + (isSelected(p.hy.name) ? ' picked' : '') + '" type="button">' + markHTML(isSelected(p.hy.name)) + '</button></div></div>';
    var btn = card.querySelector('.btn-add-cart');
    btn.dataset.name = p.hy.name;
    btn.dataset.price = p.price == null ? '' : p.price;
    if (p.price == null) {
      btn.disabled = true; btn.querySelector('span').textContent = t('pricePending');
      var mark = card.querySelector('.btn-mark'); mark.disabled = true;
    }
    btn.dataset.category = p.cat;
    return card;
  }

  function renderProducts() {
    if (!productsGrid) return;
    var frag = document.createDocumentFragment();
    PRODUCTS.forEach(function (p, i) {
      frag.appendChild(buildCard(p, i));
    });
    productsGrid.innerHTML = '';
    productsGrid.appendChild(frag);
    productCards = $$('.product-card');
  }

  /* Latin → հայերեն որոնում. ապրանքի տեքստը դարձնում ենք latin, համեմատում ենք */
  var HY2LAT = { 'ա':'a','բ':'b','գ':'g','դ':'d','ե':'e','զ':'z','է':'e','ը':'y','թ':'t','ժ':'zh','ի':'i','լ':'l','խ':'kh','ծ':'ts','կ':'k','հ':'h','ձ':'dz','ղ':'gh','ճ':'ch','մ':'m','յ':'y','ն':'n','շ':'sh','ո':'o','չ':'ch','պ':'p','ջ':'j','ռ':'r','ս':'s','վ':'v','տ':'t','ր':'r','ց':'c','ւ':'u','փ':'p','ք':'q','օ':'o','ֆ':'f','և':'ev' };
  function toLatin(s) {
    s = (s || '').toLocaleLowerCase('hy-AM');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (s.substr(i, 2) === 'ու') { out += 'u'; i++; continue; }
      var ch = s[i];
      out += (HY2LAT[ch] !== undefined) ? HY2LAT[ch] : ch;
    }
    return out;
  }

  /* Latin fold: jamanak=xorovac style spelling (zh→j, kh/gh→x, ts→c) */
  function latFold(s) {
    return (s || '').replace(/zh/g, 'j').replace(/kh/g, 'x').replace(/gh/g, 'x').replace(/ts/g, 'c');
  }

  /* ---------- 5b. Catalog filter/sort with show-more ---------- */
  function matchedCards() {
    var rawQ = productSearch.value.trim();
    var q = rawQ.toLocaleLowerCase('hy-AM');
    var qlat = latFold(rawQ.toLowerCase());
    var qdig = rawQ.replace(/[,\s․]/g, '');
    return productCards.filter(function (card) {
      var matchesCategory;
      if (activeFilter === 'fav') {
        var nbf = card.querySelector('.btn-add-cart');
        matchesCategory = nbf ? isFav(nbf.dataset.name) : false;
      } else if (activeFilter === 'sel') {
        var nbs = card.querySelector('.btn-add-cart');
        matchesCategory = nbs ? isSelected(nbs.dataset.name) : false;
      } else {
        matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      }
      if (!matchesCategory) return false;
      if (!rawQ) return true;
      if (card._t === undefined) {
        var p = PRODUCTS[Number(card.dataset.index)];
        card._t = (Object.values(p.hy).join(' ') + ' ' + Object.values(p.en).join(' ') + ' ' + (p.price == null ? '' : p.price)).toLocaleLowerCase('hy-AM');
        card._l = latFold(toLatin(card._t));
        card._d = card._t.replace(/[,\s․]/g, '');
      }
      return card._t.indexOf(q) !== -1 || card._l.indexOf(qlat) !== -1 ||
        (qdig && card._d.indexOf(qdig) !== -1);
    });
  }

  function filterProducts() {
    var matched = matchedCards();
    productCards.forEach(function (card) { card.hidden = true; });
    matched.forEach(function (card) { card.hidden = false; });
    noResults.hidden = matched.length !== 0;
    searchClear.hidden = !productSearch.value;
    var query = productSearch.value.trim();
    if (!matched.length) {
      resultsCount.textContent = '';
    } else if (query || activeFilter !== 'all') {
      resultsCount.textContent = t('resultsFound', { n: matched.length });
    } else {
      resultsCount.textContent = t('resultsAll', { n: matched.length });
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter;
      productSearch.value = '';
      filterButtons.forEach(function (item) {
        var isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      applySort();
      filterProducts();
      refreshCatTitle();
      var sec = $('#products');
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var FILTER_TITLE = { all: 'catTitle', textile: 'fTextile', art: 'fArt', accessory: 'fAccessory', ceramic: 'fCeramic', cs: 'fCS', digitalart: 'fDigitalArt', engineer: 'fEngineer', fav: 'fFav', sel: 'selTitle' };
  function updateFilterCounts() {
    var counts = { all: PRODUCTS.length, textile: 0, art: 0, accessory: 0, ceramic: 0, cs: 0, digitalart: 0, engineer: 0 };
    PRODUCTS.forEach(function (p) { if (counts[p.cat] !== undefined) counts[p.cat]++; });
    filterButtons.forEach(function (b) {
      var f = b.dataset.filter;
      if (f === 'fav') return;
      b.textContent = t(FILTER_TITLE[f] || 'catTitle') + ' · ' + (counts[f] !== undefined ? counts[f] : counts.all);
    });
    updateFavBtn();
  }
  function refreshCatTitle() {
    var el = $('#catTitle');
    var stat = $('#productStat'); if (stat) stat.textContent = PRODUCTS.length;
    if (el) el.textContent = t(FILTER_TITLE[activeFilter] || 'catTitle');
    document.body.classList.toggle('cat-filtered', activeFilter !== 'all');
  }

  function cardPrice(card) {
    return card.dataset.pending === 'true' ? null : Number(card.querySelector('.btn-add-cart').dataset.price);
  }

  function applySort() {
    var grid = $('#productsGrid');
    if (!grid) return;
    var sorted = productCards.slice();
    if (activeSort === 'asc') {
      sorted.sort(function (a, b) { var x = cardPrice(a), y = cardPrice(b); return x === null ? (y === null ? 0 : 1) : y === null ? -1 : x - y; });
    } else if (activeSort === 'desc') {
      sorted.sort(function (a, b) { var x = cardPrice(a), y = cardPrice(b); return x === null ? (y === null ? 0 : 1) : y === null ? -1 : y - x; });
    } else {
      sorted.sort(function (a, b) { return a.dataset.index - b.dataset.index; });
    }
    sorted.forEach(function (card) { grid.appendChild(card); });
  }

  sortSelect.addEventListener('change', function () {
    activeSort = sortSelect.value;
    applySort();
    filterProducts();
  });

  productSearch.addEventListener('input', debounce(filterProducts, 120));

  function submitProductSearch() {
    filterProducts();
    productSearch.blur();
  }
  $('#searchSubmit').addEventListener('click', submitProductSearch);

  productSearch.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitProductSearch();
    }
    if (event.key === 'Escape' && productSearch.value) {
      productSearch.value = '';
      filterProducts();
      productSearch.blur();
    }
  });

  // Press "/" anywhere to jump to search
  document.addEventListener('keydown', function (event) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      productSearch.focus();
    }
  });
  searchClear.addEventListener('click', function () {
    productSearch.value = '';
    filterProducts();
    productSearch.focus();
  });

  /* ---------- 6. Contact form ---------- */
  function setFieldError(input, message) {
    input.dataset.errorKey = Object.keys(STR[lang]).find(function (key) { return STR[lang][key] === message; }) || '';
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    var error = input.parentElement.querySelector('.field-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'field-error';
      input.insertAdjacentElement('afterend', error);
    }
    error.textContent = message;
    error.classList.add('show');
  }

  function clearFieldError(input) {
    delete input.dataset.errorKey;
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    var error = input.parentElement.querySelector('.field-error');
    if (error) error.classList.remove('show');
  }

  // Հայկական օպերատորների ու քաղաքային կոդեր (2 թվանշան)
  var AM_OPERATORS = ['10', '11', '12', '22', '23', '24', '25', '26', '28', '31', '32',
    '33', '41', '43', '44', '46', '55', '66', '77', '91', '93', '94', '95', '96', '97', '98', '99'];

  // Վերադարձնում է նորմալացված համարը (374XXXXXXXX) կամ null, եթե սխալ է
  function normalizeAmPhone(value) {
    var trimmed = value.trim();
    var hasPlus = trimmed.charAt(0) === '+';
    var digits = trimmed.replace(/\D/g, '');
    if (hasPlus && digits.indexOf('374') === 0) {
      digits = digits.slice(3);
    } else if (digits.length === 11 && digits.indexOf('374') === 0) {
      digits = digits.slice(3);
    } else if (digits.length === 9 && digits.charAt(0) === '0') {
      digits = digits.slice(1);
    }
    if (!/^\d{8}$/.test(digits)) return null;
    if (AM_OPERATORS.indexOf(digits.slice(0, 2)) === -1) return null;
    return '374' + digits;
  }

  // Կենդանի դիմակ․ համարը գրելուն պես դասավորում է «077 123 456»
  // և ավելորդ թվանշան գրել չի թողնում։ Էլ. փոստին չի կպնում։
  function maskAmPhone(value) {
    if (/[a-zA-Z@]/.test(value)) return null;
    var trimmed = value.trim();
    var hasPlus = trimmed.charAt(0) === '+';
    var digits = trimmed.replace(/\D/g, '');
    if (hasPlus || digits.indexOf('374') === 0) {
      if (digits.indexOf('374') !== 0) digits = '374' + digits;
      digits = digits.slice(0, 11);
      var rest = digits.slice(3);
      var out = '+374';
      if (rest.length > 0) out += ' ' + rest.slice(0, 2);
      if (rest.length > 2) out += ' ' + rest.slice(2, 5);
      if (rest.length > 5) out += ' ' + rest.slice(5, 8);
      return out;
    }
    digits = digits.slice(0, 9);
    var local = digits.slice(0, 3);
    if (digits.length > 3) local += ' ' + digits.slice(3, 6);
    if (digits.length > 6) local += ' ' + digits.slice(6, 9);
    return local;
  }

  /* ---------- 6f. Success popup ---------- */
  var doneTimer = null;

  function showDone() {
    doneModal.classList.add('open');
    doneOverlay.classList.add('open');
    doneModal.setAttribute('aria-hidden', 'false');
    doneOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    doneClose.focus();
    window.clearTimeout(doneTimer);
    doneTimer = window.setTimeout(closeDone, 3500);
  }

  function closeDone() {
    doneModal.classList.remove('open');
    doneOverlay.classList.remove('open');
    doneModal.setAttribute('aria-hidden', 'true');
    doneOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.clearTimeout(doneTimer);
  }

  doneClose.addEventListener('click', closeDone);
  doneOverlay.addEventListener('click', closeDone);

  /* ---------- 6g. Checkout modal (վճարում՝ կանխիկ ստանալիս) ---------- */

  function renderCheckoutSummary() {
    var subtotal = getCartTotal();
    var discount = getDiscountAmount(subtotal);
    coTotal.textContent = formatPrice(subtotal - discount);
    var list = $('#coItems');
    list.replaceChildren();
    cart.forEach(function (item) {
      var row = document.createElement('li');
      var label = document.createElement('span');
      var amount = document.createElement('strong');
      label.textContent = displayName(item.name) + ' × ' + item.quantity;
      amount.textContent = formatPrice(item.price * item.quantity);
      row.appendChild(label); row.appendChild(amount); list.appendChild(row);
    });
    var discountLine = $('#coDiscount');
    discountLine.hidden = discount <= 0;
    discountLine.textContent = t('coDiscount') + ': −' + formatPrice(discount);
  }

  function openCheckout() {
    if (!coModal || !cart.length) return;
    renderCheckoutSummary();
    closeCart(false);
    coModal.classList.add('open');
    coOverlay.classList.add('open');
    coModal.setAttribute('aria-hidden', 'false');
    coOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(function () { if (coName) coName.focus(); }, 60);
  }

  function closeCheckout() {
    if (!coModal) return;
    coModal.classList.remove('open');
    coOverlay.classList.remove('open');
    coModal.setAttribute('aria-hidden', 'true');
    coOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (coClose) coClose.addEventListener('click', closeCheckout);
  if (coOverlay) coOverlay.addEventListener('click', closeCheckout);
  function closeOnBackdrop(modal, close) {
    if (!modal) return;
    var startedOnBackdrop = false;
    modal.addEventListener('pointerdown', function (event) { startedOnBackdrop = event.target === modal; });
    modal.addEventListener('click', function (event) {
      if (event.target === modal && startedOnBackdrop) close();
      startedOnBackdrop = false;
    });
  }
  closeOnBackdrop(coModal, closeCheckout);
  closeOnBackdrop($('#doneModal'), closeDone);
  if (coPhone && typeof maskAmPhone === 'function') {
    coPhone.addEventListener('input', function () {
      var masked = maskAmPhone(coPhone.value);
      if (masked !== null && masked !== coPhone.value) coPhone.value = masked;
      clearFieldError(coPhone);
    });
  }
  if (coName) {
    coName.addEventListener('input', function () {
      clearFieldError(coName);
    });
  }
  [coAddress, coComment].forEach(function (input) {
    if (input) input.addEventListener('input', function () { clearFieldError(input); });
  });
  if (coForm) {
    coForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;
      if (!coName || coName.value.trim().length < 2) {
        if (coName) { setFieldError(coName, t('errName')); firstInvalid = firstInvalid || coName; }
      }
      var phoneVal = coPhone ? coPhone.value.trim() : '';
      if (!phoneVal) {
        setFieldError(coPhone, t('errContactEmpty'));
        firstInvalid = firstInvalid || coPhone;

      } else if (!normalizeAmPhone(phoneVal)) {
        setFieldError(coPhone, t('errPhoneInvalid'));
        firstInvalid = firstInvalid || coPhone;
      }
      if (!coAddress || coAddress.value.trim().length < 5) {
        if (coAddress) { setFieldError(coAddress, t('errAddress')); firstInvalid = firstInvalid || coAddress; }
      }
      if (!cart.length) { closeCheckout(); showToast(t('cartEmpty')); return; }
      if (firstInvalid) { firstInvalid.focus(); return; }
      try {
        var st = getCartTotal();
        var dc = getDiscountAmount(st);
        var orders = loadOrders();
        orders.unshift({
          id: Date.now(),
          code: newOrderCode(),
          status: 'draft',
          statusHistory: [{status:'draft', timestamp:Date.now()}],
          timestamp: Date.now(),
          total: st - dc,
          pay: 'cash',
          name: coName.value.trim(),
          phone: normalizeAmPhone(phoneVal),
          address: coAddress ? coAddress.value.trim() : '',
          comment: coComment ? coComment.value.trim() : '',
          items: cart.map(function (it) { return { n: it.name, q: it.quantity, price: it.price }; })
        });
        if (!storeSet(ORD_KEY, JSON.stringify(orders.slice(0, 20)))) throw new Error('Storage unavailable');
      } catch (e) { showToast(t('customSaveError')); return; }
      closeCheckout();
      cart = [];
      saveCart();
      renderCart();
      coForm.reset();
      [coName, coPhone, coAddress, coComment].forEach(function (i) { if (i) clearFieldError(i); });
      showDone();
    });
  }

  /* ---------- Orders history ---------- */
  var ORD_KEY = 'act-product-orders';
  function loadOrders() {
    try { var a = JSON.parse(storeGet(ORD_KEY)); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function openOrders() {
    renderOrders();
    var ov = $('#ordOverlay'), md = $('#ordModal');
    if (!md) return;
    md.classList.add('open');
    if (ov) ov.classList.add('open');
    md.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var c = $('#ordClose');
    if (c) c.focus();
  }
  function closeOrders() {
    var ov = $('#ordOverlay'), md = $('#ordModal');
    if (!md) return;
    md.classList.remove('open');
    if (ov) ov.classList.remove('open');
    md.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  var ordersToggle = $('#ordersToggle');
  if (ordersToggle) ordersToggle.addEventListener('click', openOrders);
  var ordClose = $('#ordClose'), ordOverlay = $('#ordOverlay');
  if (ordClose) ordClose.addEventListener('click', closeOrders);
  if (ordOverlay) ordOverlay.addEventListener('click', closeOrders);
  closeOnBackdrop($('#ordModal'), closeOrders);

  /* ---------- 6b. Quick view ---------- */
  var CAT_DESC = {
    textile: {
      hy: 'Ձեռագործ տեքստիլ։ Յուրաքանչյուր օրինակ եզակի է. գույնը և մանր դետալները կարող են փոքր-ինչ տարբերվել նկարից։',
      en: 'Handmade textile. Each piece is unique — colors and small details may slightly differ from the photo.'
    },
    art: {
      hy: 'Հեղինակային աշխատանք։ Օրիգինալ կամ սահմանափակ տպաքանակով արտադրանք։',
      en: 'Original artwork. An original or limited-edition piece.'
    },
    accessory: {
      hy: 'Ձեռագործ աքսեսուար։ Հարմար է ամենօրյա օգտագործման և նվերի համար։',
      en: 'Handmade accessory. Suitable for everyday use and as a gift.'
    },
    ceramic: {
      hy: 'Ձեռագործ կավագործություն՝ թրծված և ձեռքով ներկված։ Յուրաքանչյուր օրինակ եզակի է։',
      en: 'Handmade ceramics — fired and hand-painted. Each piece is unique.'
    },
    cs: {
      hy: 'Տեխնոլոգիական աքսեսուարներ՝ ստեղծված քոլեջի ուսանողների կողմից։',
      en: 'Tech accessories made by college students.'
    },
    digitalart: {
      hy: 'Թվային նկարչություն՝ տպագրված բարձր որակով։',
      en: 'Digital artwork printed in high quality.'
    },
    engineer: {
      hy: 'Ինժեներական աշխատանքներ՝ փայտից, մետաղից և 3D տպագրությամբ։',
      en: 'Engineering pieces in wood, metal and 3D print.'
    }
  };

  var galleryItems = [], galleryIndex = 0, galleryAlt = '';
  function openGallery(product, alt) {
    galleryItems = product.gallery || [{ type: 'image', src: product.img }];
    galleryIndex = 0; galleryAlt = alt || '';
    qvMedia.classList.toggle('has-gallery', galleryItems.length > 1);
    var video = $('#qvVideo');
    if (!video) {
      video = document.createElement('video'); video.id = 'qvVideo'; video.className = 'qv-video';
      video.controls = false; video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'metadata'; qvMedia.appendChild(video);
      var controls = document.createElement('div'); controls.className = 'gallery-controls';
      controls.innerHTML = '<button type="button" id="galleryPrev">‹</button><span id="galleryPosition" aria-live="polite"></span><button type="button" id="galleryNext">›</button>';
      qvMedia.appendChild(controls);
      var thumbs = document.createElement('div'); thumbs.id = 'galleryThumbs'; thumbs.className = 'gallery-thumbs'; qvMedia.appendChild(thumbs);
      $('#galleryPrev').addEventListener('click', function () { showGallery(galleryIndex - 1); });
      $('#galleryNext').addEventListener('click', function () { showGallery(galleryIndex + 1); });
      qvMedia.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'VIDEO') return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); showGallery(galleryIndex + (e.key === 'ArrowRight' ? 1 : -1)); }
      });
      var startX = null;
      qvImg.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, {passive:true});
      qvImg.addEventListener('touchend', function (e) { var delta = e.changedTouches[0].clientX - startX; if (startX !== null && Math.abs(delta) > 45) showGallery(galleryIndex + (delta < 0 ? 1 : -1)); startX = null; }, {passive:true});
    }
    $('#galleryPrev').setAttribute('aria-label', t('galleryPrev'));
    $('#galleryNext').setAttribute('aria-label', t('galleryNext'));
    var thumbs = $('#galleryThumbs'); thumbs.innerHTML = '';
    galleryItems.forEach(function (item, i) {
      var btn = document.createElement('button'); btn.type = 'button';
      btn.setAttribute('aria-label', t(item.type === 'video' ? 'galleryVideo' : 'galleryPhoto') + ' ' + (i + 1));
      var thumb = document.createElement('img'); thumb.src = item.thumb || item.poster || item.src; thumb.width = 58; thumb.height = 58; thumb.alt = ''; btn.appendChild(thumb);
      if (item.type === 'video') { var play = document.createElement('span'); play.textContent = '▶'; btn.appendChild(play); }
      btn.addEventListener('click', function () { showGallery(i); }); thumbs.appendChild(btn);
    });
    showGallery(0);
  }
  function showGallery(index) {
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[galleryIndex], video = $('#qvVideo');
    video.pause(); video.removeAttribute('src'); video.load();
    var isVideo = item.type === 'video'; video.hidden = !isVideo; qvImg.hidden = isVideo;
    if (isVideo) {
      video.src = item.src; video.poster = item.poster || '';
      var playRequest = video.play(); if (playRequest && playRequest.catch) playRequest.catch(function () {});
    }
    else { qvImg.src = item.src; qvImg.alt = galleryAlt + ' — ' + (galleryIndex + 1); qvImg.style.opacity = '1'; }
    $('#galleryPosition').textContent = (galleryIndex + 1) + ' / ' + galleryItems.length;
    Array.from($('#galleryThumbs').children).forEach(function (btn, i) { btn.setAttribute('aria-pressed', String(i === galleryIndex)); });
  }

  function openQuickView(card, updateHistory) {
    if (sharePanel) closeSharePanel(false);
    if (!card || !card.querySelector) return;
    var img = card.querySelector('.product-art');
    var addBtn = card.querySelector('.btn-add-cart');
    if (!img || !addBtn || !qvModal) return;
    function cardText(sel) {
      var el = card.querySelector(sel);
      return el ? el.textContent : '';
    }
    var product = PRODUCTS[Number(card.dataset.index)];
    if (window.ACTAnalytics) window.ACTAnalytics.viewProduct(product);
    var detail = lang === 'en' ? product.en : product.hy;
    var pending = product.price == null;
    var cat = card.dataset.category || 'textile';
    if (qvMedia) qvMedia.dataset.category = cat;
    openGallery(product, img.alt);
    var badgeEl = card.querySelector('.product-badge');
    if (qvBadge) qvBadge.textContent = badgeEl ? badgeEl.textContent : '';
    if (qvType) qvType.textContent = cardText('.product-type');
    if (qvName) qvName.textContent = cardText('.product-name');
    if (qvPrice) qvPrice.textContent = formatPrice(product.price);
    var qvPriceFoot = $('#qvPriceFoot');
    if (qvPriceFoot) qvPriceFoot.textContent = formatPrice(product.price);
    if (qvSpecs) qvSpecs.textContent = detail.specs;
    var availSrc = card.querySelector('.availability');
    if (qvAvail) {
      if (availSrc) {
        qvAvail.innerHTML = '<span class="dot" aria-hidden="true"></span>' + availSrc.textContent;
        qvAvail.className = 'availability ' + (availSrc.classList.contains('avail-made') ? 'avail-made' : (availSrc.classList.contains('avail-last') ? 'avail-last' : 'avail-in'));
      } else {
        qvAvail.textContent = '';
      }
    }
    var qvDesc = $('#qvDesc');
    if (qvDesc) qvDesc.textContent = detail.desc || (CAT_DESC[cat] ? CAT_DESC[cat][lang === 'en' ? 'en' : 'hy'] : '');
    var qvEta = $('#qvEta');
    if (qvEta) {
      var bkey = card.dataset.badge || 'bStock';
      qvEta.textContent = t('detailsPending');
    }
    qvAdd.dataset.name = addBtn.dataset.name;
    qvAdd.dataset.price = addBtn.dataset.price;
    qvAdd.dataset.category = addBtn.dataset.category;
    qvAdd.dataset.index = card.dataset.index || '';
    qvAdd.classList.remove('added');
    qvAdd.disabled = pending;
    qvAdd.textContent = t(pending ? 'pricePending' : 'add');
    var buyNow = $('#qvBuy'); if (buyNow) buyNow.hidden = pending;
    refreshQvRating();
    renderSimilar(cat, addBtn.dataset.name);
    renderQvReviews();
    qvModal.classList.add('open');
    qvOverlay.classList.add('open');
    qvModal.setAttribute('aria-hidden', 'false');
    qvOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (updateHistory !== false) syncProductUrl(product, true);
    qvClose.focus();
  }

  function closeQuickView(restoreFocus, updateHistory) {
    if (window.ACTAnalytics) window.ACTAnalytics.closeProduct();
    if (sharePanel) closeSharePanel(false);
    if (updateHistory !== false) syncProductUrl(null, false);
    var playing = $('#qvVideo'); if (playing) { playing.pause(); playing.removeAttribute('src'); playing.load(); }
    qvModal.classList.remove('open');
    qvOverlay.classList.remove('open');
    qvModal.setAttribute('aria-hidden', 'true');
    qvOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (restoreFocus !== false) productSearch.blur();
  }

  qvAdd.addEventListener('click', function () {
    addToCart(qvAdd.dataset.name, qvAdd.dataset.price, qvAdd.dataset.category);
    closeQuickView(false);
  });

  var qvBuy = $('#qvBuy');
  if (qvBuy) {
    qvBuy.addEventListener('click', function () {
      if (!qvAdd.dataset.name) return;
      addToCart(qvAdd.dataset.name, qvAdd.dataset.price, qvAdd.dataset.category);
      closeQuickView(false);
      openCheckout();
    });
  }

  /* Ratings (saved locally, no fake data) */
  var RATE_KEY = 'act-product-ratings';
  var ratingsCache = null;
  function loadRatings() {
    if (ratingsCache) return ratingsCache;
    try {
      var r = JSON.parse(storeGet(RATE_KEY));
      return (ratingsCache = (r && typeof r === 'object') ? r : {});
    } catch (e) { return {}; }
  }
  function saveRatings(r) {
    ratingsCache = r;
    storeSet(RATE_KEY, JSON.stringify(r));
  }
  function paintStars(container, value) {
    if (!container) return;
    Array.from(container.querySelectorAll('button')).forEach(function (b) {
      b.classList.toggle('on', Number(b.dataset.star) <= value);
    });
  }
  function refreshQvRating() {
    var saved = 0;
    if (qvAdd.dataset.name) {
      try { saved = Number(loadRatings()[qvAdd.dataset.name]) || 0; } catch (e) {}
    }
    paintStars($('#qvStars'), saved);
    paintStars($('#qvRevStars'), revStarsVal || saved);
    var top = $('#qvTopStars');
    if (top) top.innerHTML = starsRowHTML(saved, 18);
    var tt = $('#qvRatingText');
    if (tt) tt.textContent = saved ? t('qvYourRating', { n: saved }) : t('qvNoRating');
  }
  /* Product reviews (real, saved locally) */
  var REV_KEY = 'act-product-reviews';
  var revStarsVal = 0;
  var reviewsCache = null;
  function loadRevs() {
    if (reviewsCache) return reviewsCache;
    try { var o = JSON.parse(storeGet(REV_KEY)); return (reviewsCache = (o && typeof o === 'object') ? o : {}); }
    catch (e) { return {}; }
  }
  function saveRevs(o) { reviewsCache = o; storeSet(REV_KEY, JSON.stringify(o)); }
  function renderQvReviews() {
    var name = qvAdd.dataset.name;
    var list = $('#qvRevList'), empty = $('#qvRevEmpty');
    revStarsVal = 0;
    paintStars($('#qvRevStars'), 0);
    if (!list) return;
    list.innerHTML = '';
    var arr = (loadRevs()[name]) || [];
    if (empty) empty.hidden = arr.length !== 0;
    arr.forEach(function (r) {
      var d = document.createElement('div');
      d.className = 'qv-rev';
      var h = document.createElement('div');
      h.className = 'qv-rev-head';
      var st = document.createElement('span');
      st.className = 'qv-rev-stars';
      st.innerHTML = starsRowHTML(r.stars, 15);
      var who = document.createElement('strong');
      who.textContent = r.who;
      var dt = document.createElement('small');
      dt.textContent = r.date;
      h.appendChild(st);
      h.appendChild(who);
      h.appendChild(dt);
      var tx = document.createElement('p');
      tx.textContent = r.text;
      d.appendChild(h);
      d.appendChild(tx);
      list.appendChild(d);
    });
  }
  var qvRevStars = $('#qvRevStars');
  if (qvRevStars) {
    qvRevStars.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      revStarsVal = Number(b.dataset.star);
      paintStars(qvRevStars, revStarsVal);
    });
  }
  var qvRevForm = $('#qvRevForm');
  if (qvRevForm) {
    qvRevForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = qvAdd.dataset.name;
      if (!name) return;
      var whoI = $('#qvRevName'), txI = $('#qvRevText');
      if (!whoI || whoI.value.trim().length < 2) {
        if (whoI) { setFieldError(whoI, t('errName')); whoI.focus(); }
        return;
      }
      if (!revStarsVal) { showToast(t('revNeedStars')); return; }
      if (!txI || txI.value.trim().length < 2) {
        if (txI) { setFieldError(txI, t('errMessage')); txI.focus(); }
        return;
      }
      var all = loadRevs();
      (all[name] = all[name] || []).unshift({
        who: whoI.value.trim(),
        stars: revStarsVal,
        text: txI.value.trim(),
        date: new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'hy-AM')
      });
      saveRevs(all);
      var rt = loadRatings();
      rt[name] = revStarsVal;
      saveRatings(rt);
      qvRevForm.reset();
      [whoI, txI].forEach(function (i) { if (i) clearFieldError(i); });
      renderQvReviews();
      refreshQvRating();
      showToast(t('revThanks'));
    });
    ['qvRevName', 'qvRevText'].forEach(function (id) {
      var inp = document.getElementById(id);
      if (inp) inp.addEventListener('input', function () { clearFieldError(inp); });
    });
  }

  /* Stable product links and explicit sharing destinations. */
  function productLink(product) {
    if (!product) return '';
    try {
      var base = new URL(window.ACT_PUBLIC_URL || location.href);
      if (base.protocol !== 'http:' && base.protocol !== 'https:') return '';
      var url = new URL('index.html', base);
      url.search = ''; url.hash = '';
      url.searchParams.set('product', product.id);
      url.searchParams.set('lang', lang);
      return url.href;
    } catch (e) { return ''; }
  }
  function currentProduct() { return PRODUCTS[Number(qvAdd.dataset.index)]; }
  function syncProductUrl(product, push) {
    try {
      var url = new URL(location.href);
      var current = url.searchParams.get('product');
      if (product) url.searchParams.set('product', product.id);
      else url.searchParams.delete('product');
      if (/^#p-\d+$/.test(url.hash)) url.hash = '';
      if (product && current === product.id) return;
      history[push ? 'pushState' : 'replaceState'](null, '', url);
    } catch (e) {}
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return copied;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  var qvShare = $('#qvShare');
  var sharePanel = $('#sharePanel');
  function closeSharePanel(restoreFocus) {
    sharePanel.hidden = true; qvShare.setAttribute('aria-expanded', 'false');
    if (restoreFocus) qvShare.focus();
  }
  function openSharePanel() {
    var product = currentProduct(), url = productLink(product);
    var text = product ? product[lang].name : '';
    $('#shareUrl').value = url;
    var links = {
      shareTelegram: 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text),
      shareViber: 'viber://forward?text=' + encodeURIComponent(url + '\n' + text.slice(0, 40)),
      shareWhatsApp: 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url)
    };
    Object.keys(links).forEach(function (id) {
      var link = $('#' + id); link.setAttribute('aria-disabled', String(!url));
      if (url) link.href = links[id]; else link.removeAttribute('href');
    });
    $('#shareCopy').disabled = !url;
    $('#shareMore').hidden = !url || typeof navigator.share !== 'function';
    $('#shareMessage').textContent = !url ? t('shareFile') : /^(localhost|127\.|\[::1\])/.test(location.hostname) && !window.ACT_PUBLIC_URL ? t('shareLocal') : '';
    sharePanel.hidden = false; qvShare.setAttribute('aria-expanded', 'true');
    $('#shareCopy').focus();
  }
  qvShare.addEventListener('click', function () { if (sharePanel.hidden) openSharePanel(); else closeSharePanel(true); });
  $('#shareClose').addEventListener('click', function () { closeSharePanel(true); });
  $('#shareUrl').addEventListener('click', function () { this.select(); });
  $('#shareCopy').addEventListener('click', function () {
    var value = $('#shareUrl').value;
    if (!value) return;
    copyText(value).then(function (ok) {
      $('#shareMessage').textContent = t(ok ? 'shareCopied' : 'shareManualCopy');
      if (!ok) { $('#shareUrl').focus(); $('#shareUrl').select(); }
    });
  });
  $('#shareMore').addEventListener('click', function () {
    var product = currentProduct(), url = productLink(product);
    if (url && navigator.share) navigator.share({ title: product[lang].name, url: url }).catch(function () {});
  });
  document.addEventListener('click', function (e) {
    if (!sharePanel.hidden && !sharePanel.contains(e.target) && !qvShare.contains(e.target)) closeSharePanel(false);
  });

  /* Custom requests: browser-local records, with reference files in IndexedDB. */
  var REQUEST_KEY = 'act-product-requests';
  var attachmentMemory = {};
  var attachmentDbPromise = null;
  var referencePreviewUrl = null;
  var selectedOrderCode = '';
  var lastRequestCode = '';
  var customBusy = false;
  function referenceDb() {
    if (!attachmentDbPromise) attachmentDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { resolve(null); return; }
      var request = indexedDB.open('act-product-reference-files', 1);
      request.onupgradeneeded = function () { request.result.createObjectStore('references'); };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
    return attachmentDbPromise;
  }
  function saveReference(id, file) {
    if (!file) return Promise.resolve();
    return referenceDb().then(function (db) {
      if (!db) { attachmentMemory[id] = file; return; }
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('references', 'readwrite');
        tx.objectStore('references').put(file, id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error); };
      });
    });
  }
  function loadReference(id) {
    return referenceDb().then(function (db) {
      if (!db) return attachmentMemory[id] || null;
      return new Promise(function (resolve, reject) {
        var request = db.transaction('references').objectStore('references').get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error); };
      });
    });
  }
  function deleteReference(id) {
    delete attachmentMemory[id];
    referenceDb().then(function (db) { if (db) db.transaction('references', 'readwrite').objectStore('references').delete(id); }).catch(function () {});
  }
  function loadRequests() {
    try { var list = JSON.parse(storeGet(REQUEST_KEY)); return Array.isArray(list) ? list : []; } catch (e) { return []; }
  }
  function newOrderCode() {
    var random = new Uint32Array(2);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(random);
    else { random[0] = Math.floor(Math.random() * 4294967296); random[1] = Date.now() % 4294967296; }
    return 'ACT-' + Array.from(random).map(function (n) { return n.toString(36).toUpperCase().padStart(7, '0'); }).join('');
  }
  function orderCode(order) { return order.code || 'ACT-' + String(order.id).toUpperCase(); }
  function clearReferencePreview() {
    if (referencePreviewUrl) URL.revokeObjectURL(referencePreviewUrl);
    referencePreviewUrl = null; var preview = $('#referencePreview');
    preview.hidden = true; preview.removeAttribute('src');
    var selected = $('#customReference').files[0]; $('#referenceFilename').textContent = selected ? selected.name : t('customNoReference');
  }
  function supportedReference(file) {
    return !file || (file.size <= 5 * 1024 * 1024 && (/^image\/(jpeg|png|webp|hei[cf])$/.test(file.type) || /\.hei[cf]$/i.test(file.name)));
  }
  var finderEditing = false, finderIdeaChosen = false, finderActive = -1;
  function clearFinderError() { $('#finderError').hidden = true; $('#productPickerSearch').removeAttribute('aria-invalid'); }
  function renderCustomProducts() {
    $('#referencePreview').alt = t('customAttachment');
    var file = $('#customReference').files[0]; $('#referenceFilename').textContent = file ? file.name : t('customNoReference');
    var selected = PRODUCTS.find(function (p) { return p.id === $('#customProduct').value; });
    var hasSelection = !!selected || finderIdeaChosen;
    $('#finderSelection').hidden = !hasSelection || finderEditing;
    $('#finderInputArea').hidden = hasSelection && !finderEditing;
    $('#finderHint').hidden = hasSelection && !finderEditing;
    $('#customProductName').textContent = selected ? selected[lang].name : t('pickerOwnIdea');
    $('#customProductCategory').textContent = selected ? t(FILTER_TITLE[selected.cat]) : t('pickerIdeaCaption');
    var visual = $('#customProductVisual'); visual.replaceChildren();
    if (selected) { var image = document.createElement('img'); image.src = selected.thumb || selected.img; image.alt = ''; visual.appendChild(image); }
    else visual.textContent = '＋';
    if (!$('#productPickerPanel').hidden) renderProductPicker();
    if (lastRequestCode) $('#customResultText').textContent = t('customSaved', {code:lastRequestCode});
  }
  function positionFinder() {
    var panel = $('#productPickerPanel'); if (panel.hidden) return;
    var rect = $('#finderInputArea').getBoundingClientRect(), viewport = window.visualViewport;
    var bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
    var below = bottom - rect.bottom - 18, above = rect.top - 92;
    var up = below < 260 && above > below;
    panel.classList.toggle('opens-up', up);
    panel.style.setProperty('--finder-room', Math.max(160, Math.min(420, up ? above : below)) + 'px');
  }
  function keepFinderVisible() {
    var rect = $('#finderInputArea').getBoundingClientRect(), viewport = window.visualViewport;
    var top = (viewport ? viewport.offsetTop : 0) + 88;
    var bottom = (viewport ? viewport.offsetTop + viewport.height : window.innerHeight) - 36;
    if (rect.top < top || rect.bottom > bottom) window.scrollBy({top:rect.top - (top + bottom - rect.height) / 2, behavior:'instant'});
  }
  function resizeFinder() {
    if ($('#productPickerPanel').hidden) return;
    keepFinderVisible(); positionFinder();
  }
  function setFinderActive(index) {
    var options = Array.from($('#productPickerList').children);
    finderActive = Math.max(-1, Math.min(options.length - 1, index));
    options.forEach(function (option, i) { option.setAttribute('aria-selected', String(i === finderActive)); });
    if (options[finderActive]) {
      $('#productPickerSearch').setAttribute('aria-activedescendant', options[finderActive].id);
      options[finderActive].scrollIntoView({block:'nearest'});
    } else $('#productPickerSearch').removeAttribute('aria-activedescendant');
  }
  function renderProductPicker() {
    var query = $('#productPickerSearch').value.trim().toLocaleLowerCase('hy-AM'), folded = latFold(toLatin(query));
    var matches = PRODUCTS.map(function (p, index) {
      var name = (p.hy.name + ' ' + p.en.name).toLocaleLowerCase('hy-AM');
      var transliterated = latFold(toLatin(name));
      var cat = (STR.hy[FILTER_TITLE[p.cat]] + ' ' + STR.en[FILTER_TITLE[p.cat]]).toLocaleLowerCase('hy-AM');
      var score = !query ? 0 : name.indexOf(query) === 0 || transliterated.indexOf(folded) === 0 ? 1 : name.indexOf(query) !== -1 || transliterated.indexOf(folded) !== -1 ? 2 : cat.indexOf(query) !== -1 || latFold(toLatin(cat)).indexOf(folded) !== -1 ? 3 : 99;
      return {p:p, score:score, index:index};
    }).filter(function (item) { return item.score < 99; }).sort(function (a,b) { return a.score - b.score || a.index - b.index; });
    var list = $('#productPickerList'); list.replaceChildren(); finderActive = -1;
    $('#productPickerSearch').removeAttribute('aria-activedescendant');
    matches.forEach(function (item, index) {
      var p = item.p, option = document.createElement('li');
      option.className = 'finder-option'; option.id = 'finder-option-' + index; option.dataset.productId = p.id;
      option.setAttribute('role','option'); option.setAttribute('aria-selected','false');
      var image = document.createElement('img'); image.src = p.thumb || p.img; image.alt = ''; image.loading = 'lazy'; image.width = 44; image.height = 44;
      var copy = document.createElement('span'), name = document.createElement('strong'), category = document.createElement('small');
      name.textContent = p[lang].name; category.textContent = t(FILTER_TITLE[p.cat]); copy.appendChild(name); copy.appendChild(category);
      var arrow = document.createElement('span'); arrow.className = 'finder-option-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      option.appendChild(image); option.appendChild(copy); option.appendChild(arrow); list.appendChild(option);
    });
    $('#productPickerCount').textContent = t('pickerCount', {n:matches.length});
    $('#productPickerEmpty').hidden = !!matches.length; list.hidden = !matches.length;
    $('#productPickerClear').hidden = !$('#productPickerSearch').value;
    $('#productPickerToggle').hidden = !!$('#productPickerSearch').value;
    positionFinder();
  }
  function openFinder() {
    keepFinderVisible();
    $('#productPickerPanel').hidden = false; $('#productPickerSearch').setAttribute('aria-expanded','true');
    renderProductPicker(); $('#productPickerList').scrollTop = 0;
  }
  function closeFinder(revert) {
    $('#productPickerPanel').hidden = true; $('#productPickerSearch').setAttribute('aria-expanded','false');
    $('#productPickerSearch').removeAttribute('aria-activedescendant'); finderActive = -1;
    if (revert && finderEditing) { finderEditing = false; $('#productPickerSearch').value = ''; renderCustomProducts(); }
  }
  function chooseCustomProduct(id) {
    $('#customProduct').value = PRODUCTS.some(function (p) { return p.id === id; }) ? id : '';
    finderIdeaChosen = !id; finderEditing = false; $('#productPickerSearch').value = '';
    closeFinder(false); clearFinderError(); renderCustomProducts(); $('#customProductChange').focus({preventScroll:true});
  }
  $('#productPickerSearch').addEventListener('focus', openFinder);
  $('#productPickerSearch').addEventListener('input', function () { clearFinderError(); openFinder(); });
  $('#productPickerToggle').addEventListener('click', function () { if ($('#productPickerPanel').hidden) { $('#productPickerSearch').focus(); openFinder(); } else closeFinder(false); });
  $('#productPickerClear').addEventListener('click', function () { $('#productPickerSearch').value = ''; clearFinderError(); $('#productPickerSearch').focus(); openFinder(); });
  $('#customProductChange').addEventListener('click', function () { finderEditing = true; renderCustomProducts(); $('#productPickerSearch').value = ''; $('#productPickerSearch').focus(); });
  $('#customProductRemove').addEventListener('click', function () { $('#customProduct').value = ''; finderIdeaChosen = false; finderEditing = false; $('#productPickerSearch').value = ''; clearFinderError(); renderCustomProducts(); $('#productPickerSearch').focus(); });
  $('#productPickerList').addEventListener('pointerdown', function (event) { if (event.target.closest('[role="option"]')) event.preventDefault(); });
  $('#productPickerList').addEventListener('click', function (event) { var option = event.target.closest('[data-product-id]'); if (option) chooseCustomProduct(option.dataset.productId); });
  $('#productPickerIdea').addEventListener('click', function () { chooseCustomProduct(''); });
  $('#productPickerSearch').addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); if ($('#productPickerPanel').hidden) openFinder();
      setFinderActive(finderActive + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault(); var option = $('#productPickerList').children[finderActive < 0 ? 0 : finderActive];
      if (!$('#productPickerPanel').hidden && option) chooseCustomProduct(option.dataset.productId);
    } else if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); var changing = finderEditing; closeFinder(true); if (changing) $('#customProductChange').focus();
    }
  });
  $('#productFinder').addEventListener('focusout', function () { setTimeout(function () { if (!$('#productFinder').contains(document.activeElement)) closeFinder(true); }, 0); });
  document.addEventListener('pointerdown', function (event) { if (!$('#productFinder').contains(event.target)) closeFinder(true); });
  window.addEventListener('resize', resizeFinder, {passive:true});
  window.addEventListener('scroll', function () {
    if ($('#productPickerPanel').hidden) return;
    var rect = $('#finderInputArea').getBoundingClientRect();
    if (rect.bottom < 80 || rect.top > window.innerHeight - 32) closeFinder(true); else positionFinder();
  }, {passive:true});
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeFinder, {passive:true});
  $('#customForm').addEventListener('reset', function () {
    setTimeout(function () { $('#customProduct').value = ''; $('#productPickerSearch').value = ''; finderIdeaChosen = false; finderEditing = false; closeFinder(false); clearFinderError(); renderCustomProducts(); }, 0);
  });

  $('#chooseReference').addEventListener('click', function () { $('#customReference').click(); });
  $('#customReference').addEventListener('change', function () {
    clearReferencePreview(); clearFieldError(this);
    var file = this.files[0]; if (!file) return;
    if (!supportedReference(file)) { setFieldError(this, t('customFileError')); return; }
    referencePreviewUrl = URL.createObjectURL(file);
    var preview = $('#referencePreview'); preview.src = referencePreviewUrl;
    preview.alt = t('customAttachment'); preview.hidden = false;
    preview.onerror = function () { preview.hidden = true; };
  });
  $('#customPhone').addEventListener('input', function () {
    var masked = maskAmPhone(this.value); if (masked !== null) this.value = masked; clearFieldError(this);
  });
  ['customName','customColor','customSize','customQuantity','customDetails'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { clearFieldError(this); });
  });
  $('#qvCustom').addEventListener('click', function () {
    var product = currentProduct(); closeQuickView(false);
    $('#customProduct').value = product ? product.id : '';
    renderCustomProducts();
    $('#customName').focus({preventScroll:true}); $('#custom').scrollIntoView({behavior:'smooth', block:'start'});
  });
  $('#customForm').addEventListener('submit', function (event) {
    event.preventDefault(); if (customBusy) return;
    var first = null;
    function invalid(input, key) { setFieldError(input, t(key)); if (!first) first = input; }
    var name = $('#customName'), phone = $('#customPhone'), qty = $('#customQuantity'), details = $('#customDetails');
    [name, phone, qty, details, $('#customReference')].forEach(clearFieldError);
    if (name.value.trim().length < 2) invalid(name, 'errName');
    if (!normalizeAmPhone(phone.value)) invalid(phone, 'errPhoneInvalid');
    if ($('#productPickerSearch').value.trim() && !$('#customProduct').value && !finderIdeaChosen) {
      $('#finderError').hidden = false; $('#productPickerSearch').setAttribute('aria-invalid','true'); first = first || $('#productPickerSearch');
    }
    var quantity = Number(qty.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) invalid(qty, 'customQuantityError');
    if (details.value.trim().length < 10) invalid(details, 'customDetailsError');
    var file = $('#customReference').files[0] || null;
    if (!supportedReference(file)) invalid($('#customReference'), 'customFileError');
    if (first) { (first.id === 'customReference' ? $('#chooseReference') : first).focus(); return; }
    var code = newOrderCode();
    var request = {
      id:code, code:code, type:'custom', status:'draft', timestamp:Date.now(),
      name:name.value.trim(), phone:normalizeAmPhone(phone.value), productId:$('#customProduct').value,
      color:$('#customColor').value.trim(), size:$('#customSize').value.trim(), quantity:quantity, details:details.value.trim(),
      attachment:file ? {name:file.name, type:file.type, size:file.size} : null,
      statusHistory:[{status:'draft', timestamp:Date.now()}]
    };
    customBusy = true; $('#customSubmit').disabled = true; $('#customSubmit').textContent = t('customSaving');
    saveReference(request.id, file).then(function () {
      var saved = loadRequests(); saved.unshift(request);
      if (!storeSet(REQUEST_KEY, JSON.stringify(saved.slice(0,20)))) throw new Error('Storage unavailable');
      saved.slice(20).forEach(function (old) { if (old.attachment) deleteReference(old.id); });
      lastRequestCode = code; $('#customForm').reset(); clearReferencePreview();
      $('#customResultText').textContent = t('customSaved', {code:code}); $('#customResult').hidden = false;
      $('#customView').focus(); renderOrders();
    }).catch(function () { deleteReference(request.id); showToast(t('customSaveError')); }).finally(function () {
      customBusy = false; $('#customSubmit').disabled = false; $('#customSubmit').textContent = t('customSave');
    });
  });
  $('#customView').addEventListener('click', function () {
    selectedOrderCode = lastRequestCode; $('#orderFindInput').value = selectedOrderCode; openOrders();
  });
  $('#orderFindForm').addEventListener('submit', function (e) {
    e.preventDefault(); selectedOrderCode = $('#orderFindInput').value.trim().toUpperCase(); renderOrders();
  });
  $('#orderClearFind').addEventListener('click', function () {
    selectedOrderCode = ''; $('#orderFindInput').value = ''; renderOrders();
  });
  function appendOrderTimeline(container, order) {
    var stages = order.type === 'custom' || order.status === 'draft' ? ['draft','received','making','ready','completed'] : ['received','making','ready','completed'];
    var status = stages.indexOf(order.status) >= 0 ? order.status : 'received';
    var current = stages.indexOf(status), keys = {draft:'orderDraft',received:'orderReceived',making:'orderMaking',ready:'orderReady',completed:'orderCompleted'};
    var timeline = document.createElement('ol'); timeline.className = 'order-timeline'; timeline.setAttribute('aria-label', t('orderTimeline'));
    stages.forEach(function (stage, i) {
      var step = document.createElement('li'); step.textContent = t(keys[stage]);
      step.dataset.state = i < current ? 'done' : i === current ? 'current' : 'pending';
      if (i === current) step.setAttribute('aria-current', 'step');
      timeline.appendChild(step);
    });
    container.appendChild(timeline); return keys[status];
  }
  function renderOrders() {
    var list = $('#ordList'), empty = $('#ordEmpty'); if (!list) return;
    list.innerHTML = '';
    var all = loadOrders().concat(loadRequests()).sort(function (a,b) { return (b.timestamp || b.id || 0) - (a.timestamp || a.id || 0); });
    var orders = selectedOrderCode ? all.filter(function (order) { return orderCode(order).toUpperCase() === selectedOrderCode; }) : all;
    empty.hidden = all.length !== 0; $('#orderNotFound').hidden = !selectedOrderCode || orders.length !== 0;
    $('#orderClearFind').hidden = !selectedOrderCode;
    orders.forEach(function (order) {
      var el = document.createElement('article'); el.className = 'ord-card';
      var head = document.createElement('div'); head.className = 'ord-head';
      var code = document.createElement('button'); code.type = 'button'; code.className = 'order-code';
      code.textContent = orderCode(order); code.setAttribute('aria-label', t('orderCopyCode') + ': ' + orderCode(order));
      code.addEventListener('click', function () { copyText(orderCode(order)).then(function (ok) { if (ok) showToast(t('orderCodeCopied')); }); });
      var badge = document.createElement('span'); badge.className = 'ord-status'; head.appendChild(code); head.appendChild(badge); el.appendChild(head);
      var date = document.createElement('small'); date.className = 'order-date';
      date.textContent = order.timestamp ? new Date(order.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'hy-AM') : order.date || '';
      el.appendChild(date);
      var items = document.createElement('p'); items.className = 'ord-items';
      if (order.type === 'custom') {
        var product = PRODUCTS.find(function (p) { return p.id === order.productId; });
        items.textContent = t('customRequestType') + (product ? ' · ' + product[lang].name : '') + ' × ' + order.quantity;
      } else items.textContent = (order.items || []).map(function (it) { return displayName(it.n) + ' × ' + it.q; }).join('; ');
      el.appendChild(items);
      if (order.type !== 'custom') {
        var contact = document.createElement('p'); contact.className = 'order-custom-details';
        contact.textContent = [order.name, order.phone, order.address, order.comment].filter(Boolean).join('\n');
        if (contact.textContent) el.appendChild(contact);
        var payment = document.createElement('p'); payment.className = 'order-cash-note';
        payment.textContent = t('coPayCash'); el.appendChild(payment);
      }
      if (order.type === 'custom') {
        var details = document.createElement('p'); details.className = 'order-custom-details';
        details.textContent = [order.color ? t('customColor') + ': ' + order.color : '', order.size ? t('customSize') + ': ' + order.size : '', order.details].filter(Boolean).join('\n'); el.appendChild(details);
        if (order.attachment) {
          var download = document.createElement('button'); download.type = 'button'; download.className = 'text-button'; download.textContent = t('customDownload') + ' · ' + order.attachment.name;
          download.addEventListener('click', function () {
            loadReference(order.id).then(function (file) {
              if (!file) { showToast(t('customSaveError')); return; }
              var url = URL.createObjectURL(file), a = document.createElement('a'); a.href = url; a.download = order.attachment.name;
              document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            }).catch(function () { showToast(t('customSaveError')); });
          }); el.appendChild(download);
        }
      }
      badge.textContent = t(appendOrderTimeline(el, order));
      var total = document.createElement('p'); total.className = 'ord-total'; total.textContent = order.type === 'custom' ? t('orderDraftTotal') : t('orderTotal', {t:formatPrice(order.total)}); el.appendChild(total);
      list.appendChild(el);
    });
  }
  function openProductFromUrl() {
    var id = new URL(location.href).searchParams.get('product');
    var legacy = /^#p-(\d+)$/.exec(location.hash || '');
    var product = id ? PRODUCTS.find(function (p) { return p.id === id; }) : legacy ? PRODUCTS[Number(legacy[1])] : null;
    if (product) {
      var card = productCards.find(function (c) { return PRODUCTS[Number(c.dataset.index)].id === product.id; });
      if (card) openQuickView(card, false);
    } else if (qvModal.classList.contains('open')) closeQuickView(false, false);
  }
  window.addEventListener('popstate', openProductFromUrl);
  window.addEventListener('hashchange', openProductFromUrl);

  /* Similar products */
  function renderSimilar(cat, currentName) {
    var grid = $('#qvSimGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var items = [];
    PRODUCTS.forEach(function (p, i) {
      if (p.cat === cat && p.hy.name !== currentName) items.push({ p: p, i: i });
    });
    items.slice(0, 4).forEach(function (it) {
      var d = (lang === 'en') ? it.p.en : it.p.hy;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qv-sim';
      b.innerHTML = '<img src="' + (it.p.thumb || it.p.img) + '" alt="" loading="lazy"><strong>' + d.name + '</strong><span>' + formatPrice(it.p.price) + '</span>';
      b.addEventListener('click', function () {
        var target = null;
        productCards.forEach(function (c) { if (c.dataset.index === String(it.i)) target = c; });
        if (target) {
          openQuickView(target);
          var sc = document.querySelector('.qv-scroll');
          if (sc) sc.scrollTop = 0;
        }
      });
      grid.appendChild(b);
    });
  }

  qvClose.addEventListener('click', function () { closeQuickView(false); });
  qvOverlay.addEventListener('click', function () { closeQuickView(false); });
  var qvDownOnBackdrop = false;
  qvModal.addEventListener('pointerdown', function (e) { qvDownOnBackdrop = (e.target === qvModal); });
  qvModal.addEventListener('click', function (e) {
    if (e.target === qvModal && qvDownOnBackdrop) closeQuickView(false);
  });

  /* ---------- 6c. Promo code ---------- */
  var appliedPromo = '';
  try {
    var savedPromo = storeGet(PROMO_KEY);
    if (savedPromo && PROMOS[savedPromo]) appliedPromo = savedPromo;
  } catch (e) {}

  function showPromoMsg(message, ok) {
    promoMsg.textContent = message;
    promoMsg.classList.toggle('ok', !!ok);
    promoMsg.classList.toggle('err', !ok);
    promoMsg.hidden = false;
  }
  function applyPromoCode() {
    var code = promoInput.value.trim().toUpperCase();
    if (!code) {
      showPromoMsg(t('promoEmpty'), false);
      return;
    }
    if (PROMOS[code]) {
      appliedPromo = code;
      storeSet(PROMO_KEY, code);
      promoInput.value = '';
      showPromoMsg(t('promoOk', { p: PROMOS[code] }), true);
      renderCart();
    } else {
      showPromoMsg(t('promoBad'), false);
    }
  }

  promoApply.addEventListener('click', applyPromoCode);
  promoInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyPromoCode();
    }
  });


  /* ---------- 6e. Language (HY/EN) — reload like normal sites ---------- */
  function applyLang() {
    var activeIndex = qvModal.classList.contains('open') ? qvAdd.dataset.index : null;
    var scroll = $('.qv-scroll'); var scrollTop = scroll ? scroll.scrollTop : 0;
    document.documentElement.lang = lang;
    document.title = t('docTitle');
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    ['ph', 'aria', 'title'].forEach(function (kind) {
      var attr = kind === 'ph' ? 'placeholder' : kind === 'aria' ? 'aria-label' : 'title';
      $$('[data-i18n-' + kind + ']').forEach(function (el) { el.setAttribute(attr, t(el.getAttribute('data-i18n-' + kind))); });
    });
    var meta = $('meta[name="description"]'); if (meta) meta.content = t('metaDescription');
    renderProducts(); applySort();
    langToggle.textContent = lang === 'hy' ? 'EN' : 'ՀԱ';
    langToggle.setAttribute('aria-label', t(lang === 'hy' ? 'langToEn' : 'langToHy'));
    $$('#qvRevStars button').forEach(function (b) { b.setAttribute('aria-label', t('rateStars', {n:b.dataset.star})); });
    $$('[data-error-key]').forEach(function (input) { if (input.dataset.errorKey) setFieldError(input, t(input.dataset.errorKey)); });
    promoMsg.hidden = true;
    refreshCatTitle(); updateFilterCounts(); updateSelBar(); renderCart(); renderOrders(); renderCustomProducts(); filterProducts();
    if (coModal.classList.contains('open')) renderCheckoutSummary();
    if (activeIndex !== null) {
      openQuickView(productCards.find(function (c) { return c.dataset.index === activeIndex; }));
      if (scroll) scroll.scrollTop = scrollTop;
    }
  }
  langToggle.addEventListener('click', function () {
    lang = lang === 'hy' ? 'en' : 'hy'; storeSet(LANG_KEY, lang);
    try { var url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url); } catch (e) {}
    applyLang();
  });

  /* ---------- 7. Anchors & back-to-top ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = $(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  var siteHeader = $('header');

  window.addEventListener('scroll', function () {
    backToTop.hidden = window.scrollY < 500;
    siteHeader.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 7c. URL params (?q=, ?cat=) — 404.html-ը հղում է այսպես ---------- */
  function applyUrlParams() {
    var params = {};
    try {
      location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      });
    } catch (e) {}
    var validCats = ['all', 'textile', 'art', 'accessory', 'ceramic', 'cs', 'digitalart', 'engineer', 'fav', 'sel'];
    if (params.cat && validCats.indexOf(params.cat) !== -1 && params.cat !== 'all') {
      activeFilter = params.cat;
      filterButtons.forEach(function (item) {
        var isActive = item.dataset.filter === activeFilter;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      refreshCatTitle();
    }
    if (params.q && productSearch) productSearch.value = params.q;
    if (params.cat || params.q) {
      applySort();
      filterProducts();
    }
  }

  /* ---------- Init ---------- */
  applyLang();
  applyUrlParams();
  openProductFromUrl();
})();
