# Act Product — Ձեռագործ արտադրանքի առցանց խանութ

Ուսանողական նախագիծ (ACT College)։ Երկլեզու (ՀԱ/EN), 75 ապրանք,
զամբյուղ, պատվերի ձևակերպում, կարծիքներ։

Ամեն ինչ աշխատում է առանց backend-ի՝ տվյալները պահվում են
բրաուզերում (localStorage)։

## Կառուցվածք

| Ֆայլ / թղթապանակ | Ինչ է |
|---|---|
| `index.html` | Գլխավոր էջ (կատալոգ, զամբյուղ, պատվեր, արագ դիտում) |
| `404.html` | Սխալ հասցեի էջ (որոնումով, ՀԱ/EN) |
| `style.css` | Ամբողջ դիզայնը |
| `photo-products.js` | Նոր 10 ապրանքների նկարները, նկարագրությունները և գները |
| `script.js` | Խանութի տրամաբանություն |
| `lang.js` | Shared Armenian/English interface dictionary |
| `catalog-products.js` | Original 65 catalog entries |
| `images/` | SVG catalog artwork and optimized WebP product photos |
| `videos/pistol-model.mp4` | Local product demonstration video |

## Արագ մեկնարկ

Բացել `index.html`-ը բրաուզերում։ Վերջ։

## Ինչ ստուգել գնահատման ժամանակ

1. Կատալոգ՝ որոնում (հայերեն/latin), կատեգորիաներ, գնով դասավորում
2. Ապրանքի արագ դիտում, գնահատական, կարծիք
3. Զամբյուղ + `STUDENT10` զեղչի կոդ (−10%)
4. Պատվերի ձև (անուն, հեռախոս, հասցե՝ վճարումը կանխիկ՝ ստանալիս, քարտի տվյալներ չեն պահանջվում)
5. Սխալ հասցե → 404 էջ՝ որոնումով և կատեգորիաներով
6. Հեռախոսի էկրան (responsive), ՀԱ/EN լեզու
7. Հոսթինգ → տե՛ս `DEPLOY.md`

## Ավելացված լուսանկարներով ապրանքներ

16 տարբեր լուսանկար և 1 տեսանյութ՝ խմբավորված 10 ապրանքի տակ։ Կրկնվող կցված ֆայլերը չեն կրկնվում։ Պատկերասրահը ունի նախորդ/հաջորդ կոճակներ, փոքր նկարներ և հեռախոսով սահեցում։

Գները լրացվում են `photo-products.js` ֆայլի համապատասխան ապրանքի `price` դաշտում՝ `null`-ի փոխարեն դրամով թվային արժեք գրելով։ Մինչ այդ ցուցադրվում է «Գինը՝ շուտով», իսկ գնումը անջատված է։ Օրինակ՝ `"price": 5000`։

Չափերը, նյութը և պահեստի քանակը նկարներից հաստատել հնարավոր չէ, ուստի նոր ապրանքների համար դրանք չեն հորինվել։

## Language and performance

The language switch updates the full interface without reloading the page or restarting the hero video. Cart and saved-order product names use the selected language. User names and reviews keep their original text.

Cards use 480px WebP thumbnails; galleries load 1280px WebP images. The hero embeds the existing muted looping video immediately, without a startup timer, blur, poster or playback controls.

Removed unused poster/JPEG files, the missing hero.mp4 request, obsolete card-payment styles, dormant contact/menu code, the page-blocking loader and duplicate initial rendering.

## Custom requests and order progress

The custom form records the selected product, color, dimensions, quantity, description and an optional reference image (up to 5 MB). Metadata is saved in this browser; reference files are saved in IndexedDB. These are local drafts, not requests delivered to the shop. The page states this explicitly.

The orders panel combines checkout records and custom requests, supports lookup by reference number and displays saved/received/in-progress/ready/completed stages. New local records start as saved drafts. Stages do not advance automatically and no customer can change production status from the page. Backend integration is required for shop-confirmed status changes and cross-device history.

Delivery pricing, timing and pickup details have deliberately not been added, pending the owner's instructions.

## Product links and sharing

Every product now has a stored, stable ID. Share links use `index.html?product=<id>&lang=hy` (or `en`), open the matching product immediately and do not depend on sort order or the active catalog filter. Existing `#p-<index>` links are still understood.

The share panel offers Telegram, Viber, WhatsApp and Copy link. The system share sheet is opened only if the visitor explicitly selects Other apps. Viber requires an installed compatible app.

A published HTTP(S) website is required for links that other people can open. Localhost links stay local; file:// paths are never copied or sent to messaging apps. After publication, links automatically use the public host. If the site is previewed at another address, an optional `window.ACT_PUBLIC_URL` may be set before script.js to the actual public site URL. No public address has been invented or configured.

Protocol references: https://core.telegram.org/widgets/share and https://developers.viber.com/docs/all/ .
