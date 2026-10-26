import { useNavigate } from 'react-router-dom';
import './RegisterProducts.css';
import { useEffect, useState } from "react";

interface Product {
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  image: string;
}

interface NewProduct {
  idProduct: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
  category: string;
  image: string;
}

const newProducts: NewProduct = {
  idProduct: "", 
  name: "", 
  price: "", 
  quantity: "", 
  description: "",
  category: "",
  image: ""  
};

type Propagation = "list" | "register";

function RegisterProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [input, setInput] = useState("");
  const [newProduct, setNewProduct] = useState<NewProduct>(newProducts);
  const [archiveImage, setArchiveImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [propagation, setPropagation] = useState<Propagation>("list");
  const [idPut, setIdPut] = useState <number | null>(null); 

  const loadingProduct = () => {
    setLoading(true);
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    loadingProduct();
  }, []);

  const handleLogout = () => {
    navigate("/");
  }

  const handlePut = (product: Product) => {
    setNewProduct({
      idProduct: String(product.idProduct),
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity),
      image: String(product.image || ""),
      description: String(product.description),
      category: String(product.category)
    });
    setArchiveImage(null);
    setOpenRegister(true);
  }

  const handleDelete = async (id: number) => {
    if(!window.confirm("Tem certexa que deseja excluir este produto?")) return;

    try{
      const response = await fetch(`fhttp://localhost:8083/product/delete/${id}`, {
        method: "DELETE",
    });

    if(!response.ok){
      throw new Error("Erro ao excluir produto");

    }

    setProducts((prev) => prev.filter((p) => p.idProduct !== id));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao excluir produto");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({...newProduct, [e.target.name]: e.target.value});
  }

  const handleCancel = () => {
    setOpenRegister(false);
    setNewProduct(newProducts);
    setArchiveImage(null);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let image = newProduct.image;

      if (archiveImage) {
        const formData = new FormData();
        formData.append("file", archiveImage);

        const uploadResponse = await fetch(
          "http://localhost:8083/api/images/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const text = await uploadResponse.text();
          throw new Error(text || "Erro ao enviar imagem");
        }

        const uploadData = await uploadResponse.json();

        image = uploadData.url;
      }

      const payload = {
        idProduct: newProduct.idProduct,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity, 10),
        image: image,
        category: newProduct.category,
        description: newProduct.description,
      };

    const url = idPut ? `http://localhost:8083/api/images/upload  /${idPut}` :
                          "http://localhost:8083/product/addProduct/";
    const method = idPut ? "PATCH" : "POST";
      
      try{
        const response = await fetch(url, {
          method,
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),

        });
        if(!response.ok){
          const text = await response.text();
          throw new Error(text || "Erro ao salvar o produto")
        }
        handleCancel();
        loadingProduct();
      } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "Erro ao salvar produto");
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao enviar imagem");
    }
  };

  const filterProduct = products.filter((p) => p.name.toLowerCase().includes(input.toLowerCase()));

  return (
    <>
      <nav className="navbar">
        <div className='menu'>
          <button className='menu-button' onClick={() => setOpenMenu(!openMenu) }>
          ☰
          </button>
          <h1>⚙️ Painel Administrativo</h1>
          <button className='menu-button-logout' onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>
      
      {openMenu && (
        <div className='menu-overlay' onClick={() => setOpenMenu(false)}>
          <div className='menu-sidebar' onClick={(e) => e.stopPropagation()}>
          <div className='menu-create-product'>
            <button className='button-create-product' onClick={() => {
              setPropagation("list");
              setOpenMenu(false)}}>Listar Produtos</button>
            <button className='button-create-product' onClick={() => {
              setPropagation("register");
              setOpenMenu(false)}}>Cadastrar Produtos</button>
          </div> 
          </div>
        </div>
      )}

      <main className='content'>

        {propagation === "list" && (
          <>
            {loading ? (
              <p className='loading'> Carregando produtos...</p>
            ) : (
              <table className='table'>
                <thead>
                  <tr>
                    <th>Imagem</th>
                    <th>Codigo</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
              <tbody>
                {filterProduct.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='empty'>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  filterProduct.map((product) => (
                    <tr key={product.idProduct}>
                      <td>{product.image}</td>
                      <td>{product.idProduct}</td>
                      <td>{product.name}</td>
                      <td>{product.price.toFixed(2)}</td>
                      <td>{product.quantity}</td>
                      <td>{product.category}</td>
                      <td>{product.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            )}
          </>
        )}

            {propagation === "register" && (
      
              <div className='register-overlay'>
                  <form onSubmit={handleSave}>
                    <label>Imagem</label>
                    <input
                      type='file'
                      name='image'
                      accept='image/png,image/jpeg,image/webp,image/gif'
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setArchiveImage(file);
                      }}
                    />
                  
                    {newProduct.image && (
                      <img  
                      
                        src={`http://localhost:8083/api/images/upload${newProduct.image}`}
                        alt={newProduct.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          marginTop: "10px",
                        }}
                      />
                    )}
                
                    <label>ID</label>
                      <input
                        type="number"
                        name="idProduct"
                        min="0"
                        value={newProduct.idProduct}
                        onChange={handleFormChange}
                        required
                      />
                      <label>Nome</label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleFormChange}
                        required
                      />

                      <label>Preço</label>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        min="0"
                        value={newProduct.price}
                        onChange={handleFormChange}
                        required
                      />

                      <label>Estoque</label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        value={newProduct.quantity}
                        onChange={handleFormChange}
                        required
                      />

                      <label>Categoria</label>
                      <input
                        type="text"
                        name="category"
                        value={newProduct.category}
                        onChange={handleFormChange}
                        required
                      />

                       <label>Descrição</label>
                      <input
                        type="text"
                        name="description"
                        value={newProduct.description}
                        onChange={handleFormChange}
                        required
                      />
                      <div className='footer'>
                        <button type='button' className='cancel' onClick={() => {setNewProduct(newProducts); setArchiveImage(null);}}>
                          Limpar
                        </button>
                        <button type='submit' className='save'>
                          Cadastrar
                        </button>
                      </div>     
                  </form>
                  <div className='list-overlay'>
                    <table className='list-table'>
                <thead>
                  <tr>
                    <th>Imagem</th>
                    <th>Codigo</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
              <tbody>
                {filterProduct.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='list-empty'>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  filterProduct.map((product) => (
                    <tr key={product.idProduct}>
                      <td>{product.image}</td>
                      <td>{product.idProduct}</td>
                      <td>{product.name}</td>
                      <td>{product.price.toFixed(2)}</td>
                      <td>{product.quantity}</td>
                      <td>{product.category}</td>
                      <td>{product.description}</td>
                      <td className='list-acoes'>
                        <button className='button-put' onClick={() => handlePut}> Editar </button>
                        <button className='button-delete' onClick={() => handleDelete}>Excluir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
              </div>
            </div>
              
            )}
    </main>

       
      

     
     
    </>
  );
}

export default RegisterProducts;