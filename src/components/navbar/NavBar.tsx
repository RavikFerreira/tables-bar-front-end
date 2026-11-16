import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./NavBar.css";

function NavBar(){
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const [showTables, setShowTables] = useState(false);

    function closeModal(go: string){
        setShowMenu(false);
        navigate(go);
    }

    return(
        <>
        <div className="page-navbar">
            <header className="navbar">
                <button className="icon-btn" onClick={() => setShowMenu(true)}>
                    ☰
                </button>
                <h1>⚙️ Painel Administrativo</h1>
                <button className="btn btn-ghost" onClick={() => navigate("/")}>
                    Sair
                </button>
            </header>

            {showMenu && (
                <div className="drawer-backdrop" onClick={() => setShowMenu(false)}>
                    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-title">
                            <span>Menu</span>
                            <button className="icon-btn" onClick={() => setShowMenu(false)}>
                                ✕
                            </button>
                        </div>

                        <button className="drawer-item" onClick={() => closeModal("/cadastrar")}>
                            ➕ Cadastrar produto
                        </button>
                        <button className="drawer-tables" onClick={() => closeModal("/mesas")}>
                            📋 Listar mesas
                        </button>
                    </aside>
                </div>
            )}
        </div>
        <Outlet/>
        </>
    )}
    

export default NavBar;