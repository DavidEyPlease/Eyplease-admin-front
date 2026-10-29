/**
 * A dónde puede llevar el botón de un aviso dentro de la app: `app://retos` abre Retos sin pasar por el
 * navegador. Es un ESPEJO de `src/utils/appLinks.ts` de la app (Eyplease-App): si allá se agrega una sección,
 * se agrega aquí con la misma llave. La app lo entiende desde la 2.2.0 (41); en versiones anteriores el botón
 * no abre nada, por eso el aviso lo dice.
 */
export const APP_LINK_SCHEME = "app://";

/** Valor del selector cuando el botón lleva a una página web (la liga se pega en el campo) */
export const WEB_LINK = "web";

export const APP_SECTIONS: Array<{ key: string; label: string }> = [
    { key: "hoy", label: "Hoy" },
    { key: "retos", label: "Retos" },
    { key: "asistente", label: "Asistente" },
    { key: "boletin", label: "Boletín" },
    { key: "boletin-interactivo", label: "Boletín interactivo" },
    { key: "mis-clientas", label: "Mis clientas" },
    { key: "mi-unidad", label: "Mi unidad" },
    { key: "mis-directoras", label: "Mis Directoras" },
    { key: "novedades", label: "Novedades" },
    { key: "biblioteca", label: "Biblioteca" },
    { key: "guardados", label: "Guardados" },
    { key: "herramientas", label: "Herramientas" },
    { key: "entrenamiento", label: "Entrenamiento" },
    { key: "estrategia", label: "Tu estrategia" },
    { key: "inventario", label: "Tu inventario" },
    { key: "planes", label: "Planes" },
    { key: "perfil", label: "Perfil" },
    { key: "notificaciones", label: "Notificaciones" },
    { key: "guia", label: "Guía de la app" },
    { key: "ayuda", label: "Centro de ayuda" },
];

/** `app://seccion` o `app://seccion/<id>` (lo mismo que acepta el API) */
export const APP_LINK_PATTERN = /^app:\/\/[a-z0-9-]+(\/[^\s]*)?$/i;

export const isAppLink = (value: string) => value.trim().toLowerCase().startsWith(APP_LINK_SCHEME);

/** `app://retos` → `retos`; una liga web → null */
export const appLinkKey = (value: string) => isAppLink(value) ? value.trim().slice(APP_LINK_SCHEME.length).split(/[/?#]/)[0].toLowerCase() : null;

export const toAppLink = (key: string) => `${APP_LINK_SCHEME}${key}`;

export const appSectionLabel = (value: string) => APP_SECTIONS.find((section) => section.key === appLinkKey(value))?.label ?? null;
