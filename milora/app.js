/* Mealora: single-page app, no build step.
   DEMO MODE: data is saved in this browser's localStorage (see `db`).
   To go live, replace the `db` helpers and the auth functions with Firebase Auth + Firestore. */
(() => {
const CFG = { email: 'hello@mealora.example', phone: '+91 00000 00000', place: 'Hyderabad, India', workersApi: '' }; // placeholders: edit
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '\u20B9' + Number(n).toLocaleString('en-IN');
const qs = o => { const p = new URLSearchParams(); for (const [k, v] of Object.entries(o)) if (v && v !== 'any') p.set(k, v); return p.toString(); };
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

/* ---------- demo storage + auth ---------- */
const db = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('milora:' + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('milora:' + k, JSON.stringify(v)); return true; } catch { return false; } }
};
const session = () => db.get('session', null);
const hash = s => { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return (h >>> 0).toString(36); }; // demo only
const newId = p => p + '-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);

/* ---------- data (SAMPLE: replace with Firestore) ---------- */
const OCC = [['wedding', 'Wedding / Reception', 'Grand menus for the biggest day.'], ['birthday', 'Birthday party', 'Shareable menus for all ages.'], ['family', 'Housewarming / Family function', 'Comfort food for close gatherings.'], ['corporate', 'Corporate event', 'Reliable service for teams and clients.'], ['festival', 'Festival / Religious gathering', 'Traditional menus for festive days.'], ['other', 'Other occasion', 'Tell us what you need.']];
const GU = [['u25', 'Under 25', 0, 24], ['25-50', '25\u201350 guests', 25, 50], ['50-100', '50\u2013100 guests', 50, 100], ['100-200', '100\u2013200 guests', 100, 200], ['200-500', '200\u2013500 guests', 200, 500], ['500+', '500+ guests', 500, 1e9]];
const BU = [['any', 'Any budget', 0, 1e9], ['u200', 'Under \u20B9200', 0, 199], ['200-400', '\u20B9200\u2013\u20B9400', 200, 400], ['400-700', '\u20B9400\u2013\u20B9700', 400, 700], ['700+', '\u20B9700+', 700, 1e9]];
const DI = [['any', 'Any'], ['veg', 'Vegetarian'], ['non', 'Non-vegetarian'], ['both', 'Veg and non-veg']];
const CU = ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 'Mughlai'];
const SV = [['Buffet Service', 'Served or self-serve buffet lines, set up and managed on site.'], ['Live Counters', 'Dosa, chaat, pasta and grill counters made in front of guests.'], ['Professional Staff', 'Trained servers and supervisors for smooth service.'], ['Utensils & Equipment', 'Serving ware, chafing dishes and cooking equipment.']];
const ALLSV = SV.map(s => s[0]);
const P = [
  { id: 'spice-villa', name: 'Spice Villa Catering', cuisines: ['North Indian', 'Mughlai'], price: 450, min: 25, max: 500, rating: 4.8, reviews: 124, areas: ['Banjara Hills', 'Jubilee Hills'], diet: 'both', services: ALLSV, occ: ['wedding', 'birthday', 'corporate', 'festival'], seed: 1, desc: 'Sample listing. Slow-cooked North Indian and Mughlai menus for mid-size and large events.' },
  { id: 'royal-feast', name: 'Royal Feast Caterers', cuisines: ['Mughlai', 'North Indian', 'Chinese'], price: 750, min: 100, max: 1000, rating: 4.6, reviews: 89, areas: ['Secunderabad', 'Madhapur'], diet: 'both', services: ['Buffet Service', 'Live Counters', 'Professional Staff'], occ: ['wedding', 'corporate', 'festival'], seed: 2, desc: 'Sample listing. Premium banquet-style catering for weddings and receptions.' },
  { id: 'grand-kitchen', name: 'The Grand Kitchen', cuisines: ['South Indian', 'Continental'], price: 350, min: 50, max: 800, rating: 4.7, reviews: 56, areas: ['Gachibowli', 'Madhapur'], diet: 'veg', services: ['Buffet Service', 'Professional Staff', 'Utensils & Equipment'], occ: ['wedding', 'family', 'corporate'], seed: 3, desc: 'Sample listing. Pure vegetarian South Indian and continental spreads.' },
  { id: 'green-leaf', name: 'Green Leaf Caterers', cuisines: ['South Indian', 'North Indian'], price: 220, min: 20, max: 300, rating: 4.5, reviews: 78, areas: ['Banjara Hills', 'Gachibowli'], diet: 'veg', services: ['Buffet Service', 'Utensils & Equipment'], occ: ['birthday', 'family', 'festival'], seed: 4, desc: 'Sample listing. Affordable home-style vegetarian menus for small functions.' },
  { id: 'fusion-table', name: 'Fusion Table Events', cuisines: ['Italian', 'Continental', 'Chinese'], price: 620, min: 25, max: 200, rating: 4.4, reviews: 41, areas: ['Jubilee Hills', 'Madhapur'], diet: 'both', services: ['Live Counters', 'Professional Staff'], occ: ['birthday', 'corporate', 'other'], seed: 5, desc: 'Sample listing. Pasta, grill and Indo-Chinese counters for parties and offices.' },
  { id: 'annapurna', name: 'Annapurna Festive Kitchens', cuisines: ['North Indian', 'South Indian'], price: 280, min: 30, max: 600, rating: 4.9, reviews: 63, areas: ['Secunderabad', 'Banjara Hills'], diet: 'veg', services: ['Buffet Service', 'Professional Staff', 'Utensils & Equipment'], occ: ['festival', 'family', 'wedding'], seed: 6, desc: 'Sample listing. Traditional vegetarian menus for pujas and festive gatherings.' }
];
const ALLAREAS = [...new Set(P.flatMap(p => p.areas))];
const DISH = [['Paneer Butter Masala', 'v', 'North Indian'], ['Dal Tadka', 'v', 'North Indian'], ['Butter Chicken', 'n', 'North Indian'], ['Veg Dum Biryani', 'v', 'Mughlai'], ['Chicken Biryani', 'n', 'Mughlai'], ['Masala Dosa', 'v', 'South Indian'], ['Medu Vada', 'v', 'South Indian'], ['Andhra Chicken Curry', 'n', 'South Indian'], ['Veg Hakka Noodles', 'v', 'Chinese'], ['Chilli Chicken', 'n', 'Chinese'], ['Herb Grilled Vegetables', 'v', 'Continental'], ['Grilled Chicken Steak', 'n', 'Continental'], ['Penne Arrabbiata', 'v', 'Italian'], ['Chicken Alfredo Pasta', 'n', 'Italian']];
const menuOf = p => DISH.filter(d => p.cuisines.includes(d[2]) && (p.diet === 'both' || d[1] === 'v'));
const PK = [
  { id: 'essential', name: 'Essential Package', price: 350, seed: 7, desc: 'A balanced, simple menu for small gatherings.', dishes: [['Dal Tadka', 'v'], ['Jeera Rice', 'v'], ['Mixed Veg Curry', 'v'], ['Roti', 'v'], ['Gulab Jamun', 'v']] },
  { id: 'celebration', name: 'Celebration Package', price: 500, seed: 8, desc: 'Starters, two mains and dessert for birthdays and family events.', dishes: [['Paneer Tikka', 'v'], ['Paneer Butter Masala', 'v'], ['Chicken Biryani', 'n'], ['Raita', 'v'], ['Double Ka Meetha', 'v']] },
  { id: 'grand', name: 'Grand Feast Package', price: 750, seed: 9, desc: 'A full multi-course spread for weddings and receptions.', dishes: [['Veg Platter', 'v'], ['Chicken 65', 'n'], ['Veg Dum Biryani', 'v'], ['Butter Chicken', 'n'], ['Assorted Desserts', 'v']] },
  { id: 'custom', name: 'Custom Menu', price: null, seed: 10, desc: 'Tell us your cuisines, dishes and budget and receive tailored quotes.', dishes: [] }
];

