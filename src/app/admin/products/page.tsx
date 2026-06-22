import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { createProduct, toggleProductActive } from "@/lib/actions/admin/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Products</h1>

      <form action={createProduct} encType="multipart/form-data" className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input className="input" name="name" placeholder="Name" required />
        <input className="input" name="slug" placeholder="slug-like-this" required />
        <input className="input" name="unit" placeholder="Unit (e.g. 5 Gallon Bottle)" required />
        <input className="input" name="price" type="number" step="0.01" placeholder="Price (AED)" required />
        <input className="input" name="stock" type="number" placeholder="Stock quantity" required />
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="label">Product Image &mdash; upload a file OR paste a URL (upload takes priority)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" name="imageFile" type="file" accept="image/*" />
            <input className="input" name="imageUrl" placeholder="Or paste an image URL" />
          </div>
        </div>
        <textarea className="input sm:col-span-2 lg:col-span-3" name="description" placeholder="Description" rows={2} />
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-3">Add Product</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-brand-100">
                <td className="p-2"><Image src={p.imageUrl} alt={p.name} width={40} height={40} className="h-10 w-10 object-contain" /></td>
                <td className="p-2 font-medium text-brand-900">{p.name}</td>
                <td className="p-2">AED {p.price.toFixed(2)}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.active ? "Active" : "Hidden"}</td>
                <td className="p-2">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn-secondary px-3 py-1 text-xs">
                      {p.active ? "Hide" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
