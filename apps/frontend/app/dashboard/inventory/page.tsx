"use client";
import { useState, useEffect } from "react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", price: 0, initialStock: 0, category: ""
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/inventory/products");
      setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async () => {
    await fetch("${process.env.NEXT_PUBLIC_API_URL}/inventory/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    setShowForm(false);
    setNewProduct({ name: "", sku: "", price: 0, initialStock: 0, category: "" });
    fetchProducts();
  };

  const handleStockUpdate = async (productId: string, type: "IN" | "OUT", qty: number) => {
    await fetch("${process.env.NEXT_PUBLIC_API_URL}/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, type, quantity: qty }),
    });
    fetchProducts();
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("fa-IR").format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blueframe">مدیریت انبار</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">مدیریت موجودی و ردیابی حرکات</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blueframe text-white rounded-lg shadow-soft hover:bg-blueframe-dark text-sm md:text-base"
        >
          + افزودن محصول
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-soft border space-y-4">
          <h3 className="text-lg font-bold">محصول جدید</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="نام محصول" value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blueframe" />
            <input placeholder="کد SKU" value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blueframe" />
            <input type="number" placeholder="قیمت" value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              className="p-3 border rounded-lg outline-none" />
            <input type="number" placeholder="موجودی اولیه" value={newProduct.initialStock}
              onChange={(e) => setNewProduct({ ...newProduct, initialStock: Number(e.target.value) })}
              className="p-3 border rounded-lg outline-none" />
          </div>
          <button onClick={handleAddProduct} className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg">ذخیره</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-soft border p-12 text-center text-gray-500">
          در حال بارگذاری...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft border p-12 text-center text-gray-500">
          محصولی ثبت نشده است
        </div>
      ) : (
        <>
          {/* نمای دسکتاپ: جدول */}
          <div className="hidden md:block bg-white rounded-xl shadow-soft border overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">محصول</th>
                  <th className="px-4 py-3 text-sm font-semibold">SKU</th>
                  <th className="px-4 py-3 text-sm font-semibold">قیمت</th>
                  <th className="px-4 py-3 text-sm font-semibold">موجودی</th>
                  <th className="px-4 py-3 text-sm font-semibold">وضعیت</th>
                  <th className="px-4 py-3 text-sm font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-sm" dir="ltr">{p.sku}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)} ﷼</td>
                    <td className="px-4 py-3 font-bold">{formatPrice(p.stock)}</td>
                    <td className="px-4 py-3">
                      {p.stock <= p.minStock ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">کمبود</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">موجود</span>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2 space-x-reverse">
                      <button onClick={() => handleStockUpdate(p.id, "IN", 10)} className="px-3 py-1 bg-green-600 text-white text-xs rounded">+۱۰</button>
                      <button onClick={() => handleStockUpdate(p.id, "OUT", 5)} className="px-3 py-1 bg-orange-600 text-white text-xs rounded">-۵</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نمای موبایل: کارت‌ها */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-soft border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base">{p.name}</h3>
                    <p className="text-xs text-gray-500 font-mono" dir="ltr">{p.sku}</p>
                  </div>
                  {p.stock <= p.minStock ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs whitespace-nowrap">کمبود</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap">موجود</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">قیمت</p>
                    <p className="font-semibold">{formatPrice(p.price)} ﷼</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">موجودی</p>
                    <p className="font-bold text-lg">{formatPrice(p.stock)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button onClick={() => handleStockUpdate(p.id, "IN", 10)} 
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                    +۱۰ ورود
                  </button>
                  <button onClick={() => handleStockUpdate(p.id, "OUT", 5)} 
                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">
                    -۵ خروج
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
