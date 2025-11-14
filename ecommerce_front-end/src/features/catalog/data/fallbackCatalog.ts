import type { ProductDto, ProductResponse } from '../../../api/products'

const fallbackCatalog: ProductDto[] = [
  {
    id: 1000,
    name: 'Midnight Pour-Over Kettle',
    price: 79,
    stock: 14,
    description: 'Precision gooseneck kettle with a built-in thermometer for perfect pours.',
    sku: 'KETTLE-MIDNIGHT',
    imageUrl:
      'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1001,
    name: 'Slate Ceramic Mug',
    price: 22,
    stock: 32,
    description: 'Hand-finished ceramic mug with matte glaze and stackable profile.',
    sku: 'MUG-SLATE',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1002,
    name: 'Station Desk Lamp',
    price: 129,
    stock: 7,
    description: 'Adjustable LED desk lamp inspired by industrial task lighting.',
    sku: 'LAMP-STATION',
    imageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1003,
    name: 'Aerial Plant Stand',
    price: 58,
    stock: 18,
    description: 'Powder-coated steel plant stand that fits small to medium planters.',
    sku: 'PLANT-AERIAL',
    imageUrl:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1004,
    name: 'Cloud Linen Throw',
    price: 95,
    stock: 21,
    description: 'Lightweight linen throw blanket with a soft brushed finish.',
    sku: 'THROW-CLOUD',
    imageUrl:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1005,
    name: 'Noir Chemex Set',
    price: 149,
    stock: 9,
    description: 'Limited-run Chemex brewer bundle with filters and walnut collar.',
    sku: 'CHEMEX-NOIR',
    imageUrl:
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1006,
    name: 'Driftwood Side Table',
    price: 249,
    stock: 4,
    description: 'Compact side table made from reclaimed driftwood and steel legs.',
    sku: 'TABLE-DRIFTWOOD',
    imageUrl:
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1007,
    name: 'Atlas Wall Clock',
    price: 110,
    stock: 12,
    description: 'Minimal wall clock with silent sweep movement and brass hands.',
    sku: 'CLOCK-ATLAS',
    imageUrl:
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 1008,
    name: 'Voyage Weekender Bag',
    price: 185,
    stock: 15,
    description: 'Waxed canvas weekender with full-grain leather straps.',
    sku: 'BAG-VOYAGE',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
]

export function getFallbackCatalog(pageNo: number, pageSize: number): ProductResponse | null {
  if (!fallbackCatalog.length || pageSize <= 0) {
    return null
  }

  const totalElements = fallbackCatalog.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const safePageNo = Math.min(Math.max(pageNo, 0), totalPages - 1)
  const start = safePageNo * pageSize
  const content = fallbackCatalog.slice(start, start + pageSize)

  return {
    content,
    pageNo: safePageNo,
    pageSize,
    totalElements,
    totalPages,
    last: safePageNo >= totalPages - 1,
  }
}

export const hasFallbackCatalog = fallbackCatalog.length > 0