/* ---------- ui helpers ---------- */
let pre = 'f';
const fld = (n, l, t = 'text', o = {}) => {
  const id = `${pre}-${n}`; let c;
  if (t === 'select') c = `<select id="${id}" name="${n}">${o.opts.map(x => `<option value="${esc(x[0])}"${String(o.val) === String(x[0]) ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select>`;
  else if (t === 'textarea') c = `<textarea id="${id}" name="${n}" rows="3" placeholder="${esc(o.ph || '')}">${esc(o.val || '')}</textarea>`;
  else c = `<input id="${id}" name="${n}" type="${t}" value="${esc(o.val || '')}" placeholder="${esc(o.ph || '')}" ${o.attr || ''}>`;
  return `<div class="fld${o.wide ? ' wide' : ''}"><label for="${id}">${l}</label>${c}<p class="err" data-e="${n}" role="alert"></p></div>`;
};
const opt = (a, first) => (first ? [['', first]] : []).concat(a.map(x => [x[0], x[1]]));
const vd = t => `<i class="vd ${t}" role="img" aria-label="${t === 'v' ? 'Vegetarian' : 'Non-vegetarian'}"></i>`;
const dietTag = d => d === 'veg' ? `${vd('v')}Pure vegetarian` : d === 'non' ? `${vd('n')}Non-vegetarian` : `${vd('v')}${vd('n')}Veg and non-veg`;
const lbl = (a, k) => (a.find(x => x[0] === k) || [])[1] || '';

const val = (f, rules) => {
  let ok = true, first = null;
  for (const [n, r] of Object.entries(rules)) {
    const el = f.elements[n], v = (el.value || '').trim(); let m = '';
    if (r.req && !v) m = 'This field is required.';
    else if (v && r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) m = 'Enter a valid email address.';
    else if (v && r.phone && !/^[6-9]\d{9}$/.test(v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))) m = 'Enter a valid 10-digit mobile number.';
    else if (v && r.date && v < today()) m = 'Choose today or a later date.';
    else if (v && r.num && !(+v >= 1)) m = 'Enter a number of 1 or more.';
    else if (v && r.max && +v > r.max) m = `This provider allows up to ${r.max} per delivery.`;
    else if (v && r.min && v.length < r.min) m = `Use at least ${r.min} characters.`;
    f.querySelector(`[data-e="${n}"]`).textContent = m;
    el.setAttribute('aria-invalid', !!m);
    if (m) { ok = false; first = first || el; }
  }
  if (first) first.focus();
  return ok;
};
const say = (f, t, k) => { const m = $('.fm', f); m.textContent = t; m.className = 'fm ' + k; };

/* ---------- cards ---------- */
const favs = () => { const s = session(); return s ? db.get('favs:' + s.email, []) : []; };
const card = p => {
  const on = favs().includes(p.id);
  return `<article class="pc"><a href="#/caterer/${p.id}" class="ph photo" aria-label="View ${esc(p.name)}"><img src="media/catering/cat-${p.seed % 4 + 1}.jpg" alt="${esc(p.name)}" loading="lazy"><span class="tag${p.verified ? ' ok' : ''}">${p.verified ? 'Verified' : 'Sample provider'}</span></a>
  <div class="pb"><div class="m"><b>&#9733; ${p.rating} <i>(${p.reviews} reviews)</i></b><button class="fav${on ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${on}" aria-label="Save ${esc(p.name)}">&hearts;</button></div>
  <h3>${esc(p.name)}</h3><p class="mu">${esc(p.areas.join(', '))}</p><p class="mu">${esc(p.cuisines.join(' \u00B7 '))}</p><p class="dt">${dietTag(p.diet)}</p>
  <p class="pr"><b>${inr(p.price)}</b> per plate &middot; min ${p.min} guests</p>
  <div class="ba"><a class="btn sm" href="#/caterer/${p.id}">View Menu</a><a class="btn sm ghost" href="#/quote?provider=${p.id}">Request Quote</a></div></div></article>`;
};
const PKT = { essential: 'Everyday value', celebration: 'Most popular', grand: 'Premium', custom: 'Tailored for you' };
const pkCard = k => `<article class="pk${k.id === 'grand' ? ' prem' : ''}"><div class="ph photo"><img src="media/catering/pkg-${k.id}.jpg" alt="${esc(k.name)}" loading="lazy"><span class="tag">${PKT[k.id]}</span>${k.price ? `<span class="pprice"><small>from</small>${inr(k.price)}<small>/ plate</small></span>` : ''}</div><div class="pb"><h3>${k.name}</h3>
  <p class="pr">${k.price ? `<b>${inr(k.price)}</b> per plate <span class="demo">(demo price)</span>` : '<b>Priced per quote</b>'}</p><p>${k.desc}</p>
  <div class="ba"><button class="btn sm ghost" data-pkg="${k.id}">View Details</button><a class="btn sm" href="#/quote?package=${k.id}">Request Quote</a></div></div></article>`;

/* ---------- forms ---------- */
const findForm = q => { pre = 'h'; return `<form class="find" data-form="find" novalidate><h2>Find Your Caterer</h2><div class="fgrid">
  ${fld('occ', 'What is the occasion?', 'select', { opts: opt(OCC, 'Select occasion'), val: q.occ })}
  ${fld('guests', 'Number of guests', 'select', { opts: opt(GU, 'Select guests'), val: q.guests })}
  ${fld('date', 'Event date', 'date', { attr: `min="${today()}"`, val: q.date })}
  ${fld('loc', 'Event location', 'text', { ph: 'City and locality, e.g. Banjara Hills, Hyderabad', val: q.loc, attr: 'list="areas" autocomplete="off"' })}
  ${fld('diet', 'Food preference', 'select', { opts: DI, val: q.diet || 'any' })}
  ${fld('budget', 'Budget per plate', 'select', { opts: opt(BU), val: q.budget || 'any' })}
  </div><datalist id="areas">${ALLAREAS.map(a => `<option value="${a}, Hyderabad">`).join('')}</datalist>
  <button class="btn full">Find Caterers</button></form>`; };
const quoteForm = q => {
  pre = 'q'; const p = P.find(x => x.id === q.provider), k = PK.find(x => x.id === q.package), s = session();
  return `<form class="card" data-form="quote" novalidate><h3 style="margin-bottom:6px">Request a quote${p ? ' from ' + esc(p.name) : ''}${k ? ' (' + k.name + ')' : ''}</h3>
  <p class="mu" style="margin-bottom:14px">Demo mode: requests are saved in this browser only until a backend is connected.</p>
  <input type="hidden" name="provider" value="${esc(q.provider || '')}"><input type="hidden" name="package" value="${esc(q.package || '')}">
  <div class="fx">
  ${fld('name', 'Customer name', 'text', { val: s?.name, attr: 'autocomplete="name"' })}${fld('email', 'Email address', 'email', { val: s?.email, attr: 'autocomplete="email"' })}
  ${fld('phone', 'Phone number', 'tel', { attr: 'autocomplete="tel"', ph: '10-digit mobile' })}${fld('type', 'Event type', 'select', { opts: opt(OCC, 'Select event'), val: q.occ })}
  ${fld('date', 'Event date', 'date', { attr: `min="${today()}"`, val: q.date })}${fld('guests', 'Guest count', 'number', { attr: 'min="1"', val: q.guestsN })}
  ${fld('loc', 'Event location', 'text', { val: q.loc })}${fld('diet', 'Food preference', 'select', { opts: DI, val: q.diet || 'any' })}
  ${fld('budget', 'Approximate budget per plate', 'select', { opts: BU, val: q.budget || 'any' })}${fld('cuisine', 'Cuisine preferences', 'text', { ph: 'e.g. North Indian, Chinese' })}
  ${fld('notes', 'Additional requirements', 'textarea', { wide: 1, ph: 'Dishes, services, allergies...' })}</div>
  <button class="btn">Submit Quote Request</button><p class="fm" role="status"></p></form>`;
};
const joinForm = () => { pre = 'j'; return `<form class="card" data-form="join" novalidate><div class="fx">
  ${fld('bname', 'Business or provider name')}${fld('cname', 'Contact name')}${fld('email', 'Email', 'email')}${fld('phone', 'Phone number', 'tel')}
  ${fld('loc', 'Business location')}${fld('cats', 'Service category', 'select', { opts: [['', 'Select'], ['Caterer', 'Caterer'], ['Home cook', 'Home cook'], ['Food service provider', 'Food service provider']] })}
  ${fld('cuisines', 'Cuisine types', 'text', { ph: 'e.g. South Indian, Mughlai' })}${fld('range', 'Approximate price range', 'text', { ph: 'e.g. \u20B9300\u2013\u20B9600 per plate' })}
  ${fld('desc', 'Short business description', 'textarea', { wide: 1 })}</div>
  <button class="btn">Register as a Partner</button><p class="fm" role="status"></p></form>`; };

/* ---------- search / filter ---------- */
const filt = q => {
  let r = P.filter(p => {
    if (q.occ && q.occ !== 'other' && !p.occ.includes(q.occ)) return false;
    const g = GU.find(x => x[0] === q.guests); if (g && (p.max < g[2] || p.min > g[3])) return false;
    if (q.loc) {
      const t = q.loc.toLowerCase(), hit = ALLAREAS.filter(a => t.includes(a.toLowerCase()));
      if (hit.length) { if (!p.areas.some(a => hit.includes(a))) return false; }
      else if (!t.includes('hyderabad')) return false;
    }
    if (q.diet === 'veg' && p.diet === 'non') return false;
    if (q.diet === 'non' && p.diet === 'veg') return false;
    if (q.diet === 'both' && p.diet !== 'both') return false;
    const b = BU.find(x => x[0] === q.budget); if (b && (p.price < b[2] || p.price > b[3])) return false;
    if (q.cuisine && !p.cuisines.includes(q.cuisine)) return false;
    if (q.service && !p.services.includes(q.service)) return false;
    return true;
  });
  if (q.sort === 'pa') r.sort((a, b) => a.price - b.price); else if (q.sort === 'pd') r.sort((a, b) => b.price - a.price); else r.sort((a, b) => b.rating - a.rating);
  return r;
};

/* ---------- views ---------- */
const V = {};
V.home = () => `${homeHero()}
  <section class="sec"><div class="wrap"><div class="sh"><h2>What are you looking for?</h2></div><div class="cg">
  ${[['catering', 'Catering', 'Weddings, parties and corporate events with custom menus and quotes.', 'Explore catering', 'media/svc-catering.jpg', 'Chafing dishes of curries and rice at a catered event'], ['lunchboxes', 'Lunchboxes', 'Fresh meals from kitchens near you, delivered to home, office or hostel.', 'Find lunchboxes', 'media/svc-lunchbox.jpg', 'Steel lunchbox with rice, dal, curry and salad'], ['workers', 'Workers', 'Home cooks for daily, weekly or one-time cooking in your own kitchen.', 'Find a cook', 'media/svc-cook.jpg', 'A home cook stirring a pan in a bright kitchen']].map(c => `<a class="pc" href="#/${c[0]}"><div class="pimg"><img src="${c[4]}" alt="${c[5]}" loading="lazy"></div><div class="pb"><h3>${c[1]}</h3><p class="mu">${c[2]}</p><span class="link" style="align-self:start">${c[3]}</span></div></a>`).join('')}</div></div></section>
  <section class="sec scene"><div class="wrap"><h2>Every dish, made with care</h2><p>From a single lunchbox to a full wedding feast, Mealora connects you with kitchens that cook the way home does.</p></div></section>
  <section class="sec"><div class="wrap"><div class="sh"><div><h2>How Mealora works</h2><p>Three simple steps from craving to table.</p></div></div><div class="cg">
  ${[['1. Tell us what you need', 'Share the occasion, guests, area, food preference and budget. It takes about a minute.'], ['2. Compare your options', 'Browse matching caterers, lunchbox kitchens or home cooks and read their menus and rates.'], ['3. Book or request a quote', 'Confirm a plan or ask for a quote. The provider confirms availability and the final price.']].map(c => `<div class="pk"><div class="pb"><h3>${c[0]}</h3><p class="mu">${c[1]}</p></div></div>`).join('')}</div></div></section>
  <section class="sec"><div class="wrap"><div class="band"><div><h2>Cook with Mealora</h2><p>Are you a caterer, home cook or lunchbox kitchen? Partner with us and reach people looking for good food.</p></div><div><a class="btn" href="#/join">Become a partner</a></div></div></div></section>`;
V.catering = q => {
  const top = [...P].sort((a, b) => b.rating - a.rating).slice(0, 3);
  return `<section class="hero"><div class="ph big hbg"><img src="media/catering/hero.jpg" alt=""></div><div class="shade"></div><div class="wrap hc"><h1>Delicious Catering for Your Special Moments</h1>
  <p class="lead">From intimate gatherings to grand celebrations, find the perfect caterer for your event.</p>${findForm({})}</div></section>
  <section class="sec"><div class="wrap"><div class="sh"><div><h2>Browse by occasion</h2></div><button class="link" id="va" aria-expanded="false">View All</button></div>
  <div class="og">${OCC.map((o, i) => `<a class="oc" ${i > 3 ? 'hidden data-x' : ''} href="#/results?occ=${o[0]}"><div class="ph photo"><img src="media/catering/occ-${o[0]}.jpg" alt="" loading="lazy"></div><div class="ob"><h3>${o[1]}</h3><p>${o[2]}</p><span>Explore</span></div></a>`).join('')}</div></div></section>
  <section class="sec alt"><div class="wrap"><div class="sh"><div><h2>Top Caterers Near You</h2><p>Sample providers shown for development. Real listings appear once providers are approved.</p></div><a class="link" href="#/results">See all caterers</a></div><div class="cg">${top.map(card).join('')}</div></div></section>
  <section class="sec"><div class="wrap"><div class="sh"><div><h2>Explore Menus &amp; Packages</h2><p>Prices and dishes below are demo data, not offers from real businesses.</p></div></div><div class="og">${PK.map(pkCard).join('')}</div></div></section>
  <section class="sec alt"><div class="wrap"><div class="sh"><h2>Popular cuisines</h2></div><div class="chips">${CU.map(c => `<a class="chip" href="#/results?cuisine=${encodeURIComponent(c)}">${c}</a>`).join('')}<a class="chip" href="#/results">Other cuisines</a></div></div></section>
  <section class="sec"><div class="wrap"><div class="sh"><h2>Additional services</h2></div><div class="og">${SV.map(s => `<a class="svc" href="#/results?service=${encodeURIComponent(s[0])}"><h3>${s[0]}</h3><p>${s[1]}</p><span>Find providers</span></a>`).join('')}</div></div></section>
  <section class="sec alt" id="quote"><div class="wrap"><div class="sh"><h2>Request a Custom Quote</h2></div>${quoteForm({})}</div></section>
  <section class="sec"><div class="wrap"><div class="band"><div><h2>Join Mealora</h2><p>Are you a caterer, home cook, or food service provider? Partner with us and grow your business.</p></div>${joinForm()}</div></div></section>`;
};

V.results = q => {
  const list = filt(q); pre = 'r';
  const f = `<details class="fbox" id="fb"><summary>Filters &amp; sorting</summary><form class="flt" data-form="flt">
  ${fld('occ', 'Occasion', 'select', { opts: opt(OCC, 'Any occasion'), val: q.occ })}${fld('guests', 'Number of guests', 'select', { opts: opt(GU, 'Any size'), val: q.guests })}
  ${fld('loc', 'Service location', 'text', { val: q.loc, ph: 'e.g. Madhapur, Hyderabad', attr: 'list="areas"' })}${fld('diet', 'Food preference', 'select', { opts: DI, val: q.diet || 'any' })}
  ${fld('budget', 'Price per plate', 'select', { opts: BU, val: q.budget || 'any' })}${fld('cuisine', 'Cuisine', 'select', { opts: opt(CU.map(c => [c, c]), 'Any cuisine'), val: q.cuisine })}
  ${fld('service', 'Service', 'select', { opts: opt(SV.map(s => [s[0], s[0]]), 'Any service'), val: q.service })}${fld('sort', 'Sort by', 'select', { opts: [['', 'Top rated'], ['pa', 'Price: low to high'], ['pd', 'Price: high to low']], val: q.sort })}
  <input type="hidden" name="date" value="${esc(q.date || '')}"><a class="btn ghost" href="#/results">Clear Filters</a></form><datalist id="areas">${ALLAREAS.map(a => `<option value="${a}, Hyderabad">`).join('')}</datalist></details>`;
  return `<section class="wrap pg"><h1>Find caterers</h1><p>${q.date ? `Event date: ${esc(q.date)}. ` : ''}Availability is confirmed by the caterer after you request a quote.</p>${f}
  <p class="rc" aria-live="polite">${list.length} caterer${list.length === 1 ? '' : 's'} found &middot; sample providers</p>
  <div class="cg">${list.map(card).join('') || `<div class="empty"><h3>No caterers match these filters</h3><p>Try a different location, guest count or budget.</p><a class="btn" href="#/results">Clear Filters</a></div>`}</div></section>`;
};

V.caterer = (q, id) => {
  const p = P.find(x => x.id === id); if (!p) return V.nf();
  const m = menuOf(p);
  return `<section class="wrap pg"><a class="link" href="#/results">&larr; All caterers</a><div class="ph dhero" data-seed="${p.seed}" data-n="12" style="margin-top:16px"><span class="tag">Sample provider</span></div>
  <div class="dgrid"><div><h1>${esc(p.name)}</h1><p class="mu" style="margin:6px 0">&#9733; ${p.rating} (${p.reviews} sample reviews) &middot; ${esc(p.areas.join(', '))}, Hyderabad</p><p>${esc(p.desc)}</p>
  <div class="facts"><div><small>Price per plate</small><b>${inr(p.price)}</b></div><div><small>Guest capacity</small><b>${p.min} to ${p.max}</b></div><div><small>Cuisines</small><b>${esc(p.cuisines.join(', '))}</b></div><div><small>Food</small><b>${dietTag(p.diet)}</b></div></div>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Services offered</h2><p>${p.services.map(esc).join(' &middot; ')}</p>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Sample menu</h2><ul class="menu">${m.map(d => `<li>${vd(d[1])}${esc(d[0])} <span class="mu">(${esc(d[2])})</span></li>`).join('')}</ul>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Reviews</h2><div class="rev"><b>Sample review</b><p>Placeholder text shown for development only.</p><small>Reviews will appear here after real bookings.</small></div></div>
  <aside>${quoteForm({ provider: p.id })}</aside></div></section>`;
};

V.quote = q => `<section class="wrap pg"><h1>Request a Custom Quote</h1><p>Tell us about your event and we will route it to relevant caterers.</p>${quoteForm(q)}</section>`;
V.join = () => `<section class="wrap pg"><h1>Join Mealora</h1><p>Are you a caterer, home cook, or food service provider? Partner with us and grow your business. New partners are reviewed before they receive a Verified badge.</p>${joinForm()}</section>`;

V.login = q => {
  pre = 'a'; const su = q.mode === 'signup';
  return `<section class="wrap pg"><div class="auth"><div class="tabs"><a href="#/login" class="${su ? '' : 'on'}">Log in</a><a href="#/login?mode=signup" class="${su ? 'on' : ''}">Sign up</a></div>
  <div class="note">Demo mode: accounts are stored in this browser only. Use Firebase Authentication for real accounts.${q.need ? ' Log in to save caterers.' : ''}</div>
  <form class="card" data-form="${su ? 'signup' : 'login'}" novalidate>${su ? fld('name', 'Full name', 'text', { attr: 'autocomplete="name"' }) : ''}${fld('email', 'Email', 'email', { attr: 'autocomplete="email"' })}${fld('password', 'Password', 'password', { attr: `autocomplete="${su ? 'new' : 'current'}-password"` })}
  <button class="btn full">${su ? 'Create account' : 'Log in'}</button><p class="fm" role="status"></p>${su ? '' : '<p style="margin-top:10px"><button type="button" class="link" id="fpw">Forgot password?</button></p>'}</form></div></section>`;
};

V.account = () => {
  const s = session(); if (!s) { location.hash = '#/login'; return ''; }
  const qr = db.get('quotes', []).filter(x => x.user === s.email), pa = db.get('partners', []).filter(x => x.email === s.email), fv = favs();
  return `<section class="wrap pg"><h1>Hello, ${esc(s.name)}</h1><p>${esc(s.email)} &middot; role: ${esc(s.role)}</p><div class="ba" style="max-width:360px;margin-bottom:24px"><button class="btn ghost" id="lo">Log out</button><a class="btn ghost" href="#/inbox">Provider inbox (demo)</a></div>
  <h2 style="font-size:1.5rem;margin-bottom:10px">Saved caterers</h2><div class="cg" style="margin-bottom:28px">${fv.map(i => P.find(p => p.id === i)).filter(Boolean).map(card).join('') || '<p class="mu">Nothing saved yet. Tap the heart on a caterer.</p>'}</div>
  <h2 style="font-size:1.5rem;margin-bottom:10px">Quote requests and enquiries</h2>${qr.map(x => `<div class="li"><b>${esc(x.id)} <span class="st">${esc(x.status)}</span></b><span>${esc(lbl(OCC, x.type))} &middot; ${esc(x.date)} &middot; ${esc(x.guests)} guests${x.provider ? ' &middot; ' + esc(P.find(p => p.id === x.provider)?.name || '') : ''}</span></div>`).join('') || '<p class="mu">No requests yet.</p>'}
  <h2 style="font-size:1.5rem;margin:24px 0 10px">Lunchbox orders</h2>${db.get('lunchOrders', []).filter(x => x.user === s.email).map(x => `<div class="li"><b>${esc(x.id)} <span class="st">${esc(x.status)}</span></b><span>${esc(x.provider)} &middot; ${esc(lbl(OT, x.plan))} &middot; starts ${esc(x.start)}</span></div>`).join('') || '<p class="mu">No lunchbox orders yet.</p>'}
  <h2 style="font-size:1.5rem;margin:24px 0 10px">Cook bookings</h2>${db.get('cookBookings', []).filter(x => x.user === s.email).map(x => `<div class="li"><b>${esc(x.id)} <span class="st">${esc(x.status)}</span></b><span>${esc(x.cookName)} &middot; ${esc(lbl(WF, x.plan))} &middot; starts ${esc(x.date)} at ${esc(x.time)}</span></div>`).join('') || '<p class="mu">No cook bookings yet.</p>'}
  ${pa.length ? `<h2 style="font-size:1.5rem;margin:24px 0 10px">Partner applications</h2>${pa.map(x => `<div class="li"><b>${esc(x.bname)} <span class="st p">${esc(x.status)}</span></b><span class="mu">${esc(x.id)}. Verified badge is shown only after administrator approval.</span></div>`).join('')}` : ''}</section>`;
};

V.inbox = () => {
  const all = db.get('quotes', []);
  return `<section class="wrap pg"><h1>Provider inbox</h1><div class="note">Demo only: anyone can open this page here. In production, restrict it to approved provider accounts with Firestore security rules.</div>
  ${all.map(x => `<div class="li"><b>${esc(x.id)} <span class="st">${esc(x.status)}</span></b><span>${esc(x.name)} &middot; ${esc(x.phone)} &middot; ${esc(x.email)}</span><span>${esc(lbl(OCC, x.type))}, ${esc(x.date)}, ${esc(x.guests)} guests, ${esc(x.loc)}</span><span class="mu">${esc(x.notes || '')}</span>
  <label>Status <select data-st="${x.id}">${['Submitted', 'Viewed', 'Responded'].map(s => `<option${s === x.status ? ' selected' : ''}>${s}</option>`).join('')}</select></label></div>`).join('') || '<p class="mu">No quote requests yet.</p>'}</section>`;
};

const PAGES = { help: ['Help Center', 'Help articles will be added here. Placeholder page.'], contact: ['Contact Us', `Email ${CFG.email} or call ${CFG.phone}. Placeholder contact details.`], terms: ['Terms & Conditions', 'Add your terms before launch. Placeholder page.'], privacy: ['Privacy Policy', 'Add your privacy policy before launch. Placeholder page.'], refund: ['Refund Policy', 'Add your refund policy before launch. Placeholder page.'] };
V.page = (q, k) => {
  if (k === 'faqs') return `<section class="wrap pg"><h1>FAQs</h1><p>Placeholder answers.</p>${[['How do quotes work?', 'Submit a request and the caterer replies with an itemised quote.'], ['Is payment taken online?', 'Not in this version. Payment is arranged with the caterer.'], ['What does Verified mean?', 'An administrator has reviewed the provider. Sample providers are not verified.']].map(f => `<details class="rev"><summary><b>${f[0]}</b></summary><p>${f[1]}</p></details>`).join('')}</section>`;
  const p = PAGES[k]; if (!p) return V.nf();
  return `<section class="wrap pg"><h1>${p[0]}</h1><p>${p[1]}</p><a class="btn" href="#/catering">Explore catering</a></section>`;
};
V.nf = () => `<section class="wrap pg"><h1>Page not found</h1><p>That page does not exist.</p><a class="btn" href="#/">Go home</a></section>`;

/* ---------- form handlers ---------- */
const H = {
  find(f) {
    if (!val(f, { occ: { req: 1 }, guests: { req: 1 }, date: { req: 1, date: 1 }, loc: { req: 1 } })) return;
    location.hash = '#/results?' + qs(Object.fromEntries(new FormData(f)));
  },
  flt(f) { location.hash = '#/results?' + qs(Object.fromEntries(new FormData(f))); },
  quote(f) {
    if (!val(f, { name: { req: 1 }, email: { req: 1, email: 1 }, phone: { req: 1, phone: 1 }, type: { req: 1 }, date: { req: 1, date: 1 }, guests: { req: 1, num: 1 }, loc: { req: 1 } })) return;
    const s = session(), d = Object.fromEntries(new FormData(f)), id = newId('MQ');
    const list = db.get('quotes', []); list.push({ ...d, id, user: s?.email || null, status: 'Submitted', createdAt: new Date().toISOString() });
    if (!db.set('quotes', list)) return say(f, 'Your request could not be saved. Check that browser storage is allowed and try again.', 'bad');
    say(f, `Request ${id} saved on this device (demo mode). No caterer has received it yet. ${s ? 'Track it in your account.' : 'Log in to track requests in your account.'}`, 'ok');
    f.reset();
  },
  join(f) {
    if (!val(f, { bname: { req: 1 }, cname: { req: 1 }, email: { req: 1, email: 1 }, phone: { req: 1, phone: 1 }, loc: { req: 1 }, cats: { req: 1 }, cuisines: { req: 1 }, range: { req: 1 }, desc: { req: 1 } })) return;
    const id = newId('MP'), list = db.get('partners', []); list.push({ ...Object.fromEntries(new FormData(f)), id, status: 'Pending approval' });
    if (!db.set('partners', list)) return say(f, 'Your application could not be saved. Try again.', 'bad');
    say(f, `Application ${id} saved (demo mode) with status: Pending approval. The Verified badge is shown only after an administrator approves it.`, 'ok'); f.reset();
  },
  signup(f) {
    if (!val(f, { name: { req: 1 }, email: { req: 1, email: 1 }, password: { req: 1, min: 8 } })) return;
    const users = db.get('users', []), email = f.email.value.trim().toLowerCase();
    if (users.some(u => u.email === email)) return say(f, 'An account with this email already exists. Log in instead.', 'bad');
    users.push({ email, name: f.name.value.trim(), hash: hash(f.password.value), role: 'customer' });
    if (!db.set('users', users)) return say(f, 'Could not create the account. Check browser storage.', 'bad');
    db.set('session', { email, name: f.name.value.trim(), role: 'customer' }); location.hash = '#/account';
  },
  login(f) {
    if (!val(f, { email: { req: 1, email: 1 }, password: { req: 1 } })) return;
    const u = db.get('users', []).find(x => x.email === f.email.value.trim().toLowerCase() && x.hash === hash(f.password.value));
    if (!u) return say(f, 'Email or password is incorrect.', 'bad');
    db.set('session', { email: u.email, name: u.name, role: u.role }); location.hash = '#/account';
  }
};

/* ---------- lunchboxes ---------- */
const PLC = [['home', 'Home'], ['office', 'Office'], ['college', 'College / hostel'], ['other', 'Other location']];
const OT = [['one', 'One-time order'], ['daily', 'Daily meals'], ['weekly', 'Weekly subscription'], ['monthly', 'Monthly subscription']];
const ML = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['ld', 'Lunch and dinner']];
const LDT = [['veg', 'Vegetarian', vd('v')], ['non', 'Non-vegetarian', vd('n')], ['both', 'Both veg and non-veg options', vd('v') + vd('n')], ['vegan', 'Vegan', vd('v')]];
const LC = [['South Indian', 'South Indian'], ['North Indian', 'North Indian'], ['Andhra / Telangana', 'Andhra / Telangana'], ['any', 'Any cuisine']];
const FQ = [['every', 'Every day'], ['weekdays', 'Monday\u2013Friday'], ['selected', 'Selected days only']];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SP = [['mild', 'Mild'], ['medium', 'Medium'], ['spicy', 'Spicy']];
const QT = [['1', '1', 1], ['2', '2', 2], ['3-5', '3\u20135', 5], ['6+', '6 or more', 6]];
const LB = [['u100', 'Under \u20B9100', 0, 99], ['100-150', '\u20B9100\u2013\u20B9150', 100, 150], ['150-250', '\u20B9150\u2013\u20B9250', 150, 250], ['flex', 'Flexible budget', 0, 1e9]];
const SLOTS = { breakfast: '7:30\u20139:00 am', lunch: '12:00\u20131:30 pm', dinner: '7:30\u20139:00 pm' };
const MN = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const LP = [
  { id: 'ammas-tiffin', name: "Amma's Tiffin Box", seed: 31, cuisines: ['South Indian', 'Andhra / Telangana'], diet: 'veg', vegan: true, meals: ['breakfast', 'lunch'], prices: { breakfast: 70, lunch: 110 }, plans: ['one', 'daily', 'weekly', 'monthly'], areas: ['Madhapur', 'Gachibowli'], days: DAYS.slice(0, 6), spice: ['mild', 'medium'], maxQty: 10, fee: 20, rating: 4.7, reviews: 112, desc: 'Sample listing. Homestyle South Indian tiffins and meals.' },
  { id: 'telangana-rasoi', name: 'Telangana Rasoi', seed: 32, cuisines: ['Andhra / Telangana'], diet: 'both', vegan: false, meals: ['lunch', 'dinner'], prices: { lunch: 140, dinner: 150 }, plans: ['one', 'daily', 'weekly', 'monthly'], areas: ['Banjara Hills', 'Jubilee Hills', 'Madhapur'], days: DAYS, spice: ['medium', 'spicy'], maxQty: 20, fee: 25, rating: 4.6, reviews: 87, desc: 'Sample listing. Spicy regional meals with veg and non-veg thalis.' },
  { id: 'punjabi-tadka', name: 'Punjabi Tadka Tiffins', seed: 33, cuisines: ['North Indian'], diet: 'both', vegan: false, meals: ['lunch', 'dinner'], prices: { lunch: 180, dinner: 190 }, plans: ['daily', 'weekly', 'monthly'], areas: ['Secunderabad', 'Banjara Hills'], days: DAYS.slice(0, 5), spice: ['mild', 'medium', 'spicy'], maxQty: 8, fee: 30, rating: 4.5, reviews: 64, desc: 'Sample listing. North Indian meals with fresh rotis, dal and sabzi.' },
  { id: 'green-bowl', name: 'Green Bowl Meals', seed: 34, cuisines: ['South Indian', 'North Indian'], diet: 'veg', vegan: true, meals: ['breakfast', 'lunch', 'dinner'], prices: { breakfast: 60, lunch: 95, dinner: 100 }, plans: ['one', 'daily', 'weekly', 'monthly'], areas: ['Gachibowli', 'Madhapur', 'Jubilee Hills'], days: DAYS.slice(0, 6), spice: ['mild', 'medium'], maxQty: 6, fee: 0, rating: 4.4, reviews: 49, desc: 'Sample listing. Light vegetarian and vegan-friendly everyday meals.' },
  { id: 'home-plate', name: 'Home Plate by Radhika', seed: 35, cuisines: ['South Indian', 'Andhra / Telangana'], diet: 'both', vegan: false, meals: ['lunch'], prices: { lunch: 130 }, plans: ['daily', 'weekly', 'monthly'], areas: ['Banjara Hills', 'Jubilee Hills'], days: DAYS, spice: ['mild', 'medium', 'spicy'], maxQty: 5, fee: 15, rating: 4.9, reviews: 38, desc: 'Sample listing. A home cook preparing small-batch lunches.' },
  { id: 'office-box', name: 'Office Box Co.', seed: 36, cuisines: ['North Indian', 'South Indian'], diet: 'both', vegan: false, meals: ['lunch', 'dinner'], prices: { lunch: 210, dinner: 220 }, plans: ['one', 'daily', 'weekly', 'monthly'], areas: ['Madhapur', 'Gachibowli', 'Secunderabad'], days: DAYS.slice(0, 5), spice: ['mild', 'medium'], maxQty: 50, fee: 0, rating: 4.3, reviews: 205, desc: 'Sample listing. Bulk lunchboxes for offices and teams.' }
];
const LDISH = [['Idli Sambar', 'v', 'South Indian', 'breakfast'], ['Masala Dosa', 'v', 'South Indian', 'breakfast'], ['Sambar Rice', 'v', 'South Indian', 'lunch'], ['Curd Rice', 'v', 'South Indian', 'lunch'], ['Lemon Rice with Chutney', 'v', 'South Indian', 'lunch'], ['Chicken Curry Meals', 'n', 'South Indian', 'lunch'],
  ['Aloo Paratha', 'v', 'North Indian', 'breakfast'], ['Dal Tadka with Jeera Rice', 'v', 'North Indian', 'lunch'], ['Rajma Chawal', 'v', 'North Indian', 'lunch'], ['Paneer Butter Masala with Roti', 'v', 'North Indian', 'dinner'], ['Butter Chicken with Roti', 'n', 'North Indian', 'dinner'],
  ['Pesarattu', 'v', 'Andhra / Telangana', 'breakfast'], ['Gongura Pappu Meals', 'v', 'Andhra / Telangana', 'lunch'], ['Natu Kodi Curry Meals', 'n', 'Andhra / Telangana', 'lunch'], ['Veg Pulao with Kurma', 'v', 'Andhra / Telangana', 'dinner'], ['Andhra Chicken Fry Meals', 'n', 'Andhra / Telangana', 'dinner']];
const lMenu = p => LDISH.filter(d => p.cuisines.includes(d[2]) && p.meals.includes(d[3]) && (p.diet !== 'veg' || d[1] === 'v'));
const priceFor = (p, meal) => meal === 'ld' ? Math.max(p.prices.lunch || 0, p.prices.dinner || 0) : meal ? (p.prices[meal] || 0) : Math.min(...Object.values(p.prices));
const mealsOf = m => m === 'ld' ? ['lunch', 'dinner'] : m ? [m] : [];
const dpwOf = e => e.freq === 'weekdays' ? 5 : e.freq === 'selected' ? Math.max((e.days || []).length, 1) : e.freq === 'every' ? 7 : 5;
const lcalc = (p, plan, meal, qty, dpw) => {
  const per = mealsOf(meal).reduce((s, m) => s + (p.prices[m] || 0), 0) * qty, n = plan === 'weekly' ? dpw : plan === 'monthly' ? dpw * 4 : 1;
  return { per, fee: p.fee, n, each: per + p.fee, total: (per + p.fee) * n };
};

const radios = (n, l, opts, val) => `<fieldset class="fs"><legend>${l}</legend><div class="opts">${opts.map(x => `<label class="opt"><input type="radio" name="${n}" value="${esc(x[0])}"${val === x[0] ? ' checked' : ''}><span>${x[2] || ''}${esc(x[1])}</span></label>`).join('')}</div><p class="err" data-e="${n}" role="alert"></p></fieldset>`;
const checks = (n, l, opts, vals) => `<fieldset class="fs"><legend>${l}</legend><div class="opts">${opts.map(x => `<label class="opt"><input type="checkbox" name="${n}" value="${esc(x[0])}"${(vals || []).includes(x[0]) ? ' checked' : ''}><span>${esc(x[1])}</span></label>`).join('')}</div><p class="err" data-e="${n}" role="alert"></p></fieldset>`;

V.lform = () => {
  pre = 'l'; const d = db.get('lunchPrefs', {});
  return `<section class="wrap pg"><a class="link" href="#/">&larr; Back to Home</a><h1 style="margin-top:14px">Find Your Perfect Lunchbox</h1><p>Tell us what you like, and discover meals that fit your routine, taste, and budget.</p>
  <form class="card lf" data-form="lprefs" novalidate>
  ${radios('place', 'Where should the lunchbox be delivered?', PLC, d.place)}
  <div data-w="other">${fld('placeOther', 'Other delivery location', 'text', { val: d.placeOther, ph: 'e.g. Co-working space' })}</div>
  ${fld('addr', 'Delivery address or locality', 'text', { val: d.addr, ph: 'e.g. Madhapur, Hyderabad', attr: 'list="areas" autocomplete="street-address"' })}
  <p class="mu" style="margin:-10px 0 0">Your address stays on this device. It is not added to the page link.</p><datalist id="areas">${ALLAREAS.map(a => `<option value="${a}, Hyderabad">`).join('')}</datalist>
  ${radios('orderType', 'What type of order do you want?', OT, d.orderType)}
  ${radios('meal', 'Which meal?', ML, d.meal)}
  ${radios('diet', 'Food preference', LDT, d.diet)}
  ${checks('cuisines', 'Preferred cuisine (choose one or more)', LC, d.cuisines)}
  <div data-w="freq">${radios('freq', 'How often do you need meals?', FQ, d.freq)}<div data-w="days">${checks('days', 'Which days?', DAYS.map(x => [x, x]), d.days)}</div></div>
  ${radios('spice', 'Spice preference', SP, d.spice)}
  ${radios('qty', 'Number of lunchboxes per meal', QT, d.qty)}
  ${radios('budget', 'Budget per lunchbox', LB, d.budget)}
  ${fld('notes', 'Allergies or special requests (optional)', 'textarea', { val: d.notes, ph: 'E.g., peanut allergy, less oil, no onion or garlic\u2026' })}
  <p class="note">Allergy requirements must be confirmed directly with the provider before ordering. Mealora cannot guarantee allergen-free meals.</p>
  <button class="btn">Find Matching Lunchboxes</button><p class="fm" role="status"></p></form></section>`;
};

const lPrefs = q => {
  const e = { ...db.get('lunchPrefs', {}) };
  if (q.cuisine) e.cuisines = [q.cuisine]; if (q.meal) e.meal = q.meal; if (q.budget) e.budget = q.budget; if (q.plan) e.orderType = q.plan; if (q.area) e.area = q.area;
  e.broad = q.broad === '1'; e.minr = +q.minr || 0; e.sort = q.sort || ''; return e;
};
const lfilt = e => {
  const r = LP.filter(p => {
    if (!mealsOf(e.meal).every(m => p.meals.includes(m))) return false;
    if (e.diet === 'non' && p.diet === 'veg') return false;
    if (e.diet === 'both' && p.diet !== 'both') return false;
    if (e.diet === 'vegan' && !p.vegan) return false;
    if (e.orderType && !p.plans.includes(e.orderType)) return false;
    if (p.rating < e.minr) return false;
    const t = (e.area || e.addr || '').toLowerCase(), hit = ALLAREAS.filter(a => t.includes(a.toLowerCase()));
    if (hit.length && !p.areas.some(a => hit.includes(a))) return false;
    const qm = (QT.find(x => x[0] === e.qty) || [])[2]; if (qm && qm > p.maxQty) return false;
    if (e.broad) return true;
    const cu = e.cuisines || []; if (cu.length && !cu.includes('any') && !cu.some(c => p.cuisines.includes(c))) return false;
    if (e.orderType && e.orderType !== 'one') { const need = e.freq === 'every' ? DAYS : e.freq === 'weekdays' ? DAYS.slice(0, 5) : e.freq === 'selected' ? (e.days || []) : []; if (!need.every(x => p.days.includes(x))) return false; }
    if (e.spice && !p.spice.includes(e.spice)) return false;
    const b = LB.find(x => x[0] === e.budget), pr = priceFor(p, e.meal); if (b && (pr < b[2] || pr > b[3])) return false;
    return true;
  });
  if (e.sort === 'pa') r.sort((a, b) => priceFor(a, e.meal) - priceFor(b, e.meal)); else if (e.sort === 'pd') r.sort((a, b) => priceFor(b, e.meal) - priceFor(a, e.meal)); else r.sort((a, b) => b.rating - a.rating);
  return r;
};
const lcard = (p, e) => `<article class="pc"><a href="#/lunchboxes/provider/${p.id}" class="ph" data-seed="${p.seed}" aria-label="View ${esc(p.name)}"><span class="tag">Sample provider</span></a><div class="pb">
  <div class="m"><b>&#9733; ${p.rating} <i>(${p.reviews} reviews)</i></b></div><h3>${esc(p.name)}</h3><p class="mu">${esc(p.cuisines.join(' \u00B7 '))}</p>
  <p class="dt">${dietTag(p.diet)}${p.vegan ? ' &middot; Vegan options' : ''}</p><p class="mu">${p.meals.map(m => MN[m]).join(', ')} &middot; ${p.plans.map(x => lbl(OT, x).replace(' order', '').replace(' subscription', '')).join(', ')}</p>
  <p class="pr"><b>${inr(priceFor(p, e.meal))}</b> per lunchbox${e.meal === 'ld' ? ' (higher meal)' : ''}</p>
  <p class="mu">Delivers to ${esc(p.areas.join(', '))}<br>${p.days[0]}\u2013${p.days[p.days.length - 1]}${p.days.length === 7 ? ' (all week)' : ''} &middot; ${p.meals.map(m => MN[m] + ' ' + SLOTS[m]).join(', ')}</p>
  <div class="ba"><a class="btn sm ghost" href="#/lunchboxes/provider/${p.id}">View Menu</a><a class="btn sm" href="#/lunchboxes/order/${p.id}">Choose Plan</a></div></div></article>`;

V.lres = q => {
  pre = 'lr'; const e = lPrefs(q), list = lfilt(e);
  const sum = [e.addr && 'Delivery: ' + esc(e.addr), e.orderType && lbl(OT, e.orderType), e.meal && lbl(ML, e.meal), e.diet && lbl(LDT, e.diet)].filter(Boolean).join(' \u00B7 ');
  const f = `<details class="fbox" id="fb"><summary>Filters &amp; sorting</summary><form class="flt" data-form="lflt">
  ${fld('sort', 'Sort by', 'select', { opts: [['', 'Top rated'], ['pa', 'Price: low to high'], ['pd', 'Price: high to low']], val: e.sort })}
  ${fld('minr', 'Minimum rating', 'select', { opts: [['', 'Any'], ['4', '4.0 and up'], ['4.5', '4.5 and up']], val: q.minr || '' })}
  ${fld('meal', 'Meal type', 'select', { opts: opt(ML, 'Any meal'), val: e.meal })}
  ${fld('cuisine', 'Cuisine', 'select', { opts: [['', 'From my preferences'], ...LC.map(x => [x[0], x[1]])], val: q.cuisine || '' })}
  ${fld('budget', 'Price per lunchbox', 'select', { opts: opt(LB, 'Any price'), val: e.budget })}
  ${fld('plan', 'Subscription type', 'select', { opts: opt(OT, 'Any plan'), val: e.orderType })}
  ${fld('area', 'Delivery area', 'select', { opts: opt(ALLAREAS.map(a => [a, a]), 'From my address'), val: q.area || '' })}
  <a class="btn ghost" href="#/lunchboxes/results">Reset filters</a></form></details>`;
  return `<section class="wrap pg"><a class="link" href="#/lunchboxes">&larr; Edit preferences</a><h1 style="margin-top:14px">Matching lunchboxes</h1><p>${sum || 'Showing all sample providers.'}${e.broad ? ' (broader search)' : ''}</p>${f}
  <p class="rc" aria-live="polite">${list.length} provider${list.length === 1 ? '' : 's'} found &middot; sample providers. Delivery to your exact address is confirmed by the provider.</p>
  <div class="cg">${list.map(p => lcard(p, e)).join('') || `<div class="empty"><h3>No lunchboxes match your preferences</h3><p>Try a broader search or change your preferences.</p><div class="ba" style="justify-content:center"><a class="btn" href="#/lunchboxes/results?broad=1">Broaden my search</a><a class="btn ghost" href="#/lunchboxes">Edit preferences</a></div></div>`}</div></section>`;
};

V.ldet = id => {
  const p = LP.find(x => x.id === id); if (!p) return V.nf();
  return `<section class="wrap pg"><a class="link" href="#/lunchboxes/results">&larr; Back to results</a><div class="ph dhero" data-seed="${p.seed}" data-n="12" style="margin-top:16px"><span class="tag">Sample provider</span></div>
  <div class="dgrid"><div><h1>${esc(p.name)}</h1><p class="mu" style="margin:6px 0">&#9733; ${p.rating} (${p.reviews} sample reviews) &middot; ${esc(p.cuisines.join(', '))}</p><p>${esc(p.desc)}</p>
  <div class="facts"><div><small>Food</small><b>${dietTag(p.diet)}${p.vegan ? ' + vegan options' : ''}</b></div><div><small>Delivery days</small><b>${p.days.join(', ')}</b></div><div><small>Delivery coverage</small><b>${esc(p.areas.join(', '))}</b></div><div><small>Delivery fee</small><b>${p.fee ? inr(p.fee) + ' per delivery' : 'Free'}</b></div></div>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Meal timings and prices</h2><ul class="menu">${p.meals.map(m => `<li><b>${MN[m]}</b> &middot; ${SLOTS[m]} <span class="mu">(typical slot, sample)</span> &middot; ${inr(p.prices[m])} per lunchbox</li>`).join('')}</ul>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Plans</h2><p>${p.plans.map(x => lbl(OT, x)).join(' &middot; ')}</p>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Sample menu</h2><ul class="menu">${lMenu(p).map(d => `<li>${vd(d[1])}${esc(d[0])} <span class="mu">(${MN[d[3]]})</span></li>`).join('')}</ul>
  <p class="note">Allergies must be confirmed directly with the provider before ordering. Menu and availability are sample data.</p></div>
  <aside class="card"><h3 style="margin-bottom:8px">Ready to order?</h3><p class="mu" style="margin-bottom:14px">Choose a plan and review the price before confirming.</p><a class="btn full" href="#/lunchboxes/order/${p.id}">Choose Plan</a></aside></div></section>`;
};

V.lord = (id, q) => {
  const p = LP.find(x => x.id === id); if (!p) return V.nf();
  pre = 'o'; const d = db.get('lunchPrefs', {}), s = session();
  const plan = p.plans.includes(d.orderType) ? d.orderType : p.plans[0];
  const meal = d.meal && mealsOf(d.meal).every(m => p.meals.includes(m)) ? d.meal : p.meals[0];
  const mo = ML.filter(x => mealsOf(x[0]).every(m => p.meals.includes(m)));
  return `<section class="wrap pg"><a class="link" href="#/lunchboxes/provider/${p.id}">&larr; Back to menu</a><h1 style="margin-top:14px">Order from ${esc(p.name)}</h1><p>Review your plan and the price below. Nothing is ordered until you confirm.</p>
  <div class="dgrid"><form class="card" data-form="lorder" novalidate><input type="hidden" name="pid" value="${p.id}"><div class="fx">
  ${fld('plan', 'Plan', 'select', { opts: p.plans.map(x => [x, lbl(OT, x)]), val: plan })}${fld('meal', 'Meal', 'select', { opts: mo, val: meal })}
  ${fld('qty', 'Lunchboxes per meal', 'number', { attr: `min="1" max="${p.maxQty}"`, val: (QT.find(x => x[0] === d.qty) || [0, 0, 1])[2] })}${fld('start', 'Start date', 'date', { attr: `min="${today()}"` })}
  ${fld('addr', 'Delivery address', 'text', { val: d.addr, wide: 1, attr: 'autocomplete="street-address"' })}
  ${fld('name', 'Your name', 'text', { val: s?.name })}${fld('phone', 'Phone number', 'tel')}
  ${fld('notes', 'Allergies or special requests', 'textarea', { val: d.notes, wide: 1 })}</div>
  <p class="note">Confirm allergy requirements directly with the provider before ordering.</p><button class="btn full">Confirm order</button><p class="fm" role="status"></p></form>
  <aside class="card" id="sum" aria-live="polite" data-p="${p.id}"></aside></div></section>`;
};
V.lunch = (q, seg) => seg[1] === 'results' ? V.lres(q) : seg[1] === 'provider' ? V.ldet(seg[2]) : seg[1] === 'order' ? V.lord(seg[2], q) : seg[1] ? V.nf() : V.lform();

const sumUpdate = f => {
  const p = LP.find(x => x.id === f.pid.value), box = $('#sum'), qty = +f.qty.value, d = db.get('lunchPrefs', {});
  if (!p || !box) return;
  if (!(qty >= 1)) { box.innerHTML = '<h3>Order summary</h3><p class="mu">Enter how many lunchboxes you need.</p>'; return; }
  const c = lcalc(p, f.plan.value, f.meal.value, qty, dpwOf(d)), plan = f.plan.value;
  box.innerHTML = `<h3 style="margin-bottom:10px">Order summary</h3><ul class="menu"><li>${esc(p.name)} (sample provider)</li><li>${esc(lbl(OT, plan))} &middot; ${esc(lbl(ML, f.meal.value))}</li>
  <li>${qty} lunchbox${qty > 1 ? 'es' : ''} per meal: ${inr(c.per)}</li><li>Delivery fee: ${inr(c.fee)}</li><li>${plan === 'daily' ? 'Billed per delivery day' : plan === 'one' ? '1 delivery' : c.n + ' deliveries (' + (plan === 'monthly' ? '4 weeks' : '1 week') + ')'}</li></ul>
  <p style="margin-top:12px"><b style="font-size:1.4rem;color:var(--green)">${inr(plan === 'daily' ? c.each : c.total)}</b> <span class="mu">${plan === 'daily' ? 'per delivery day' : 'total'}</span></p>
  <p class="demo" style="margin-top:8px">Based on your delivery days. The provider confirms the final amount. No payment is taken in this demo.</p>`;
};
const ldata = f => { const g = n => (f.querySelector(`[name="${n}"]:checked`) || {}).value || '', a = n => [...f.querySelectorAll(`[name="${n}"]:checked`)].map(x => x.value), o = g('place') === 'other';
  return { place: g('place'), placeOther: o ? f.placeOther.value : '', addr: f.addr.value, orderType: g('orderType'), meal: g('meal'), diet: g('diet'), cuisines: a('cuisines'), freq: g('orderType') === 'one' ? '' : g('freq'), days: g('freq') === 'selected' && g('orderType') !== 'one' ? a('days') : [], spice: g('spice'), qty: g('qty'), budget: g('budget'), notes: f.notes.value }; };
const syncL = f => {
  const g = n => (f.querySelector(`[name="${n}"]:checked`) || {}).value;
  f.querySelector('[data-w="other"]').hidden = g('place') !== 'other';
  f.querySelector('[data-w="freq"]').hidden = g('orderType') === 'one';
  f.querySelector('[data-w="days"]').hidden = g('freq') !== 'selected';
};
H.lprefs = f => {
  const d = ldata(f); let ok = true, first = null;
  const bad = (n, m) => { f.querySelector(`[data-e="${n}"]`).textContent = m; if (m) { ok = false; first = first || f.querySelector(`[name="${n}"]`); } };
  bad('place', d.place ? '' : 'Choose where to deliver.'); bad('placeOther', d.place === 'other' && !d.placeOther.trim() ? 'Enter the delivery location.' : '');
  bad('addr', d.addr.trim() ? '' : 'Enter your delivery address or locality.'); bad('orderType', d.orderType ? '' : 'Choose an order type.'); bad('meal', d.meal ? '' : 'Choose a meal.'); bad('diet', d.diet ? '' : 'Choose a food preference.');
  bad('cuisines', d.cuisines.length ? '' : 'Pick at least one cuisine, or choose Any cuisine.');
  bad('freq', d.orderType !== 'one' && !d.freq ? 'Tell us how often you need meals.' : ''); bad('days', d.freq === 'selected' && !d.days.length ? 'Select at least one day.' : '');
  bad('spice', d.spice ? '' : 'Choose a spice level.'); bad('qty', d.qty ? '' : 'Choose a quantity.'); bad('budget', d.budget ? '' : 'Choose a budget.');
  if (!ok) { first.focus(); return; }
  if (!db.set('lunchPrefs', d)) return say(f, 'Your preferences could not be saved. Check that browser storage is allowed.', 'bad');
  location.hash = '#/lunchboxes/results';
};
const saveDraft = f => { const d = ldata(f); db.set('lunchPrefs', { ...db.get('lunchPrefs', {}), ...d }); };
H.lflt = f => { const o = Object.fromEntries(new FormData(f)); location.hash = '#/lunchboxes/results?' + qs(o); };
H.lorder = f => {
  const p = LP.find(x => x.id === f.pid.value);
  if (!val(f, { plan: { req: 1 }, meal: { req: 1 }, qty: { req: 1, num: 1, max: p.maxQty }, start: { req: 1, date: 1 }, addr: { req: 1 }, name: { req: 1 }, phone: { req: 1, phone: 1 } })) return;
  const s = session(), d = Object.fromEntries(new FormData(f)), c = lcalc(p, d.plan, d.meal, +d.qty, dpwOf(db.get('lunchPrefs', {}))), id = newId('LB');
  const list = db.get('lunchOrders', []); list.push({ ...d, id, user: s?.email || null, provider: p.name, total: d.plan === 'daily' ? c.each : c.total, status: 'Submitted', createdAt: new Date().toISOString() });
  if (!db.set('lunchOrders', list)) return say(f, 'Your order could not be saved. Check that browser storage is allowed and try again.', 'bad');
  say(f, `Order ${id} saved on this device (demo mode). The provider has not received it and nothing was charged. ${s ? 'See it in your account.' : 'Log in to track orders.'}`, 'ok');
};

/* ---------- workers (home cooks) ----------
   DEMO MODE: sample cooks below. Set CFG.workersApi to your backend base URL to use live data:
     GET  {api}/cooks          -> array of cooks shaped like WDEMO (id, name, rate, ...)
     POST {api}/cook-bookings  -> receives the booking object saved below
   Nothing about verification, ratings or reviews is shown unless the data contains it. */
const WM = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner']];
const WF = [['one', 'One-time'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']];
const WDI = [['veg', 'Vegetarian'], ['non', 'Non-vegetarian'], ['both', 'Both veg and non-veg']];
const WC = [['South Indian', 'South Indian'], ['North Indian', 'North Indian'], ['Andhra / Telangana', 'Andhra / Telangana'], ['Chinese', 'Chinese'], ['Continental', 'Continental'], ['any', 'Any cuisine']];
const WH = [['1', '1 hour'], ['1.5', '1.5 hours'], ['2', '2 hours'], ['3', '3 hours'], ['4', '4 hours']];
const WB = [['any', 'Any budget', 0, 1e9], ['u300', 'Under ₹300 per visit', 0, 299], ['300-500', '₹300–₹500', 300, 500], ['500-800', '₹500–₹800', 500, 800], ['800+', '₹800+', 800, 1e9]];
const WPAT = [['every', 'Every day'], ['weekdays', 'Monday–Friday']];
const WT = [['groceries', 'Grocery shopping', 'cook'], ['prep', 'Meal prep for later', 'cook'], ['kclean', 'Clean the kitchen after cooking', 'cook'], ['dishes', 'Wash utensils from the day', 'home'], ['sweep', 'House cleaning', 'home'], ['laundry', 'Laundry', 'home']];
const WDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WDEMO = [
  { id: 'cook-lakshmi', name: 'Lakshmi Devi', hue: 24, exp: 12, cuisines: ['South Indian', 'Andhra / Telangana'], meals: ['breakfast', 'lunch', 'dinner'], diet: 'veg', areas: ['Madhapur', 'Gachibowli'], freqs: ['one', 'daily', 'weekly', 'monthly'], days: WDAYS.slice(0, 6), window: ['06:30', '13:00'], maxPeople: 6, minHours: 1.5, rate: 160, extra: 20, tasks: { groceries: 100, kclean: 0, dishes: 0 }, languages: ['Telugu', 'Hindi'], bio: 'Sample profile. Home-style South Indian vegetarian cooking for families.' },
  { id: 'cook-fatima', name: 'Fatima Begum', hue: 160, exp: 8, cuisines: ['North Indian', 'Andhra / Telangana'], meals: ['lunch', 'dinner'], diet: 'both', areas: ['Banjara Hills', 'Jubilee Hills', 'Secunderabad'], freqs: ['one', 'weekly', 'monthly'], days: WDAYS, window: ['10:00', '21:00'], maxPeople: 8, minHours: 2, rate: 220, extra: 30, tasks: { prep: 150, kclean: 0, groceries: 120 }, languages: ['Telugu', 'Hindi', 'Urdu'], bio: 'Sample profile. Veg and non-veg meals, biryani and curry specialities.' },
  { id: 'cook-suresh', name: 'Suresh Kumar', hue: 210, exp: 15, cuisines: ['North Indian', 'Chinese', 'Continental'], meals: ['lunch', 'dinner'], diet: 'both', areas: ['Madhapur', 'Gachibowli', 'Jubilee Hills'], freqs: ['one', 'daily', 'weekly', 'monthly'], days: WDAYS.slice(0, 5), window: ['11:00', '21:30'], maxPeople: 12, minHours: 2, rate: 300, extra: 40, tasks: { groceries: 150, prep: 200, kclean: 0 }, languages: ['English', 'Hindi', 'Telugu'], bio: 'Sample profile. Experienced in multi-dish menus for small gatherings and busy households.' },
  { id: 'cook-anitha', name: 'Anitha Reddy', hue: 330, exp: 5, cuisines: ['South Indian', 'North Indian'], meals: ['breakfast', 'lunch'], diet: 'veg', areas: ['Gachibowli', 'Madhapur'], freqs: ['daily', 'weekly', 'monthly'], days: WDAYS.slice(0, 6), window: ['06:00', '12:30'], maxPeople: 4, minHours: 1, rate: 140, extra: 20, tasks: { dishes: 60, sweep: 200, kclean: 0 }, languages: ['Telugu', 'English'], bio: 'Sample profile. Quick daily breakfast and lunch for small households. Also offers cleaning as a separate service.' },
  { id: 'cook-ramesh', name: 'Ramesh Babu', hue: 90, exp: 10, cuisines: ['Andhra / Telangana', 'South Indian'], meals: ['lunch', 'dinner'], diet: 'both', areas: ['Secunderabad', 'Banjara Hills'], freqs: ['one', 'weekly'], days: ['Sat', 'Sun'], window: ['09:00', '20:00'], maxPeople: 15, minHours: 3, rate: 260, extra: 25, tasks: { groceries: 150, prep: 180, kclean: 0, laundry: 250 }, languages: ['Telugu', 'Hindi'], bio: 'Sample profile. Weekend cook for family lunches and small get-togethers.' }
];
const W = { cooks: WDEMO, src: 'demo' };
const wnorm = c => c && c.id && c.name && +c.rate > 0 ? { hue: 150, exp: null, cuisines: [], meals: [], diet: 'both', areas: [], freqs: ['one'], days: WDAYS, window: ['08:00', '20:00'], maxPeople: 4, minHours: 1, extra: 0, tasks: {}, languages: [], bio: '', ...c, rate: +c.rate } : null;
if (CFG.workersApi) fetch(CFG.workersApi.replace(/\/$/, '') + '/cooks').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(a => { if (!Array.isArray(a)) throw new Error('bad'); W.cooks = a.map(wnorm).filter(Boolean); W.src = 'live'; })
  .catch(() => { W.src = 'fallback'; }).finally(() => { if (location.hash.startsWith('#/workers')) route(); });
const wcook = id => W.cooks.find(c => c.id === id);
const wareas = () => [...new Set([...ALLAREAS, ...W.cooks.flatMap(c => c.areas)])];
const mins = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const wdow = d => (new Date(d + 'T00:00').getDay() + 6) % 7;
const wneed = e => e.freq === 'daily' ? (e.pattern === 'weekdays' ? WDAYS.slice(0, 5) : WDAYS) : e.freq === 'weekly' || e.freq === 'monthly' ? (e.days || []) : e.date ? [WDAYS[wdow(e.date)]] : [];
const wdpw = e => e.freq === 'daily' ? (e.pattern === 'weekdays' ? 5 : 7) : e.freq === 'weekly' || e.freq === 'monthly' ? Math.max((e.days || []).length, 1) : 1;
const wfits = (c, time, hrs) => !time || (mins(time) >= mins(c.window[0]) && mins(time) + hrs * 60 <= mins(c.window[1]));
const tl = id => (WT.find(t => t[0] === id) || [id, id, 'cook'])[1];
const tk = id => (WT.find(t => t[0] === id) || [])[2] || 'cook';
const wquote = (c, d) => {
  const hrs = +d.hours || c.minHours, ppl = +d.people || 1, tasks = (d.tasks || []).filter(t => t in c.tasks);
  const cooking = c.rate * hrs + c.extra * Math.max(0, ppl - 4) * hrs;
  const lines = tasks.map(t => ({ id: t, label: tl(t), kind: tk(t), fee: c.tasks[t] }));
  const cookAdd = lines.filter(l => l.kind === 'cook').reduce((s, l) => s + l.fee, 0), home = lines.filter(l => l.kind === 'home').reduce((s, l) => s + l.fee, 0);
  const per = cooking + cookAdd + home, dpw = wdpw(d), plan = d.plan || d.freq || 'one';
  const visits = plan === 'one' ? 1 : plan === 'monthly' ? dpw * 4 : dpw;
  return { hrs, ppl, cooking, lines, cookAdd, home, per, visits, total: per * visits, plan, dpw };
};
const wmatch = (c, e) => {
  if (e.loc) { const t = e.loc.toLowerCase(), known = wareas().filter(a => t.includes(a.toLowerCase())); if (known.length ? !c.areas.some(a => known.includes(a)) : !t.includes((c.city || 'Hyderabad').toLowerCase())) return false; }
  if (e.freq && !c.freqs.includes(e.freq)) return false;
  if (e.freq && !wneed(e).every(x => c.days.includes(x))) return false;
  if ((e.meals || []).some(m => !c.meals.includes(m))) return false;
  if (e.diet === 'non' || e.diet === 'both') { if (c.diet !== 'both') return false; }
  const cu = e.cuisines || []; if (cu.length && !cu.includes('any') && !cu.some(x => c.cuisines.includes(x))) return false;
  if (+e.people && +e.people > c.maxPeople) return false;
  if (+e.hours && +e.hours < c.minHours) return false;
  if (!wfits(c, e.time, +e.hours || c.minHours)) return false;
  if ((e.tasks || []).some(t => !(t in c.tasks))) return false;
  const b = WB.find(x => x[0] === e.budget), pr = wquote(c, { ...e, plan: e.freq }).per; if (b && (pr < b[2] || pr > b[3])) return false;
  return true;
};
const wlist = e => { const r = W.cooks.filter(c => wmatch(c, e)); if (e.sort === 'pa') r.sort((a, b) => a.rate - b.rate); else if (e.sort === 'pd') r.sort((a, b) => b.rate - a.rate); else r.sort((a, b) => (b.exp || 0) - (a.exp || 0)); return r; };

const wav = (c, lg) => `<div class="av${lg ? ' lg' : ''}" style="--h:${+c.hue || 150}" role="img" aria-label="${c.photo ? 'Photo of ' : 'No photo yet for '}${esc(c.name)}">${c.photo ? `<img src="${esc(c.photo)}" alt="">` : esc(c.name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase())}</div>`;
const wver = c => { const v = c.verification, items = v && Array.isArray(v.items) ? v.items : []; return items.length ? { ok: true, items } : { ok: false, items: [] }; };
const wbadge = c => wver(c).ok ? '<span class="vb ok">&#10003; Verified</span>' : '<span class="vb">Not yet verified</span>';
const wrate = c => c.rating && c.reviews ? `&#9733; ${esc(c.rating)} <i>(${esc(c.reviews)} reviews)</i>` : '<i>No ratings yet</i>';
const wnote = () => W.src === 'demo' ? '<p class="note">Demo mode: these are sample cooks for development. Connect your backend (CFG.workersApi) to show real, approved providers.</p>' : W.src === 'fallback' ? '<p class="note">Live cooks could not be loaded, so sample cooks are shown instead.</p>' : '';
const wavail = c => `${c.days.length === 7 ? 'All week' : c.days.length > 1 && WDAYS.indexOf(c.days[c.days.length - 1]) - WDAYS.indexOf(c.days[0]) === c.days.length - 1 ? c.days[0] + '–' + c.days[c.days.length - 1] : c.days.join(', ')} &middot; ${esc(c.window[0])}–${esc(c.window[1])}`;
const pills = (a, cls) => `<div class="pl${cls ? ' ' + cls : ''}">${a.map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
const wtaskSplit = c => { const ids = Object.keys(c.tasks); return { inc: ids.filter(i => c.tasks[i] === 0), paid: ids.filter(i => c.tasks[i] > 0) }; };

const wcard = (c, e) => { const t = wtaskSplit(c), q = e && e.hours ? wquote(c, { ...e, plan: e.freq }) : null;
  return `<article class="pc wk"><div class="pb"><div class="wh">${wav(c)}<div><h3>${esc(c.name)}</h3><p class="mu">${c.exp ? c.exp + ' years experience' : 'Experience not listed'}</p><p>${wbadge(c)}${c.demo === false ? '' : ' <span class="vb">Sample provider</span>'}</p></div></div>
  <div class="m"><b>${wrate(c)}</b></div>${pills(c.cuisines)}<p class="dt">${esc(c.meals.map(m => lbl(WM, m)).join(', '))} &middot; ${dietTag(c.diet)}</p>
  <p class="pr"><b>${inr(c.rate)}</b> per hour${q ? ` &middot; about <b>${inr(q.per)}</b> per visit` : ''}<br><span class="mu">min ${c.minHours} hr &middot; up to ${c.maxPeople} people</span></p>
  <p class="mu"><b>Available:</b> ${wavail(c)}<br><b>Area:</b> ${esc(c.areas.join(', '))}</p>
  ${t.inc.length ? `<p class="mu"><b>Included:</b></p>${pills(t.inc.map(tl), 'h')}` : ''}${t.paid.length ? `<p class="mu"><b>Optional add-ons (extra):</b> ${esc(t.paid.map(tl).join(', '))}</p>` : ''}
  <div class="ba"><a class="btn sm ghost" href="#/workers/${esc(c.id)}">View Profile</a><a class="btn sm" href="#/workers/book/${esc(c.id)}">Book Cook</a></div></div></article>`; };

const taskChecks = (n, l, ids, c, vals) => { const lab = i => `${tl(i)} ${c ? (c.tasks[i] ? '(+' + inr(c.tasks[i]) + ' per visit)' : '(included)') : ''}`;
  const cook = ids.filter(i => tk(i) === 'cook'), home = ids.filter(i => tk(i) === 'home'), one = (leg, a) => a.length ? checks(n, leg, a.map(i => [i, lab(i)]), vals) : '';
  return `<div class="tg">${one('Cooking-related help', cook)}${one('Cleaning and other household work (separate from cooking)', home)}${!ids.length ? `<p class="mu">${esc(l)}: this cook has not listed any extra tasks.</p>` : ''}</div>`; };

/* --- preferences form --- */
V.wform = () => {
  pre = 'w'; const d = db.get('cookPrefs', {});
  return `<section class="wrap pg"><a class="link" href="#/">&larr; Back to Home</a><h1 style="margin-top:14px">Find Your Perfect Home Cook</h1><p>Tell us what you need and we will show cooks who offer it. Cooking and household help are listed separately.</p>${wnote()}
  <form class="card lf" data-form="wprefs" novalidate>
  ${fld('loc', 'Location', 'text', { val: d.loc, ph: 'e.g. Madhapur, Hyderabad', attr: 'list="areas" autocomplete="off"' })}<datalist id="areas">${wareas().map(a => `<option value="${esc(a)}, Hyderabad">`).join('')}</datalist>
  ${radios('freq', 'How often do you need a cook?', WF, d.freq)}
  <div data-w="pat">${radios('pattern', 'Daily visits', WPAT, d.pattern)}</div>
  <div data-w="days">${checks('days', 'Which days of the week?', WDAYS.map(x => [x, x]), d.days)}</div>
  ${checks('meals', 'Meals required', WM, d.meals)}
  ${radios('diet', 'Food preference', WDI, d.diet)}
  ${checks('cuisines', 'Cuisine (choose one or more)', WC, d.cuisines)}
  <div class="fx">${fld('people', 'Number of people', 'number', { attr: 'min="1"', val: d.people })}${fld('hours', 'Visit duration', 'select', { opts: opt(WH, 'Select duration'), val: d.hours })}
  ${fld('budget', 'Budget per visit', 'select', { opts: WB.map(x => [x[0], x[1]]), val: d.budget || 'any' })}${fld('date', '<span data-l="date">Preferred date</span>', 'date', { attr: `min="${today()}"`, val: d.date })}
  ${fld('time', 'Preferred start time', 'time', { val: d.time })}</div>
  ${taskChecks('tasks', 'Extra tasks', WT.map(t => t[0]), null, d.tasks).replace('Cooking-related help', 'Extra tasks: cooking-related (optional)')}
  <p class="mu" style="margin-top:-10px">Cooks only appear if they offer every task you tick.</p>
  ${fld('notes', 'Dietary needs or other requirements (optional)', 'textarea', { val: d.notes, ph: 'E.g., no onion or garlic, diabetic-friendly, kids meals...' })}
  <p class="note">Allergy and dietary needs must be confirmed directly with the cook. Mealora cannot guarantee allergen-free meals.</p>
  <button class="btn">Find Matching Cooks</button><p class="fm" role="status"></p></form></section>`;
};
const wpdata = f => { const g = n => (f.querySelector(`[name="${n}"]:checked`) || {}).value || '', a = n => [...f.querySelectorAll(`[name="${n}"]:checked`)].map(x => x.value), fr = g('freq');
  return { loc: f.loc.value, freq: fr, pattern: fr === 'daily' ? g('pattern') : '', days: fr === 'weekly' || fr === 'monthly' ? a('days') : [], meals: a('meals'), diet: g('diet'), cuisines: a('cuisines'), people: f.people.value, hours: f.hours.value, budget: f.budget.value, date: f.date.value, time: f.time.value, tasks: a('tasks'), notes: f.notes.value }; };
const syncW = f => { const g = n => (f.querySelector(`[name="${n}"]:checked`) || {}).value, fr = g('freq');
  f.querySelector('[data-w="pat"]').hidden = fr !== 'daily'; f.querySelector('[data-w="days"]').hidden = !(fr === 'weekly' || fr === 'monthly');
  const l = f.querySelector('[data-l="date"]'); if (l) l.textContent = fr && fr !== 'one' ? 'Preferred start date' : 'Preferred date'; };
const wDraft = f => db.set('cookPrefs', { ...db.get('cookPrefs', {}), ...wpdata(f) });
const wbad = (f, n, m) => { const p = f.querySelector(`[data-e="${n}"]`), el = f.querySelector(`[name="${n}"]`); if (p) p.textContent = m; if (el && el.type !== 'radio' && el.type !== 'checkbox') el.setAttribute('aria-invalid', !!m); return m ? el : null; };
H.wprefs = f => {
  const d = wpdata(f), bad = [];
  const chk = (n, m) => { const el = wbad(f, n, m); if (el) bad.push(el); };
  chk('loc', d.loc.trim() ? '' : 'Enter your location.'); chk('freq', d.freq ? '' : 'Choose how often you need a cook.');
  chk('pattern', d.freq === 'daily' && !d.pattern ? 'Choose daily visit days.' : ''); chk('days', (d.freq === 'weekly' || d.freq === 'monthly') && !d.days.length ? 'Select at least one day.' : '');
  chk('meals', d.meals.length ? '' : 'Select at least one meal.'); chk('diet', d.diet ? '' : 'Choose a food preference.'); chk('cuisines', d.cuisines.length ? '' : 'Pick a cuisine, or choose Any cuisine.');
  chk('people', +d.people >= 1 ? '' : 'Enter 1 or more people.'); chk('hours', d.hours ? '' : 'Choose a duration.');
  chk('date', !d.date ? 'Choose a date.' : d.date < today() ? 'Choose today or a later date.' : ''); chk('time', d.time ? '' : 'Choose a start time.');
  if (bad.length) { bad[0].focus(); return; }
  if (!db.set('cookPrefs', d)) return say(f, 'Your preferences could not be saved. Check that browser storage is allowed.', 'bad');
  location.hash = '#/workers/results';
};

/* --- results --- */
V.wres = q => {
  pre = 'wr'; const e = { ...db.get('cookPrefs', {}), sort: q.sort || '' }, list = wlist(e);
  const sum = [e.loc && 'Location: ' + esc(e.loc), e.freq && lbl(WF, e.freq), (e.meals || []).map(m => lbl(WM, m)).join(' + '), e.diet && lbl(WDI, e.diet), e.people && e.people + ' people', e.hours && e.hours + ' hr', e.date && 'from ' + esc(e.date) + (e.time ? ' at ' + esc(e.time) : '')].filter(Boolean).join(' · ');
  return `<section class="wrap pg"><a class="link" href="#/workers">&larr; Edit preferences</a><h1 style="margin-top:14px">Matching home cooks</h1><p>${sum || 'Showing all cooks. Set your preferences to narrow the list.'}</p>${wnote()}
  <form class="flt wflt" data-form="wflt" style="padding:0;max-width:280px">${fld('sort', 'Sort by', 'select', { opts: [['', 'Most experienced'], ['pa', 'Rate: low to high'], ['pd', 'Rate: high to low']], val: e.sort })}</form>
  <p class="rc" aria-live="polite">${list.length} cook${list.length === 1 ? '' : 's'} found${W.src === 'live' ? '' : ' &middot; sample cooks'}. Availability is confirmed by the cook after you book.</p>
  <div class="cg">${list.map(c => wcard(c, e)).join('') || `<div class="empty"><h3>No cooks match these preferences</h3><p>Try a different area, day, meal, task or duration.</p><a class="btn" href="#/workers">Change preferences</a></div>`}</div></section>`;
};
H.wflt = f => { location.hash = '#/workers/results?' + qs({ sort: f.sort.value }); };

/* --- profile --- */
V.wdet = id => {
  const c = wcook(id); if (!c) return V.nf(); const t = wtaskSplit(c), v = wver(c), grp = k => Object.keys(c.tasks).filter(i => tk(i) === k);
  const ts = (k, h) => grp(k).length ? `<h3 style="margin:14px 0 6px">${h}</h3><ul class="menu">${grp(k).map(i => `<li>${esc(tl(i))} <span class="mu">${c.tasks[i] ? '+' + inr(c.tasks[i]) + ' per visit' : 'Included in the rate'}</span></li>`).join('')}</ul>` : '';
  return `<section class="wrap pg"><a class="link" href="#/workers/results">&larr; Back to results</a>
  <div class="wh" style="margin:18px 0">${wav(c, 1)}<div><h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">${esc(c.name)}</h1><p class="mu" style="margin:6px 0">${wrate(c)} &middot; ${c.exp ? c.exp + ' years experience' : 'Experience not listed'}</p><p>${wbadge(c)} <span class="vb">${c.demo === false ? 'Listed provider' : 'Sample provider'}</span></p></div></div>${wnote()}
  <div class="dgrid"><div>${c.bio ? `<p>${esc(c.bio)}</p>` : ''}
  <div class="facts"><div><small>Hourly rate</small><b>${inr(c.rate)}</b></div><div><small>Minimum visit</small><b>${c.minHours} hr</b></div><div><small>Group size</small><b>Up to ${c.maxPeople} people${c.extra ? ' (+' + inr(c.extra) + '/hr per person above 4)' : ''}</b></div><div><small>Food</small><b>${dietTag(c.diet)}</b></div></div>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Cooking services</h2><p class="mu">Meals offered</p>${pills(c.meals.map(m => lbl(WM, m)))}<p class="mu" style="margin-top:10px">Cuisines</p>${pills(c.cuisines)}${c.languages && c.languages.length ? `<p class="mu" style="margin-top:10px">Languages</p>${pills(c.languages)}` : ''}
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Arrangements</h2><p>${c.freqs.map(x => lbl(WF, x)).join(' &middot; ')}</p>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Availability and service area</h2><p><b>Days and hours:</b> ${wavail(c)}</p><p><b>Areas:</b> ${esc(c.areas.join(', '))}${c.city ? ', ' + esc(c.city) : ', Hyderabad'}</p>
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Extra tasks this cook offers</h2>${Object.keys(c.tasks).length ? ts('cook', 'Cooking-related') + ts('home', 'Cleaning and other household work (separate service)') : '<p class="mu">This cook has not listed any extra tasks.</p>'}
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Verification</h2>${v.ok ? `<ul class="menu">${v.items.map(i => `<li>&#10003; ${esc(i.label || i)}${i.date ? ` <span class="mu">(${esc(i.date)})</span>` : ''}</li>`).join('')}</ul>` : '<p class="note">This cook has not been verified by Mealora yet. No identity or background check is shown for this profile.</p>'}
  <h2 style="font-size:1.4rem;margin:24px 0 8px">Reviews</h2><div class="rev"><p>${c.reviews ? esc(c.reviews) + ' reviews' : 'No reviews yet.'}</p><small>Reviews appear here only after real bookings.</small></div></div>
  <aside class="card"><h3 style="margin-bottom:8px">Book ${esc(c.name.split(' ')[0])}</h3><p class="mu" style="margin-bottom:14px">Choose your plan and review the price before you confirm.</p><a class="btn full" href="#/workers/book/${esc(c.id)}">Book Cook</a></aside></div></section>`;
};

/* --- booking --- */
V.wbook = id => {
  const c = wcook(id); if (!c) return V.nf(); pre = 'b';
  const d = db.get('cookPrefs', {}), s = session(), plan = c.freqs.includes(d.freq) ? d.freq : c.freqs[0];
  const meals = (d.meals || []).filter(m => c.meals.includes(m)), hrs = WH.filter(x => +x[0] >= c.minHours), hv = hrs.some(x => x[0] === d.hours) ? d.hours : hrs[0][0];
  const tasks = (d.tasks || []).filter(t => t in c.tasks), ppl = Math.min(+d.people || 2, c.maxPeople);
  return `<section class="wrap pg"><a class="link" href="#/workers/${esc(c.id)}">&larr; Back to profile</a><h1 style="margin-top:14px">Book ${esc(c.name)}</h1><p>Review your plan and the price below. Nothing is booked until you confirm.</p>${wnote()}
  <div class="dgrid"><form class="card" data-form="wbook" novalidate><input type="hidden" name="cid" value="${esc(c.id)}">
  <div class="fx">${fld('plan', 'Arrangement', 'select', { opts: c.freqs.map(x => [x, lbl(WF, x)]), val: plan })}${fld('hours', 'Visit duration', 'select', { opts: hrs, val: hv })}
  ${fld('date', '<span data-l="date">Date</span>', 'date', { attr: `min="${today()}"`, val: d.date })}${fld('time', 'Start time', 'time', { val: d.time })}
  ${fld('people', `Number of people (max ${c.maxPeople})`, 'number', { attr: `min="1" max="${c.maxPeople}"`, val: ppl })}</div>
  <div data-w="pat">${radios('pattern', 'Daily visits', WPAT.filter(x => wneedOk(c, x[0])), d.pattern)}</div>
  <div data-w="days">${checks('days', 'Which days of the week?', c.days.map(x => [x, x]), (d.days || []).filter(x => c.days.includes(x)))}</div>
  <div style="margin:14px 0">${checks('meals', 'Meals required', c.meals.map(m => [m, lbl(WM, m)]), meals)}</div>
  ${taskChecks('tasks', 'Extra tasks', Object.keys(c.tasks), c, tasks)}
  <div class="fx" style="margin-top:14px">${fld('addr', 'Service address', 'text', { wide: 1, val: d.loc, attr: 'autocomplete="street-address"', ph: 'House no., street, locality' })}${fld('name', 'Your name', 'text', { val: s?.name, attr: 'autocomplete="name"' })}${fld('phone', 'Phone number', 'tel', { attr: 'autocomplete="tel"', ph: '10-digit mobile' })}
  ${fld('notes', 'Dietary needs or other requirements', 'textarea', { wide: 1, val: d.notes })}</div>
  <p class="note">Confirm allergies and dietary needs directly with the cook before the first visit.</p><button class="btn full">Confirm booking</button><p class="fm" role="status"></p></form>
  <aside class="card" id="wsum" aria-live="polite"></aside></div></section>`;
};
const wneedOk = (c, p) => (p === 'every' ? WDAYS : WDAYS.slice(0, 5)).every(x => c.days.includes(x));
const wbdata = f => { const g = n => (f.querySelector(`[name="${n}"]:checked`) || {}).value || '', a = n => [...f.querySelectorAll(`[name="${n}"]:checked`)].map(x => x.value), p = f.plan.value;
  return { cid: f.cid.value, plan: p, freq: p, hours: f.hours.value, date: f.date.value, time: f.time.value, people: f.people.value, pattern: p === 'daily' ? g('pattern') : '', days: p === 'weekly' || p === 'monthly' ? a('days') : [], meals: a('meals'), tasks: a('tasks'), addr: f.addr.value, name: f.name.value, phone: f.phone.value, notes: f.notes.value }; };
const syncB = f => { const p = f.plan.value; f.querySelector('[data-w="pat"]').hidden = p !== 'daily'; f.querySelector('[data-w="days"]').hidden = !(p === 'weekly' || p === 'monthly');
  const l = f.querySelector('[data-l="date"]'); if (l) l.textContent = p === 'one' ? 'Date' : 'Start date'; };
const wsum = f => {
  const c = wcook(f.cid.value), box = $('#wsum'); if (!c || !box) return; const d = wbdata(f);
  if (!(+d.people >= 1)) { box.innerHTML = '<h3>Price summary</h3><p class="mu">Enter the number of people.</p>'; return; }
  const q = wquote(c, d), row = (a, b) => `<div class="sumrow"><span>${a}</span><b>${b}</b></div>`, cl = q.lines.filter(l => l.kind === 'cook'), hl = q.lines.filter(l => l.kind === 'home');
  box.innerHTML = `<h3 style="margin-bottom:10px">Price summary</h3><p class="mu">${esc(c.name)} &middot; ${esc(lbl(WF, q.plan))}</p>
  <p class="mu" style="margin-top:8px"><b>Cooking service</b></p>${row(`Cooking: ${inr(c.rate)} &times; ${q.hrs} hr`, inr(c.rate * q.hrs))}${q.ppl > 4 && c.extra ? row(`${q.ppl - 4} extra ${q.ppl - 4 > 1 ? 'people' : 'person'} &times; ${q.hrs} hr`, inr(c.extra * (q.ppl - 4) * q.hrs)) : ''}${cl.map(l => row(esc(l.label), l.fee ? inr(l.fee) : 'Included')).join('')}
  ${hl.length ? `<p class="mu" style="margin-top:8px"><b>Household work (separate from cooking)</b></p>${hl.map(l => row(esc(l.label), l.fee ? inr(l.fee) : 'Included')).join('')}` : ''}
  ${row('Per visit', inr(q.per))}${q.plan === 'one' ? '' : row(q.plan === 'monthly' ? `${q.visits} visits (4 weeks)` : q.plan === 'weekly' ? `${q.visits} visit${q.visits > 1 ? 's' : ''} per week` : `${q.visits} visits per week`, inr(q.total))}
  <p style="margin-top:12px"><b style="font-size:1.4rem;color:var(--green)">${inr(q.plan === 'daily' ? q.per : q.total)}</b> <span class="mu">${q.plan === 'daily' ? 'per visit' : q.plan === 'one' ? 'total' : q.plan === 'weekly' ? 'per week' : 'for 4 weeks'}</span></p>
  <p class="demo" style="margin-top:8px">The cook confirms the final amount. No payment is taken${W.src === 'live' ? '' : ' in this demo'}.</p>`;
};
H.wbook = async f => {
  const c = wcook(f.cid.value), d = wbdata(f), bad = [], chk = (n, m) => { const el = wbad(f, n, m); if (el) bad.push(el); };
  chk('plan', d.plan ? '' : 'Choose an arrangement.');
  chk('pattern', d.plan === 'daily' && !d.pattern ? 'Choose daily visit days.' : ''); chk('days', (d.plan === 'weekly' || d.plan === 'monthly') && !d.days.length ? 'Select at least one day.' : '');
  chk('date', !d.date ? 'Choose a date.' : d.date < today() ? 'Choose today or a later date.' : !c.days.includes(WDAYS[wdow(d.date)]) ? `${c.name.split(' ')[0]} is not available on ${WDAYS[wdow(d.date)]}s.` : '');
  chk('time', !d.time ? 'Choose a start time.' : !wfits(c, d.time, +d.hours) ? `Visit must fit between ${c.window[0]} and ${c.window[1]}.` : '');
  chk('people', !(+d.people >= 1) ? 'Enter 1 or more people.' : +d.people > c.maxPeople ? `This cook serves up to ${c.maxPeople} people.` : '');
  chk('meals', d.meals.length ? '' : 'Select at least one meal.'); chk('addr', d.addr.trim() ? '' : 'Enter the service address.'); chk('name', d.name.trim() ? '' : 'Enter your name.');
  chk('phone', /^[6-9]\d{9}$/.test(d.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')) ? '' : 'Enter a valid 10-digit mobile number.');
  if (bad.length) { bad[0].focus(); return; }
  const q = wquote(c, d), s = session(), id = newId('CB');
  const b = { ...d, id, user: s?.email || null, cookId: c.id, cookName: c.name, demoCook: W.src !== 'live', perVisit: q.per, total: q.total, visits: q.visits, status: 'Submitted', createdAt: new Date().toISOString() };
  if (CFG.workersApi) { try { const r = await fetch(CFG.workersApi.replace(/\/$/, '') + '/cook-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw new Error(r.status); b.sent = true; } catch { return say(f, 'Your booking could not be sent. Please try again.', 'bad'); } }
  const list = db.get('cookBookings', []); list.push(b);
  if (!db.set('cookBookings', list)) return say(f, 'Your booking could not be saved. Check that browser storage is allowed and try again.', 'bad');
  location.hash = '#/workers/confirmed/' + id;
};
V.wdone = ref => {
  const b = db.get('cookBookings', []).find(x => x.id === ref), c = b && wcook(b.cookId); if (!b) return V.nf();
  const q = c ? wquote(c, b) : null, row = (a, v) => `<li>${a}: <b>${v}</b></li>`;
  return `<section class="wrap pg"><h1>Booking request received</h1><p>Reference <b>${esc(b.id)}</b> <span class="st">${esc(b.status)}</span></p>
  <div class="card" style="max-width:640px"><ul class="menu">${row('Cook', esc(b.cookName))}${row('Arrangement', esc(lbl(WF, b.plan)))}${row('Starts', esc(b.date) + ' at ' + esc(b.time))}${row('Duration', esc(b.hours) + ' hr')}${row('People', esc(b.people))}${row('Meals', esc(b.meals.map(m => lbl(WM, m)).join(', ')))}
  ${b.plan === 'daily' ? row('Days', esc(lbl(WPAT, b.pattern))) : b.days.length ? row('Days', esc(b.days.join(', '))) : ''}${b.tasks.length ? row('Extra tasks', esc(b.tasks.map(tl).join(', '))) : ''}${row('Address', esc(b.addr))}${row('Per visit', inr(b.perVisit))}${b.plan === 'one' ? '' : row(b.plan === 'monthly' ? 'Estimated for 4 weeks' : b.plan === 'weekly' ? 'Estimated per week' : 'Visits per week', inr(b.plan === 'daily' ? b.perVisit * b.visits : b.total))}</ul>
  <p class="note" style="margin-top:14px">${b.sent ? 'Your request was sent. The cook still has to accept it; availability and the final amount are confirmed by the cook. Nothing has been charged.' : 'Demo mode: this request is saved on this device only. No cook has received it and nothing was charged.'}</p>
  <div class="ba"><a class="btn" href="#/workers">Find another cook</a><a class="btn ghost" href="#/account">My account</a></div></div></section>`;
};
V.wk = (q, seg) => !seg[1] ? V.wform() : seg[1] === 'results' ? V.wres(q) : seg[1] === 'book' ? V.wbook(seg[2]) : seg[1] === 'confirmed' ? V.wdone(seg[2]) : V.wdet(seg[1]);

/* ---------- home hero: arati aku bhojanam (banana-leaf meal) ----------
   The picture is an original illustration. To use a real photo instead, put it in an
   "images" folder next to index.html and set HOME_PHOTO = 'images/arati-aku.jpg'. */
const HOME_PHOTO = '';
const HD = [
  ['annam', 'Annam', 'Steamed rice with a spoon of ghee'], ['pappu', 'Pappu', 'Toor dal'], ['sambar', 'Sambar', 'Vegetable lentil stew'], ['charu', 'Charu', 'Tangy pepper rasam'],
  ['perugu', 'Perugu', 'Fresh curd'], ['payasam', 'Payasam', 'Sweet milk pudding with cashews'], ['beans', 'Beans Fry', 'Green beans with coconut'], ['aloo', 'Bangaladumpa Fry', 'Crisp potato fry'],
  ['tomato', 'Tomato Kura', 'Tomato curry'], ['garelu', 'Garelu', 'Crispy lentil vada'], ['appadam', 'Appadam', 'Roasted papad'], ['avakaya', 'Avakaya', 'Andhra mango pickle'],
  ['chutney', 'Pachadi', 'Fresh green chutney'], ['boorelu', 'Boorelu', 'Sweet lentil fritters']
];
const HCAP = '<b>Arati Aku Bhojanam</b>';
const scat = (cx, cy, R, n, seed, fn) => { let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; let o = ''; for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * R; o += fn(+(cx + Math.cos(a) * d).toFixed(1), +(cy + Math.sin(a) * d).toFixed(1), Math.round(r() * 180), i); } return o; };
const katori = (cx, cy, r, inner, extra) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#st)" stroke="#7d898c" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="${inner}"/>${extra || ''}<path d="M${cx - r + 6} ${cy - 5} A${r - 6} ${r - 6} 0 0 1 ${cx - 5} ${cy - r + 6}" stroke="#fff" stroke-opacity=".75" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
const dg = (id, i, body) => `<g class="dish" data-d="${id}" style="--i:${i}" tabindex="0" role="img" aria-label="${HD.find(x => x[0] === id)[1]}: ${HD.find(x => x[0] === id)[2]}"><g class="in" filter="url(#ds)">${body}</g></g>`;
const leafSVG = () => `<svg class="leafsvg" viewBox="0 0 640 450" role="group" aria-label="Illustration of Arati Aku Bhojanam with rice, dal, sambar, rasam, curd, curries, papad, vada, pickle and payasam" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="lg" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#58b36a"/><stop offset=".65" stop-color="#2f8447"/><stop offset="1" stop-color="#1b5e35"/></radialGradient>
<radialGradient id="rice" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f7f2e4"/><stop offset="1" stop-color="#e3dac2"/></radialGradient>
<radialGradient id="st" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f7f9fa"/><stop offset="1" stop-color="#9aa5a8"/></radialGradient>
<radialGradient id="dal" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f7d15e"/><stop offset="1" stop-color="#d89a1c"/></radialGradient>
<pattern id="vn" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(72)"><path d="M0 6H12" stroke="#0e4626" stroke-opacity=".16" stroke-width="1"/></pattern>
<filter id="ds" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0b2a18" flood-opacity=".4"/></filter>
<filter id="bl"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="bl2"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<ellipse cx="320" cy="428" rx="270" ry="14" fill="#000" opacity=".32" filter="url(#bl2)"/>
<path d="M34 118Q34 62 96 58L546 52Q610 52 614 112L618 342Q616 402 552 406L96 410Q34 410 30 350Z" fill="url(#lg)"/>
<path d="M34 118Q34 62 96 58L546 52Q610 52 614 112L618 342Q616 402 552 406L96 410Q34 410 30 350Z" fill="url(#vn)"/>
<path d="M34 118Q34 62 96 58L546 52Q610 52 614 112L618 342Q616 402 552 406L96 410Q34 410 30 350Z" fill="none" stroke="#a8e0a0" stroke-opacity=".55" stroke-width="3"/>
<path d="M32 232H616" stroke="#8fd08b" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
${dg('avakaya', 11, `<circle cx="78" cy="205" r="17" fill="#7a1a0d"/><circle cx="78" cy="205" r="12" fill="#a32a14"/>${scat(78, 205, 11, 7, 3, (x, y, r) => `<rect x="${x - 2.5}" y="${y - 1.5}" width="5" height="3" rx="1" fill="#d9a05a" transform="rotate(${r} ${x} ${y})"/>`)}<ellipse cx="72" cy="199" rx="5" ry="2.5" fill="#fff" opacity=".35"/>`)}
${dg('chutney', 12, `<circle cx="142" cy="124" r="23" fill="#4c8a2b"/><circle cx="142" cy="124" r="19" fill="#74b341"/>${scat(142, 124, 15, 9, 8, (x, y) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#2f6a1a"/>`)}<ellipse cx="135" cy="116" rx="6" ry="3" fill="#fff" opacity=".3"/>`)}
${dg('beans', 6, `<circle cx="228" cy="110" r="33" fill="#3f7a22"/>${scat(228, 110, 26, 16, 5, (x, y, r) => `<rect x="${x - 9}" y="${y - 2.5}" width="18" height="5" rx="2.5" fill="#6fb53a" stroke="#3d7d1f" stroke-width=".7" transform="rotate(${r} ${x} ${y})"/>`)}${scat(228, 110, 26, 10, 6, (x, y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fffaf0"/>`)}`)}
${dg('aloo', 7, `<circle cx="322" cy="110" r="33" fill="#b97a1a"/>${scat(322, 110, 25, 12, 9, (x, y, r) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" fill="#efbb4a" stroke="#c0831f" stroke-width="1" transform="rotate(${r} ${x} ${y})"/>`)}${scat(322, 110, 24, 8, 4, (x, y) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#5a3410"/>`)}`)}
${dg('tomato', 8, `<circle cx="416" cy="110" r="33" fill="#9c2a12"/><circle cx="416" cy="110" r="27" fill="#d1431f"/>${scat(416, 110, 22, 9, 12, (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="#a52b10"/>`)}${scat(416, 110, 22, 7, 15, (x, y) => `<circle cx="${x}" cy="${y}" r="1.7" fill="#ffd9a0"/>`)}<ellipse cx="406" cy="98" rx="9" ry="4" fill="#fff" opacity=".25"/>`)}
${dg('boorelu', 13, `${[[502, 112], [528, 104], [516, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#b9741f"/><circle cx="${x}" cy="${y}" r="11" fill="#d99a3c"/><ellipse cx="${x - 4}" cy="${y - 4}" rx="4" ry="2.5" fill="#fff" opacity=".35"/>`).join('')}`)}
${dg('pappu', 1, `<circle cx="186" cy="240" r="37" fill="url(#dal)"/><path d="M162 236q12-14 28-6t20 18" stroke="#fbe49a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>${scat(186, 240, 28, 8, 21, (x, y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#6b3d0a"/>`)}${scat(186, 240, 26, 5, 22, (x, y) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#4c8a2b"/>`)}`)}
${dg('annam', 0, `<circle cx="302" cy="247" r="76" fill="#cfc6ad" opacity=".5"/><circle cx="302" cy="243" r="72" fill="url(#rice)"/>${scat(302, 243, 66, 70, 31, (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="1.9" fill="#fffdf6" stroke="#e6dec9" stroke-width=".6" transform="rotate(${r} ${x} ${y})"/>`)}<ellipse cx="302" cy="222" rx="22" ry="13" fill="#f6c445" opacity=".6"/><ellipse cx="296" cy="218" rx="9" ry="4" fill="#fff" opacity=".55"/><circle cx="326" cy="214" r="2.5" fill="#4c8a2b"/><circle cx="276" cy="226" r="2.2" fill="#4c8a2b"/>`)}
${dg('appadam', 10, `<circle cx="512" cy="212" r="36" fill="#d9b373" opacity=".7"/><circle cx="496" cy="192" r="37" fill="#ecc98a" stroke="#c99a52" stroke-width="1.5"/>${scat(496, 192, 31, 20, 41, (x, y) => `<circle cx="${x}" cy="${y}" r="${(1 + (x % 2)).toFixed(1)}" fill="#b98438" opacity=".7"/>`)}<path d="M470 178q14-12 34-8" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`)}
${dg('garelu', 9, `${[[548, 276], [514, 306]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#a3611a"/><circle cx="${x}" cy="${y}" r="21" fill="#d58b2a"/><circle cx="${x}" cy="${y}" r="8" fill="#2f8447"/>${scat(x, y, 17, 9, x, (px, py) => `<circle cx="${px}" cy="${py}" r="1.5" fill="#7a410d" opacity=".7"/>`)}<path d="M${x - 16} ${y - 8}q8-10 18-10" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')}`)}
${dg('sambar', 2, katori(150, 352, 34, '#c4601b', `${scat(150, 352, 22, 8, 51, (x, y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#e8a53b"/>`)}${scat(150, 352, 22, 4, 52, (x, y, r) => `<rect x="${x - 4}" y="${y - 1.4}" width="8" height="2.8" rx="1.4" fill="#6fb53a" transform="rotate(${r} ${x} ${y})"/>`)}`))}
${dg('charu', 3, katori(252, 356, 34, '#a52c14', `${scat(252, 356, 22, 9, 61, (x, y) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#2d5d1c"/>`)}${scat(252, 356, 22, 6, 62, (x, y) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#f0c36b"/>`)}`))}
${dg('perugu', 4, katori(354, 356, 34, '#fffaf0', `<path d="M338 354q16-10 32 0" stroke="#efe6d2" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="360" cy="348" r="1.6" fill="#4c8a2b"/>`))}
${dg('payasam', 5, katori(456, 352, 34, '#f1dba8', `${scat(456, 352, 22, 7, 71, (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="2" fill="#e5bd7e" stroke="#c99650" stroke-width=".6" transform="rotate(${r} ${x} ${y})"/>`)}${scat(456, 352, 22, 5, 72, (x, y) => `<circle cx="${x}" cy="${y}" r="2" fill="#6b3a12"/>`)}`))}
<g filter="url(#bl)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="4">
<path class="steam" style="--s:0s" d="M280 185q-12-16 0-30t0-28"/><path class="steam" style="--s:1s" d="M306 182q-12-16 0-30t0-28"/><path class="steam" style="--s:2s" d="M332 186q-12-16 0-30t0-28"/>
<path class="steam" style="--s:.6s" d="M150 316q-9-12 0-22t0-20"/><path class="steam" style="--s:1.6s" d="M252 320q-9-12 0-22t0-20"/><path class="steam" style="--s:2.4s" d="M456 316q-9-12 0-22t0-20"/>
</g>
</svg>`;
const homeHero = () => `<section class="hero home"><div class="wrap hc hgrid"><div class="ht"><p class="eyebrow">Kitchens, close to you</p><h1>Mealora. More Than Meals.</h1>
  <p class="lead">Caterers, lunchboxes and home cooks for every day and every celebration. Good food, served the way it should be.</p>
  <div class="ba hb"><a class="btn" href="#/catering">Explore Catering</a><a class="btn ghost" href="#/workers">Find a Home Cook</a><a class="btn ghost" href="#/join">Become a partner</a></div></div>
  <div class="hv"><div class="leafwrap">${HOME_PHOTO ? `<img class="hphoto" src="${esc(HOME_PHOTO)}" alt="Arati Aku Bhojanam">` : leafSVG()}</div>
  <p class="dishcap" id="dishcap" aria-live="polite">${HCAP}</p>
  <div class="dsh-w" role="list" aria-label="Dishes on the leaf">${HD.map(d => `<button type="button" class="dsh" role="listitem" data-d="${d[0]}">${d[1]}</button>`).join('')}</div></div></div></section>`;
const dishHL = id => { $$('.dish').forEach(g => g.classList.toggle('hl', g.dataset.d === id)); $$('.dsh').forEach(b => b.classList.toggle('on', b.dataset.d === id)); const cap = $('#dishcap'); if (cap) { const d = HD.find(x => x[0] === id); cap.innerHTML = d ? `<b>${d[1]}</b> &middot; ${d[2]}` : HCAP; } };
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-d]'); if (t) dishHL(t.dataset.d); });
document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('[data-d]') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-d]'))) dishHL(''); });
document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('[data-d]'); if (t) dishHL(t.dataset.d); });
document.addEventListener('focusout', e => { if (e.target.closest && e.target.closest('[data-d]')) dishHL(''); });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.dsh'); if (t) dishHL(t.dataset.d); });

/* ---------- scroll reveal ---------- */
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const rio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const t = e.target; rio.unobserve(t); t.classList.add('in'); t.addEventListener('animationend', ev => { if (ev.target === t) t.classList.remove('rv', 'in'); }, { once: false }); }), { threshold: .1, rootMargin: '0px 0px -30px 0px' }) : null;
const reveal = root => { if (calm || !rio) return; $$('.sec .sh,.sec .pc,.sec .oc,.sec .pk,.sec .svc,.band,.pg .pc,.pg .card,.pg .li', root).forEach((el, i) => { el.style.setProperty('--d', (i % 6) * 70 + 'ms'); el.classList.add('rv'); rio.observe(el); }); };

/* ---------- placeholders for photos ---------- */
const COL = [['#fff8e6', '#ecdcb0'], ['#d9482b', '#a93118'], ['#e8a33a', '#c47a0a'], ['#7fa04a', '#4f6f2c'], ['#b5532a', '#7d3519'], ['#f2c46b', '#d99a2b']];
const paint = root => $$('.ph[data-seed]', root).forEach(p => {
  if (p.dataset.done) return; p.dataset.done = 1;
  let s = +p.dataset.seed * 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280, n = +p.dataset.n || 12;
  for (let i = 0; i < n; i++) { const c = COL[Math.floor(r() * COL.length)], d = document.createElement('i'); d.className = 'bowl'; d.style.background = `radial-gradient(circle at 40% 35%,${c[0]} 0 38%,${c[1]} 70%)`; p.appendChild(d); }
});

/* ---------- scroll-scrubbed 3D video background (home only) ---------- */
const bgv = $('#bgv'), vst = $('.vstage'); let vc = 0, vraf = 0, mx = 0, my = 0;
const vloop = () => {
  if (!document.body.classList.contains('vbg')) { vraf = 0; return; }
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
  vc += (p - vc) * .12; if (Math.abs(p - vc) < .0004) vc = p;
  if (bgv.readyState >= 2 && bgv.duration && !bgv.seeking) { const t = vc * (bgv.duration - .06); if (Math.abs(bgv.currentTime - t) > .012) bgv.currentTime = t; }
  vst.style.setProperty('--p', vc.toFixed(4)); vst.style.setProperty('--mx', mx.toFixed(3)); vst.style.setProperty('--my', my.toFixed(3));
  vraf = requestAnimationFrame(vloop);
};
if (matchMedia('(hover:hover) and (pointer:fine)').matches) addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
const vsync = home => { document.body.classList.toggle('vbg', home); if (!bgv) return; if (home && !calm) { bgv.pause(); if (!vraf) vraf = requestAnimationFrame(vloop); } };

/* ---------- router ---------- */
const app = $('#app');
const route = () => {
  const [path, query] = (location.hash.slice(1) || '/').split('?'), q = Object.fromEntries(new URLSearchParams(query || '')), seg = path.split('/').filter(Boolean);
  const k = seg[0] || 'home'; let html, title = k;
  if (k === 'caterer') html = V.caterer(q, seg[1]);
  else if (k === 'p') html = V.page(q, seg[1]);
  else if (k === 'lunchboxes') html = V.lunch(q, seg);
  else if (k === 'workers') html = V.wk(q, seg);
  else if (V[k] && !['page', 'nf'].includes(k)) html = V[k](q);
  else if (PAGES[k]) html = V.page(q, k);
  else html = V.nf();
  app.innerHTML = html || '';
  document.title = (k === 'home' ? 'Mealora | More Than Meals' : 'Mealora | ' + (k.charAt(0).toUpperCase() + k.slice(1)));
  const on = ['results', 'caterer', 'quote', 'join'].includes(k) ? 'catering' : k;
  $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.r === on));
  $('#nav').classList.remove('open'); $('#bg').setAttribute('aria-expanded', 'false');
  const s = session(); $('#auth').textContent = s ? 'My account' : 'Log in / Sign up'; $('#auth').href = s ? '#/account' : '#/login';
  vsync(k === 'home'); paint(app); bind(); reveal(app); scrollTo(0, 0); app.focus({ preventScroll: true });
};
const bind = () => {
  $$('form[data-form]', app).forEach(f => {
    f.addEventListener('submit', e => { e.preventDefault(); H[f.dataset.form](f); });
    if (f.dataset.form === 'flt' || f.dataset.form === 'lflt') f.addEventListener('change', () => H[f.dataset.form](f));
    if (f.dataset.form === 'lprefs') {
      syncL(f);
      f.addEventListener('change', e => {
        if (e.target.name === 'cuisines') $$('[name="cuisines"]', f).forEach(c => { if (c !== e.target && e.target.checked && (e.target.value === 'any' || c.value === 'any')) c.checked = false; });
        syncL(f); saveDraft(f);
      });
    }
    if (f.dataset.form === 'wprefs') { syncW(f); f.addEventListener('change', () => { syncW(f); wDraft(f); }); }
    if (f.dataset.form === 'wflt') f.addEventListener('change', () => H.wflt(f));
    if (f.dataset.form === 'wbook') { syncB(f); wsum(f); f.addEventListener('input', () => { syncB(f); wsum(f); }); f.addEventListener('change', () => { syncB(f); wsum(f); }); }
    if (f.dataset.form === 'lorder') { sumUpdate(f); f.addEventListener('input', () => sumUpdate(f)); }
  });
  const fb = $('#fb'); if (fb && innerWidth >= 900) fb.open = true;
  const va = $('#va'); if (va) va.onclick = () => { const x = va.getAttribute('aria-expanded') === 'true'; $$('[data-x]').forEach(e => e.hidden = x); va.setAttribute('aria-expanded', !x); va.textContent = x ? 'View All' : 'Show fewer'; };
  const lo = $('#lo'); if (lo) lo.onclick = () => { db.set('session', null); location.hash = '#/'; route(); };
  const fp = $("#fpw"); if (fp) fp.onclick = () => say($('form', app), 'Password reset needs email delivery. It is available once Firebase Authentication is connected.', 'bad');
  $$('[data-st]', app).forEach(s => s.onchange = () => { const l = db.get('quotes', []); const x = l.find(i => i.id === s.dataset.st); if (x) { x.status = s.value; db.set('quotes', l); route(); } });
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-fav]');
  if (b) {
    const s = session(); if (!s) { location.hash = '#/login?need=save'; return; }
    const k = 'favs:' + s.email, id = b.dataset.fav; let f = db.get(k, []); f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]; db.set(k, f);
    b.classList.toggle('on', f.includes(id)); b.setAttribute('aria-pressed', f.includes(id));
  }
  const g = e.target.closest('[data-pkg]');
  if (g) {
    const k = PK.find(x => x.id === g.dataset.pkg);
    $('#dc').innerHTML = `<h3 id="dt">${k.name}</h3><p class="mu">${k.price ? inr(k.price) + ' per plate (demo price)' : 'Priced per quote'}</p><p>${k.desc}</p>${k.dishes.length ? `<ul class="menu">${k.dishes.map(d => `<li>${vd(d[1])}${esc(d[0])}</li>`).join('')}</ul><p class="demo">Sample menu. Final dishes are agreed with your caterer.</p>` : ''}<a class="btn" style="margin-top:12px" href="#/quote?package=${k.id}" onclick="document.getElementById('dlg').close()">Request Quote</a>`;
    $('#dlg').showModal();
  }
});
$('#bg').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#bg').setAttribute('aria-expanded', o); });
$('#fe').textContent = CFG.email; $('#fp').textContent = CFG.phone; $('#fl2').textContent = CFG.place; $('#yr').textContent = new Date().getFullYear();
addEventListener('hashchange', route); route();
})();
