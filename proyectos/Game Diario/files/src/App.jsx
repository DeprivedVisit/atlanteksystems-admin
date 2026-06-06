export default function App() {
  const esIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div
      style={{
        background: "#030712",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "10px",
        }}
      >
        GAME DIARIO
      </h1>

      <p
        style={{
          opacity: 0.8,
          marginBottom: "30px",
          maxWidth: "400px",
        }}
      >
        Tu app gaming PWA ya funciona 🔥
      </p>

      {esIphone ? (
        <div>
          <p>
            Para instalar en iPhone:
          </p>

          <p style={{ opacity: 0.7 }}>
            Safari → Compartir → Agregar a pantalla de inicio
          </p>
        </div>
      ) : (
        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "15px 30px",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Instalar App
        </button>
      )}
    </div>
  );
}