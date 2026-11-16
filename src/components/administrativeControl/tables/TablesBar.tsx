import { useEffect, useState } from "react";
import "./TablesBar.css";
import { Product } from "../products/RegisterProducts";


interface Payload{
  idTable: number;
  order: order;
  state: state;
}

interface state{
  state: state;
}

const STATE: Record<string, string> = {
  LIVRE: "LIVRE",
  OCUPADO: "OCUPADO",
};

interface order{
  idOrder: string;
  products: Product;
}
/* ========================================================================== */
/*  COMPONENTE                                                                */
/* ========================================================================== */

function TablesBar() {
  const [showMenu, setShowMenu] = useState(false);
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayload() {
      try {
        setPayloads(await fetchPayload());
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as mesas.");
      } finally {
        setLoading(false);
      }
    }

    loadPayload();
  }, []);

  const API_URL = "http://localhost:8083";
/* ========================================================================== */
/*  CHAMADA À API                                                             */
/* ========================================================================== */

async function fetchPayload(): Promise<Payload[]> {
  const response = await fetch(`${API_URL}/tables/list`);
  if (!response.ok) throw new Error(`Erro ${response.status} ao buscar produtos`);

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function groupByIdTable(payloads: Payload[]): [number, Payload[]][] {
  const groups: Record<number, Payload[]> = {};

  payloads.forEach((payload) => {
    (groups[payload.idTable] ??= []).push(payload);
  });

  return Object.keys(groups)
  .map(Number)
  .sort((a, b) => a - b )
  .map((id) : [number, Payload[]] => [id, groups[id]]);
}

const groups = groupByIdTable(payloads);


  return (

      <main className="menu-container">
        {loading && <p className="menu-message">Carregando...</p>}
        {error && <p className="menu-message menu-error">{error}</p>}
        {!loading && !error && payloads.length === 0 && (
          <p className="menu-message">Não há produtos disponíveis.</p>
        )}

        {groups.map(([category, items]) => (
          <section key={category} className="menu-section">

            <div className="menu-grid">
              {items.map((payload) => {
                const soldOut = payload.idTable <= 0;

                return (
                  <article
                    key={payload.idTable}
                    className={`menu-card ${soldOut ? "menu-card-soldout" : ""}`}>
                
                    <div className="menu-card-body">
                      <h3 className="menu-name">{payload.idTable}</h3>

                      <div className="menu-card-footer">

                        {soldOut && <span className="menu-badge"></span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
  )}
    

export default TablesBar;
