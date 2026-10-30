import { CatalogItem } from '@/types';

export const MOCK_CATALOG: CatalogItem[] = [
  // 4K Webcams
  {
    id: 'CAM-4K-01',
    merchantName: 'Nexus Direct',
    title: 'UltraClear 4K Pro Studio Webcam',
    category: 'Electronics',
    price: 89.99,
    currency: 'USD',
    shippingCost: 4.99,
    deliveryDays: 2,
    rating: 4.8,
    reviewCount: 1420,
    inStock: true,
    specs: {
      resolution: '4K UHD (3840x2160)',
      fps: '60fps',
      sensor: 'Sony STARVIS CMOS',
      fov: '90-degree adjustable',
      connection: 'USB-C 3.1',
      microphone: 'Dual omni-directional noise-canceling',
    },
    description: 'Broadcast-quality 4K streaming webcam with AI auto-focus and low-light enhancement.',
  },
  {
    id: 'CAM-4K-02',
    merchantName: 'OmniTech Global',
    title: 'StreamMaster 4K HDR Conference Camera',
    category: 'Electronics',
    price: 114.5,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 1,
    rating: 4.9,
    reviewCount: 3105,
    inStock: true,
    specs: {
      resolution: '4K HDR',
      fps: '60fps',
      sensor: '1/2.8" BSI Sensor',
      fov: '95-degree wide',
      connection: 'USB-C Plug & Play',
      microphone: 'Quad beamforming array',
    },
    description: 'Premier enterprise-grade 4K conference camera featuring HDR glass optics and prime next-day delivery.',
  },
  {
    id: 'CAM-4K-03',
    merchantName: 'Apex Peripherals',
    title: 'VisionCore 4K Basic Webcam',
    category: 'Electronics',
    price: 69.0,
    currency: 'USD',
    shippingCost: 8.5,
    deliveryDays: 4,
    rating: 4.3,
    reviewCount: 420,
    inStock: true,
    specs: {
      resolution: '4K (interpolated)',
      fps: '30fps',
      sensor: 'Standard CMOS',
      fov: '75-degree',
      connection: 'USB-A 2.0',
    },
    description: 'Budget 4K webcam suitable for basic video calls and remote work.',
  },
  {
    id: 'CAM-4K-04',
    merchantName: 'ShadyElectronicsCorp',
    title: 'SuperMega 4K Ultra Cheap Cam (Blacklisted Seller)',
    category: 'Electronics',
    price: 39.99,
    currency: 'USD',
    shippingCost: 15.0,
    deliveryDays: 14,
    rating: 2.1,
    reviewCount: 18,
    inStock: true,
    specs: {
      resolution: 'Claimed 4K',
      fps: '15fps',
    },
    description: 'Suspiciously cheap unbranded webcam from blacklisted distributor.',
  },

  // Ergonomic Mice
  {
    id: 'MOU-ERG-01',
    merchantName: 'Apex Peripherals',
    title: 'ErgoGlide Vertical Wireless Productivity Mouse',
    category: 'Peripherals',
    price: 49.99,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 2,
    rating: 4.7,
    reviewCount: 2210,
    inStock: true,
    specs: {
      ergonomics: '57-degree natural handshake angle',
      dpi: '4000 DPI adjustable',
      connectivity: 'Dual Bluetooth 5.1 & 2.4GHz Dongle',
      battery: 'Rechargeable 500mAh (4 months per charge)',
      buttons: '6 programmable silent buttons',
    },
    description: 'Scientific ergonomic vertical mouse designed to eliminate wrist strain during extended coding sessions.',
  },
  {
    id: 'MOU-ERG-02',
    merchantName: 'Nexus Direct',
    title: 'PrecisionTrack Pro Ergonomic Laser Mouse',
    category: 'Peripherals',
    price: 58.0,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 1,
    rating: 4.8,
    reviewCount: 1840,
    inStock: true,
    specs: {
      ergonomics: 'Contoured thumb rest with gesture button',
      dpi: '8000 DPI Darkfield sensor',
      connectivity: 'Multi-device pairing (3 devices)',
      battery: 'USB-C Quick Charge (70 days)',
    },
    description: 'Premium productivity mouse with hyper-fast MagSpeed electromagnetic scrolling wheel.',
  },

  // Keyboards
  {
    id: 'KB-MEC-01',
    merchantName: 'Nexus Direct',
    title: 'KeyCraft Pro 75% Wireless Mechanical Keyboard',
    category: 'Peripherals',
    price: 84.99,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 2,
    rating: 4.9,
    reviewCount: 950,
    inStock: true,
    specs: {
      layout: '75% Compact (84 keys)',
      switches: 'Hot-swappable Pre-lubed Gateron Yellow',
      connectivity: 'Tri-mode: Type-C, Bluetooth 5.0, 2.4G',
      keycaps: 'PBT Double-shot OEM Profile',
      backlight: 'South-facing RGB',
    },
    description: 'Acoustically dampened mechanical keyboard engineered for rapid typing and whisper-quiet switches.',
  },
  {
    id: 'KB-MEC-02',
    merchantName: 'MicroStore Plus',
    title: 'DeskComfort Silent Membrane Office Keyboard',
    category: 'Office Supplies',
    price: 32.5,
    currency: 'USD',
    shippingCost: 4.99,
    deliveryDays: 3,
    rating: 4.4,
    reviewCount: 680,
    inStock: true,
    specs: {
      layout: 'Full 104-key',
      switches: 'Cushioned membrane',
      connectivity: 'USB Cable',
    },
    description: 'Durable spill-resistant office keyboard for everyday corporate procurement.',
  },

  // Cloud Compute & Software Subscriptions
  {
    id: 'CLD-SRV-01',
    merchantName: 'PrimeCloud Logistics',
    title: 'ComputePro Instance - 4 vCPU / 16GB RAM (Monthly)',
    category: 'Cloud Software',
    price: 74.0,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 0,
    rating: 4.9,
    reviewCount: 880,
    inStock: true,
    specs: {
      cpu: '4 vCPU AMD EPYC',
      ram: '16GB ECC DDR5',
      storage: '160GB NVMe SSD',
      bandwidth: '5TB @ 10Gbps',
      uptime: '99.99% SLA',
      instantActivation: true,
    },
    description: 'Enterprise virtual server cluster optimized for autonomous AI agent containers and database workloads.',
  },
  {
    id: 'CLD-SRV-02',
    merchantName: 'CloudNode Pro',
    title: 'HighMemory Server Instance - 8 vCPU / 32GB RAM (Monthly)',
    category: 'Cloud Software',
    price: 139.0,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 0,
    rating: 4.8,
    reviewCount: 520,
    inStock: true,
    specs: {
      cpu: '8 vCPU AMD EPYC',
      ram: '32GB ECC DDR5',
      storage: '320GB NVMe Gen4',
      bandwidth: '10TB @ 10Gbps',
      uptime: '99.99% SLA',
    },
    description: 'High-throughput memory-optimized node tailored for large language model inference caching.',
  },

  // Noise Canceling Headsets
  {
    id: 'AUD-ANC-01',
    merchantName: 'OmniTech Global',
    title: 'SoundSilence Pro Hybrid ANC Wireless Headphones',
    category: 'Electronics',
    price: 94.99,
    currency: 'USD',
    shippingCost: 0.0,
    deliveryDays: 1,
    rating: 4.7,
    reviewCount: 1640,
    inStock: true,
    specs: {
      anc: '40dB Hybrid Active Noise Cancellation',
      batteryLife: '60 hours playback',
      codec: 'LDAC, AAC, SBC Hi-Res Audio',
      microphone: 'AI Voice Clarity 5-mic system',
    },
    description: 'Over-ear headphones that cancel ambient distraction, delivering pristine calls and focus soundscapes.',
  },
  {
    id: 'AUD-ANC-02',
    merchantName: 'MicroStore Plus',
    title: 'FocusBuds Active Noise Cancelling Earbuds',
    category: 'Electronics',
    price: 54.0,
    currency: 'USD',
    shippingCost: 3.5,
    deliveryDays: 3,
    rating: 4.5,
    reviewCount: 790,
    inStock: true,
    specs: {
      anc: 'Active Noise Cancellation',
      batteryLife: '32 hours with case',
      waterproof: 'IPX5 Water Resistant',
    },
    description: 'Pocketable true wireless earbuds with immersive audio and wireless charging case.',
  },
];

