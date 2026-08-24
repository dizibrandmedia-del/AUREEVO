import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PERMISSIONS, SYSTEM_ROLES, DEFAULT_ROLE_PERMISSIONS } from '../lib/rbac';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AUREEVO database...');

  // 1. Seed Permissions
  console.log('Seeding permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: {
        code: perm.code,
        name: perm.name,
        module: perm.module,
        description: perm.description,
      },
    });
  }

  const allDbPermissions = await prisma.permission.findMany();
  const permMap = new Map(allDbPermissions.map((p) => [p.code, p.id]));

  // 2. Seed System Roles & Assign Permissions
  console.log('Seeding roles & assigning permissions...');
  for (const [key, roleDef] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: { name: roleDef.name, description: roleDef.description, isSystem: true },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystem: true,
      },
    });

    const permCodes = DEFAULT_ROLE_PERMISSIONS[roleDef.slug] || [];
    for (const code of permCodes) {
      const permId = permMap.get(code);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'super-admin' } });
  const productManagerRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'product-manager' } });
  const inventoryManagerRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'inventory-manager' } });

  // 3. Seed Default Super Admin & Staff Users
  console.log('Seeding admin users...');
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@aureevo.com' },
    update: {
      name: 'AUREEVO Super Admin',
      roleId: superAdminRole.id,
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@aureevo.com',
      name: 'AUREEVO Super Admin',
      passwordHash: adminPasswordHash,
      roleId: superAdminRole.id,
      status: 'ACTIVE',
      avatar: '/images/aureevo-logo.png',
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'products@aureevo.com' },
    update: { roleId: productManagerRole.id },
    create: {
      email: 'products@aureevo.com',
      name: 'Elena Vance (Product Lead)',
      passwordHash: adminPasswordHash,
      roleId: productManagerRole.id,
      status: 'ACTIVE',
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'inventory@aureevo.com' },
    update: { roleId: inventoryManagerRole.id },
    create: {
      email: 'inventory@aureevo.com',
      name: 'Marcus Sterling (Inventory Lead)',
      passwordHash: adminPasswordHash,
      roleId: inventoryManagerRole.id,
      status: 'ACTIVE',
    },
  });

  // 4. Seed Customer Demo User
  console.log('Seeding customer users...');
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);
  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPasswordHash,
      firstName: 'Lady',
      lastName: 'Genevieve',
      phone: '+91 9988776655',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  });

  // Seed Customer Address
  await prisma.address.deleteMany({ where: { userId: demoCustomer.id } });
  await prisma.address.create({
    data: {
      userId: demoCustomer.id,
      name: 'Lady Genevieve DuPont',
      phone: '+91 9988776655',
      addressLine1: 'Penthouse 4B, Imperial Towers',
      addressLine2: 'Altamount Road, Cumballa Hill',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400026',
      landmark: 'Near Antilia',
      addressType: 'HOME',
      isDefault: true,
    },
  });

  // 5. Seed Warehouses
  console.log('Seeding warehouses...');
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MUM-01' },
    update: { isDefault: true },
    create: {
      name: 'AUREEVO Central Fulfillment Center',
      code: 'WH-MUM-01',
      address: 'Plot 42, Bandra-Kurla Complex Luxury Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      contactName: 'Vikramaditya Roy',
      contactPhone: '+91 22 4500 8900',
      contactEmail: 'logistics.mumbai@aureevo.com',
      isDefault: true,
      status: 'ACTIVE',
    },
  });

  const northWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-DEL-02' },
    update: {},
    create: {
      name: 'AUREEVO North Distribution Hub',
      code: 'WH-DEL-02',
      address: 'Aerocity Global Gateway, Sector 21',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      contactName: 'Ananya Sharma',
      contactPhone: '+91 11 6700 3400',
      contactEmail: 'logistics.delhi@aureevo.com',
      isDefault: false,
      status: 'ACTIVE',
    },
  });

  // 6. Seed Categories
  console.log('Seeding categories...');
  const beautyRoot = await prisma.category.upsert({
    where: { slug: 'beauty-and-personal-care' },
    update: { isFeatured: true, sortOrder: 1 },
    create: {
      name: 'Beauty & Personal Care',
      slug: 'beauty-and-personal-care',
      description: 'Ultra-luxurious formulated skincare, haute parfumerie, and cosmetic alchemy.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 1,
      status: 'ACTIVE',
    },
  });

  const skincare = await prisma.category.upsert({
    where: { slug: 'skincare' },
    update: { parentId: beautyRoot.id, sortOrder: 1, isFeatured: true },
    create: {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Cellular restoration, 24k gold botanicals, and high-potency elixirs.',
      parentId: beautyRoot.id,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 1,
      status: 'ACTIVE',
    },
  });

  const serums = await prisma.category.upsert({
    where: { slug: 'serums-and-treatments' },
    update: { parentId: skincare.id, sortOrder: 1 },
    create: {
      name: 'Serums & Treatments',
      slug: 'serums-and-treatments',
      description: 'Targeted bio-active serums and youth concentrates.',
      parentId: skincare.id,
      sortOrder: 1,
      status: 'ACTIVE',
    },
  });

  const creams = await prisma.category.upsert({
    where: { slug: 'moisturizers-and-creams' },
    update: { parentId: skincare.id, sortOrder: 2 },
    create: {
      name: 'Moisturizers & Night Creams',
      slug: 'moisturizers-and-creams',
      description: 'Velvet texture rich hydration and barrier renewal creams.',
      parentId: skincare.id,
      sortOrder: 2,
      status: 'ACTIVE',
    },
  });

  const fragrance = await prisma.category.upsert({
    where: { slug: 'fragrance' },
    update: { parentId: beautyRoot.id, sortOrder: 2, isFeatured: true },
    create: {
      name: 'Haute Parfumerie',
      slug: 'fragrance',
      description: 'Masterfully crafted extrait de parfum and rare oriental essences.',
      parentId: beautyRoot.id,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 2,
      status: 'ACTIVE',
    },
  });

  const makeup = await prisma.category.upsert({
    where: { slug: 'makeup' },
    update: { parentId: beautyRoot.id, sortOrder: 3, isFeatured: true },
    create: {
      name: 'Luxury Makeup',
      slug: 'makeup',
      description: 'Satin lipsticks, pure mineral pigments, and golden illuminators.',
      parentId: beautyRoot.id,
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 3,
      status: 'ACTIVE',
    },
  });

  // 7. Seed Brands
  console.log('Seeding brands...');
  const brandAureevo = await prisma.brand.upsert({
    where: { slug: 'aureevo-maison' },
    update: { isFeatured: true },
    create: {
      name: 'AUREEVO Maison',
      slug: 'aureevo-maison',
      logo: '/images/aureevo-logo.png',
      description: 'The pinnacle of luxury skincare and precious botanical infusions.',
      website: 'https://aureevo.com',
      isFeatured: true,
      status: 'ACTIVE',
    },
  });

  const brandElixir = await prisma.brand.upsert({
    where: { slug: 'lelixir-royale' },
    update: { isFeatured: true },
    create: {
      name: "L'Élixir Royale",
      slug: 'lelixir-royale',
      logo: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=300&q=80',
      description: 'French heritage perfumery distilling the rarest blossoms and resins.',
      website: 'https://lelixir-royale.paris',
      isFeatured: true,
      status: 'ACTIVE',
    },
  });

  const brandAurum = await prisma.brand.upsert({
    where: { slug: 'aurum-botanicals' },
    update: {},
    create: {
      name: 'Aurum Botanicals',
      slug: 'aurum-botanicals',
      logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80',
      description: 'Swiss alpine biotechnology meets certified 24-karat gold leaf.',
      isFeatured: true,
      status: 'ACTIVE',
    },
  });

  // 8. Seed Dynamic Attributes
  console.log('Seeding dynamic attributes...');
  const attrVolume = await prisma.attribute.upsert({
    where: { code: 'volume' },
    update: { isVariant: true, isFilterable: true },
    create: {
      name: 'Volume / Size',
      code: 'volume',
      type: 'SELECT',
      isFilterable: true,
      isVariant: true,
      isRequired: false,
      sortOrder: 1,
    },
  });

  await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: attrVolume.id, value: '30ml' } },
    update: {},
    create: { attributeId: attrVolume.id, value: '30ml', label: '30 ml (Travel Luxe)', sortOrder: 1 },
  });

  await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: attrVolume.id, value: '50ml' } },
    update: {},
    create: { attributeId: attrVolume.id, value: '50ml', label: '50 ml (Standard)', sortOrder: 2 },
  });

  await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: attrVolume.id, value: '100ml' } },
    update: {},
    create: { attributeId: attrVolume.id, value: '100ml', label: '100 ml (Grand Flacon)', sortOrder: 3 },
  });

  const attrSkinType = await prisma.attribute.upsert({
    where: { code: 'skin_type' },
    update: { isVariant: false, isFilterable: true },
    create: {
      name: 'Skin Type',
      code: 'skin_type',
      type: 'MULTISELECT',
      isFilterable: true,
      isVariant: false,
      isRequired: false,
      sortOrder: 2,
    },
  });

  await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: attrSkinType.id, value: 'all-skin-types' } },
    update: {},
    create: { attributeId: attrSkinType.id, value: 'all-skin-types', label: 'All Skin Types', sortOrder: 1 },
  });

  // 9. Seed Products & Variants
  console.log('Seeding products, variants & inventory...');

  // Product 1: Variable Product
  const productSerum = await prisma.product.upsert({
    where: { sku: 'AUR-SER-24K' },
    update: {
      name: 'AUREEVO 24K Imperial Gold Rejuvenating Serum',
      status: 'ACTIVE',
      isFeatured: true,
      mrp: 14500,
      sellingPrice: 12500,
      rating: 4.9,
      reviewCount: 42,
      categoryId: serums.id,
      brandId: brandAureevo.id,
    },
    create: {
      name: 'AUREEVO 24K Imperial Gold Rejuvenating Serum',
      slug: 'aureevo-24k-imperial-gold-rejuvenating-serum',
      sku: 'AUR-SER-24K',
      brandId: brandAureevo.id,
      categoryId: serums.id,
      productType: 'VARIABLE',
      status: 'ACTIVE',
      isFeatured: true,
      rating: 4.9,
      reviewCount: 42,
      shortDescription: 'Infused with pure 24-karat gold flakes and bio-identical peptides for unmatched cellular luminescence.',
      description: '<p>The AUREEVO 24K Imperial Gold Rejuvenating Serum represents the zenith of cellular cosmetic mastery. Handcrafted with suspended 24-karat micronized gold leaves and royal saffron extract.</p>',
      highlights: JSON.stringify([
        'Suspended pure 24K Swiss colloidal gold',
        'Multi-molecular weight hyaluronic acid',
        'Visible firming and deep luminescence within 7 days',
        'Dermatologist tested & hypoallergenic',
      ]),
      benefits: JSON.stringify([
        'Accelerates cellular regeneration and collagen synthesis',
        'Neutralizes free radicals with intense antioxidant gold matrix',
        'Deeply restores moisture barrier with velvety finish',
      ]),
      specifications: JSON.stringify({
        Formulation: 'Ultra-lightweight Golden Essence',
        'Skin Type': 'All Skin Types, Ideal for Mature/Dull',
        Origin: 'Switzerland & India Collaboration',
        Volume: '30ml / 50ml flacons',
      }),
      ingredients: 'Aqua (Purified Water), 24K Pure Gold Flakes (Aurum), Niacinamide (5%), Triple-Hyaluronic Acid Complex, Royal Kashmiri Saffron Extract (Crocus Sativus), Squalane (Plant-derived), Matrixyl 3000 Peptides, Phenoxyethanol.',
      howToUse: 'After cleansing, dispense 3-4 golden drops onto fingertips. Gently press into face, neck, and décolletage in an upward sweeping motion. Allow 60 seconds to absorb before applying moisturiser.',
      mrp: 14500,
      sellingPrice: 12500,
      discountPercent: 13.79,
      taxRate: 18.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1608248597359-216954b88d36?auto=format&fit=crop&w=1000&q=80',
      ]),
      tags: JSON.stringify(['24k gold', 'luxury serum', 'anti-aging', 'luminescence', 'aureevo signature']),
      metaTitle: '24K Imperial Gold Rejuvenating Serum | AUREEVO',
      metaDescription: 'Shop the signature AUREEVO 24K Imperial Gold Rejuvenating Serum. Ultra-luxurious anti-aging youth elixir with pure gold leaf.',
    },
  });

  const var30 = await prisma.productVariant.upsert({
    where: { sku: 'AUR-SER-24K-30ML' },
    update: { stock: 45, price: 8500, mrp: 9500 },
    create: {
      productId: productSerum.id,
      sku: 'AUR-SER-24K-30ML',
      name: '30 ml Flacon',
      mrp: 9500,
      price: 8500,
      stock: 45,
      status: 'ACTIVE',
      attributes: JSON.stringify({ volume: '30ml' }),
    },
  });

  const var50 = await prisma.productVariant.upsert({
    where: { sku: 'AUR-SER-24K-50ML' },
    update: { stock: 28, price: 12500, mrp: 14500 },
    create: {
      productId: productSerum.id,
      sku: 'AUR-SER-24K-50ML',
      name: '50 ml Flacon',
      mrp: 14500,
      price: 12500,
      stock: 28,
      status: 'ACTIVE',
      attributes: JSON.stringify({ volume: '50ml' }),
    },
  });

  // Clean old inventories for demo reload
  await prisma.inventory.deleteMany({
    where: { productId: productSerum.id },
  });

  const invVar30 = await prisma.inventory.create({
    data: {
      productId: productSerum.id,
      variantId: var30.id,
      warehouseId: mainWarehouse.id,
      currentStock: 45,
      reservedStock: 3,
      lowStockThreshold: 10,
    },
  });

  const invVar50 = await prisma.inventory.create({
    data: {
      productId: productSerum.id,
      variantId: var50.id,
      warehouseId: mainWarehouse.id,
      currentStock: 28,
      reservedStock: 2,
      lowStockThreshold: 8,
    },
  });

  // Product 2: Simple Product (Haute Perfume)
  const productPerfume = await prisma.product.upsert({
    where: { sku: 'ELX-PARF-OUD100' },
    update: {
      name: "L'Élixir Royale Oud & Damascene Rose Extrait",
      status: 'ACTIVE',
      isFeatured: true,
      mrp: 28000,
      sellingPrice: 24500,
      rating: 5.0,
      reviewCount: 18,
      categoryId: fragrance.id,
      brandId: brandElixir.id,
    },
    create: {
      name: "L'Élixir Royale Oud & Damascene Rose Extrait",
      slug: 'lelixir-royale-oud-damascene-rose-extrait',
      sku: 'ELX-PARF-OUD100',
      brandId: brandElixir.id,
      categoryId: fragrance.id,
      productType: 'SIMPLE',
      status: 'ACTIVE',
      isFeatured: true,
      rating: 5.0,
      reviewCount: 18,
      shortDescription: 'Masterpiece extrait de parfum combining 40-year aged Cambodian agarwood and Taif roses.',
      description: '<p>A scent of regal opulence. Hand-blended in Grasse using antique copper alembics, this extrait de parfum opens with crystalline saffron and unfolds into a dark, smoky heart of rare vintage oud.</p>',
      highlights: JSON.stringify([
        'Extrait de Parfum (35% oil concentration)',
        'Hand-harvested midnight Taif roses',
        'Aged 40-year wild Cambodian agarwood',
        'Cut crystal flacon with 24k gold-plated stopper',
      ]),
      benefits: JSON.stringify([
        'Exceptional 24-hour longevity with majestic sillage',
        'Hypnotic blend of spicy, floral, and resinous accords',
      ]),
      specifications: JSON.stringify({
        Concentration: 'Extrait de Parfum',
        Volume: '100 ml (3.4 fl. oz.)',
        'Top Notes': 'Saffron, Pink Pepper, Sicilian Bergamot',
        'Heart Notes': 'Taif Damascene Rose, Turkish Rose Absolute, Nutmeg',
        'Base Notes': 'Cambodian Oud, Golden Amber, Civet, Leather, Mysore Sandalwood',
      }),
      mrp: 28000,
      sellingPrice: 24500,
      discountPercent: 12.5,
      taxRate: 18.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
      ]),
      tags: JSON.stringify(['haute perfumery', 'oud', 'rose', 'luxury perfume', 'extrait']),
      metaTitle: "L'Élixir Royale Oud & Damascene Rose Extrait | AUREEVO",
      metaDescription: 'Discover the rarest artisanal perfume, aged Cambodian oud and precious Taif rose. Presented exclusively at AUREEVO.',
    },
  });

  await prisma.inventory.deleteMany({
    where: { productId: productPerfume.id },
  });

  const invPerfume = await prisma.inventory.create({
    data: {
      productId: productPerfume.id,
      variantId: null,
      warehouseId: mainWarehouse.id,
      currentStock: 14,
      reservedStock: 1,
      lowStockThreshold: 5,
    },
  });

  // Product 3: Night Cream
  const productNightCream = await prisma.product.upsert({
    where: { sku: 'AUR-BOT-CRM' },
    update: {
      name: 'Aurum Botanicals Midnight Recovery Crème',
      status: 'ACTIVE',
      isFeatured: false,
      mrp: 9800,
      sellingPrice: 8900,
      rating: 4.8,
      reviewCount: 29,
      categoryId: creams.id,
      brandId: brandAurum.id,
    },
    create: {
      name: 'Aurum Botanicals Midnight Recovery Crème',
      slug: 'aurum-botanicals-midnight-recovery-creme',
      sku: 'AUR-BOT-CRM',
      brandId: brandAurum.id,
      categoryId: creams.id,
      productType: 'SIMPLE',
      status: 'ACTIVE',
      isFeatured: false,
      rating: 4.8,
      reviewCount: 29,
      shortDescription: 'Intensive nightly lipid replenishment with rare black truffle extract and marine collagen.',
      description: '<p>Reclaim youthful elasticity while you rest with Swiss alpine phyto-nutrients and velvet bio-lipids.</p>',
      highlights: JSON.stringify([
        'Black Périgord truffle bio-actives',
        'Deep lipid lipid restorative matrix',
        'Non-comedogenic silk absorption',
      ]),
      specifications: JSON.stringify({
        Volume: '50 ml Jar',
        Formulation: 'Velvety Rich Crème',
        Origin: 'Valais, Switzerland',
      }),
      mrp: 9800,
      sellingPrice: 8900,
      discountPercent: 9.18,
      taxRate: 18.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
      ]),
      tags: JSON.stringify(['night cream', 'anti-aging', 'swiss botanicals']),
    },
  });

  await prisma.inventory.deleteMany({
    where: { productId: productNightCream.id },
  });

  await prisma.inventory.create({
    data: {
      productId: productNightCream.id,
      variantId: null,
      warehouseId: mainWarehouse.id,
      currentStock: 18,
      reservedStock: 0,
      lowStockThreshold: 5,
    },
  });

  // Seed Product Reviews
  console.log('Seeding customer reviews...');
  await prisma.customerReview.deleteMany();
  await prisma.customerReview.createMany({
    data: [
      {
        productId: productSerum.id,
        userId: demoCustomer.id,
        rating: 5,
        title: 'Unrivalled Luminescence & Texture',
        comment:
          'From the very first application, the 24K gold flakes melted effortlessly into my skin. My complexion has taken on an incandescent glow that no other luxury brand has matched.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
      {
        productId: productPerfume.id,
        userId: demoCustomer.id,
        rating: 5,
        title: 'Masterpiece of Grasse Perfumery',
        comment:
          'The Taif rose harmonizes with the aged oud in a way that feels ancient and regal. The sillage lasts well past 24 hours.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
    ],
  });

  // 10. Record Initial Stock History Audit Logs
  console.log('Recording stock history audits...');
  await prisma.stockHistory.deleteMany();
  await prisma.stockHistory.createMany({
    data: [
      {
        inventoryId: invVar30.id,
        productId: productSerum.id,
        variantId: var30.id,
        warehouseId: mainWarehouse.id,
        previousQty: 0,
        newQty: 45,
        diffQty: 45,
        action: 'INITIAL',
        reason: 'Initial luxury inventory intake from Swiss Laboratory',
        adminUserId: superAdmin.id,
      },
      {
        inventoryId: invVar50.id,
        productId: productSerum.id,
        variantId: var50.id,
        warehouseId: mainWarehouse.id,
        previousQty: 0,
        newQty: 28,
        diffQty: 28,
        action: 'INITIAL',
        reason: 'Initial luxury inventory intake from Swiss Laboratory',
        adminUserId: superAdmin.id,
      },
      {
        inventoryId: invPerfume.id,
        productId: productPerfume.id,
        variantId: null,
        warehouseId: mainWarehouse.id,
        previousQty: 0,
        newQty: 14,
        diffQty: 14,
        action: 'INITIAL',
        reason: 'First batch vintage extraction import from Grasse, France',
        adminUserId: superAdmin.id,
      },
    ],
  });

  // 11. Seed Admin Settings
  console.log('Seeding admin settings...');
  const defaultSettings = [
    { key: 'business_name', value: 'AUREEVO Luxury Retail Private Limited', group: 'BUSINESS' },
    { key: 'business_tagline', value: 'THE WORLD OF LUXURY.', group: 'BUSINESS' },
    { key: 'business_email', value: 'concierge@aureevo.com', group: 'BUSINESS' },
    { key: 'business_phone', value: '+91 22 8900 1200', group: 'BUSINESS' },
    { key: 'business_address', value: 'Level 14, The Oberoi Grand Arcade, Nariman Point, Mumbai - 400021', group: 'BUSINESS' },
    { key: 'primary_color', value: '#071a14', group: 'BRANDING' },
    { key: 'accent_gold', value: '#d4af37', group: 'BRANDING' },
    { key: 'logo_url', value: '/images/aureevo-logo.png', group: 'BRANDING' },
    { key: 'favicon_url', value: '/favicon.png', group: 'BRANDING' },
    { key: 'default_currency', value: 'INR', group: 'GENERAL' },
    { key: 'currency_symbol', value: '₹', group: 'GENERAL' },
    { key: 'free_shipping_threshold', value: '5000', group: 'GENERAL' },
    { key: 'standard_shipping_rate', value: '350', group: 'GENERAL' },
    { key: 'timezone', value: 'Asia/Kolkata', group: 'GENERAL' },
    { key: 'default_tax_rate', value: '18.0', group: 'GENERAL' },
    { key: 'payment_gateway', value: 'razorpay', group: 'INTEGRATIONS' },
    { key: 'shipping_partner', value: 'bluedart_luxury', group: 'INTEGRATIONS' },
    { key: 'email_provider', value: 'smtp_ses', group: 'INTEGRATIONS' },
    { key: 'whatsapp_provider', value: 'interakt', group: 'INTEGRATIONS' },
  ];

  for (const s of defaultSettings) {
    await prisma.adminSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: { key: s.key, value: s.value, group: s.group },
    });
  }

  // 12. Seed Homepage CMS Sections & Banners
  console.log('Seeding Homepage CMS sections & hero banners...');
  await prisma.banner.deleteMany();
  await prisma.homepageSection.deleteMany();

  const heroSection = await prisma.homepageSection.create({
    data: {
      type: 'HERO_BANNER',
      title: 'Hero Carousel',
      subtitle: 'Main storefront slider',
      isActive: true,
      sortOrder: 1,
      config: JSON.stringify({ autoPlay: true, interval: 5000 }),
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        sectionId: heroSection.id,
        title: 'THE WORLD OF LUXURY.',
        subtitle: 'Rare 24K Swiss Gold Botanical Alchemy & Haute Parfumerie.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85',
        mobileImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
        ctaText: 'EXPLORE THE HAUTE COLLECTION',
        ctaUrl: '/shop',
        sortOrder: 1,
        isActive: true,
      },
      {
        sectionId: heroSection.id,
        title: "L'ÉLIXIR ROYALE PARFUMERIE",
        subtitle: '40-Year Aged Cambodian Oud & Rare Taif Rose Extraits.',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1800&q=85',
        mobileImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85',
        ctaText: 'DISCOVER ARTISANAL FRAGRANCES',
        ctaUrl: '/category/fragrance',
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  await prisma.homepageSection.createMany({
    data: [
      {
        type: 'CATEGORY_SHOWCASE',
        title: 'Curated Maisons',
        subtitle: 'Explore Haute Categories',
        isActive: true,
        sortOrder: 2,
      },
      {
        type: 'BEST_SELLERS',
        title: 'Iconic Formulations',
        subtitle: 'Most Coveted Masterpieces',
        isActive: true,
        sortOrder: 3,
      },
      {
        type: 'NEW_ARRIVALS',
        title: 'New High-Potency Launches',
        subtitle: 'The Latest Developments in Cellular Alchemy',
        isActive: true,
        sortOrder: 4,
      },
      {
        type: 'TRUST_PILLARS',
        title: 'The AUREEVO Privilege',
        subtitle: 'Uncompromising standards of authentic luxury',
        isActive: true,
        sortOrder: 5,
      },
      {
        type: 'REVIEWS',
        title: 'Clientèle Praise',
        subtitle: 'Words from our distinguished patrons',
        isActive: true,
        sortOrder: 6,
      },
      {
        type: 'INSTAGRAM_UGC',
        title: 'The Haute World of AUREEVO',
        subtitle: 'Follow @AUREEVO.LUXURY on Instagram',
        isActive: true,
        sortOrder: 7,
      },
      {
        type: 'NEWSLETTER',
        title: 'Join The Private Clientèle Circle',
        subtitle: 'Receive private invitations to limited batch harvests and masterclasses.',
        isActive: true,
        sortOrder: 8,
      },
    ],
  });

  // 13. Seed Media Records
  console.log('Seeding media records...');
  await prisma.media.upsert({
    where: { id: 'media-official-logo' },
    update: {},
    create: {
      id: 'media-official-logo',
      filename: 'aureevo-logo.png',
      originalName: 'AUREEVO Official Brand Crest.png',
      mimeType: 'image/png',
      size: 742100,
      url: '/images/aureevo-logo.png',
      altText: 'AUREEVO Official Brand Identity',
      folder: 'branding',
    },
  });

  // 15. Seed Phase 3 Coupons
  console.log('Seeding Phase 3 coupons...');
  await prisma.coupon.upsert({
    where: { code: 'ROYAL10' },
    update: {},
    create: {
      code: 'ROYAL10',
      name: 'Clientèle Royal Privilege 10%',
      description: '10% privilege discount on all haute formulations above ₹5,000.',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 5000,
      maxDiscount: 5000,
      usageLimit: 1000,
      perUserLimit: 2,
      isFirstOrderOnly: false,
      isCodAllowed: true,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2027-12-31'),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'AUREEVO500' },
    update: {},
    create: {
      code: 'AUREEVO500',
      name: 'Maison Welcome ₹500 Off',
      description: 'Flat ₹500 privilege voucher on orders above ₹2,500.',
      discountType: 'FLAT',
      discountValue: 500,
      minOrderValue: 2500,
      usageLimit: 500,
      perUserLimit: 1,
      isFirstOrderOnly: false,
      isCodAllowed: true,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2027-12-31'),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FIRSTORDER' },
    update: {},
    create: {
      code: 'FIRSTORDER',
      name: 'Inaugural Client Privilege 15%',
      description: '15% privilege discount exclusively for your first acquisition.',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 3000,
      maxDiscount: 3000,
      isFirstOrderOnly: true,
      isCodAllowed: false,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2027-12-31'),
    },
  });

  // 16. Seed Phase 3 Promotions
  console.log('Seeding promotions...');
  await prisma.promotion.upsert({
    where: { slug: 'imperial-gold-harvest-2026' },
    update: {},
    create: {
      name: 'Imperial 24K Gold Harvest Festival',
      slug: 'imperial-gold-harvest-2026',
      type: 'FLASH_SALE',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      badgeText: 'IMPERIAL HARVEST 20% OFF',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-09-30'),
      isActive: true,
    },
  });

  // 17. Seed Initial Customer Order with Shipment & Tracking
  console.log('Seeding demo customer orders...');
  const patronUser = await prisma.user.findFirst({ where: { email: 'genevieve@aureevo.com' } });
  const sampleProd = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { variants: true },
  });

  if (patronUser && sampleProd) {
    const variant = sampleProd.variants[0] || null;
    const itemPrice = variant ? variant.price : sampleProd.sellingPrice;
    const subtotal = itemPrice * 1;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;

    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: 'AUR-2026-89210' } });
    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'AUR-2026-89210',
          userId: patronUser.id,
          status: 'SHIPPED',
          subtotal,
          taxTotal: tax,
          shippingFee: 0,
          grandTotal,
          deliveryMethod: 'WHITE_GLOVE',
          shippingAddress: JSON.stringify({
            name: 'Lady Genevieve',
            phone: '+919988776655',
            addressLine1: 'Penthouse 4B, Imperial Towers',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400026',
            addressType: 'HOME',
          }),
          items: {
            create: [
              {
                productId: sampleProd.id,
                variantId: variant ? variant.id : null,
                productName: sampleProd.name,
                variantName: variant ? variant.name : null,
                sku: variant ? variant.sku : sampleProd.sku,
                image: sampleProd.images ? JSON.parse(sampleProd.images)[0] : null,
                quantity: 1,
                unitPrice: itemPrice,
                unitMrp: variant ? variant.mrp : sampleProd.mrp,
                taxRate: 18.0,
                taxAmount: tax,
                totalPrice: subtotal,
              },
            ],
          },
          payments: {
            create: [
              {
                paymentMethod: 'UPI',
                gateway: 'razorpay',
                transactionId: 'pay_AUR_9821094',
                gatewayOrderId: 'order_AUR_98210',
                amount: grandTotal,
                status: 'SUCCESS',
              },
            ],
          },
          shipments: {
            create: [
              {
                courier: 'BLUE_DART',
                awbNumber: 'BD-LUX-8921094',
                trackingUrl: 'https://www.bluedart.com/tracking/BD-LUX-8921094',
                status: 'IN_TRANSIT',
                carrierStatus: 'In transit to Mumbai Distribution Hub',
                timeline: JSON.stringify([
                  { status: 'Order Placed', time: '2026-08-20 10:15' },
                  { status: 'Vault Harvest Quality Approved', time: '2026-08-20 14:40' },
                  { status: 'Handed to Blue Dart Luxury Courier', time: '2026-08-21 09:00' },
                ]),
              },
            ],
          },
          statusHistory: {
            create: [
              { fromStatus: null, toStatus: 'NEW', comment: 'Order created via VIP Online Checkout', performedBy: patronUser.id },
              { fromStatus: 'NEW', toStatus: 'CONFIRMED', comment: 'Payment verified via Razorpay UPI', performedBy: 'SYSTEM' },
              { fromStatus: 'CONFIRMED', toStatus: 'PACKED', comment: 'Vault formulation packaged with white-glove seals', performedBy: 'SYSTEM' },
              { fromStatus: 'PACKED', toStatus: 'SHIPPED', comment: 'AWB BD-LUX-8921094 dispatched via Blue Dart Luxury Courier', performedBy: 'SYSTEM' },
            ],
          },
        },
      });
    }
  }

  console.log('AUREEVO Phase 3 Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
