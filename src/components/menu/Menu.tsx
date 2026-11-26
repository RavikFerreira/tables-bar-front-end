import { useEffect, useState } from "react";
import "./Menu.css";
import { API_URL } from "../administrativeControl/tables/TablesBar";

/* ========================================================================== */
/*  TIPOS                                                                     */
/* ========================================================================== */

interface Product {
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image?: string;
}

const CATEGORIES: Record<string, string> = {
  ESPETINHOS: "ESPETINHOS",
  BEBIDAS: "BEBIDAS",
  PORCOES: "PORÇÕES",
  BEBIDAS_ALCOOLICAS: "BEBIDAS ALCOÓLICAS",
};

const formatCategory = (category: string) => CATEGORIES[category] ?? category;

// Formata número como dinheiro: 10 -> "R$ 10,00"
const formatPrice = (value: number | string) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Se a imagem já for um link completo usa ele, senão junta com o endereço da API
const imageUrl = (image: string) =>
  image.startsWith("http") ? image : `${API_URL}${image}`;

// Agrupa os produtos por categoria, na ordem de CATEGORIES.
// Categorias que não estão na lista aparecem no final.
function groupByCategory(products: Product[]): [string, Product[]][] {
  const groups: Record<string, Product[]> = {};

  products.forEach((product) => {
    (groups[product.category] ??= []).push(product);
  });

  const known = Object.keys(CATEGORIES).filter((category) => groups[category]);
  const others = Object.keys(groups).filter((category) => !(category in CATEGORIES));

  return [...known, ...others].map((category) => [category, groups[category]]);
}

/* ========================================================================== */
/*  CHAMADA À API                                                             */
/* ========================================================================== */

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/product/list`);
  if (!response.ok) throw new Error(`Erro ${response.status} ao buscar produtos`);

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/* ========================================================================== */
/*  COMPONENTE                                                                */
/* ========================================================================== */

function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Roda uma vez, quando a tela abre
  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await fetchProducts());
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o cardápio.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const groups = groupByCategory(products);

  return (
    <div className="menu-page">
      <header className="menu-navbar">
        <h1>🛍️ Minha Loja</h1>
      </header>

      <main className="menu-container">
        {loading && <p className="menu-message">Carregando...</p>}
        {error && <p className="menu-message menu-error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="menu-message">Não há produtos disponíveis.</p>
        )}

        {groups.map(([category, items]) => (
          <section key={category} className="menu-section">
            <h2 className="menu-category">{formatCategory(category)}</h2>

            <div className="menu-grid">
              {items.map((product) => {
                const soldOut = product.quantity <= 0;

                return (
                  <article
                    key={product.idProduct}
                    className={`menu-card ${soldOut ? "menu-card-soldout" : ""}`}
                  >
                    {/* Imagem à esquerda (ou um ícone, se o produto não tiver) */}
                    {product.image ? (
                      <img
                        className="menu-image"
                        src={imageUrl(product.image)}
                        alt={product.name}
                      />
                    ) : (
                      <div className="menu-image menu-image-empty">🍽️</div>
                    )}

                    {/* Textos à direita: nome, descrição e, embaixo, preço */}
                    <div className="menu-card-body">
                      <h3 className="menu-name">{product.name}</h3>
                      <p className="menu-description">{product.description}</p>

                      <div className="menu-card-footer">
                        <span className="menu-price">{formatPrice(product.price)}</span>
                        {soldOut && <span className="menu-badge">Esgotado</span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default Menu;