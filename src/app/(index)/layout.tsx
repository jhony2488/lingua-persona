import type { ReactNode } from "react";
import "../globals.css";

// Root layout mínimo para a rota "/" fora de [lang]. No standalone o proxy
// redireciona antes desta página renderizar; no static export (mobile),
// ela é o index.html que redireciona no cliente.
export default function IndexLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
