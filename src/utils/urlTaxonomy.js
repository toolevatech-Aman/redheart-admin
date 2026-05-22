/**
 * URL Taxonomy — Redheart
 * All URL slug → API filter payload mappings + H1 map
 */

const BASE = {
  category_name: '',
  subcategory_name: [],
  festival_tags: [],
  occasion_tags: [],
  special_occasion_tags: [],
  type: [],
  relationship: [],
  color: [],
};

// Top-level category slug → base filter
export const CATEGORY_BASE_FILTERS = {
  'flowers':                    { category_name: 'Flowers' },
  'florist-near-me':            { category_name: 'Flowers' },
  'cakes':                      { category_name: 'Cakes' },
  'order-cake-online':          { category_name: 'Cakes' },
  'plants':                     { category_name: 'Plants' },
  'plants-online':              { category_name: 'Plants' },
  'birthday':                   { occasion_tags: ['Birthday'] },
  'birthday-gifts-delivery':    { occasion_tags: ['Birthday'] },
  'anniversary':                { occasion_tags: ['Anniversary'] },
  'anniversary-gifts-delivery': { occasion_tags: ['Anniversary'] },
  'wedding':                    { occasion_tags: ['Wedding'] },
  'wedding-gifts-online':       { occasion_tags: ['Wedding'] },
  'hampers':                    { category_name: 'Hampers' },
  'gift-hampers':               { category_name: 'Hampers' },
};

