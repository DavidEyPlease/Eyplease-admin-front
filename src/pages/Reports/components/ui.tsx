// Las primitivas de marca viven ahora en components/generics/brand-ui.tsx (tokenizadas).
// Este archivo se mantiene como puente para no tocar los imports existentes de Reports.
export { Panel, KpiTile, HeroTile, PanelHeader, BtnPrimary, BtnGhost, MiniBar } from "@/components/generics/brand-ui"

/** @deprecated usa los tokens de marca (bg-brand-gradient, text-brand-violet…) en vez de hex sueltos. */
export const BRAND = { violet: "#5B47E0", cyan: "#5DD9D2", cyanInk: "#0E9E97" }
