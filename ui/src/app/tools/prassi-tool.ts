/** The Tools the Screens use; every value must exist in `serving/tools/public` (the contract audit proves it). Bare names (the Gateway prefix is not used by the Console). */
export enum PrassiTool {
  Search = 'search',
  Lookup = 'lookup',
  Doc = 'doc',
  SuNorma = 'su_norma',
  Status = 'status',
}

/** Tool -> the (snake case) input keys its facade method may send; mirrors the `parameters` of the Tool JSON. */
export const TOOL_INPUT_KEYS: Readonly<Record<PrassiTool, readonly string[]>> = {
  [PrassiTool.Search]: ['query', 'k', 'mode', 'tipo', 'ente', 'anno_from', 'anno_to'],
  [PrassiTool.Lookup]: ['tipo', 'numero', 'anno', 'data_from', 'data_to', 'ente', 'fonte', 'sort', 'desc', 'limit', 'offset'],
  [PrassiTool.Doc]: ['id', 'tipo', 'numero', 'anno', 'offset', 'length'],
  [PrassiTool.SuNorma]: ['norma_urn', 'limit'],
  [PrassiTool.Status]: [],
};