// Subcategory slug → additional filter fields (merged on top of base)
export const SUBCATEGORY_SLUG_FILTERS = {
  // Flower varieties
  'roses':               { subcategory_name: ['Roses'] },
  'lilies':              { subcategory_name: ['Lillies'] },
  'carnations':          { subcategory_name: ['Carnation'] },
  'roses-and-carnation': { subcategory_name: ['Roses and Carnation'] },
  'roses-and-lily':      { subcategory_name: ['Roses and Lily'] },
  // Types
  'bouquets':            { type: ['Bouquet'] },
  'hot-picks':           { type: ['Hot Pick'] },
  'best-sellers':        { type: ['Best Seller'] },
  'new-arrivals':        { type: ['New Arrival'] },
  // Colors
  'red':                 { color: ['Red'] },
  'white':               { color: ['White'] },
  'pink':                { color: ['Pink'] },
  'yellow':              { color: ['Yellow'] },
  'purple':              { color: ['Purple'] },
  'mixed':               { color: ['Mixed'] },
  // Occasions
  'birthday':            { occasion_tags: ['Birthday'] },
  'anniversary':         { occasion_tags: ['Anniversary'] },
  'wedding':             { occasion_tags: ['Wedding'] },
  'valentine':           { occasion_tags: ['Valentine'] },
  'love-and-romance':    { occasion_tags: ['Love n Romance'] },
  'congratulations':     { occasion_tags: ['Congratulations'] },
  'get-well-soon':       { occasion_tags: ['Get Well Soon'] },
  'thank-you':           { occasion_tags: ['Thank You'] },
  'house-warming':       { occasion_tags: ['House Warming'] },
  'new-born-baby':       { occasion_tags: ['New Born Baby'] },
  'baby-shower':         { occasion_tags: ['Baby Shower'] },
  'appreciation':        { occasion_tags: ['Appreciation'] },
  'cheer-up':            { occasion_tags: ['Cheer Up'] },
  'i-am-sorry':          { occasion_tags: ['I am sorry'] },
  'funeral':             { occasion_tags: ['Funeral'] },
  // Relationships (direct)
  'for-her':             { relationship: ['Her'] },
  'for-him':             { relationship: ['Him'] },
  'for-wife':            { relationship: ['Wife'] },
  'for-husband':         { relationship: ['Husband'] },
  'for-mother':          { relationship: ['Mother'] },
  'for-father':          { relationship: ['Father'] },
  'for-girlfriend':      { relationship: ['Girlfriend'] },
  'for-boyfriend':       { relationship: ['Boyfriend'] },
  'for-friends':         { relationship: ['Friends'] },
  'for-kids':            { relationship: ['Kids'] },
  'for-brother':         { relationship: ['Brother'] },
  'for-sister':          { relationship: ['Sister'] },
  'for-parents':         { relationship: ['Mother', 'Father'] },
  // Gifts-for (birthday/anniversary pages)
  'gifts-for-her':       { relationship: ['Her'] },
  'gifts-for-him':       { relationship: ['Him'] },
  'gifts-for-wife':      { relationship: ['Wife'] },
  'gifts-for-husband':   { relationship: ['Husband'] },
  'gifts-for-mother':    { relationship: ['Mother'] },
  'gifts-for-father':    { relationship: ['Father'] },
  'gifts-for-girlfriend':{ relationship: ['Girlfriend'] },
  'gifts-for-boyfriend': { relationship: ['Boyfriend'] },
  'gifts-for-friends':   { relationship: ['Friends'] },
  'gifts-for-brother':   { relationship: ['Brother'] },
  'gifts-for-sister':    { relationship: ['Sister'] },
  'gifts-for-kids':      { relationship: ['Kids'] },
  'gifts-for-parents':   { relationship: ['Mother', 'Father'] },
  // Festivals
  'valentines-day':      { festival_tags: ["Valentine's Day"] },
  'rose-day':            { festival_tags: ['Rose Day'] },
  'mothers-day':         { festival_tags: ['Mothers Day'] },
  'womens-day':          { festival_tags: ['Womens Day'] },
  'christmas':           { festival_tags: ['Christmas'] },
  'new-year':            { festival_tags: ['New Year'] },
  'holi':                { festival_tags: ['Holi'] },
  'eid-al-fitr':         { festival_tags: ['Eid Al Fitr'] },
  'fathers-day':         { festival_tags: ["Father's Day"] },
  'lohri':               { festival_tags: ['Lohri'] },
  'propose-day':         { festival_tags: ['Propose Day'] },
  'chocolate-day':       { festival_tags: ['Chocolate Day'] },
  'teddy-day':           { festival_tags: ['Teddy Day'] },
  'promise-day':         { festival_tags: ['Promise Day'] },
  'hug-day':             { festival_tags: ['Hug Day'] },
  'kiss-day':            { festival_tags: ['Kiss Day'] },
  'republic-day':        { festival_tags: ['Republic Day'] },
  'doctors-day':         { festival_tags: ['Doctors day'] },
  'brothers-day':        { festival_tags: ["Brother's Day"] },
  // Cakes flavours
  'black-forest':        { subcategory_name: ['Black Forest Cakes'] },
  'chocolate':           { subcategory_name: ['Chocolate Cakes'] },
  'red-velvet':          { subcategory_name: ['Red Velvet Cakes'] },
  'ferrero-rocher':      { subcategory_name: ['Ferrero Rocher Cakes'] },
  'pinata':              { subcategory_name: ['Pinata cake'] },
  // Plants
  'snake':               { subcategory_name: ['Snake Plant'] },
  'money':               { subcategory_name: ['Money Plant'] },
  'jade':                { subcategory_name: ['Jade Plant'] },
  'peace-lily':          { subcategory_name: ['Peace Lily Plant'] },
  'syngonium':           { subcategory_name: ['Syngonium'] },
  'bonsai':              { subcategory_name: ['Bonsai '] }, // DB has trailing space
  // Compound / popular combinations
  'red-roses':               { color: ['Red'], subcategory_name: ['Roses'] },
  'pink-roses':              { color: ['Pink'], subcategory_name: ['Roses'] },
  'white-lilies':            { color: ['White'], subcategory_name: ['Lillies'] },
  'birthday-roses':          { occasion_tags: ['Birthday'], subcategory_name: ['Roses'] },
  'anniversary-roses':       { occasion_tags: ['Anniversary'], subcategory_name: ['Roses'] },
  'birthday-chocolate':      { occasion_tags: ['Birthday'], subcategory_name: ['Chocolate Cakes'] },
  'birthday-black-forest':   { occasion_tags: ['Birthday'], subcategory_name: ['Black Forest Cakes'] },
  'anniversary-red-velvet':  { occasion_tags: ['Anniversary'], subcategory_name: ['Red Velvet Cakes'] },
  'chocolate-cakes':         { subcategory_name: ['Chocolate Cakes'] },
  'birthday-chocolate-cakes':{ occasion_tags: ['Birthday'], subcategory_name: ['Chocolate Cakes'] },
  // Category switchers inside birthday/anniversary context
  'flowers':             { category_name: 'Flowers' },
  'cakes':               { category_name: 'Cakes' },
  'plants':              { category_name: 'Plants' },
  // Surprise
  'surprise-gifts':      { type: ['Hot Pick', 'Best Seller'] },
};

