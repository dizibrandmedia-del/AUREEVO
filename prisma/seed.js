const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AUREVO.digital database...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryMarginRule.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.pincodeService.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.weddingPackage.deleteMany();
  await prisma.b2BEnquiry.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users (Admin, Sales, Listing)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Dev SuperAdmin",
      email: "admin@aurevo.digital",
      phone: "+919876500001",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const adminManager = await prisma.user.create({
    data: {
      name: "Rohit Operations",
      email: "manager@aurevo.digital",
      phone: "+919876500002",
      passwordHash,
      role: "ADMIN_MANAGER",
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      name: "Amit Sales",
      email: "sales@aurevo.digital",
      phone: "+919876500003",
      passwordHash,
      role: "SALES_MANAGER",
    },
  });

  const listingExec = await prisma.user.create({
    data: {
      name: "Neha Listing",
      email: "listing@aurevo.digital",
      phone: "+919876500004",
      passwordHash,
      role: "LISTING_EXECUTIVE",
    },
  });

  // 3. Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "9876543210",
      passwordHash,
      isVerified: true,
      addresses: {
        create: [
          {
            type: "HOME",
            recipientName: "Rahul Sharma",
            phone: "9876543210",
            streetAddress: "Flat 402, Ganga Heights, Sigra",
            landmark: "Near IP Mall",
            city: "Varanasi",
            state: "Uttar Pradesh",
            pincode: "221010",
            isDefault: true,
          },
        ],
      },
    },
  });

  // 4. Brands
  const brandsData = [
    { name: "Samsung", slug: "samsung", isFeatured: true },
    { name: "LG", slug: "lg", isFeatured: true },
    { name: "Sony", slug: "sony", isFeatured: true },
    { name: "Whirlpool", slug: "whirlpool", isFeatured: true },
    { name: "Bosch", slug: "bosch", isFeatured: true },
    { name: "Philips", slug: "philips", isFeatured: true },
    { name: "Voltas", slug: "voltas", isFeatured: true },
    { name: "Godrej", slug: "godrej", isFeatured: true },
    { name: "AUREVO Living", slug: "aurevo-living", isFeatured: true },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.create({ data: b });
    brandMap[b.slug] = brand.id;
  }

  // 5. Categories & Subcategories
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      displayOrder: 1,
      subcategories: [
        { name: "LED & Smart TVs", slug: "led-smart-tvs" },
        { name: "QLED & OLED TVs", slug: "qled-oled-tvs" },
        { name: "Soundbars & Home Theatre", slug: "soundbars-home-theatre" },
        { name: "Party Speakers & Audio", slug: "speakers-audio" },
      ],
      marginRule: { minMarginPercent: 8, defaultMarginPercent: 12, otherCostPercent: 2 },
    },
    {
      name: "AC & Cooling",
      slug: "ac-cooling",
      displayOrder: 2,
      subcategories: [
        { name: "Split Inverter ACs", slug: "split-inverter-acs" },
        { name: "Window ACs", slug: "window-acs" },
        { name: "Air Coolers & Fans", slug: "air-coolers-fans" },
      ],
      marginRule: { minMarginPercent: 10, defaultMarginPercent: 14, otherCostPercent: 3 },
    },
    {
      name: "Refrigeration",
      slug: "refrigeration",
      displayOrder: 3,
      subcategories: [
        { name: "Double Door Refrigerators", slug: "double-door-refrigerators" },
        { name: "Side by Side Refrigerators", slug: "side-by-side-refrigerators" },
        { name: "Single Door Refrigerators", slug: "single-door-refrigerators" },
      ],
      marginRule: { minMarginPercent: 10, defaultMarginPercent: 15, otherCostPercent: 3 },
    },
    {
      name: "Washing & Cleaning",
      slug: "washing-cleaning",
      displayOrder: 4,
      subcategories: [
        { name: "Front Load Washing Machines", slug: "front-load-washing-machines" },
        { name: "Top Load Washing Machines", slug: "top-load-washing-machines" },
        { name: "Semi-Automatic Washers", slug: "semi-automatic-washers" },
        { name: "Vacuum Cleaners", slug: "vacuum-cleaners" },
      ],
      marginRule: { minMarginPercent: 9, defaultMarginPercent: 13, otherCostPercent: 2.5 },
    },
    {
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      displayOrder: 5,
      subcategories: [
        { name: "Microwave & OTG", slug: "microwave-otg" },
        { name: "Mixer Grinders & Juicers", slug: "mixer-grinders-juicers" },
        { name: "Air Fryers & Kettles", slug: "air-fryers-kettles" },
        { name: "Chimneys & Cooktops", slug: "chimneys-cooktops" },
      ],
      marginRule: { minMarginPercent: 12, defaultMarginPercent: 18, otherCostPercent: 2.5 },
    },
    {
      name: "Furniture",
      slug: "furniture",
      displayOrder: 6,
      subcategories: [
        { name: "King & Queen Beds", slug: "beds" },
        { name: "Luxury Sofas & Recliners", slug: "sofas-recliners" },
        { name: "Dining Sets & Tables", slug: "dining-tables" },
        { name: "Wardrobes & Storage", slug: "wardrobes-storage" },
      ],
      marginRule: { minMarginPercent: 15, defaultMarginPercent: 25, otherCostPercent: 5 },
    },
    {
      name: "Home & Living",
      slug: "home-living",
      displayOrder: 7,
      subcategories: [
        { name: "Lighting & Lamps", slug: "lighting-lamps" },
        { name: "Decor & Curtains", slug: "decor-curtains" },
      ],
      marginRule: { minMarginPercent: 15, defaultMarginPercent: 22, otherCostPercent: 3 },
    },
  ];

  const catMap = {};
  const subcatMap = {};

  for (const c of categoriesData) {
    const cat = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        displayOrder: c.displayOrder,
        marginRule: {
          create: c.marginRule,
        },
      },
    });
    catMap[c.slug] = cat.id;

    for (const sc of c.subcategories) {
      const subcat = await prisma.subcategory.create({
        data: {
          categoryId: cat.id,
          name: sc.name,
          slug: sc.slug,
        },
      });
      subcatMap[sc.slug] = subcat.id;
    }
  }

  // 6. Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Kailash Electronics Distributors",
      companyName: "Kailash Distro Pvt Ltd",
      phone: "+919839011223",
      whatsapp: "+919839011223",
      email: "orders@kailashdist.com",
      gstin: "09AABCK1234F1Z8",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221002",
      deliveryArea: "Eastern UP & Bihar",
      paymentTerms: "15 Days Credit",
      rating: 4.8,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Apex Home Comforts",
      companyName: "Apex Comforts India",
      phone: "+919811223344",
      whatsapp: "+919811223344",
      email: "wholesale@apexhome.in",
      gstin: "07AAACF5678M1Z2",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110020",
      deliveryArea: "Pan-India",
      paymentTerms: "Immediate NEFT",
      rating: 4.7,
    },
  });

  // 7. Products
  const products = [
    {
      name: "Samsung 55-inch Crystal 4K Vivid Pro Ultra HD Smart TV",
      slug: "samsung-55-inch-crystal-4k-smart-tv",
      modelNumber: "UA55VUE80AKXXL",
      sku: "SAM-TV-55-4K-01",
      catSlug: "electronics",
      subcatSlug: "led-smart-tvs",
      brandSlug: "samsung",
      shortDescription: "55-inch 4K Ultra HD Display with PurColor, Crystal Processor 4K, and Q-Symphony Audio.",
      fullDescription: "Upgrade your entertainment with the Samsung 55-inch Crystal 4K Smart TV. Features include HDR 10+, Auto Game Mode, Motion Xcelerator, and seamless OTT streaming across Netflix, Prime Video, Disney+ Hotstar, and YouTube.",
      mrp: 64900,
      purchasePrice: 37500,
      sellingPrice: 42990,
      discountPercent: 34,
      gstPercent: 18,
      stock: 24,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      warrantyMonths: 24,
      warrantyDetails: "1 Year Comprehensive + 1 Year Additional on Panel",
      installationType: "FREE",
      installationCost: 0,
      images: [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Screen Size", attributeValue: "55 inch" },
        { attributeName: "Resolution", attributeValue: "4K Ultra HD (3840 x 2160)" },
        { attributeName: "Panel Type", attributeValue: "Crystal UHD" },
        { attributeName: "Refresh Rate", attributeValue: "60 Hz" },
        { attributeName: "Smart TV OS", attributeValue: "Tizen" },
        { attributeName: "Sound Output", attributeValue: "20 W Dolby Digital Plus" },
      ],
    },
    {
      name: "LG 1.5 Ton 5 Star AI Dual Inverter Split AC",
      slug: "lg-1-5-ton-5-star-ai-dual-inverter-split-ac",
      modelNumber: "TS-Q19YNZE",
      sku: "LG-AC-15T-5S-01",
      catSlug: "ac-cooling",
      subcatSlug: "split-inverter-acs",
      brandSlug: "lg",
      shortDescription: "AI Convertible 6-in-1 Cooling, 100% Copper Condenser with Ocean Black Protection, and HD Filter.",
      fullDescription: "Experience revolutionary cooling efficiency with LG AI Dual Inverter technology. Predicts cooling capacity requirements, operates with ultra-low vibration, and saves up to 60% electricity even at ambient temperatures up to 52°C.",
      mrp: 75990,
      purchasePrice: 38200,
      sellingPrice: 44490,
      discountPercent: 41,
      gstPercent: 28,
      stock: 18,
      isFeatured: true,
      isTrending: true,
      warrantyMonths: 120,
      warrantyDetails: "1 Year Comprehensive, 5 Years on PCB, 10 Years on Compressor",
      installationType: "PAID",
      installationCost: 1199,
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Capacity", attributeValue: "1.5 Ton" },
        { attributeName: "Energy Rating", attributeValue: "5 Star" },
        { attributeName: "Inverter Type", attributeValue: "AI Dual Inverter" },
        { attributeName: "Condenser Coil", attributeValue: "100% Copper" },
        { attributeName: "Refrigerant Gas", attributeValue: "R32 Eco-Friendly" },
      ],
    },
    {
      name: "Whirlpool 265L 3 Star IntelliFresh Inverter Frost Free Double Door Refrigerator",
      slug: "whirlpool-265l-double-door-refrigerator",
      modelNumber: "IF-INV-CNV-278",
      sku: "WHP-REF-265-01",
      catSlug: "refrigeration",
      subcatSlug: "double-door-refrigerators",
      brandSlug: "whirlpool",
      shortDescription: "IntelliFresh Inverter Technology, Convertible 5-in-1 Modes, and Freshflow Air Tower.",
      fullDescription: "Keep your fresh greens and perishables crisp for up to 15 days with Whirlpool IntelliFresh Technology. Adapts cooling based on load and external climate conditions.",
      mrp: 38450,
      purchasePrice: 23200,
      sellingPrice: 27990,
      discountPercent: 27,
      gstPercent: 18,
      stock: 15,
      isBestSeller: true,
      warrantyMonths: 120,
      warrantyDetails: "1 Year on Product, 10 Years on Compressor",
      installationType: "FREE",
      installationCost: 0,
      images: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Capacity", attributeValue: "265 Litres" },
        { attributeName: "Door Type", attributeValue: "Double Door" },
        { attributeName: "Energy Rating", attributeValue: "3 Star" },
        { attributeName: "Defrosting Type", attributeValue: "Frost Free" },
      ],
    },
    {
      name: "Bosch 8 kg 5 Star 1400 RPM Inverter Touch Control Front Load Washing Machine",
      slug: "bosch-8kg-front-load-washing-machine",
      modelNumber: "WAJ2846SIN",
      sku: "BOS-WM-8KG-FL-01",
      catSlug: "washing-cleaning",
      subcatSlug: "front-load-washing-machines",
      brandSlug: "bosch",
      shortDescription: "EcoSilence Drive, Anti-Vibration Design, Hygiene Care 60°C, and SpeedPerfect Wash.",
      fullDescription: "Engineered in Germany, the Bosch 8 kg front loader features frictionless motor performance, silent nighttime washing, and anti-bacterial hygiene cycles delivering 99.9% allergy reduction.",
      mrp: 54990,
      purchasePrice: 32800,
      sellingPrice: 37990,
      discountPercent: 31,
      gstPercent: 18,
      stock: 12,
      isFeatured: true,
      warrantyMonths: 36,
      warrantyDetails: "3 Years Comprehensive, 12 Years Motor Warranty",
      installationType: "FREE",
      installationCost: 0,
      images: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Capacity", attributeValue: "8 kg" },
        { attributeName: "Load Type", attributeValue: "Front Load" },
        { attributeName: "Maximum Spin Speed", attributeValue: "1400 RPM" },
        { attributeName: "Energy Rating", attributeValue: "5 Star" },
      ],
    },
    {
      name: "Philips 750W 4 Jar Heavy Duty Mixer Grinder with ProBlend Technology",
      slug: "philips-750w-4-jar-mixer-grinder",
      modelNumber: "HL7707/00",
      sku: "PHI-MG-750W-01",
      catSlug: "kitchen-appliances",
      subcatSlug: "mixer-grinders-juicers",
      brandSlug: "philips",
      shortDescription: "750W Power Chop Motor with ChefPro Food Processing Bowl, Juice Extractor, and Stainless Steel Jars.",
      fullDescription: "Versatile all-in-one kitchen powerhouse that kneads atta, chops vegetables, blends smoothies, and pulverizes tough spices in under 2 minutes.",
      mrp: 11495,
      purchasePrice: 6200,
      sellingPrice: 7999,
      discountPercent: 30,
      gstPercent: 18,
      stock: 35,
      isBestSeller: true,
      warrantyMonths: 24,
      warrantyDetails: "2 Years Comprehensive on Product, 5 Years on Motor",
      installationType: "NOT_REQUIRED",
      installationCost: 0,
      images: [
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Power", attributeValue: "750 Watt" },
        { attributeName: "Number of Jars", attributeValue: "4 Jars" },
        { attributeName: "Blade Material", attributeValue: "Rust-Resistant Stainless Steel" },
      ],
    },
    {
      name: "AUREVO Royal Teakwood King Size Hydraulic Storage Bed",
      slug: "aurevo-royal-teakwood-king-hydraulic-bed",
      modelNumber: "AUR-BED-KG-HYD",
      sku: "AUR-FUR-BED-01",
      catSlug: "furniture",
      subcatSlug: "beds",
      brandSlug: "aurevo-living",
      shortDescription: "Premium Sheesham Wood with High-Pressure Pneumatic Hydraulic Storage Lift and Cushioned Headboard.",
      fullDescription: "Crafted for lavish master bedrooms. Boasts solid hardwood construction, termite-resistant coating, whisper-quiet hydraulic pistons, and premium linen upholstery on the headboard.",
      mrp: 68000,
      purchasePrice: 28000,
      sellingPrice: 39999,
      discountPercent: 41,
      gstPercent: 18,
      stock: 10,
      isFeatured: true,
      isTrending: true,
      warrantyMonths: 60,
      warrantyDetails: "5 Years Termite and Structural Warranty",
      installationType: "FREE",
      installationCost: 0,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80",
      ],
      attributes: [
        { attributeName: "Size", attributeValue: "King Size (78 x 72 inches)" },
        { attributeName: "Material", attributeValue: "Solid Teak & Engineered Wood" },
        { attributeName: "Storage Type", attributeValue: "Hydraulic Box Storage" },
        { attributeName: "Finish", attributeValue: "Honey Teak Gloss" },
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        modelNumber: p.modelNumber,
        sku: p.sku,
        categoryId: catMap[p.catSlug],
        subcategoryId: subcatMap[p.subcatSlug],
        brandId: brandMap[p.brandSlug],
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        mrp: p.mrp,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        discountPercent: p.discountPercent,
        gstPercent: p.gstPercent,
        stock: p.stock,
        isFeatured: p.isFeatured || false,
        isTrending: p.isTrending || false,
        isBestSeller: p.isBestSeller || false,
        status: "PUBLISHED",
        warrantyMonths: p.warrantyMonths,
        warrantyDetails: p.warrantyDetails,
        installationType: p.installationType,
        installationCost: p.installationCost,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            displayOrder: idx,
          })),
        },
        attributes: {
          create: p.attributes,
        },
      },
    });

    // Assign to supplier
    await prisma.supplierProduct.create({
      data: {
        supplierId: supplier1.id,
        productId: product.id,
        supplierSku: `SUP-${p.sku}`,
        purchasePrice: p.purchasePrice,
        stock: p.stock,
        leadTimeDays: 2,
        isPrimarySupplier: true,
      },
    });
  }

  // 8. Wedding Packages
  const weddingPackages = [
    {
      title: "Silver Start Package (₹1 Lakh Budget)",
      slug: "silver-start-wedding-package-1-lakh",
      budgetTier: "1_LAKH",
      headline: "Essential New Home Electronics & Appliances",
      basePrice: 125000,
      packagePrice: 99999,
      discountAmount: 25001,
      description: "Includes 43-inch Smart TV, 190L Single Door Refrigerator, 7kg Semi-Automatic Washing Machine, and 500W Mixer Grinder.",
      bannerImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      itemsJson: JSON.stringify([
        { category: "LED TV", model: "43 inch Full HD Smart LED TV", value: 24999 },
        { category: "Refrigerator", model: "190L Single Door 3-Star Refrigerator", value: 16999 },
        { category: "Washing Machine", model: "7kg Semi-Automatic Top Load", value: 11499 },
        { category: "Mixer Grinder", model: "500W 3-Jar Mixer Grinder", value: 2999 },
        { category: "Gas Stove", model: "3-Burner Toughened Glass Cooktop", value: 4499 },
        { category: "Bed", model: "Queen Size Engineered Wood Bed", value: 18999 },
      ]),
    },
    {
      title: "Gold Complete Package (₹2 Lakh Budget)",
      slug: "gold-complete-wedding-package-2-lakh",
      budgetTier: "2_LAKH",
      headline: "Complete Home Electronics + Living Comforts",
      basePrice: 245000,
      packagePrice: 194999,
      discountAmount: 50001,
      description: "Includes 50-inch 4K Smart TV, 260L Double Door Refrigerator, 7kg Fully Automatic Top Load, Microwave Oven, Mixer Grinder, and King Bed with Mattress.",
      bannerImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
      itemsJson: JSON.stringify([
        { category: "Smart TV", model: "50-inch 4K Ultra HD Smart TV", value: 36999 },
        { category: "Refrigerator", model: "260L Frost-Free Double Door Refrigerator", value: 27999 },
        { category: "Washing Machine", model: "7kg Fully Automatic Top Load", value: 18999 },
        { category: "Microwave", model: "23L Convection Microwave Oven", value: 12499 },
        { category: "Mixer Grinder", model: "750W 4-Jar Heavy Duty", value: 6999 },
        { category: "King Bed", model: "Solid Wood King Bed with Storage", value: 34999 },
        { category: "Sofa Set", model: "3+1+1 Fabric Sofa Set", value: 28999 },
      ]),
    },
    {
      title: "Platinum Luxury Suite Package (₹3 Lakh Budget)",
      slug: "platinum-luxury-wedding-package-3-lakh",
      budgetTier: "3_LAKH",
      headline: "The Royal Bridal Makeover: All Tier-1 Appliances & Furniture",
      basePrice: 365000,
      packagePrice: 289999,
      discountAmount: 75001,
      description: "55-inch Crystal 4K TV, 1.5 Ton 5-Star Split AC, Double Door Refrigerator, Front Load Washer, Chimney + Cooktop, Hydraulic King Bed, 6-Seater Dining, and Luxury Recliner.",
      bannerImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
      itemsJson: JSON.stringify([
        { category: "Smart TV", model: "55-inch Crystal 4K HDR TV", value: 44999 },
        { category: "Air Conditioner", model: "1.5 Ton 5-Star AI Inverter Split AC", value: 44490 },
        { category: "Refrigerator", model: "340L Double Door Convertible", value: 38999 },
        { category: "Washing Machine", model: "8kg Front Load Inverter Washer", value: 37990 },
        { category: "Kitchen Chimney & Hob", model: "Filterless Auto-Clean Chimney + 3 Burner Hob", value: 21999 },
        { category: "Hydraulic Bed", model: "Teakwood King Bed with Hydraulic Storage", value: 39999 },
        { category: "Dining Table", model: "6-Seater Solid Wood Dining Set", value: 32999 },
      ]),
    },
  ];

  for (const wp of weddingPackages) {
    await prisma.weddingPackage.create({ data: wp });
  }

  // 9. Pincodes
  const pincodes = [
    { pincode: "221001", city: "Varanasi", state: "Uttar Pradesh", deliveryCharge: 0, estimatedDays: 1 },
    { pincode: "221002", city: "Varanasi", state: "Uttar Pradesh", deliveryCharge: 0, estimatedDays: 1 },
    { pincode: "221010", city: "Varanasi", state: "Uttar Pradesh", deliveryCharge: 0, estimatedDays: 1 },
    { pincode: "226001", city: "Lucknow", state: "Uttar Pradesh", deliveryCharge: 199, estimatedDays: 2 },
    { pincode: "110001", city: "New Delhi", state: "Delhi", deliveryCharge: 299, estimatedDays: 3 },
    { pincode: "400001", city: "Mumbai", state: "Maharashtra", deliveryCharge: 399, estimatedDays: 4 },
  ];

  for (const pin of pincodes) {
    await prisma.pincodeService.create({ data: pin });
  }

  // 10. Coupons
  await prisma.coupon.create({
    data: {
      code: "AUREVO10",
      description: "10% Instant Discount on orders above ₹10,000",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 10000,
      maxDiscountAmount: 3000,
      usageLimit: 500,
      endDate: new Date("2026-12-31"),
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FESTIVE2500",
      description: "Flat ₹2,500 off on Premium Home Appliances",
      discountType: "FIXED",
      discountValue: 2500,
      minOrderAmount: 35000,
      usageLimit: 200,
      endDate: new Date("2026-12-31"),
    },
  });

  // 11. Campaigns
  await prisma.campaign.create({
    data: {
      title: "Diwali Mahotsav Mega Sale",
      slug: "diwali-mega-sale",
      tagline: "Up to 55% Off on 4K TVs, ACs, Refrigerators & Furniture",
      discountText: "UP TO 55% OFF",
      ctaText: "SHOP DEALS NOW",
      ctaLink: "/deals",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-11-15"),
      isActive: true,
    },
  });

  // 12. CRM Leads & Quotations
  const sampleLead = await prisma.lead.create({
    data: {
      name: "Vikas Singhania",
      phone: "9822114455",
      email: "vikas.singhania@gmail.com",
      city: "Varanasi",
      leadSource: "WEDDING_PACKAGE",
      productName: "Gold Complete Package (₹2 Lakh Budget)",
      quantity: 1,
      budgetRange: "₹2,00,000",
      requirement: "Looking for complete wedding bundle for daughter's marriage next month. Needs delivery to Sigra.",
      status: "QUOTATION",
      assignedToId: salesManager.id,
    },
  });

  await prisma.quotation.create({
    data: {
      quoteNumber: "QT-2026-001",
      leadId: sampleLead.id,
      customerName: "Vikas Singhania",
      customerPhone: "9822114455",
      customerEmail: "vikas.singhania@gmail.com",
      subtotal: 194999,
      discount: 5000,
      gstAmount: 34199,
      deliveryCharge: 0,
      installationCharge: 0,
      totalAmount: 189999,
      status: "SENT",
      validityDate: new Date("2026-10-31"),
      terms: "100% genuine brand warranty. Free home delivery and installation within 48 hours of order confirmation.",
      createdById: salesManager.id,
      items: {
        create: [
          {
            productName: "Gold Complete Wedding Package (TV, Refrigerator, Washer, Microwave, King Bed)",
            quantity: 1,
            unitPrice: 194999,
            discount: 5000,
            total: 189999,
          },
        ],
      },
    },
  });

  // 13. Sample Order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "AUR-ORD-2026-1001",
      customerId: customer1.id,
      customerName: "Rahul Sharma",
      customerPhone: "9876543210",
      customerEmail: "rahul.sharma@example.com",
      shippingAddressText: "Flat 402, Ganga Heights, Sigra, Near IP Mall, Varanasi, UP - 221010",
      pincode: "221010",
      totalMrp: 64900,
      subtotal: 42990,
      totalDiscount: 21910,
      couponCode: "AUREVO10",
      couponDiscount: 3000,
      deliveryCharge: 0,
      installationCharge: 0,
      gstAmount: 6099,
      grandTotal: 39990,
      paymentStatus: "PAID",
      paymentMethod: "UPI",
      orderStatus: "OUT_FOR_DELIVERY",
      fulfilmentModel: "LOCAL_SUPPLIER_LOCAL_DELIVERY",
      supplierId: supplier1.id,
      invoiceNumber: "INV-2026-0001",
      shipments: {
        create: [
          {
            courierName: "AUREVO Express Local Fleet",
            trackingNumber: "AUR-EXP-88902",
            status: "OUT_FOR_DELIVERY",
            shippedAt: new Date(),
            notes: "Driver Contact: +91 94150 12345 (Vehicle: UP-65-AX-9910)",
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
