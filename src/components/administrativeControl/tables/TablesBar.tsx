
import { useEffect, useState } from "react";
import "./TablesBar.css";
import { Product } from "../products/RegisterProducts";

interface Order {
  idOrder: string;
  products: Product;
}

interface Payload {
  idTable: number;
  order: Order | null;
  account: number;
}

function TablesBar() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:8083";

  useEffect(() => {
    async function loadPayload() {
      try {
        const data = await fetchPayload();
        setPayloads(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as mesas.");
      } finally {
        setLoading(false);
      }
    }

    loadPayload();
  }, []);

  async function fetchPayload(): Promise<Payload[]> {
    const response = await fetch(`${API_URL}/tables/list`);

    if (!response.ok) {
      throw new Error(`Erro ${response.status} ao buscar mesas`);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  }

  // Agrupa os registros pelo ID da mesa
  function groupByIdTable(payloads: Payload[]) {
    const groups: Record<number, Payload[]> = {};

    payloads.forEach((payload) => {
      (groups[payload.idTable] ??= []).push(payload);
    });

    return Object.entries(groups)
      .map(([id, items]) => ({
        idTable: Number(id),
        items
      }))
      .sort((a, b) => a.idTable - b.idTable);
  }

  const tables = groupByIdTable(payloads);

  // Verifica se existe um pedido associado à mesa
  function isOccupied(items: Payload[]): boolean {
    return items.some((payload) => payload.order != null);
  }

  return (
    <main className="tables-container">

      <header className="tables-header">
        <h1>🍴 Mesas do Restaurante</h1>

        <div className="tables-legend">
          <span>
            <i className="legend-dot livre-dot"></i>
            Livre
          </span>

          <span>
            <i className="legend-dot occupied-dot"></i>
            Ocupada
          </span>
        </div>
      </header>

      {loading && (
        <p className="tables-message">Carregando mesas...</p>
      )}

      {error && (
        <p className="tables-message tables-error">{error}</p>
      )}

      {!loading && !error && tables.length === 0 && (
        <p className="tables-message">
          Não há mesas disponíveis.
        </p>
      )}

      {!loading && !error && (
        <div className="tables-grid">

          {tables.map(({ idTable, items }) => {

            const occupied = isOccupied(items);

            return (
              <article
                key={idTable}
                className={`tables-card ${
                  occupied ? "tables-card-occupied" : "tables-card-free"
                }`}
              >
                <h2 className="tables-id">
                  Mesa {String(idTable).padStart(2, "0")}
                </h2>
                <div className="tables-account">
                  <span>Valor da conta</span>

                  <strong>
                    {items
                      .reduce((total, item) => total + (item.account || 0), 0)
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                  </strong>
                </div>

                <div
                  className={`tables-status ${
                    occupied ? "status-occupied" : "status-free"
                  }`}
                >
                  <span className="status-icon">
                    {occupied ? "✕" : "✓"}
                  </span>

                  <span>
                    {occupied ? "Ocupada" : "Livre"}
                  </span>
                </div>
              </article>
            );
          })}

        </div>
      )}

    </main>
  );
}

export default TablesBar;
