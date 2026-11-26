import { useEffect, useState } from "react";
import "./Order.css";
import { API_URL } from "../tables/TablesBar";

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

interface Table {
  id?: string;
  idTable: number | string;
  state?: string;
}

interface Feedback {
  type: "ok" | "error";
  text: string;
}



// Valor usado no filtro para mostrar todas as categorias
const ALL = "TODAS";

// A chave é o valor do enum (vem do backend), o texto é o que aparece na tela.
// A ordem aqui é a ordem em que as categorias aparecem no cardápio.
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

async function fetchTables(): Promise<Table[]> {
  const response = await fetch(`${API_URL}/tables/list`);
  if (!response.ok) throw new Error(`Erro ${response.status} ao buscar mesas`);

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Adiciona o produto no pedido da mesa
async function addProductInOrder(idTable: number | string, idProduct: number) {
  const response = await fetch(
    `${API_URL}/tables/addProductInOrder/${idTable}/${idProduct}`,
    { method: "PATCH",
      headers: { "Content-Type": "application/json" },
     }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao adicionar o produto na mesa");
  }
}

/* ========================================================================== */
/*  COMPONENTE                                                                */
/* ========================================================================== */

function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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

    async function loadTables() {
      try {
        setTables(await fetchTables());
      } catch (err) {
        console.error(err);
      }
    }

    loadProducts();
    loadTables();
  }, []);

  // Mostra uma mensagem rápida na tela e some sozinha
  function showFeedback(type: Feedback["type"], text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleAddToTable(product: Product) {
    if (!selectedTable) {
      showFeedback("error", "Selecione uma mesa primeiro.");
      return;
    }

    setAddingId(product.idProduct);
    try {
      await addProductInOrder(selectedTable, product.idProduct);
      showFeedback(
        "ok",
        `${product.name} adicionado à mesa ${String(selectedTable).padStart(2, "0")}.`
      );
      // recarrega o cardápio e as mesas (o estoque e o estado podem ter mudado)
      setProducts(await fetchProducts());
      setTables(await fetchTables());
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Erro ao adicionar produto"
      );
    } finally {
      setAddingId(null);
    }
  }

  const sortedTables = [...tables].sort(
    (a, b) => Number(a.idTable) - Number(b.idTable)
  );

  const groups = groupByCategory(products);

  // Só as categorias que realmente têm produtos viram botão
  const categoryOptions = groups.map(([category]) => category);

  // Aplica o filtro escolhido (ou mostra tudo)
  const visibleGroups =
    selectedCategory === ALL
      ? groups
      : groups.filter(([category]) => category === selectedCategory);

  return (
    <div className="menu-page">
      <main className="menu-container">
        {loading && <p className="menu-message">Carregando...</p>}
        {error && <p className="menu-message menu-error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="menu-message">Não há produtos disponíveis.</p>
        )}

        {/* Escolha da mesa que vai receber os produtos */}
        {!loading && !error && products.length > 0 && (
          <div className="menu-table-picker">
            <label htmlFor="menu-table">Mesa:</label>
            <select
              id="menu-table"
              className="menu-table-select"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              <option value="">Selecione a mesa</option>
              {sortedTables.map((table) => (
                <option key={table.id ?? table.idTable} value={table.idTable}>
                  Mesa {String(table.idTable).padStart(2, "0")}
                  {table.state ? ` — ${table.state}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {feedback && (
          <p
            className={`menu-feedback ${
              feedback.type === "ok" ? "menu-feedback-ok" : "menu-feedback-error"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {/* Filtros por categoria */}
        {!loading && !error && products.length > 0 && (
          <div className="menu-filters">
            {[ALL, ...categoryOptions].map((category) => (
              <button
                key={category}
                type="button"
                className={`menu-filter-btn ${
                  selectedCategory === category ? "menu-filter-active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === ALL ? "TODAS" : formatCategory(category)}
              </button>
            ))}
          </div>
        )}

        {visibleGroups.map(([category, items]) => (
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

                      <p className="menu-quantity">
                        Quantidade: <strong>{product.quantity}</strong>
                      </p>

                      <button
                        type="button"
                        className="menu-add-btn"
                        onClick={() => handleAddToTable(product)}
                        disabled={soldOut || addingId === product.idProduct}
                      >
                        {addingId === product.idProduct
                          ? "Adicionando..."
                          : "Adicionar à mesa"}
                      </button>
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

export default Order;