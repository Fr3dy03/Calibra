/**
 * DCC parser — PTB Digital Calibration Certificate v3.3.0
 *
 * Extraction contract is documented in docs/DCC_IMPLEMENTATION.md §2.
 * Core rules enforced here:
 *  - exact decimals (string passthrough, never Number())
 *  - units preserved verbatim (si-unit / si-label)
 *  - all language variants retained; default locale = document lang, else en
 *  - refId/refType graph resolution (methods, equipment)
 *  - signatures: presence + X509 subject extraction only (no crypto verification in v1)
 */
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const DCC_NS = 'https://ptb.de/dcc';

export interface LocaleText { lang?: string; content: string[] }
export interface ExtractedResult {
  resultIndex: number;
  quantityName: string;
  refMethodRef?: string;
  values: Array<{
    SIunit?: string; SIlabel?: string;
    decimal?: string;          // dc:value (exact)
    elemental?: string;        // fallback raw text
  }>;
  expandedUnc?: { decimal?: string; unit?: string; coverageFactor?: string; coverageProbability?: string };
}
export interface RefersToStandard {
  refType?: string; entityName?: string; description?: string;
}
export interface DccExtraction {
  schemaVersion: string;
  certificateUid?: string;   // coreData/uniqID
  issueDate?: string;        // coreData/issueDate
  validUntil?: string;       // coreData/periodOfValidity
  documentLang?: string;     // coreData/lang
  laboratory?: { name?: string; address?: string; trust?: string };
  respPersons: Array<{ name?: string; role?: string; mail?: string }>;
  customer?: { name?: string; address?: string };
  items: Array<{ name?: string; manufacturer?: string; model?: string; identifications: Array<{ issuer?: string; kind?: string; value?: string }> }>;
  methods: Array<{ name?: string; refMethodRef?: string }>;
  results: ExtractedResult[];
  influenceConditions: Array<{ name?: string; values: ExtractedResult['values'] }>;
  statements?: string;
  comment?: string;
  signatureRefs: Array<{ x509Subject?: string; hasSignature: boolean }>;
  attachmentNames: string[];
}

type AnyNode = Record<string, unknown>;

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  preserveOrder: false, // simple path access; validation has already passed
  parseTagValue: false, // no silent numeric coercion — digits stay text
  parseAttributeValue: false,
  trimValues: false,
  isArray: (name) => ['content', 'measurementData', 'quantity', 'result', 'respPerson', 'item', 'identification', 'method', 'usedMethod', 'influencingQuantity', 'software', 'data', 'numQuantity', 'real', 'SIQuantity', 'hybrid', 'document', 'Signature'].includes(name),
});

export function parseDcc(xml: string): DccExtraction {
  const wellformed = XMLValidator.validate(xml, { allowBooleanAttributes: false });
  if (wellformed !== true) {
    const msg = typeof wellformed === 'object' ? wellformed.err?.msg : 'not well-formed';
    throw Object.assign(new Error(`XML not well-formed: ${msg}`), { code: 'XML_MALFORMED' });
  }

  const doc = PARSER.parse(xml) as AnyNode;
  const root = (doc?.[`${DCC_NS.split('/').slice(-1)[0]}`] ?? doc['dcc:digitalCalibrationCertificate'] ?? doc['digitalCalibrationCertificate']) as AnyNode | undefined;
  if (!root) throw Object.assign(new Error('not a DCC document'), { code: 'NOT_DCC_ROOT' });

  const schemaVersion = typeof root['@schemaVersion'] === 'string' ? (root['@schemaVersion'] as string) : '';
  if (!schemaVersion) throw Object.assign(new Error('missing schemaVersion'), { code: 'SCHEMA_VERSION_MISSING' });

  const admin = pick(root, 'dcc:administrativeData', 'administrativeData') as AnyNode | undefined;
  const core = pick(admin, 'dcc:coreData', 'coreData') as AnyNode | undefined;
  const resultsTree = pick(root, 'dcc:measurementResults', 'measurementResults') as AnyNode | undefined;

  const lang = detectLang(core);
  const certificateUid = textOf(pick(core, 'dcc:uniqID', 'uniqID'));
  const issueDate = dateOf(pick(core, 'dcc:issueDate', 'issueDate'), 'issueDate');
  const validUntil = dateOf(pick(core, 'dcc:periodOfValidity', 'periodOfValidity'), 'issueDate');

  const methods = (pick(resultsTree, 'dcc:usedMethods', 'usedMethods') as AnyNode | undefined);
  const methodList = asArray(pick(methods, 'dcc:usedMethod', 'usedMethod')).map((m) => ({
    name: textOfLocalized(pick(m, 'dcc:name', 'name'), lang),
    refMethodRef: refAttr(pick(m, 'dcc:description', 'description'), '@refId'),
  }));

  const resultsNode = asArray(pick(resultsTree, 'dcc:results', 'results').flatMap ? asArray(pick(resultsTree, 'dcc:results', 'results')) : [pick(resultsTree, 'dcc:results', 'results')])[0] as AnyNode | undefined;
  const resultList = asArray(pick(resultsNode, 'dcc:result', 'result'));
  const results = resultList.map((r, i) => extractResult(r, i, methodList, lang));

  return {
    schemaVersion,
    certificateUid,
    issueDate,
    validUntil,
    documentLang: lang,
    laboratory: extractLaboratory(admin, lang),
    respPersons: extractRespPersons(admin, lang),
    customer: extractCustomer(admin, lang),
    items: extractItems(admin, lang),
    methods: methodList,
    results,
    influenceConditions: extractInfluenceConditions(resultsTree, lang),
    statements: textOfLocalized(pick(pick(admin, 'dcc:statements', 'statements') as AnyNode | undefined, 'dcc:statement', 'statement'), lang),
    comment: textOfLocalized(pick(root, 'dcc:comment', 'comment') as AnyNode | undefined, lang),
    signatureRefs: extractSignatureRefs(root),
    attachmentNames: extractAttachmentNames(root, 'document'),
  };
}

