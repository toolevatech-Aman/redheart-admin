import React, { useState, useEffect, useCallback } from "react";
import {
  listCategoryConfigs,
  createCategoryConfig,
  updateCategoryConfig,
  deleteCategoryConfig,
  generateCityPages,
  downloadTemplate,
} from "../../service/categoryConfigService";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_CITIES_TEXT = [
  "Abids","Abohar","Achhnera","Adipur","Adyar","Agartala","Agra","Ahmedabad",
  "Ahmednagar","Aizawl","Ajmer","Akola","Alappuzha","Aligarh","Alipurduar",
  "Allahabad","Almora","Alwar","Ambala","Ambattur","Ambikapur","Amravati",
  "Amritsar","Amroha","Anakapalle","Anand","Anantapur","Ankleshwar","Anuppur",
  "Aranthangi","Arcot","Araria","Arrah","Ariyalur","Arsikere","Aruppukkottai",
  "Asansol","Ashoknagar","Asifabad","Attingal","Aurai","Aurangabad","Ayodhya",
  "Azamgarh","Bagalkot","Bagaha","Baghpat","Bageshwar","Bahadurgarh","Bahraich",
  "Balia","Balasore","Balod","Baloda Bazar","Balrampur","Balurghat","Ballari",
  "Balotra","Banda","Bankura","Banswara","Bapatla","Barabanki","Baramulla",
  "Barasat","Bareilly","Bardhaman","Bargarh","Barh","Barmer","Barnala",
  "Barrackpore","Barwani","Basti","Batala","Bathinda","Beawar","Beed","Begusarai",
  "Belagavi","Bellary","Bemetara","Berhampur","Betul","Bettiah","Bhadohi",
  "Bhadrachalam","Bhadrak","Bhagalpur","Bharatpur","Bharuch","Bhavnagar",
  "Bhandara","Bhilai","Bhilwara","Bhimavaram","Bhind","Bhiwadi","Bhiwani",
  "Bhopal","Bhubaneswar","Bhuj","Bhongir","Bhusawal","Bidar","Bihar Sharif",
  "Bijapur","Bikaner","Bilaspur","Bina","Bishnupur","Bodhan","Bokaro","Bobbili",
  "Botad","Brahmapur","Bulandshahr","Bundi","Cachar","Calicut","Chamarajanagar",
  "Chamba","Champawat","Chandigarh","Chandauli","Chandel","Changanassery",
  "Changlang","Channapatna","Chandrapur","Chatra","Chengalpattu","Chengannur",
  "Chennai","Chhapra","Chhindwara","Chikkaballapur","Chikkamagaluru","Chikhli",
  "Chikodi","Chinchvad","Chirala","Chitoor","Chittorgarh","Chittur","Churu",
  "Coimbatore","Cooch Behar","Cuddalore","Cuddapah","Cuttack","Dahanu","Dahod",
  "Daltonganj","Daman","Damoh","Darbhanga","Datia","Dausa","Davangere","Dehradun",
  "Delhi","Deoghar","Deoria","Dewas","Dhanbad","Dharmanagar","Dharmapuri",
  "Dharmavaram","Dharuhera","Dharwad","Dhoraji","Dhubri","Dhule","Dibrugarh",
  "Dimapur","Dindigul","Dindori","Durg","Durgapur","East Champaran","Eluru",
  "Erode","Etah","Etawah","Faizabad","Faridabad","Faridkot","Farrukhabad",
  "Fatehabad","Fatehgarh Sahib","Fatehpur","Fazilka","Firozabad","Firozpur",
  "Gadchiroli","Gadwal","Gadag","Gandhinagar","Gangavati","Ganganagar","Gangtok",
  "Ganjam","Garhmukteshwar","Garhwa","Gariaband","Gaya","Ghaziabad","Ghazipur",
  "Giridih","Godda","Godhra","Golaghat","Gokak","Gonda","Gondia","Gondal",
  "Gopalganj","Gorakhpur","Gulbarga","Gumla","Guna","Guntur","Guntakal",
  "Gurdaspur","Gurgaon","Guwahati","Gwalior","Hajipur","Haldia","Haldwani",
  "Halol","Hamirpur","Hansi","Hanumangarh","Hapur","Hardoi","Haridwar","Hassan",
  "Hathras","Hisar","Hinganghat","Hingoli","Hirekerur","Honnavar","Hoshangabad",
  "Hoshiarpur","Hospet","Howrah","Hubli","Hyderabad","Ichalkaranji","Idukki",
  "Igatpuri","Ilkal","Imphal","Indore","Itanagar","Itarsi","Jabalpur","Jagdalpur",
  "Jagitial","Jaipur","Jalandhar","Jalgaon","Jalna","Jaisalmer","Jalaun","Jalpaiguri",
  "Jammu","Jamnagar","Jamshedpur","Jamtara","Janjgir","Jaora","Jashpur","Jaunpur",
  "Jehanabad","Jhalawar","Jharsuguda","Jhansi","Jind","Jodhpur","Jorhat","Junagadh",
  "Junnar","Kadapa","Kadiri","Kaithal","Kakinada","Kalaburagi","Kalahandi","Kalol",
  "Kalyan","Kalyani","Kamareddy","Kamarhati","Kamrup","Kancheepuram","Kandhamal",
  "Kangra","Kanker","Kanniyakumari","Kannur","Kanpur","Kapurthala","Karaikal",
  "Karauli","Karimnagar","Karnal","Karur","Kasaragod","Kathua","Katni","Katpadi",
  "Kavali","Kendrapara","Kendujhar","Khammam","Kharagpur","Khandwa","Khargone",
  "Kheda","Khunti","Kishanganj","Kochi","Kodaikanal","Kodagu","Koderma","Kohima",
  "Kokrajhar","Kolhapur","Kolkata","Kollam","Kondagaon","Koppal","Korba","Korea",
  "Kota","Kothagudem","Kovvur","Kozhikode","Krishna","Krishnagiri","Kullu",
  "Kumbakonam","Kupwara","Kurukshetra","Kurnool","Lakhimpur","Lalitpur","Latur",
  "Leh","Lohardaga","Loni","Lonavala","Lucknow","Ludhiana","Lunglei","Macherla",
  "Madanapalle","Madhubani","Madurai","Maheshtala","Mahbubnagar","Mahendragarh",
  "Mahoba","Mahuva","Mainpuri","Malappuram","Malda","Malkangiri","Malerkotla",
  "Mancherial","Mandi","Mandsaur","Mangalagiri","Mangalore","Manmad","Mannargudi",
  "Markapur","Marthandam","Mathura","Mau","Medak","Medchal","Meerut","Miryalaguda",
  "Mirzapur","Modasa","Moga","Mon","Morbi","Morena","Motihari","Mumbai","Munger",
  "Murshidabad","Muzaffarnagar","Muzaffarpur","Mysuru","Nadia","Nagapattinam",
  "Nagaur","Nagda","Nagercoil","Nagpur","Nalanda","Nalgonda","Namakkal","Nanded",
  "Nandurbar","Narasaraopet","Narayanpur","Narsinghpur","Nashik","Navi Mumbai",
  "Navsari","Nawada","Nawanshahr","Nellore","Neemuch","Nirmal","Nizamabad","Noida",
  "North Lakhimpur","Nuapada","Ongole","Osmanabad","Padrauna","Palakkad","Palamu",
  "Palayamkottai","Palghar","Pali","Paloncha","Palwal","Panchkula","Panchmahal",
  "Panaji","Panihati","Panipat","Panna","Panvel","Parbhani","Parli","Pathankot",
  "Pathanamthitta","Patiala","Patna","Pattukkottai","Pauri","Payyanur","Peddapalli",
  "Perambalur","Phagwara","Pilibhit","Pimpri","Pithoragarh","Pollachi","Pondicherry",
  "Ponnani","Porbandar","Pratapgarh","Proddatur","Puducherry","Pudukkottai","Punch",
  "Pune","Puri","Purnia","Puruliya","Raebareli","Raipur","Raichur","Raigad","Raisen",
  "Rajahmundry","Rajampet","Rajkot","Rajnandgaon","Rajsamand","Ramanagara",
  "Ramanathapuram","Rameshwaram","Ramgarh","Rampur","Ranchi","Ranibennur","Ranipet",
  "Ratlam","Ratnagiri","Rayagada","Reasi","Renigunta","Rewa","Rewari","Robertsganj",
  "Rohtak","Rohtas","Rupnagar","Sabarkantha","Sagar","Saharanpur","Sahibganj",
  "Salem","Samastipur","Samba","Sangamner","Sangareddy","Sangli","Sankarankovil",
  "Sangrur","Saran","Saraikela","Satara","Satna","Sawai Madhopur","Sehore","Seoni",
  "Shegaon","Shahjahanpur","Shillong","Shimla","Shivamogga","Shivpuri","Shoranur",
  "Shrirampur","Siddipet","Siliguri","Silvassa","Singrauli","Sirohi","Sirsa",
  "Sitamarhi","Sitapur","Sivaganga","Siwan","Solapur","Sonbhadra","Sonipat",
  "Sonitpur","Srikakulam","Srinagar","Srirangam","Srirangapatna","Sukma","Sultanpur",
  "Sunam","Supaul","Surendranagar","Surguja","Surat","Tadepalligudem","Tadipatri",
  "Tambaram","Tamenglong","Tanda","Tanuku","Tarikere","Tawang","Tehri","Tenkasi",
  "Thane","Thanjavur","Thiruvananthapuram","Thoothukudi","Thrissur","Tiruchengode",
  "Tiruchirappalli","Tirukoilur","Tirunelveli","Tirupattur","Tirupati","Tiruppur",
  "Tiruvallur","Tiruvottiyur","Tiruvannamalai","Tiruvarur","Tinsukia","Tonk",
  "Tumkur","Tuensang","Udaipur","Udupi","Ujjain","Ulhasnagar","Umaria","Una",
  "Unnao","Vadodara","Valsad","Vapi","Varanasi","Vasai","Vasco da Gama","Vellakoil",
  "Vellore","Vidisha","Vijayawada","Villupuram","Visakhapatnam","Vizianagaram",
  "Wai","Warangal","Wardha","Washim","Wokha","Yadgir","Yamunanagar","Yanam",
  "Yavatmal","Zunheboto",
].join("\n");

