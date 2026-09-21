/** «de», «del», «la»… van en minúscula y no cuentan para las iniciales */
const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

/** El padrón trae los nombres en mayúsculas: así se leen en la lista, en el diálogo y en los avisos */
export const titleCase = (name: string) => name.toLocaleLowerCase('es-MX').split(/\s+/).filter(Boolean)
    .map((word, index) => index > 0 && PARTICLES.has(word) ? word : word.charAt(0).toLocaleUpperCase('es-MX') + word.slice(1)).join(' ')

export const initials = (name: string) => name.toLocaleLowerCase('es-MX').split(/\s+/).filter(word => word && !PARTICLES.has(word)).slice(0, 2).map(word => word.charAt(0).toLocaleUpperCase('es-MX')).join('')