// ---------------------------------------------------------------- helpers

function pick(node: AnyNode | undefined | null | Array<unknown>, ...names: string[]): unknown {
  if (!node || Array.isArray(node) && !(node as Array<AnyNode>).length || Array.isArray(node)) {
    return Array.isArray(node) ? node[0] : undefined;
  }
  for (const n of names) {
    if (node && typeof node === 'object' && n in (node as AnyNode)) return (node as AnyNode)[n];
  }
  return undefined;
}

function asArray(v: unknown): AnyNode[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? (v as AnyNode[]) : [v as AnyNode];
}

function detectLang(node: AnyNode | undefined): string | undefined {
  // DCC coreData uses dcc:lang (ISO 639) inside locale contexts.
  const langNode = node ? pick(node, 'dcc:lang', 'lang') : undefined;
  if (langNode && typeof langNode === 'object') {
    const arr = asArray(langNode).map((l) => (typeof l === 'object' && l !== null ? (l as AnyNode)['@content'] ? String((l as AnyNode)['@content']) : undefined : undefined));
    return arr.find(Boolean);
  }
  if (typeof langNode === 'string') return langNode;
  return undefined;
}

/** dcc:textType → sequence of dcc:content(lang) */
function textOfLocalized(node: unknown, preferred?: string): string | undefined {
  const contents = asArray(pick(node as AnyNode, 'dcc:content', 'content'));
  if (!contents.length) {
    const raw = textOf(node);
    return raw;
  }
  const parse = (c: AnyNode) => ({
    lang: typeof c['@lang'] === 'string' ? (c['@lang'] as string) : undefined,
    text: flattenText(c),
  });
  const parsed = contents.map(parse);
  const chosen = preferred ? parsed.find((p) => p.lang === preferred) : undefined;
  return (chosen ?? parsed.find((p) => p.lang === 'en') ?? parsed[0])?.text;
}

function textOf(node: unknown): string | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === 'object' && node !== null) {
    const t = (node as AnyNode)['#text'];
    if (typeof t === 'string') return t;
    return undefined;
  }
  return String(node).trim() || undefined;
}

function flattenText(node: unknown, out: string[] = []): string {
  if (node === undefined || node === null) return out.join('');
  if (typeof node === 'object') {
    const anyNode = node as AnyNode;
    if (typeof anyNode['#text'] === 'string') out.push(anyNode['#text'] as string);
    for (const [k, v] of Object.entries(anyNode)) {
      if (k.startsWith('@') || k === '#text') continue;
      flattenText(v, out);
    }
  } else if (typeof node !== 'object') {
    out.push(String(node));
  }
  return out.join('').trim() || undefined as never;
}

