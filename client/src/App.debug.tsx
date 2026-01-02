import { useEffect, useState } from "react";

export default function App() {
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      console.log("App iniciando...");
      setLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      setError(String(err));
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", fontFamily: "monospace" }}>
        <h1>❌ Erro ao Carregar</h1>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>✅ App Carregado com Sucesso</h1>
      <p>Página funcionando corretamente!</p>
      <p>Pressione F12 para ver o console</p>
    </div>
  );
}