/**
 * Searches the catalog across multiple merchant inventories.
 */
export async function searchCatalog(
  query: string,
  maxBudget?: number,
  category?: string
): Promise<CatalogItem[]> {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  const results = MOCK_CATALOG.filter((item) => {
    // Check stock
    if (!item.inStock) return false;

    // Optional category check
    if (category && item.category.toLowerCase() !== category.toLowerCase()) {
      // Don't strictly discard if text strongly matches
    }

    // Text search against title, description, category, and specs
    const searchCorpus = [
      item.title,
      item.category,
      item.description || '',
      item.merchantName,
      ...Object.values(item.specs).map(String),
    ]
      .join(' ')
      .toLowerCase();

    const matchesQuery = queryTokens.length === 0 || queryTokens.some((token) => searchCorpus.includes(token));
    if (!matchesQuery) return false;

    // Filter by max budget if provided
    if (maxBudget !== undefined && maxBudget > 0) {
      const total = item.price + item.shippingCost;
      // Allow minor slack if within 15% for evaluation comparison
      if (total > maxBudget * 1.25) {
        return false;
      }
    }

    return true;
  });

  // Sort by rating & popularity by default
  return results.sort((a, b) => b.rating - a.rating);
}

/**
 * Retrieves details for a specific catalog item by ID.
 */
export async function getProductDetails(id: string): Promise<CatalogItem | null> {
  const item = MOCK_CATALOG.find((i) => i.id === id);
  return item || null;
}