const COLUMN_TYPES = ["string", "number", "boolean", "array", "enum", "url"];

const DEFAULT_COLUMNS = [
  { key: "name",                               label: "Product Name",         mandatory: true,  type: "string",  example: "Red Rose Bouquet" },
  { key: "sku",                                label: "SKU",                  mandatory: true,  type: "string",  example: "RH001CO",         pattern: "" },
  { key: "quantity",                           label: "Quantity",             mandatory: true,  type: "number",  example: "100" },
  { key: "costing_price",                      label: "Costing Price",        mandatory: true,  type: "number",  example: "200" },
  { key: "original_price",                     label: "Original Price",       mandatory: true,  type: "number",  example: "499" },
  { key: "selling_price",                      label: "Selling Price",        mandatory: true,  type: "number",  example: "399" },
  { key: "description",                        label: "Description",          mandatory: false, type: "string",  example: "A beautiful bouquet" },
  { key: "media.primary_image_url",            label: "Primary Image URL",    mandatory: true,  type: "url",     example: "https://cdn.redheart.in/image.jpg" },
  { key: "product_attributes.available_cities",label: "Available Cities",     mandatory: false, type: "string",  example: "India" },
  { key: "availability.is_active",             label: "Is Active",            mandatory: false, type: "boolean", example: "true" },
  { key: "availability.is_featured",           label: "Is Featured",          mandatory: false, type: "boolean", example: "false" },
];

