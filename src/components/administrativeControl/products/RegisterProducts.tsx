

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./RegisterProducts.css";
import { CATEGORIES } from "../../constants/categories";
import { API_URL } from "../tables/TablesBar";

/* ========================================================================== */
/*  TIPOS                                                                     */
/* ========================================================================== */

// Produto como vem do backend
export interface Product {
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  image: string;
}

// Formulário: os inputs trabalham sempre com texto (string)
interface ProductForm {
  idProduct: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
  category: string;
  image: string;
}

const EMPTY_FORM: ProductForm = {
  idProduct: "",
  name: "",
  price: "",
  quantity: "",
  description: "",
  category: "",
  image: "",
};



// Formata número como dinheiro: 10 -> "R$ 10,00"
const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Se a imagem já for um link completo usa ele, senão junta com o endereço da API
const imageUrl = (image: string) =>
  image.startsWith("http") ? image : `${API_URL}${image}`;

// Define o texto e a cor (classe do CSS) do selo de estoque
function getStockBadge(quantity: number) {
  if (quantity <= 0) return { text: "Sem estoque", color: "badge-red" };
  if (quantity <= 5) return { text: "Estoque baixo", color: "badge-yellow" };
  return { text: "Em estoque", color: "badge-green" };
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/product/list`);
  if (!response.ok) throw new Error("Erro ao carregar produtos");
  return response.json();
}

async function deleteProduct(id: number) {
  const response = await fetch(`${API_URL}/product/delete/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao excluir produto");
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/images/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Erro ao enviar imagem");

  const data = await response.json();
  return data.url;
}

async function saveProduct(form: ProductForm, image: string, editingId: number | null) {
  const url = editingId
    ? `${API_URL}/product/updateProduct/${editingId}`
    : `${API_URL}/product/addProduct/`;

  const response = await fetch(url, {
    method: editingId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idProduct: form.idProduct,
      name: form.name,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      image,
      category: form.category,
      description: form.description,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao salvar o produto");
  }
}

function RegisterProducts() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null); // imagem escolhida
  const [preview, setPreview] = useState(""); // link para mostrar a imagem escolhida
  const [editingId, setEditingId] = useState<number | null>(null); // null = cadastrando
  const [saving, setSaving] = useState(false);

  /* ------------------------- Carregar a lista ----------------------------- */

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);


  const text = search.toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(text) ||
      p.category.toLowerCase().includes(text) ||
      String(p.idProduct).includes(text)
  );


  function openEditModal(product: Product) {
    setForm({
      idProduct: String(product.idProduct),
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description ?? "",
      category: product.category,
      image: product.image || "",
    });
    setImageFile(null);
    setPreview(product.image ? imageUrl(product.image) : "");
    setEditingId(product.idProduct);
    setShowModal(true);
  }

  function openCreateModal() {
        clearForm();
        setEditingId(null);
        setShowModal(true);
    }
    
    function clearForm() {
        setForm(EMPTY_FORM);
        setImageFile(null);
        setPreview("");
    }
    
    function closeModal() {
    setShowModal(false);
    setEditingId(null);
    clearForm();
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setPreview("");
    setForm({ ...form, image: "" });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Se escolheu uma imagem nova, envia primeiro e usa o link que voltar
      const image = imageFile ? await uploadImage(imageFile) : form.image;

      await saveProduct(form, image, editingId);

      closeModal();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Deseja excluir "${product.name}"?`)) return;

    try {
      await deleteProduct(product.idProduct);
      setProducts(products.filter((p) => p.idProduct !== product.idProduct));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao excluir produto");
    }
  }

  return (
    <>
      {/* Conteúdo */}
      <main className="container">
        <div className="toolbar">
          <div>
            <h2>Produtos</h2>
            <p>{products.length} cadastrado(s)</p>
          </div>

          <div className="toolbar-actions">
            <input
              className="search"
              type="search"
              placeholder="🔍 Buscar por nome, categoria ou código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Novo produto
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <p className="empty">Carregando produtos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="empty">Nenhum produto encontrado.</p>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th className="col-desc">Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = getStockBadge(product.quantity);

                    return (
                      <tr key={product.idProduct}>
                        <td>
                          <div className="product">
                            {product.image && (
                              <img
                                className="thumb"
                                src={imageUrl(product.image)}
                                alt={product.name}
                              />
                            )}
                            {product.name}
                          </div>
                        </td>
                        <td>#{product.idProduct}</td>
                        <td>
                          <span className="tag">
                            {CATEGORIES[product.category] ?? product.category}
                          </span>
                        </td>
                        <td>{formatPrice(product.price)}</td>
                        <td>
                          <span className={`badge ${stock.color}`}>
                            {product.quantity} · {stock.text}
                          </span>
                        </td>
                        <td className="col-desc">{product.description}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn btn-outline btn-small"
                              onClick={() => openEditModal(product)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleDelete(product)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Editar produto" : "Novo produto"}</h3>
              <button className="icon-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                {/* Imagem */}
                <div className="field full">
                  <label>Imagem</label>
                  <div className="upload">
                    <div className="upload-preview">
                      {preview ? <img src={preview} alt="Pré-visualização" /> : "📷"}
                    </div>

                    <div>
                      <label htmlFor="image" className="btn btn-outline btn-small">
                        {preview ? "Trocar imagem" : "Escolher imagem"}
                      </label>
                      <input
                        id="image"
                        className="hidden"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleImageChange}
                      />
                      {preview && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={handleRemoveImage}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campos de texto */}
                <div className="field">
                  <label htmlFor="idProduct">ID</label>
                  <input
                    id="idProduct"
                    className="input"
                    type="number"
                    name="idProduct"
                    min="0"
                    value={form.idProduct}
                    onChange={handleChange}
                    disabled={editingId !== null}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="category">Categoria</label>
                  <select
                    id="category"
                    className="input"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    {Object.entries(CATEGORIES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor="name">Nome</label>
                  <input
                    id="name"
                    className="input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="price">Preço (R$)</label>
                  <input
                    id="price"
                    className="input"
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="quantity">Estoque</label>
                  <input
                    id="quantity"
                    className="input"
                    type="number"
                    name="quantity"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field full">
                  <label htmlFor="description">Descrição</label>
                  <textarea
                    id="description"
                    className="input"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  </>
)}

export default RegisterProducts;