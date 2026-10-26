import './Menu.css';
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
}

function Menu(){
  const [products, setProducts] = useState<Product[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const handleAddToCart = (product: Product) => {
    console.log("Added to cart:", product);
  };

  return (
    <>
      <nav className="navbar">
        <h1>🛍️ My Store</h1>
        
        <input className="navbar-input"
            type="text"
            placeholder="Search for a product..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
        />

        <button className='navbar-button'>Sair</button>

        
      </nav>

      <div className="menu">
        {Object.entries(productsByCategory).map(([category, items]) => (
          <section key={category} className="categoria-section">
            <h2 className="categoria-titulo">{category}</h2>
            <div className="itens-grid">
              {items.map((product) => (
                <div className="item-card" key={product.id}>
                  <div className="item-info">
                    <h3>{product.name}</h3>
                    <p className="item-desc">{product.description}</p>
                    <span className="item-estoque">
                      {product.quantity > 0
                        ? `${product.quantity} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                  <div className="item-footer">
                    <span className="item-preco">
                      $ {product.price.toFixed(2)}
                    </span>
                    <button
                      className="btn-add"
                      disabled={product.quantity === 0}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add
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