const EMPTY_COLUMN = {
  key: "", label: "", mandatory: false, type: "string",
  allowedValues: [], separator: "|", min: "", maxLength: "", pattern: "", example: "", note: "",
};

const EMPTY_CONFIG = {
  name: "", slug: "", short_slug: "", sku_suffix: "", accent_color: "#e11d48", is_active: true,
  subcategories: [],
  columns: DEFAULT_COLUMNS.map(c => ({ ...EMPTY_COLUMN, ...c })),
  seo: {
    service_label: "", biz_type: "Store",
    category_page: { meta_title: "", meta_description: "", h1: "", canonical_url: "", meta_keywords: "", footer_content: "", og_image: "" },
    subcategory_page: { title_template: "", description_template: "", h1_template: "", keywords_template: "" },
    city_page: { title_template: "", description_template: "", h1_template: "", keywords_template: "", breadcrumb_last_template: "", footer_content_template: "" },
    category_faqs: Array(5).fill(null).map(() => ({ question: "", answer: "" })),
    city_faqs: Array(5).fill(null).map(() => ({ question_template: "", answer_template: "" })),
  },
  schema: { category_page_type: "CollectionPage", city_page_type: "LocalBusiness" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            t.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return { toasts, addToast };
}

// ── Column editor modal ───────────────────────────────────────────────────────

function ColumnModal({ initial, onSave, onClose }) {
  const [col, setCol] = useState(initial || deepClone(EMPTY_COLUMN));

  const set = (field, value) => setCol((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{initial ? "Edit Column" : "Add Column"}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key *</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono"
                value={col.key} onChange={(e) => set("key", e.target.value)} placeholder="e.g. categorization.subcategory_name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label *</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={col.label} onChange={(e) => set("label", e.target.value)} placeholder="Display label" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={col.type} onChange={(e) => set("type", e.target.value)}>
                {COLUMN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="col-mandatory" checked={col.mandatory}
                onChange={(e) => set("mandatory", e.target.checked)} className="accent-red-600 w-4 h-4" />
              <label htmlFor="col-mandatory" className="text-sm font-medium text-gray-700">Mandatory</label>
            </div>
          </div>

          {col.type === "enum" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Allowed Values (pipe-separated)</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={Array.isArray(col.allowedValues) ? col.allowedValues.join("|") : col.allowedValues || ""}
                onChange={(e) => set("allowedValues", e.target.value.split("|").map((v) => v.trim()).filter(Boolean))}
                placeholder="Option1|Option2|Option3" />
            </div>
          )}

          {col.type === "array" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={col.separator || "|"} onChange={(e) => set("separator", e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={col.min || ""} onChange={(e) => set("min", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Length</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                value={col.maxLength || ""} onChange={(e) => set("maxLength", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pattern (regex)</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono"
              value={col.pattern || ""} onChange={(e) => set("pattern", e.target.value)} placeholder="^[A-Za-z0-9]+CO$" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Example</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
              value={col.example || ""} onChange={(e) => set("example", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
              value={col.note || ""} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSave(col)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            {initial ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Basic Info ─────────────────────────────────────────────────────────

function TabBasic({ form, setForm }) {
  const setField = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name) + "-online",
      short_slug: slugify(name),
    }));
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
          value={form.name} onChange={handleNameChange} placeholder="e.g. Combos" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Slug (SEO URL) *</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono"
          value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="combos-online" />
        <p className="text-xs text-gray-400 mt-1">Used in URLs: /combos-online/delhi</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Short Slug</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono"
          value={form.short_slug} onChange={(e) => setField("short_slug", e.target.value)} placeholder="combos" />
        <p className="text-xs text-gray-400 mt-1">Used in product links: /p/combos/product-sku</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SKU Suffix *</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono"
          value={form.sku_suffix} onChange={(e) => setField("sku_suffix", e.target.value.toUpperCase())} placeholder="CO" />
        <p className="text-xs text-gray-400 mt-1">e.g. "CO" → SKU pattern: RH001CO</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
        <div className="flex items-center gap-3">
          <input type="color" className="w-10 h-10 rounded cursor-pointer border border-gray-300"
            value={form.accent_color} onChange={(e) => setField("accent_color", e.target.value)} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none font-mono w-32"
            value={form.accent_color} onChange={(e) => setField("accent_color", e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="is-active" checked={form.is_active}
          onChange={(e) => setField("is_active", e.target.checked)} className="accent-red-600 w-4 h-4" />
        <label htmlFor="is-active" className="text-sm font-medium text-gray-700">Active</label>
      </div>
    </div>
  );
}

// ── Tab 2: Subcategories ──────────────────────────────────────────────────────

function TabSubcategories({ form, setForm }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (!val) return;
    setForm((prev) => ({ ...prev, subcategories: [...(prev.subcategories || []), val] }));
    setInput("");
  };

  const remove = (idx) => {
    setForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== idx),
    }));
  };

  const move = (idx, dir) => {
    const arr = [...(form.subcategories || [])];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setForm((prev) => ({ ...prev, subcategories: arr }));
  };

  return (
    <div className="max-w-xl">
      <p className="text-sm text-gray-500 mb-4">Define the subcategories for this category. These will appear as filter options for products.</p>

      <div className="flex gap-2 mb-4">
        <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. Flower and Cake Combo" />
        <button onClick={add}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap">
          Add
        </button>
      </div>

      {(form.subcategories || []).length === 0 ? (
        <p className="text-gray-400 text-sm italic">No subcategories added yet.</p>
      ) : (
        <ul className="space-y-2">
          {(form.subcategories || []).map((sub, idx) => (
            <li key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="flex-1 text-sm text-gray-800">{sub}</span>
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs px-1">▲</button>
              <button onClick={() => move(idx, 1)} disabled={idx === (form.subcategories || []).length - 1}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs px-1">▼</button>
              <button onClick={() => remove(idx)}
                className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tab 3: Product Attributes (Columns) ──────────────────────────────────────

function TabColumns({ form, setForm }) {
  const [colModal, setColModal] = useState(null); // null | { mode: "add" } | { mode: "edit", idx, col }

  const columns = form.columns || [];

  const saveColumn = (col) => {
    if (colModal.mode === "add") {
      setForm((prev) => ({ ...prev, columns: [...prev.columns, col] }));
    } else {
      setForm((prev) => {
        const arr = [...prev.columns];
        arr[colModal.idx] = col;
        return { ...prev, columns: arr };
      });
    }
    setColModal(null);
  };

  const removeColumn = (idx) => {
    setForm((prev) => ({ ...prev, columns: prev.columns.filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Define upload columns for this category's product template.</p>
        <button onClick={() => setColModal({ mode: "add" })}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
          + Add Column
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Key</th>
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Mandatory</th>
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Example</th>
              <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {columns.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm italic">No columns defined.</td></tr>
            ) : (
              columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-gray-700">{col.key}</td>
                  <td className="px-3 py-2 text-gray-700">{col.label}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-mono">{col.type}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {col.mandatory
                      ? <span className="inline-block px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">Yes</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-400 text-xs truncate max-w-[160px]">{col.example || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => setColModal({ mode: "edit", idx, col: deepClone(col) })}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => removeColumn(idx)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">Del</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {colModal && (
        <ColumnModal
          initial={colModal.mode === "edit" ? colModal.col : null}
          onSave={saveColumn}
          onClose={() => setColModal(null)}
        />
      )}
    </div>
  );
}

// ── Tab 4: SEO Config ─────────────────────────────────────────────────────────

function SeoInput({ label, value, onChange, multiline, placeholder, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none"
          value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
          value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function TabSeo({ form, setForm }) {
  const setSeo = (field, value) =>
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));

  const setSeoSub = (section, field, value) =>
    setForm((prev) => ({
      ...prev,
      seo: { ...prev.seo, [section]: { ...(prev.seo?.[section] || {}), [field]: value } },
    }));

  const seo = form.seo || {};
  const catPage = seo.category_page || {};
  const subPage = seo.subcategory_page || {};
  const cityPage = seo.city_page || {};

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Top-level */}
      <div className="grid grid-cols-2 gap-4">
        <SeoInput label="Service Label" value={seo.service_label}
          onChange={(v) => setSeo("service_label", v)} placeholder="Combo Delivery" />
        <SeoInput label="Business Type" value={seo.biz_type}
          onChange={(v) => setSeo("biz_type", v)} placeholder="Store" />
      </div>

      {/* Category Landing Page */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-200">Category Landing Page</h3>
        <div className="space-y-3">
          <SeoInput label="Meta Title" value={catPage.meta_title} onChange={(v) => setSeoSub("category_page", "meta_title", v)} />
          <SeoInput label="Meta Description" value={catPage.meta_description} onChange={(v) => setSeoSub("category_page", "meta_description", v)} multiline />
          <SeoInput label="H1" value={catPage.h1} onChange={(v) => setSeoSub("category_page", "h1", v)} />
          <SeoInput label="Canonical URL" value={catPage.canonical_url} onChange={(v) => setSeoSub("category_page", "canonical_url", v)} placeholder="https://www.redheart.in/combos-online" />
          <SeoInput label="Meta Keywords" value={catPage.meta_keywords} onChange={(v) => setSeoSub("category_page", "meta_keywords", v)} />
          <SeoInput label="OG Image URL" value={catPage.og_image} onChange={(v) => setSeoSub("category_page", "og_image", v)} />
          <SeoInput label="Footer Content" value={catPage.footer_content} onChange={(v) => setSeoSub("category_page", "footer_content", v)} multiline placeholder="HTML or plain text footer..." />
        </div>
      </div>

      {/* Subcategory Page Templates */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1 pb-1 border-b border-gray-200">Subcategory Page Templates</h3>
        <p className="text-xs text-gray-400 mb-3">Use <code className="bg-gray-100 px-1 rounded">{"{subcategory}"}</code> and <code className="bg-gray-100 px-1 rounded">{"{category}"}</code> as placeholders.</p>
        <div className="space-y-3">
          <SeoInput label="Title Template" value={subPage.title_template} onChange={(v) => setSeoSub("subcategory_page", "title_template", v)} />
          <SeoInput label="Description Template" value={subPage.description_template} onChange={(v) => setSeoSub("subcategory_page", "description_template", v)} multiline />
          <SeoInput label="H1 Template" value={subPage.h1_template} onChange={(v) => setSeoSub("subcategory_page", "h1_template", v)} />
          <SeoInput label="Keywords Template" value={subPage.keywords_template} onChange={(v) => setSeoSub("subcategory_page", "keywords_template", v)} />
        </div>
      </div>

      {/* City Page Templates */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1 pb-1 border-b border-gray-200">City Page Templates</h3>
        <p className="text-xs text-gray-400 mb-3">Use <code className="bg-gray-100 px-1 rounded">{"{city}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{category}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{service_label}"}</code> as placeholders.</p>
        <div className="space-y-3">
          <SeoInput label="Title Template" value={cityPage.title_template} onChange={(v) => setSeoSub("city_page", "title_template", v)} placeholder="Combo Delivery in {city} | Same Day {category} Delivery — RedHeart" />
          <SeoInput label="Description Template" value={cityPage.description_template} onChange={(v) => setSeoSub("city_page", "description_template", v)} multiline />
          <SeoInput label="H1 Template" value={cityPage.h1_template} onChange={(v) => setSeoSub("city_page", "h1_template", v)} placeholder="{service_label} in {city}" />
          <SeoInput label="Keywords Template" value={cityPage.keywords_template} onChange={(v) => setSeoSub("city_page", "keywords_template", v)} />
          <SeoInput label="Breadcrumb Last Label Template" value={cityPage.breadcrumb_last_template} onChange={(v) => setSeoSub("city_page", "breadcrumb_last_template", v)} placeholder="{service_label} in {city}" />
          <SeoInput label="Footer Content Template" value={cityPage.footer_content_template} onChange={(v) => setSeoSub("city_page", "footer_content_template", v)} multiline placeholder="Explore our combo delivery in {city}..." />
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: FAQs ───────────────────────────────────────────────────────────────

function FaqRow({ faq, onChange, templateMode }) {
  if (templateMode) {
    return (
      <div className="grid grid-cols-1 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-0.5">Question Template</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
            value={faq.question_template || ""} onChange={(e) => onChange({ ...faq, question_template: e.target.value })}
            placeholder="How quickly can I get {category} delivery in {city}?" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-0.5">Answer Template</label>
          <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none"
            value={faq.answer_template || ""} onChange={(e) => onChange({ ...faq, answer_template: e.target.value })}
            placeholder="RedHeart offers same-day {category} delivery in {city}..." />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-0.5">Question</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
          value={faq.question || ""} onChange={(e) => onChange({ ...faq, question: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-0.5">Answer</label>
        <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none"
          value={faq.answer || ""} onChange={(e) => onChange({ ...faq, answer: e.target.value })} />
      </div>
    </div>
  );
}

function TabFaqs({ form, setForm }) {
  const updateCatFaq = (idx, val) => {
    const arr = [...(form.seo?.category_faqs || [])];
    arr[idx] = val;
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, category_faqs: arr } }));
  };

  const updateCityFaq = (idx, val) => {
    const arr = [...(form.seo?.city_faqs || [])];
    arr[idx] = val;
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, city_faqs: arr } }));
  };

  const catFaqs  = (form.seo?.category_faqs || []).length === 5
    ? form.seo.category_faqs
    : Array(5).fill(null).map((_, i) => form.seo?.category_faqs?.[i] || { question: "", answer: "" });

  const cityFaqs = (form.seo?.city_faqs || []).length === 5
    ? form.seo.city_faqs
    : Array(5).fill(null).map((_, i) => form.seo?.city_faqs?.[i] || { question_template: "", answer_template: "" });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Category Page FAQs</h3>
        <div className="space-y-3">
          {catFaqs.map((faq, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-400 mb-1">FAQ {idx + 1}</p>
              <FaqRow faq={faq} onChange={(v) => updateCatFaq(idx, v)} templateMode={false} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1">City Page FAQ Templates</h3>
        <p className="text-xs text-gray-400 mb-3">Use <code className="bg-gray-100 px-1 rounded">{"{city}"}</code> as a placeholder — it will be replaced with each city name.</p>
        <div className="space-y-3">
          {cityFaqs.map((faq, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-400 mb-1">FAQ Template {idx + 1}</p>
              <FaqRow faq={faq} onChange={(v) => updateCityFaq(idx, v)} templateMode={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 6: City Pages ─────────────────────────────────────────────────────────

function TabCities({ form, setForm, configName, addToast }) {
  const [cityText, setCityText]       = useState(DEFAULT_CITIES_TEXT);
  const [generating, setGenerating]   = useState(false);
  const [lastResult, setLastResult]   = useState(null);

  const handleGenerate = async () => {
    if (!configName) { addToast("Save the config first before generating city pages.", "error"); return; }
    setGenerating(true);
    try {
      const cityNames = cityText.split("\n").map((c) => c.trim()).filter(Boolean);
      const res = await generateCityPages(configName, cityNames);
      const { generated, total } = res.data;
      setLastResult(res.data);
      addToast(`Generated/updated ${generated} of ${total} city pages.`, "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "City generation failed.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!configName) { addToast("Save the config first.", "error"); return; }
    try {
      const res = await downloadTemplate(configName);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${configName.toLowerCase()}_upload_template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast("Template download failed.", "error");
    }
  };

  const schema = form.schema || {};
  const setSchema = (field, value) =>
    setForm((prev) => ({ ...prev, schema: { ...prev.schema, [field]: value } }));

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Schema Config */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">JSON-LD Schema Config</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category Page Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
              value={schema.category_page_type || "CollectionPage"} onChange={(e) => setSchema("category_page_type", e.target.value)}>
              {["CollectionPage", "ItemList", "WebPage"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City Page Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
              value={schema.city_page_type || "LocalBusiness"} onChange={(e) => setSchema("city_page_type", e.target.value)}>
              {["LocalBusiness", "Store", "Florist", "Bakery"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Product Upload Template</h3>
        <button onClick={handleDownloadTemplate}
          className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors">
          Download XLSX Template
        </button>
      </div>

      {/* City Pages Generator */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1">Generate City Pages</h3>
        <p className="text-xs text-gray-400 mb-3">
          Generates city pages using your City Page SEO templates. Safe to re-run — existing pages are updated, not duplicated.
        </p>

        <label className="block text-xs font-medium text-gray-600 mb-1">City Names (one per line)</label>
        <textarea rows={10}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-y font-mono"
          value={cityText} onChange={(e) => setCityText(e.target.value)} />

        <button onClick={handleGenerate} disabled={generating}
          className="mt-3 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors">
          {generating ? "Generating…" : "Generate / Refresh City Pages"}
        </button>

        {lastResult && (
          <div className="mt-3 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Generated/updated <strong>{lastResult.generated}</strong> of <strong>{lastResult.total}</strong> city pages.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Editor Panel ──────────────────────────────────────────────────────────────

const TABS = ["Basic Info", "Subcategories", "Product Attributes", "SEO Config", "FAQs", "City Pages"];

function EditorPanel({ selected, onSaved, onDeleted, addToast }) {
  const isNew = !selected?._id;
  const [form, setForm]       = useState(isNew ? deepClone(EMPTY_CONFIG) : deepClone(selected));
  const [activeTab, setActive] = useState(0);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setForm(isNew ? deepClone(EMPTY_CONFIG) : deepClone(selected));
    setActive(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await createCategoryConfig(form);
        addToast("Category config created!", "success");
      } else {
        await updateCategoryConfig(selected.name, form);
        addToast("Saved successfully!", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${selected.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCategoryConfig(selected.name);
      addToast("Deleted.", "success");
      onDeleted();
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const configName = isNew ? null : selected?.name;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-5 flex-wrap">
        {TABS.map((tab, idx) => (
          <button key={tab} onClick={() => setActive(idx)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === idx
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 0 && <TabBasic form={form} setForm={setForm} />}
        {activeTab === 1 && <TabSubcategories form={form} setForm={setForm} />}
        {activeTab === 2 && <TabColumns form={form} setForm={setForm} />}
        {activeTab === 3 && <TabSeo form={form} setForm={setForm} />}
        {activeTab === 4 && <TabFaqs form={form} setForm={setForm} />}
        {activeTab === 5 && <TabCities form={form} setForm={setForm} configName={configName} addToast={addToast} />}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <div>
          {!isNew && (
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60">
              {deleting ? "Deleting…" : "Delete Config"}
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors">
          {saving ? "Saving…" : isNew ? "Create Config" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CategoryConfigManager = () => {
  const [configs, setConfigs]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // null | config | { _new: true }
  const { toasts, addToast }    = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategoryConfigs();
      setConfigs(res.data || []);
    } catch (err) {
      console.error("loadConfigs error", err);
      addToast("Failed to load configs.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const handleNew = () => setSelected({ _new: true });

  const handleSaved = async () => {
    await load();
    setSelected(null);
  };

  const handleDeleted = async () => {
    await load();
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast toasts={toasts} />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Config</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define new product categories (e.g. Combos) entirely through this UI — no code changes needed.
          Existing Flowers, Cakes, Plants categories are unaffected.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Panel — Config List */}
        <div className="w-64 flex-shrink-0">
          <button onClick={handleNew}
            className="w-full mb-4 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">
            + New Category
          </button>

          {loading ? (
            <Spinner />
          ) : configs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 italic">No configs yet.</p>
          ) : (
            <div className="space-y-2">
              {configs.map((cfg) => (
                <button key={cfg._id} onClick={() => setSelected(cfg)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    selected?._id === cfg._id
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 truncate">{cfg.name}</span>
                    <span className={`ml-2 flex-shrink-0 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      cfg.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cfg.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400 font-mono truncate">{cfg.slug}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel — Editor */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[600px]">
          {selected ? (
            <EditorPanel
              selected={selected._new ? null : selected}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              addToast={addToast}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <div className="text-5xl mb-4">🗂</div>
              <p className="text-sm font-medium">Select a config to edit, or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryConfigManager;
