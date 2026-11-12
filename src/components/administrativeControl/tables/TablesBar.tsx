import { useEffect, useState } from "react";
import "./TablesBar.css";
import {Product} from "../products/RegisterProduct"
import { Navigate, useNavigate } from "react-router-dom";

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

/* ========================================================================== */
/*  COMPONENTE                                                                */
/* ========================================================================== */

function TablesBar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [tablesBar, setTablesBar] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayload() {
      try {
        setTablesBar(await fetchPayload());
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as mesas.");
      } finally {
        setLoading(false);
      }
    }

    loadPayload();
  }, []);

  function openCreateModal() {
    setShowModal(true);
  }

  return (
    <div className="page">
      {/* Barra superior */}
      <header className="navbar">
        <button className="icon-btn" onClick={() => setShowMenu(true)}>
          ☰
        </button>
        <h1>⚙️ Painel Administrativo</h1>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          Sair
        </button>
      </header>

      {/* Menu lateral */}
      {showMenu && (
        <div className="drawer-backdrop" onClick={() => setShowMenu(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-title">
              <span>Menu</span>
              <button className="icon-btn" onClick={() => setShowMenu(false)}>
                ✕
              </button>
            </div>

            <button
              className="drawer-item"
              onClick={() => {
                setShowMenu(false);
                openCreateModal();
              }}
            >
              ➕ Cadastrar produto
            </button>
            <button className="drawer-tables" onClick={() => navigate("/mesas")}>
              📋 Listar mesas
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default TablesBar;

function setShowModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}
