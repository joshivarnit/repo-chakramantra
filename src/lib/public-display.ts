export const PUBLICATION_NAME = "Chakramantra Editorial";

/** Author shown on the public site — always our publication voice. */
export function publicAuthor(_author?: string): string {
  return PUBLICATION_NAME;
}
