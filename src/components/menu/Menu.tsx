import './Menu.css';
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
}

const CATEGORIES: Record<string, string> = {
  ESPETINHOS: "ESPETINHOS",
  BEBIDAS: "BEBIDAS",
  PORCOES: "PORÇÕES",
  BEBIDAS_ALCOOLICAS: "BEBIDAS ALCOÓLICAS",
};

const formatCategory = (category: string) => CATEGORIES[category] ?? category;

const formatPrice = (value: number | string) =>
  Number(value).toLocaleString("en-US", { style: "currency", currency: "BRL" });

function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status} while fetching products`);
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("Could not load the menu.");
      })
      .finally(() => setLoading(false));
  }, []);

  const productsByCategory = products.reduce((acc, product) => {
    (acc[product.category] ??= []).push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const handleAddToCart = (product: Product) => {
    console.log("Added to cart:", product);
  };

  return (
    <>
      <nav className="navbar">
        <h1>🛍️ My Store</h1>
      </nav>

      <div className="menu">
        {loading && <p className="message">Carregando...</p>}
        {error && <p className="message error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="message">Não há produtos disponíveis.</p>
        )}

        {Object.entries(productsByCategory).map(([category, items]) => (
          <section key={category} className="category-section">
            <h2 className="category-title">{formatCategory(category)}</h2>

            <div className="items-grid">
              {items.map((product) => (
                <div className="item-card" key={product.id}>
                  <div className="item-info">
                    <h3>{product.name}</h3>
                    <span className="item-price">{formatPrice(product.price)}</span>
                  </div>
                  <p className="item-desc">{product.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default Menu;
