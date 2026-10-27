/* Act Product: opt-in GA4; never collect customer forms or search text. */
(function () {
  'use strict';
  var ID = 'G-0NMC4BNTQY', KEY = 'act-product-analytics-consent-v1';
  var banner = document.getElementById('analyticsChoice');
  var active = false, loaded = false, currentProduct = '';
  var production = location.hostname === 'daklodli.github.io' && location.pathname.indexOf('/act-product/') === 0;
  var products = (window.ACT_PHOTO_PRODUCTS || []).concat(window.ACT_CATALOG_PRODUCTS || []);
  function preference() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function knownProduct(id) { return products.find(function (p) { return p.id === id; }); }
  function canonicalUrl(id) {
    var url = new URL('https://daklodli.github.io/act-product/act-product%208/index.html');
    if (knownProduct(id)) url.searchParams.set('product', id);
    url.searchParams.set('lang', document.documentElement.lang === 'en' ? 'en' : 'hy');
    return url.href;
  }
  function referrerOrigin() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch (e) { return ''; }
  }
  function tag() { window.dataLayer.push(arguments); }
  function viewProduct(product) {
    if (!active || !product || product.id === currentProduct) return;
    var known = knownProduct(product.id);
    if (!known) return;
    currentProduct = known.id;
    var lang = document.documentElement.lang === 'en' ? 'en' : 'hy';
    tag('event', 'view_item', {
      page_location: canonicalUrl(known.id), page_title: 'Act Product',
      items: [{item_id: known.id, item_name: known[lang].name, item_category: known.cat}]
    });
  }
  function enable() {
    if (active || !production) return;
    window['ga-disable-' + ID] = false;
    active = true;
    var initial = knownProduct(new URL(location.href).searchParams.get('product'));
    if (!loaded) {
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = tag;
      tag('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
      tag('consent', 'update', {analytics_storage:'granted'});
      tag('js', new Date());
      tag('config', ID, {
        send_page_view:false, page_title:'Act Product', page_location:canonicalUrl(initial && initial.id), page_referrer:referrerOrigin(),
        allow_google_signals:false, allow_ad_personalization_signals:false,
        cookie_prefix:'act_product', cookie_domain:'none', cookie_path:'/act-product/', cookie_flags:'SameSite=Lax;Secure'
      });
      tag('event', 'page_view', {page_title:'Act Product', page_location:canonicalUrl(initial && initial.id), page_referrer:referrerOrigin()});
      var script = document.createElement('script');
      script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
      document.head.appendChild(script);
    } else tag('consent', 'update', {analytics_storage:'granted'});
    if (initial && document.getElementById('qvModal').classList.contains('open')) viewProduct(initial);
  }
  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    if (value === 'granted') enable();
    else {
      active = false; currentProduct = '';
      window['ga-disable-' + ID] = true;
      if (loaded) tag('consent', 'update', {analytics_storage:'denied'});
      document.cookie.split(';').forEach(function (part) {
        var name = part.trim().split('=')[0];
        if (name.indexOf('act_product_') === 0) document.cookie = name + '=; Max-Age=0; path=/act-product/; SameSite=Lax; Secure';
      });
    }
    banner.hidden = true;
  }
  window.ACTAnalytics = {viewProduct:viewProduct, closeProduct:function () { currentProduct = ''; }};
  document.getElementById('analyticsAllow').addEventListener('click', function () { choose('granted'); });
  document.getElementById('analyticsDecline').addEventListener('click', function () { choose('denied'); });
  document.getElementById('analyticsSettings').addEventListener('click', function () {
    banner.hidden = false; document.getElementById('analyticsDecline').focus();
  });
  if (preference() === 'granted') enable();
  else if (preference() !== 'denied') banner.hidden = false;
})();
