import { isNewShell } from "@/layouts/TopShell/useNewShell";
import LegacyClientDetail from "./Legacy";
import ClientProfile from "./Profile";

/**
 * La ficha de la clienta. Con el marco nuevo es «Profile» (todo su estado arriba, su unidad y sus
 * ajustes abajo); con el de siempre (`?nuevo=0`) sigue la ficha de antes, sin tocar.
 */
const ClientDetailPage = () => isNewShell() ? <ClientProfile /> : <LegacyClientDetail />

export default ClientDetailPage;