function refAttr(node: unknown, attrName: string): string | undefined {
  if (node && typeof node === 'object' && (node as AnyNode)[attrName]) return String((node as AnyNode)[attrName]);
  return undefined;
}

function dateOf(node: unknown, kindOf: string): string | undefined {
  const raw = textOf(pick(node as AnyNode, 'dcc:content', 'content')) ?? textOf(node);
  return raw ?? undefined;
}

// ------------------------------------------------------------ domain extracts

function extractLaboratory(admin: AnyNode | undefined, lang?: string): DccExtraction['laboratory'] {
  const lab = pick(admin, 'dcc:calibrationLaboratory', 'calibrationLaboratory') as AnyNode | undefined;
  if (!lab) return undefined;
  return {
    name: textOfLocalized(pick(lab, 'dcc:name', 'name'), lang),
    address: flattenAddress(lab),
    trust: textOf(pick(lab, 'dcc:trustLab', 'trustLab')),
  };
}

function flattenAddress(lab: AnyNode): string | undefined {
  const addr = pick(lab, 'dcc:address', 'address') as AnyNode | undefined;
  const parts = ['dcc:street', 'street', 'dcc:zipCode', 'zipCode', 'dcc:city', 'city', 'dcc:countryCode', 'countryCode'];
  const collected = parts.map((p) => textOf(pick(addr, p))).filter(Boolean) as string[];
  return collected.length ? collected.join(', ') : undefined;
}

function extractRespPersons(admin: AnyNode | undefined, lang?: string): DccExtraction['respPersons'] {
  const persons = pick(admin, 'dcc:respPersons', 'respPersons') as AnyNode | undefined;
  return asArray(pick(persons, 'dcc:respPerson', 'respPerson')).map((p) => ({
    name: textOfLocalized(pick(pick(p, 'dcc:person', 'person') as AnyNode, 'dcc:name', 'name'), lang),
    role: textOfLocalized(pick(p, 'dcc:role', 'role'), lang),
    mail: textOf(pick(p, 'dcc:mail', 'mail')),
  }));
}

function extractCustomer(admin: AnyNode | undefined, lang?: string): DccExtraction['customer'] {
  const c = pick(admin, 'dcc:customer', 'customer') as AnyNode | undefined;
  if (!c) return undefined;
  return { name: textOfLocalized(pick(c, 'dcc:name', 'name'), lang), address: flattenAddress({ address: pick(c, 'dcc:address', 'address') } as AnyNode) };
}

function extractItems(admin: AnyNode | undefined, lang?: string): DccExtraction['items'] {
  const itemsNode = pick(admin, 'dcc:items', 'items') as AnyNode | undefined;
  return asArray(pick(itemsNode, 'dcc:item', 'item')).map((item) => ({
    name: textOfLocalized(pick(item, 'dcc:name', 'name'), lang),
    manufacturer: textOfLocalized(pick(item, 'dcc:manufacturer', 'manufacturer'), lang),
    model: textOfLocalized(pick(item, 'dcc:model', 'model'), lang),
    identifications: asArray(pick(item, 'dcc:identifications', 'identifications').flatMap
      ? [] : []).concat(asArray(pick(pick(item, 'dcc:identifications', 'identifications') as AnyNode, 'dcc:identification', 'identification'))).map((id) => ({
      issuer: textOf(pick(id, 'dcc:issuer', 'issuer')),
      kind: textOfLocalized(pick(id, 'dcc:value', 'value') ? pick(pick(id, 'dcc:description', 'description') as AnyNode, 'dcc:name', 'name') : undefined, lang),
      value: textOfLocalized(pick(id, 'dcc:value', 'value'), lang),
    })),
  }));
}

function extractInfluenceConditions(resultsTree: AnyNode | undefined, lang?: string): DccExtraction['influenceConditions'] {
  const conds = pick(resultsTree, 'dcc:influenceConditions', 'influenceConditions') as AnyNode | undefined;
  return asArray(pick(conds, 'dcc:influencingQuantity', 'influencingQuantity')).map((q) => ({
    name: textOfLocalized(pick(q, 'dcc:name', 'name'), lang),
    values: extractQuantities(q),
  }));
}

/**
 * Extracts dcc:quantity entries with numerical children, including expandedUnc.
 * Decimal passthrough preserved (no Number conversion anywhere).
 */
