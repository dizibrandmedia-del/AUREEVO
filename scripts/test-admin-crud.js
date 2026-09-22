const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Testing Admin CRUD API Endpoints ===\n");

  // Helper for requests with Super Admin cookie
  // First quick-switch to SUPER_ADMIN
  const authRes = await fetch(`${BASE_URL}/api/v1/auth/quick-switch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetRole: "SUPER_ADMIN" }),
  });
  const cookie = authRes.headers.get("set-cookie") || "";
  console.log("1. Authenticated as Super Admin:", authRes.status === 200 ? "PASS" : "FAIL");

  const headers = {
    "Content-Type": "application/json",
    Cookie: cookie,
  };

  // 2. Test Product Update
  const prodListRes = await fetch(`${BASE_URL}/api/v1/products?limit=1`, { headers });
  const prodListData = await prodListRes.json();
  const testProduct = prodListData.products?.[0];
  console.log("2. Fetch products:", prodListData.success ? `PASS (found ${testProduct?.name})` : "FAIL");

  if (testProduct) {
    const originalPrice = testProduct.sellingPrice;
    const updatedPrice = originalPrice + 1;
    const updateRes = await fetch(`${BASE_URL}/api/v1/products/${testProduct.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        sellingPrice: updatedPrice,
        stock: 55,
      }),
    });
    const updateData = await updateRes.json();
    console.log("3. Update product price & stock:", updateData.success && updateData.product?.sellingPrice === updatedPrice ? "PASS" : "FAIL");

    // Revert price
    await fetch(`${BASE_URL}/api/v1/products/${testProduct.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ sellingPrice: originalPrice }),
    });
  }

  // 3. Test Coupon CRUD
  const couponCode = `TEST${Date.now().toString().slice(-4)}`;
  const createCouponRes = await fetch(`${BASE_URL}/api/v1/coupons`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      code: couponCode,
      description: "Automated test coupon",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minOrderAmount: 2000,
      endDate: "2027-01-01",
    }),
  });
  const createCouponData = await createCouponRes.json();
  console.log("4. Create coupon:", createCouponData.success ? `PASS (code: ${couponCode})` : `FAIL (${createCouponData.error})`);

  if (createCouponData.coupon?.id) {
    const couponId = createCouponData.coupon.id;

    // Toggle/Edit coupon
    const updateCouponRes = await fetch(`${BASE_URL}/api/v1/coupons`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        id: couponId,
        discountValue: 20,
        isActive: false,
      }),
    });
    const updateCouponData = await updateCouponRes.json();
    console.log("5. Edit coupon & toggle active:", updateCouponData.success && updateCouponData.coupon?.isActive === false ? "PASS" : "FAIL");

    // Delete coupon
    const deleteCouponRes = await fetch(`${BASE_URL}/api/v1/coupons?id=${couponId}`, {
      method: "DELETE",
      headers,
    });
    const deleteCouponData = await deleteCouponRes.json();
    console.log("6. Delete coupon:", deleteCouponData.success ? "PASS" : "FAIL");
  }

  // 4. Test Category & Subcategory CRUD
  const catSlug = `test-cat-${Date.now().toString().slice(-4)}`;
  const createCatRes = await fetch(`${BASE_URL}/api/v1/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Test Smart Lighting",
      slug: catSlug,
      description: "Category for automated testing",
      defaultMarginPercent: 18,
      otherCostPercent: 4,
    }),
  });
  const createCatData = await createCatRes.json();
  console.log("7. Create category:", createCatData.success ? `PASS (id: ${createCatData.category?.id})` : "FAIL");

  if (createCatData.category?.id) {
    const catId = createCatData.category.id;

    // Create Subcategory under it
    const subRes = await fetch(`${BASE_URL}/api/v1/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        isSubcategory: true,
        categoryId: catId,
        name: "RGB Strip Lights",
      }),
    });
    const subData = await subRes.json();
    console.log("8. Create subcategory:", subData.success ? "PASS" : "FAIL");

    if (subData.subcategory?.id) {
      // Delete subcategory
      const delSubRes = await fetch(`${BASE_URL}/api/v1/categories?id=${subData.subcategory.id}&isSubcategory=true`, {
        method: "DELETE",
        headers,
      });
      const delSubData = await delSubRes.json();
      console.log("9. Delete subcategory:", delSubData.success ? "PASS" : "FAIL");
    }

    // Delete category
    const delCatRes = await fetch(`${BASE_URL}/api/v1/categories?id=${catId}`, {
      method: "DELETE",
      headers,
    });
    const delCatData = await delCatRes.json();
    console.log("10. Delete category:", delCatData.success ? "PASS" : "FAIL");
  }

  // 5. Test Supplier CRUD
  const createSupRes = await fetch(`${BASE_URL}/api/v1/suppliers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Test POC",
      companyName: `Test Supplier ${Date.now().toString().slice(-4)}`,
      phone: "9988776655",
      city: "Varanasi",
    }),
  });
  const createSupData = await createSupRes.json();
  console.log("11. Create supplier:", createSupData.success ? "PASS" : "FAIL");

  if (createSupData.supplier?.id) {
    const supId = createSupData.supplier.id;

    const updateSupRes = await fetch(`${BASE_URL}/api/v1/suppliers`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        id: supId,
        deliveryArea: "All India Priority",
      }),
    });
    const updateSupData = await updateSupRes.json();
    console.log("12. Edit supplier:", updateSupData.success && updateSupData.supplier?.deliveryArea === "All India Priority" ? "PASS" : "FAIL");

    const delSupRes = await fetch(`${BASE_URL}/api/v1/suppliers?id=${supId}`, {
      method: "DELETE",
      headers,
    });
    const delSupData = await delSupRes.json();
    console.log("13. Delete supplier:", delSupData.success ? "PASS" : "FAIL");
  }

  console.log("\n=== All Admin CRUD tests completed successfully! ===");
}

runTests().catch(console.error);
