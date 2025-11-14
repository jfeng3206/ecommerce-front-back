
db = db.getSiblingDB('ecommerce')

db.products.drop();

const now = new Date();

const baseProducts = [
  {
    id: 1,
    name: "Aurora Noise-Canceling Headphones",
    description: "Wireless over-ear headphones with adaptive ANC and 35-hour battery life.",
    price: 149.99,
    stock: 120,
    sku: "EL-AUR-0001",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944"
  },
  {
    id: 2,
    name: "Lumen Smart Home Hub",
    description: "Matter-compatible hub automating lights, thermostats, and sensors with a privacy-first design.",
    price: 129.0,
    stock: 85,
    sku: "EL-LUM-0002",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Pulse Fitness Tracker",
    description: "24/7 heart-rate monitor with built-in GPS, swim tracking, and 6-day battery life.",
    price: 99.5,
    stock: 140,
    sku: "EL-PULSE-0003",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Driftwood Pour-Over Coffee Kit",
    description: "Handcrafted brewer with borosilicate server, reusable steel filter, and precision kettle.",
    price: 79.95,
    stock: 70,
    sku: "HM-DRIFT-0004",
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Hearthstone Cast Iron Skillet",
    description: "Pre-seasoned 12\" skillet designed for stovetop-to-oven cooking and perfect searing.",
    price: 59.0,
    stock: 110,
    sku: "HM-HEARTH-0005",
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1481671703460-040cb8a2d909"
  },
  {
    id: 6,
    name: "Summit 28L Daypack",
    description: "Water-resistant alpine pack with breathable suspension and hydration compatibility.",
    price: 119.0,
    stock: 95,
    sku: "OUT-SUMMIT-0006",
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1438480478735-3234e63615bb"
  },
  {
    id: 7,
    name: "Trailblazer Insulated Bottle",
    description: "32oz stainless bottle keeps drinks cold 30 hours, hot 12 hours; includes magnetic cap.",
    price: 39.9,
    stock: 200,
    sku: "OUT-TRAIL-0007",
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657"
  },
  {
    id: 8,
    name: "Velocity Pro Pickleball Paddle",
    description: "Carbon-fiber paddle with polymer honeycomb core for balanced control and pop.",
    price: 89.0,
    stock: 150,
    sku: "SP-VELO-0008",
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf"
  },
  {
    id: 9,
    name: "Apex Eco Yoga Mat",
    description: "Natural rubber mat with closed-cell top for grip, hygiene, and easy cleaning.",
    price: 74.0,
    stock: 130,
    sku: "SP-APEX-0009",
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a"
  },
  {
    id: 10,
    name: "Canvas Minimalist Desk Lamp",
    description: "LED lamp with three touch dimming levels, ambient glow, and USB-C charging base.",
    price: 92.0,
    stock: 80,
    sku: "DEC-CANVAS-0010",
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf"
  },
  {
    id: 11,
    name: "Arcadia Standing Desk",
    description: "Dual-motor sit/stand desk with programmable memory presets and cable tray.",
    price: 499.0,
    stock: 45,
    sku: "DEC-ARCA-0011",
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173"
  },
  {
    id: 12,
    name: "Nimbus Ultralight Jacket",
    description: "Packable windproof shell with stretch cuffs, DWR coating, and reflective hits.",
    price: 139.0,
    stock: 160,
    sku: "APP-NIMB-0012",
    categoryId: 6,
    imageUrl: "https://images.unsplash.com/photo-1467043237213-65f2da53396f"
  },
  {
    id: 13,
    name: "Meridian Merino Hoodie",
    description: "200gsm merino mid-layer for year-round comfort with scuba hood and thumb loops.",
    price: 159.0,
    stock: 90,
    sku: "APP-MERI-0013",
    categoryId: 6,
    imageUrl: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb"
  },
  {
    id: 14,
    name: "Ember Ceramic Mug Set",
    description: "12oz double-wall ceramic mugs with soft-touch exterior and insulated base.",
    price: 44.0,
    stock: 180,
    sku: "KIT-EMBER-0014",
    categoryId: 7,
    imageUrl: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 15,
    name: "Stellar 4K Action Camera",
    description: "Rugged action cam with HorizonLock, voice control, and 60m waterproofing.",
    price: 249.0,
    stock: 70,
    sku: "EL-STELL-0015",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff"
  },
  {
    id: 16,
    name: "Flux Portable SSD 1TB",
    description: "USB‑C Gen2 drive with 1050MB/s read speeds and drop-resistant shell.",
    price: 179.0,
    stock: 210,
    sku: "EL-FLUX-0016",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475"
  },
  {
    id: 17,
    name: "Drift Loom Throw Blanket",
    description: "Organic cotton throw with artisanal weave and fringed edges.",
    price: 89.0,
    stock: 65,
    sku: "DEC-DRIFT-0017",
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
  },
  {
    id: 18,
    name: "Bloom Hydroponic Herb Kit",
    description: "Countertop garden with LED grow cycles and auto-watering reservoir.",
    price: 119.0,
    stock: 75,
    sku: "HM-BLOOM-0018",
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
  },
  {
    id: 19,
    name: "Orbit Bluetooth Speaker",
    description: "360° portable speaker with IP67 rating and multi-speaker pairing.",
    price: 99.0,
    stock: 155,
    sku: "EL-ORBIT-0019",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1511376777868-611b54f68947"
  },
  {
    id: 20,
    name: "Spectra Gaming Mouse",
    description: "65g mouse with adjustable DPI, PTFE feet, and RGB halo.",
    price: 69.0,
    stock: 190,
    sku: "EL-SPECT-0020",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
  }
];

const docs = baseProducts.map(p => ({
  _id: NumberLong(p.id),
  id: NumberLong(p.id),
  name: p.name,
  description: p.description,
  price: Number(p.price.toFixed(2)),
  stock: NumberInt(p.stock),
  reserved: NumberInt(0),
  sku: p.sku,
  category_id: NumberLong(p.categoryId),
  image_url: `${p.imageUrl}?auto=format&fit=crop&w=800&q=80`,
  deleted: false,
  created_at: now,
  updated_at: now
}));

db.products.insertMany(docs);
print(`Inserted ${docs.length} products`);
