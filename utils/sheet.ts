/**
 * Drawing-sheet number for a concept's title block, derived from the tail of
 * its uuid. The TAIL, not the head: our seeded ids share a `c0000000…` prefix
 * (and uuidv4s cluster on version/variant nibbles mid-string), so the first
 * characters collide — the last four are the unique end of the random block.
 * Seeds read VV-0001…VV-0005 in filing order, which is exactly the fiction a
 * drawing register wants.
 */
export function sheetNo(id: string): string {
  return `VV-${id.replace(/-/g, "").slice(-4).toUpperCase()}`;
}
