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

function Menu() {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const formatarCategoria = (cat: string) => {
  const mapa: Record<string, string> = {
    ESPETINHOS: "ESPETINHOS",
    BEBIDA: "BEBIDAS",
    PORCOES: "PORÇÕES",
    BEBIDAS_ALCOOLICAS: "BEBIDAS ALCOÓLICAS"
  };

  return mapa[cat] || cat;
};

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error(err));
  }, []);

  const produtosPorCategoria = Array.isArray(produtos) 
  ? produtos.reduce((acc, produto) => {
    const categoria = produto.category;

    if (!acc[categoria]) {
      acc[categoria] = [];
    }

    acc[categoria].push(produto);

    return acc;
  }, {} as Record<string, Produto[]>)
  : {};

  return (
    <>
      <nav className="navbar">
        <h1>🍔 Meu Cardápio</h1>
      </nav>

      <div className="menu">
        <div className="itens">
          {Object.entries(produtosPorCategoria).map(([categoria, itens]) => (
            <div key={categoria}>
              <h2>{formatarCategoria(categoria)}</h2>

              {itens.map((produto) => (
                <div className="item" key={produto.id}>
                  <div className="info">
                    <h3>{produto.name}</h3>
                    <p>{produto.description}</p>
                  </div>
                  <span>R$ {produto.price}</span>
                  
            
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Menu;