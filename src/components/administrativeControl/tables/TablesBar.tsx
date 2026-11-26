import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "./TablesBar.css";
import { Product } from "../products/RegisterProducts";
import { STATE } from "../../constants/state";

interface Order {
  idOrder: string;
  account?: number | string;
  // o back pode devolver um produto só ou uma lista deles
  products: Product | Product[];
}

export interface Payload {
  id?: string;
  state?: string;
  idTable: number;
  order: Order | null;
  account?: number | string;
}

interface PayloadForm {
  idTable: string;
  account: string;
}

type StatusFilter = "todas" | "livres" | "ocupadas";

const EMPTY_FORM: PayloadForm = {
  idTable: "",
  account: "",
};

const API_URL = "http://localhost:8083";

async function fetchPayload(): Promise<Payload[]> {
  const response = await fetch(`${API_URL}/tables/list`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar mesas`);
  }

  const data = await response.json();
  console.log("Resposta de /tables/list:", data); // temporário: pode apagar depois
  return Array.isArray(data) ? data : [];
}

async function saveTables(form: PayloadForm) {
  const response = await fetch(`${API_URL}/tables/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idTable: Number(form.idTable),
      // a conta começa em 0 quando o campo não existe no formulário
      account: form.account ? parseFloat(form.account) : 0,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao salvar a mesa");
  }
}

