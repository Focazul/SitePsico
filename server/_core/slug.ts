/**
 * Gera um slug automaticamente a partir de um título
 * Converte para lowercase, substitui espaços e caracteres especiais por hífens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens múltiplos
    .replace(/^-+|-+$/g, ""); // Remove hífens das extremidades
}

/**
 * Gera um slug único baseado em um slug base
 * Se o slug já existe, adiciona um número ao final
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  if (!(await checkExists(baseSlug))) {
    return baseSlug;
  }

  let counter = 1;
  let slug = baseSlug;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 1000) throw new Error("Não foi possível gerar um slug único");
  }

  return slug;
}