/**
 * Resolve API filter payload from route params
 * Handles INTERSECTION logic: all filters must match simultaneously
 */
export const resolveFiltersFromUrl = (categorySlug, subcategorySlug) => {
  const result = { ...BASE };
  const catBase = CATEGORY_BASE_FILTERS[categorySlug] || {};

  // Apply category base
  Object.entries(catBase).forEach(([k, v]) => {
    if (Array.isArray(v)) result[k] = [...v];
    else result[k] = v;
  });

  if (!subcategorySlug) return result;

  const subFilters = SUBCATEGORY_SLUG_FILTERS[subcategorySlug] || {};

  // Merge sub filters (arrays are unioned, strings overwrite)
  Object.entries(subFilters).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      const existing = result[k] || [];
      const newVals = v.filter(x => !existing.includes(x));
      result[k] = [...existing, ...newVals];
    } else {
      result[k] = v;
    }
  });

  return result;
};

// ── H1 Map ────────────────────────────────────────────────────────────────────
export const PAGE_H1_MAP = {
  // Flowers base
  'florist-near-me':                'Flowers Delivery',
  'flowers/bouquets':               'Shop Fresh Flower Bouquets',
  'flowers/hot-picks':              'Hot Pick Flowers Delivery',
  'flowers/best-sellers':           'Best Selling Flowers Delivery',
  'flowers/new-arrivals':           'New Arrival Flowers Delivery',
  // Flowers varieties
  'flowers/roses':                  'Roses Delivery',
  'flowers/lilies':                 'Lilies Delivery',
  'flowers/carnations':             'Carnations Delivery',
  'flowers/roses-and-carnation':    'Roses and Carnation Delivery',
  'flowers/roses-and-lily':         'Roses and Lily Delivery',
  // Flowers colors
  'flowers/red':                    'Red Flowers Delivery',
  'flowers/white':                  'White Flowers Delivery',
  'flowers/pink':                   'Pink Flowers Delivery',
  'flowers/yellow':                 'Yellow Flowers Delivery',
  'flowers/purple':                 'Purple Flowers Delivery',
  'flowers/mixed':                  'Mixed Flowers Delivery',
  // Flowers occasions
  'flowers/birthday':               'Birthday Flowers Delivery',
  'flowers/anniversary':            'Anniversary Flowers Delivery',
  'flowers/wedding':                'Wedding Flowers Delivery',
  'flowers/valentine':              'Valentine Flowers Delivery',
  'flowers/love-and-romance':       'Love and Romance Flowers Delivery',
  'flowers/congratulations':        'Congratulations Flowers Delivery',
  'flowers/get-well-soon':          'Get Well Soon Flowers Delivery',
  'flowers/thank-you':              'Thank You Flowers Delivery',
  'flowers/house-warming':          'House Warming Flowers Delivery',
  'flowers/new-born-baby':          'New Born Baby Flowers Delivery',
  'flowers/baby-shower':            'Baby Shower Flowers Delivery',
  'flowers/appreciation':           'Appreciation Flowers Delivery',
  'flowers/cheer-up':               'Cheer Up Flowers Delivery',
  // Flowers relationships
  'flowers/for-her':                'Flowers for Her Delivery',
  'flowers/for-him':                'Flowers for Him Delivery',
  'flowers/for-wife':               'Flowers for Wife Delivery',
  'flowers/for-husband':            'Flowers for Husband Delivery',
  'flowers/for-mother':             'Flowers for Mother Delivery',
  'flowers/for-father':             'Flowers for Father Delivery',
  'flowers/for-girlfriend':         'Flowers for Girlfriend Delivery',
  'flowers/for-boyfriend':          'Flowers for Boyfriend Delivery',
  'flowers/for-friends':            'Flowers for Friends Delivery',
  'flowers/for-kids':               'Flowers for Kids Delivery',
  // Flowers festivals
  'flowers/valentines-day':         "Valentine's Day Flowers Delivery",
  'flowers/rose-day':               'Rose Day Flowers Delivery',
  'flowers/mothers-day':            "Mother's Day Flowers Delivery",
  'flowers/womens-day':             "Women's Day Flowers Delivery",
  'flowers/christmas':              'Christmas Flowers Delivery',
  'flowers/new-year':               'New Year Flowers Delivery',
  'flowers/holi':                   'Holi Flowers Delivery',
  'flowers/eid-al-fitr':            'Eid Flowers Delivery',
  'flowers/fathers-day':            "Father's Day Flowers Delivery",
  'flowers/lohri':                  'Lohri Flowers Delivery',
  // Flowers combos
  'flowers/red-roses':              'Red Roses Delivery',
  'flowers/pink-roses':             'Pink Roses Delivery',
  'flowers/white-lilies':           'White Lilies Delivery',
  'flowers/birthday-roses':         'Birthday Roses Delivery',
  'flowers/anniversary-roses':      'Anniversary Roses Delivery',
  // Cakes base
  'order-cake-online':              'Order Cakes Online',
  'cakes/hot-picks':                'Order Hot Pick Cakes',
  'cakes/best-sellers':             'Order Best Selling Cakes',
  'cakes/new-arrivals':             'Order New Arrival Cakes',
  // Cakes flavours
  'cakes/black-forest':             'Order Black Forest Cakes',
  'cakes/chocolate':                'Order Chocolate Cakes',
  'cakes/red-velvet':               'Order Red Velvet Cakes',
  'cakes/ferrero-rocher':           'Order Ferrero Rocher Cakes',
  'cakes/pinata':                   'Order Pinata Cakes',
  // Cakes occasions
  'cakes/birthday':                 'Order Birthday Cakes',
  'cakes/anniversary':              'Order Anniversary Cakes',
  'cakes/wedding':                  'Order Wedding Cakes',
  'cakes/valentine':                'Order Valentine Cakes',
  'cakes/congratulations':          'Order Congratulations Cakes',
  'cakes/get-well-soon':            'Order Get Well Soon Cakes',
  'cakes/thank-you':                'Order Thank You Cakes',
  'cakes/house-warming':            'Order House Warming Cakes',
  'cakes/new-born-baby':            'Order New Born Baby Cakes',
  'cakes/baby-shower':              'Order Baby Shower Cakes',
  'cakes/appreciation':             'Order Appreciation Cakes',
  'cakes/cheer-up':                 'Order Cheer Up Cakes',
  'cakes/i-am-sorry':               'Order I Am Sorry Cakes',
  'cakes/funeral':                  'Order Funeral Cakes',
  // Cakes relationships
  'cakes/for-her':                  'Order Cakes for Her',
  'cakes/for-him':                  'Order Cakes for Him',
  'cakes/for-wife':                 'Order Cakes for Wife',
  'cakes/for-husband':              'Order Cakes for Husband',
  'cakes/for-mother':               'Order Cakes for Mother',
  'cakes/for-father':               'Order Cakes for Father',
  'cakes/for-girlfriend':           'Order Cakes for Girlfriend',
  'cakes/for-boyfriend':            'Order Cakes for Boyfriend',
  'cakes/for-friends':              'Order Cakes for Friends',
  'cakes/for-kids':                 'Order Cakes for Kids',
  'cakes/for-brother':              'Order Cakes for Brother',
  'cakes/for-sister':               'Order Cakes for Sister',
  // Cakes festivals
  'cakes/valentines-day':           "Order Valentine's Day Cakes",
  'cakes/mothers-day':              "Order Mother's Day Cakes",
  'cakes/christmas':                'Order Christmas Cakes',
  'cakes/new-year':                 'Order New Year Cakes',
  'cakes/womens-day':               "Order Women's Day Cakes",
  'cakes/eid-al-fitr':              'Order Eid Cakes',
  'cakes/fathers-day':              "Order Father's Day Cakes",
  'cakes/holi':                     'Order Holi Cakes',
  // Cakes combos
  'cakes/birthday-chocolate':       'Order Birthday Chocolate Cakes',
  'cakes/birthday-black-forest':    'Order Birthday Black Forest Cakes',
  'cakes/anniversary-red-velvet':   'Order Anniversary Red Velvet Cakes',
  // Plants base
  'plants-online':                  'Plants Online',
  'plants/hot-picks':               'Hot Pick Plants Online',
  'plants/best-sellers':            'Best Selling Plants Online',
  'plants/new-arrivals':            'New Arrival Plants Online',
  // Plants varieties
  'plants/snake':                   'Snake Plant Online',
  'plants/money':                   'Money Plant Online',
  'plants/jade':                    'Jade Plant Online',
  'plants/peace-lily':              'Peace Lily Plant Online',
  'plants/syngonium':               'Syngonium Plant Online',
  'plants/bonsai':                  'Bonsai Plant Online',
  // Plants occasions
  'plants/birthday':                'Birthday Plants Online',
  'plants/anniversary':             'Anniversary Plants Online',
  'plants/wedding':                 'Wedding Plants Online',
  'plants/house-warming':           'House Warming Plants Online',
  'plants/congratulations':         'Congratulations Plants Online',
  'plants/get-well-soon':           'Get Well Soon Plants Online',
  'plants/thank-you':               'Thank You Plants Online',
  'plants/new-born-baby':           'New Born Baby Plants Online',
  'plants/baby-shower':             'Baby Shower Plants Online',
  'plants/appreciation':            'Appreciation Plants Online',
  'plants/love-and-romance':        'Love and Romance Plants Online',
  'plants/cheer-up':                'Cheer Up Plants Online',
  // Plants relationships
  'plants/for-her':                 'Plants for Her Online',
  'plants/for-him':                 'Plants for Him Online',
  'plants/for-wife':                'Plants for Wife Online',
  'plants/for-husband':             'Plants for Husband Online',
  'plants/for-mother':              'Plants for Mother Online',
  'plants/for-father':              'Plants for Father Online',
  'plants/for-girlfriend':          'Plants for Girlfriend Online',
  'plants/for-boyfriend':           'Plants for Boyfriend Online',
  'plants/for-friends':             'Plants for Friends Online',
  'plants/for-kids':                'Plants for Kids Online',
  // Plants festivals
  'plants/valentines-day':          "Valentine's Day Plants Online",
  'plants/mothers-day':             "Mother's Day Plants Online",
  'plants/womens-day':              "Women's Day Plants Online",
  'plants/christmas':               'Christmas Plants Online',
  'plants/new-year':                'New Year Plants Online',
  'plants/eid-al-fitr':             'Eid Plants Online',
  'plants/fathers-day':             "Father's Day Plants Online",
  // Birthday
  'birthday-gifts-delivery':        'Birthday Gifts Delivery',
  'birthday/flowers':               'Birthday Flowers Delivery',
  'birthday/cakes':                 'Order Birthday Cakes',
  'birthday/plants':                'Birthday Plants Online',
  'birthday/gifts-for-her':         'Birthday Gifts for Her',
  'birthday/gifts-for-him':         'Birthday Gifts for Him',
  'birthday/gifts-for-wife':        'Birthday Gifts for Wife',
  'birthday/gifts-for-husband':     'Birthday Gifts for Husband',
  'birthday/gifts-for-mother':      'Birthday Gifts for Mother',
  'birthday/gifts-for-father':      'Birthday Gifts for Father',
  'birthday/gifts-for-girlfriend':  'Birthday Gifts for Girlfriend',
  'birthday/gifts-for-boyfriend':   'Birthday Gifts for Boyfriend',
  'birthday/gifts-for-friends':     'Birthday Gifts for Friends',
  'birthday/gifts-for-brother':     'Birthday Gifts for Brother',
  'birthday/gifts-for-sister':      'Birthday Gifts for Sister',
  'birthday/gifts-for-kids':        'Birthday Gifts for Kids',
  'birthday/roses':                 'Birthday Roses Delivery',
  'birthday/chocolate-cakes':       'Order Birthday Chocolate Cakes',
  'birthday/surprise-gifts':        'Birthday Surprise Gifts',
  // Anniversary
  'anniversary-gifts-delivery':     'Anniversary Gifts Delivery',
  'anniversary/flowers':            'Anniversary Flowers Delivery',
  'anniversary/cakes':              'Order Anniversary Cakes',
  'anniversary/plants':             'Anniversary Plants Online',
  'anniversary/gifts-for-wife':     'Anniversary Gifts for Wife',
  'anniversary/gifts-for-husband':  'Anniversary Gifts for Husband',
  'anniversary/gifts-for-parents':  'Anniversary Gifts for Parents',
  'anniversary/gifts-for-her':      'Anniversary Gifts for Her',
  'anniversary/gifts-for-him':      'Anniversary Gifts for Him',
  'anniversary/gifts-for-girlfriend':'Anniversary Gifts for Girlfriend',
  'anniversary/gifts-for-boyfriend':'Anniversary Gifts for Boyfriend',
  'anniversary/gifts-for-friends':  'Anniversary Gifts for Friends',
  'anniversary/roses':              'Anniversary Roses Delivery',
  'anniversary/red-velvet':         'Order Anniversary Red Velvet Cakes',
  'anniversary/surprise-gifts':     'Anniversary Surprise Gifts',
  // Wedding
  'wedding-gifts-online':           'Wedding Gifts Online',
  'wedding/flowers':                'Wedding Flowers Delivery',
  'wedding/plants':                 'Wedding Plants Online',
  'wedding/cakes':                  'Order Wedding Cakes',
  'wedding/roses':                  'Wedding Roses Delivery',
  'wedding/lilies':                 'Wedding Lilies Delivery',
  'wedding/carnations':             'Wedding Carnations Delivery',
  'wedding/roses-and-carnation':    'Wedding Roses and Carnation Delivery',
  'wedding/peace-lily':             'Wedding Peace Lily Plant Online',
  'wedding/money':                  'Wedding Money Plant Online',
  'wedding/jade':                   'Wedding Jade Plant Online',
  'wedding/bonsai':                 'Wedding Bonsai Plant Online',
  'wedding/snake':                  'Wedding Snake Plant Online',
  'wedding/bouquets':               'Shop Fresh Wedding Bouquets',
  'wedding/for-her':                'Wedding Gifts for Her',
  'wedding/for-him':                'Wedding Gifts for Him',
  'wedding/for-wife':               'Wedding Gifts for Wife',
  'wedding/for-husband':            'Wedding Gifts for Husband',
  'wedding/for-mother':             'Wedding Gifts for Mother',
  'wedding/for-father':             'Wedding Gifts for Father',
  'wedding/for-friends':            'Wedding Gifts for Friends',
  'wedding/for-girlfriend':         'Wedding Gifts for Girlfriend',
  'wedding/for-boyfriend':          'Wedding Gifts for Boyfriend',
  'wedding/surprise-gifts':         'Wedding Surprise Gifts',
  // Hampers
  'gift-hampers':                   'Gift Hampers Online',
  'hampers/birthday':               'Birthday Hampers Online',
  'hampers/anniversary':            'Anniversary Hampers Online',
  'hampers/wedding':                'Wedding Hampers Online',
  'hampers/house-warming':          'House Warming Hampers Online',
  'hampers/baby-shower':            'Baby Shower Hampers Online',
  'hampers/new-born-baby':          'New Born Baby Hampers Online',
  'hampers/thank-you':              'Thank You Hampers Online',
  'hampers/congratulations':        'Congratulations Hampers Online',
  'hampers/for-her':                'Gift Hampers for Her',
  'hampers/for-him':                'Gift Hampers for Him',
  'hampers/for-wife':               'Gift Hampers for Wife',
  'hampers/for-husband':            'Gift Hampers for Husband',
  'hampers/for-mother':             'Gift Hampers for Mother',
  'hampers/for-father':             'Gift Hampers for Father',
  'hampers/for-friends':            'Gift Hampers for Friends',
  'hampers/for-kids':               'Gift Hampers for Kids',
  'hampers/for-sister':             'Gift Hampers for Sister',
  'hampers/for-brother':            'Gift Hampers for Brother',
  'hampers/valentines-day':         "Valentine's Day Hampers Online",
  'hampers/mothers-day':            "Mother's Day Hampers Online",
  'hampers/fathers-day':            "Father's Day Hampers Online",
  'hampers/christmas':              'Christmas Hampers Online',
  'hampers/new-year':               'New Year Hampers Online',
  'hampers/eid-al-fitr':            'Eid Hampers Online',
  'hampers/holi':                   'Holi Hampers Online',
  'hampers/luxury':                 'Luxury Gift Hampers Online',
  'hampers/premium':                'Premium Gift Hampers Online',
  'hampers/personalised':           'Personalised Gift Hampers Online',
};

export const getPageH1 = (categorySlug, subcategorySlug) => {
  const key = subcategorySlug ? `${categorySlug}/${subcategorySlug}` : categorySlug;
  return PAGE_H1_MAP[key] || null;
};
