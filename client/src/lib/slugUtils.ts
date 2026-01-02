/**
 * Utilitários para geração e normalização de slugs
 * Centralizado para evitar duplicação de código
 */

/**
 * Gera um slug a partir de um texto
 * Remove acentos, caracteres especiais e espaços
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-")      // Substitui não-alfanuméricos por hífen
    .replace(/^-|-$/g, "");             // Remove hífens no início/fim
}

/**
 * Valida se um slug é válido
 * Deve conter apenas letras minúsculas, números e hífens
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Remove acentos e normaliza o texto
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default {
  generateSlug,
  isValidSlug,
  normalizeText,
};
