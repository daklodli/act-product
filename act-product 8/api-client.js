/* ACT API transport and catalog adapter. Compatible with the supplied OpenAPI contracts. */
(function (root, factory) {
  'use strict';
  var exports = factory();
  if (typeof module === 'object' && module.exports) module.exports = exports;
  else root.ACTAPI = exports.create(root.ACT_API_CONFIG || {});
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function apiError(code, status, message) {
    var error = new Error(message || code); error.code = code; error.status = status || 0; error.isACTAPIError = true; return error;
  }
  function endpoint(value) {
    if (!value) return '';
    var url = new URL(value, typeof location !== 'undefined' ? location.href : 'https://localhost/');
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(url.hostname))) throw apiError('configuration');
    if(url.username||url.password)throw apiError('configuration');
    return url.href;
  }
  function category(tags) {
    var aliases = {
      textile:['textile','textiles','տեքստիլ'], art:['painting','art','նկարչություն'],
      accessory:['accessory','accessories','աքսեսուարներ'], ceramic:['ceramics','ceramic','կավագործություն'],
      cs:['computer science','cs','web development','համակարգչային գիտություն'],
      digitalart:['digital art','digitalart','դիջիթլ արվեստ'],
      engineer:['engineering','engineer','3d printing','electrical circuits','ինժեներություն']
    };
    var normalized = tags.map(function (s) { return s.trim().toLowerCase(); });
    return Object.keys(aliases).find(function (key) { return aliases[key].some(function (s) { return normalized.indexOf(s) !== -1; }); }) || 'other';
  }
  function adaptGood(good, config) {
    if (!good || !Number.isSafeInteger(good.id) || good.id < 1 || typeof good.title !== 'string' || !good.title.trim() || typeof good.description !== 'string' || typeof good.slug !== 'string' || !good.slug.trim() || ['.','..'].indexOf(good.slug) !== -1 || good.status !== 'active' || !/^[A-Z]{3}$/.test(good.currency)) throw apiError('catalog_format');
    var decimals;
    try { decimals = new Intl.NumberFormat('en', {style:'currency', currency:good.currency}).resolvedOptions().maximumFractionDigits; }
    catch (_) { throw apiError('catalog_format'); }
    var amount = good.price == null ? null : good.price;
    if (amount !== null && (!Number.isSafeInteger(amount) || amount < 0)) throw apiError('catalog_format');
    var tags = Array.isArray(good.tags) ? good.tags.filter(function (tag) { return typeof tag === 'string'; }) : [];
    var base = endpoint(config.assetsBaseUrl || config.goodsUrl).replace(/\/$/,'');
    var assetUrl = function (asset) { return base + '/' + encodeURIComponent(good.slug) + '/assets/' + asset.asset_id; };
    var assets = (Array.isArray(good.assets) ? good.assets : []).filter(function (asset) { return asset && Number.isSafeInteger(asset.asset_id) && asset.asset_id > 0 && ['thumbnail','primary_image','gallery','document'].indexOf(asset.role) !== -1; }).slice().sort(function (a,b) { return a.position - b.position || a.asset_id - b.asset_id; });
    var primary = assets.find(function (a) { return a.role === 'primary_image'; }) || assets.find(function (a) { return a.role === 'gallery'; });
    var thumbnail = assets.find(function (a) { return a.role === 'thumbnail'; });
    var galleryAssets = assets.filter(function (a) { return a.role === 'primary_image' || a.role === 'gallery'; });
    var image = primary ? assetUrl(primary) : 'images/website.svg';
    var details = function (locale) { return {name:good.title.trim(), type:tags.join(' · ') || (locale === 'hy' ? 'Կատալոգի ապրանք' : 'Catalog item'), specs:tags.join(' · '), desc:good.description, avail:locale === 'hy' ? 'Պատվերի մանրամասները՝ ճշտումով' : 'Order details to be confirmed'}; };
    return {
      id:'api-' + good.id, goodId:good.id, slug:good.slug, source:'api', cat:category(tags),
      price:amount === null ? null : amount / Math.pow(10,decimals), currency:good.currency,
      img:image, thumb:thumbnail ? assetUrl(thumbnail) : image, badge:'bCatalog',
      gallery:galleryAssets.length ? galleryAssets.map(function (a) { return {type:'image',src:assetUrl(a),thumb:a.role === 'primary_image' && thumbnail ? assetUrl(thumbnail) : assetUrl(a),alt:a.alt_text || good.title}; }) : [{type:'image',src:image}],
      documents:assets.filter(function (a) { return a.role === 'document'; }).map(function (a) { return {url:assetUrl(a),label:a.alt_text || String(a.asset_id)}; }),
      hy:details('hy'), en:details('en')
    };
  }
  function create(config,dependencies) {
    dependencies=dependencies||{};var fetcher=dependencies.fetch||fetch,Controller=dependencies.AbortController||AbortController;
    var goodsUrl=endpoint(config.goodsUrl);
    return Object.freeze({loadGoods:async function(){
      if(!goodsUrl)throw apiError('configuration');
      var controller=new Controller(),timer=setTimeout(function(){controller.abort();},config.timeoutMs||12000);
      try{
        var response=await fetcher(goodsUrl,{method:'GET',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal,headers:{Accept:'application/json'}});
        if(!response.ok)throw apiError('http',response.status);
        var data=await response.json();if(!Array.isArray(data))throw apiError('catalog_format');
        return data.map(function(good){return adaptGood(good,config);});
      }finally{clearTimeout(timer);}
    }});
  }
  return {create:create,adaptGood:adaptGood};
});