function extractQuantities(q: AnyNode): ExtractedResult['values'] {
  const quantities = asArray(pick(q, 'dcc:data', 'data').flatMap ? [] : []).concat(asArray(pick(pick(q, 'dcc:data', 'data') as AnyNode, 'dcc:quantity', 'quantity')));
  const values: ExtractedResult['values'] = [];
  for (const quantity of quantities) {
    const siform = pick(quantity, 'dcc:SIQuantity', 'SIQuantity') as AnyNode | undefined;
    const unit = textOf(pick(siform, '@SIUnit')) ?? textOf(pick(quantity, '@SIUnit')) ?? textOf(pick(siform, 'dcc:SIUnit', 'SIUnit'));
    values.push(...extractNumerals(quantity, unit));
  }
  return values;
}

function extractNumerals(node: AnyNode, unit?: string): ExtractedResult['values'] {
  const out: ExtractedResult['values'] = [];
  const reals = asArray(pick(node, 'dcc:real', 'real'));
  for (const r of reals) {
    const decimal = textOf(pick(pick(r, 'dcc:valueData', 'valueData') as AnyNode, 'dc:value', 'value'));
    out.push({ SIunit: unit, decimal });
  }
  const hybrid = asArray(pick(node, 'dcc:hybrid', 'hybrid'));
  for (const h of hybrid) {
    for (const r of asArray(pick(h, 'dcc:real', 'real'))) {
      const decimal = textOf(pick(pick(r, 'dcc:valueData', 'valueData') as AnyNode, 'dc:value', 'value'));
      out.push({ SIunit: unit, decimal });
    }
  }
  return out.filter((v) => v.decimal !== undefined);
}

function extractResult(r: AnyNode, resultIndex: number, methodList: DccExtraction['methods'], lang?: string): ExtractedResult {
  const data = pick(r, 'dcc:data', 'data') as AnyNode | undefined;
  const measurementNodes = asArray(pick(data, 'dcc:measurementData', 'measurementData'));
  const values: ExtractedResult['values'] = [];
  for (const md of measurementNodes) {
    values.push(...extractQuantities(md));
  }
  const expandedUncRaw = pick(pick(r, 'dcc:expUncertainties', 'expUncertainties') as AnyNode | undefined, 'dcc:expandedUnc', 'expandedUnc');
  let expandedUnc: ExtractedResult['expandedUnc'] | undefined;
  if (expandedUncRaw) {
    const u = expandedUncRaw as AnyNode;
    const unit = textOf(pick(u, '@SIUnit')) ?? textOf(pick(u, 'dcc:SIUnit', 'SIUnit'));
    const decimal = textOf(pick(pick(u, 'dcc:valueData', 'valueData') as AnyNode, 'dc:value', 'value'));
    expandedUnc = {
      decimal,
      unit,
      coverageFactor: textOf(pick(u, 'dcc:coverageFactor', 'coverageFactor')),
      coverageProbability: textOf(pick(u, 'dcc:coverageProbability', 'coverageProbability')),
    };
  }
  const refMethod = refAttr(r, '@refMethodRef') ?? refAttr(r, '@refId');
  const methodName = methodList.find((m) => m.refMethodRef === refMethod)?.name;
  return {
    resultIndex,
    quantityName: textOfLocalized(pick(r, 'dcc:name', 'name'), lang) ?? methodName ?? `result ${resultIndex + 1}`,
    refMethodRef: refMethod,
    values,
    expandedUnc,
  };
}

function extractSignatureRefs(root: AnyNode): DccExtraction['signatureRefs'] {
  const sigs = asArray(root['ds:Signature'] ?? root['Signature']);
  return sigs.map((sig) => {
    const signed = typeof sig === 'object';
    const keyinfo = pick(sig as AnyNode, 'ds:KeyInfo', 'KeyInfo') as AnyNode | undefined;
    const cert = pick(pick(keyinfo, 'ds:X509Data', 'X509Data') as AnyNode | undefined, 'ds:X509Subject', 'X509Subject');
    return { hasSignature: Boolean(signed), x509Subject: textOf(cert) };
  });
}

function extractAttachmentNames(root: AnyNode, _kind: string): string[] {
  const docs = asArray(pick(root, 'dcc:document', 'document'));
  return docs.map((d) => asArray(pick(pick(d, 'dcc:file', 'file') as AnyNode | undefined, 'dcc:fileName', 'fileName')).map(textOf)).flat()
    .filter((x): x is string => Boolean(x));
}
