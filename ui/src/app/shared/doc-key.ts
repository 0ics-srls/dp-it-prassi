/**
 * The document Screen route parameter: `doc~<uuid>`. A uuid has nothing to encode, so the Host (which encodes `subPath` once, P78-47) shows an
 * address that opens directly and survives a reload. The key is NEVER pre-encoded here; only '/' needs care because it separates route segments.
 */
const PREFIX = 'doc~';

export function docKey(id: string): string {
  return `${PREFIX}${id.replaceAll('/', '%2F')}`;
}

/** null when the key is empty, has no `doc~` prefix or no id (the Screen then shows a hint and calls no Tool). */
export function parseDocKey(subPath: string): string | null {
  if (!subPath.startsWith(PREFIX)) {
    return null;
  }
  const id = subPath.slice(PREFIX.length).replaceAll('%2F', '/').trim();
  return id === '' ? null : id;
}
