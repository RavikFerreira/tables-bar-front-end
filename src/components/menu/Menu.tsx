import './Menu.css';
import { useEffect, useState } from "react";

interface Produto {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
}

const CATEGORIAS: Record<string, string> = {
  ESPETINHOS: "ESPETINHOS",
  BEBIDA: "BEBIDAS",
  PORCOES: "PORÇÕES",
  BEBIDAS_ALCOOLICAS: "BEBIDAS ALCOÓLICAS",
};

const formatarCategoria = (cat: string) => CATEGORIAS[cat] ?? cat;

const formatarPreco = (valor: number | string) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Menu() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status} ao buscar produtos`);
        return res.json();
      })
      .then((data) => setProdutos(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setErro("Não foi possível carregar o cardápio.");
      })
      .finally(() => setCarregando(false));
  }, []);

  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    (acc[produto.category] ??= []).push(produto);
    return acc;
  }, {} as Record<string, Produto[]>);

  const handleAddToCart = (produto: Produto) => {
    console.log("Adicionado ao carrinho:", produto);
  };

  return (
    <>
      <nav className="navbar">
        <h1>🛍️ Minha Loja</h1>
      </nav>

      <div className="menu">
        {carregando && <p className="mensagem">Carregando...</p>}
        {erro && <p className="mensagem erro">{erro}</p>}
        {!carregando && !erro && produtos.length === 0 && (
          <p className="mensagem">Nenhum produto disponível.</p>
        )}

        {Object.entries(produtosPorCategoria).map(([categoria, itens]) => (
          <section key={categoria} className="categoria-section">
            <h2 className="categoria-titulo">{formatarCategoria(categoria)}</h2>

            <div className="itens-grid">
              {itens.map((produto) => (
                <div className="item-card" key={produto.id}>
                  <div className="item-info">
                    <h3>{produto.name}</h3>
                    <p className="item-desc">{produto.description}</p>
                    <span className="item-estoque">
                      {produto.quantity > 0
                        ? `${produto.quantity} em estoque`
                        : "Fora de estoque"}
                    </span>
                  </div>

                  <div className="item-footer">
                    <span className="item-preco">{formatarPreco(produto.price)}</span>
                    <button
                      className="btn-add"
                      disabled={produto.quantity === 0}
                      onClick={() => handleAddToCart(produto)}
                    >
                      Adicionar
                    </button>
                  </div>
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
