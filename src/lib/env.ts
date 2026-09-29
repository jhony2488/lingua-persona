/**
 * Modo landing institucional ("/" pública, app oculto).
 *
 * Lê as duas formas: `LANDING_PAGE` (server-only) e
 * `NEXT_PUBLIC_LANDING_PAGE` (embutida no bundle client). Server lê qualquer
 * uma; no browser só a NEXT_PUBLIC_ existe — o OR garante aderência nos dois.
 */
export const IS_LANDING =
  process.env.LANDING_PAGE === "1" ||
  process.env.NEXT_PUBLIC_LANDING_PAGE === "1";
