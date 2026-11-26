import './Login.css';
import { useState } from "react";
import { Link , useNavigate} from "react-router-dom";

interface LoginData {
  email: string;
  password: string;
}

function Login() {
  const [login, setLogin] = useState<LoginData>({

    email: "",
    password: "",

  });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };
  const navigate = useNavigate();

  function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("PAYLOAD COMPLETO DO TOKEN:", payload); 
    return payload.roles?.[0] ?? null;
  } catch {
    return null;
  }
}
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  function getPayloadFromToken(token: string): any {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

    try{
        const response = await fetch("http://localhost:8087/api/v1/auth/authenticate", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(login),

    });

  

    if (!response.ok) {
    throw new Error("Email ou senha inválidos");
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);

    const payload = getPayloadFromToken(data.accessToken);
    const idShopping = String(payload?.id ?? "");

    localStorage.setItem("idShopping", idShopping);

    const roleName = getRoleFromToken(data.accessToken);
    localStorage.setItem("role", roleName ?? "");

    alert("Login realizado com sucesso!");
    if (roleName === "ADMIN") {
      navigate("/cadastrar");
    } else {
      navigate("/");
    }
    } catch (error) {
    ;
    alert(console.error(error));
  }
};


  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={login.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={login.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Entrar</button>
        <p className="register-link">
        Não possui uma conta? <Link to="/registrar">Cadastre-se</Link>
        </p>
      </form>

    </div>
  );
}
  
export default Login;