async function deleteTable(idTable: number) {
  const response = await fetch(`${API_URL}/tables/delete/${idTable}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao excluir a mesa");
}

// Usa o "state" que o back-end envia ("OCUPADO"); se não vier, olha o pedido
function isOccupied(payload: Payload): boolean {
  if (payload.state) return payload.state.toUpperCase() === "OCUPADO";
  return payload.order != null;
}

// Lista de produtos do pedido da mesa (sempre um array)
function getProducts(payload: Payload): Product[] {
  const products = payload.order?.products;
  if (!products) return [];
  return Array.isArray(products) ? products : [products];
}

// Ajuste aqui os nomes dos campos conforme a interface Product
function describeProduct(product: Product) {
  const p = product as unknown as Record<string, unknown>;
  const name = String(p.name ?? p.nome ?? p.description ?? "Produto");
  const price = Number(p.price ?? p.preco ?? p.value ?? 0);
  const quantity = Number(p.quantity ?? p.quantidade ?? 1);
  return { name, price, quantity };
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Mostra o "account" exatamente como o back-end enviou (sem nenhum cálculo).
// Procura na mesa e, se não houver, dentro do pedido.
function showAccount(payload: Payload): string {
  const raw = payload.account ?? payload.order?.account;
  if (raw === undefined || raw === null || raw === "") return "—";
  if (typeof raw === "number") return formatBRL(raw);
  const asNumber = Number(raw);
  return Number.isNaN(asNumber) ? String(raw) : formatBRL(asNumber);
}

function TablesBar() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [error, setError] = useState<string | null>(null);
  const [savingTables, setSavingTables] = useState(false);
  const [formTables, setFormTables] = useState<PayloadForm>(EMPTY_FORM);
  const [selectedTable, setSelectedTable] = useState<Payload | null>(null);

  // Mantém o modal atualizado quando a lista de mesas é recarregada
  useEffect(() => {
    setSelectedTable((prev) =>
      prev
        ? payloads.find((p) =>
            prev.id ? p.id === prev.id : p.idTable === prev.idTable
          ) ?? null
        : null
    );
  }, [payloads]);

  // Fecha o modal com a tecla Esc
  useEffect(() => {
    if (!selectedTable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTable(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTable]);

  async function loadPayload() {
    setLoading(true);
    setError(null);
    try {
      setPayloads(await fetchPayload());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao buscar mesas");
    } finally {
      setLoading(false);
    }
  }

  // Roda uma vez, quando a tela abre
  useEffect(() => {
    loadPayload();
  }, []);

  const filteredPayload = payloads
    .filter((p) => {
      if (statusFilter === "livres") return !isOccupied(p);
      if (statusFilter === "ocupadas") return isOccupied(p);
      return true;
    })
    .sort((a, b) => a.idTable - b.idTable);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSavingTables(true);

    try {
      await saveTables(formTables);
      setFormTables(EMPTY_FORM);
      await loadPayload();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erro ao salvar mesa");
    } finally {
      setSavingTables(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormTables({ ...formTables, [e.target.name]: e.target.value });
  }

  async function handleDelete(payload: Payload) {
    if (!window.confirm(`Deseja excluir a mesa ${payload.idTable}?`)) return;

    try {
      await deleteTable(payload.idTable);
      setPayloads((prev) => prev.filter((p) => p.idTable !== payload.idTable));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erro ao excluir mesa");
    }
  }

  return (
    <main className="tables-container">
      <div className="tables">
        <form onSubmit={handleSave}>
          <div className="tables-id-body">
            <label htmlFor="idTable">ID</label>
            <input
              id="idTable"
              className="input"
              type="number"
              name="idTable"
              min="0"
              value={formTables.idTable}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingTables}
            >
              {savingTables ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      <header className="tables-header">
        <h1>🍴 Mesas do Restaurante</h1>

        <div className="tables-filter">
          {(["todas", "livres", "ocupadas"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`tables-filter-btn ${
                statusFilter === f ? "tables-filter-active" : ""
              }`}
              onClick={() => setStatusFilter(f)}
            >
              {f === "todas" ? "Todas" : f === "livres" ? "Livres" : "Ocupadas"}
            </button>
          ))}
        </div>

        <div className="tables-legend">
          <span>
            <i className="legend-dot livre-dot"></i>
            Livre
          </span>

          <span>
            <i className="legend-dot occupied-dot"></i>
            Ocupado
          </span>
        </div>
      </header>

      {loading && <p className="tables-message">Carregando mesas...</p>}

      {error && <p className="tables-message tables-error">{error}</p>}

      {!loading && !error && filteredPayload.length === 0 && (
        <p className="tables-message">Não há mesas disponíveis.</p>
      )}

      {!loading && !error && (
        <div className="tables-grid">
          {filteredPayload.map((payload) => {
            const occupied = isOccupied(payload);

            return (
              <article
                key={payload.id ?? payload.idTable}
                className={`tables-card ${
                  occupied ? "tables-card-occupied" : "tables-card-free"
                }`}
                onClick={() => setSelectedTable(payload)}
              >
                <h2 className="tables-id">
                  Mesa {String(payload.idTable).padStart(2, "0")}
                  {!occupied && (
                    <button
                      className="btn-excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(payload);
                      }}
                      aria-label={`Excluir mesa ${payload.idTable}`}
                    >
                      🗑️
                    </button>
                  )}
                </h2>

                {occupied && (
                  <div className="tables-account">
                    <span>Valor da conta:</span>

                    <strong>{showAccount(payload)}</strong>
                  </div>
                )}

                <div
                  className={`tables-status ${
                    occupied ? "status-occupied" : "status-free"
                  }`}
                >
                  <span className="status-icon">{occupied ? "✕" : "✓"}</span>

                  <span>{occupied ? STATE.OCUPADO : STATE.LIVRE}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <h2>Mesa {String(selectedTable.idTable).padStart(2, "0")}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedTable(null)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </header>

            {getProducts(selectedTable).length === 0 ? (
              <p className="modal-empty">Nenhum produto nesta mesa.</p>
            ) : (
              <ul className="modal-list">
                {getProducts(selectedTable).map((product, index) => {
                  const { name, price, quantity } = describeProduct(product);
                  return (
                    <li key={index} className="modal-item">
                      <span className="modal-item-name">{name}</span>

                      <span className="modal-item-quantity">
                        Qtd: {quantity}
                      </span>

                      <span className="modal-item-price">
                        Preço: {formatBRL(price)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {isOccupied(selectedTable) && (
              <footer className="modal-footer">
                <span>Total da conta:</span>
                <strong>{showAccount(selectedTable)}</strong>
              </footer>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default TablesBar;