/**
 * DCC parser — PTB Digital Calibration Certificate, schema v3.3.0 (pinned copy in
 * schemas/dcc/v3.3.0; structure verified against the official XSD with libxml2).
 *
 * Extraction contract (docs/DCC_IMPLEMENTATION.md). Core rules:
 *  - exact decimals (string passthrough, never Number())
 *  - units preserved verbatim (si:unit, BIPM SI notation like "\volt")
 *  - all language variants retained; default locale = declared usedLangCodeISO639_1, else en
 *  - expandedUnc via si:expandedMU (uExpanded, coverageFactor, coverageProbability)
 *  - ds:Signature* presence detection (X509 subject extraction when present)
 */
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const DCC_NS = 'https://ptb.de/dcc';
export const SI_NS = 'https://ptb.de/si';
export const DS_NS = 'http://www.w3.org/2000/09/xmldsig#';

export interface LocaleText { lang?: string; content: string[] }
export interface ExtractedResult {
  resultName: string;
  measurementResultName?: string;
  label?: string;
  decimal?: string;            // si:value (exact decimal, opaque string)
  unit?: string;               // si:unit (verbatim, e.g. "\volt")
  expandedUnc?: {
    decimal?: string;          // si:valueExpandedMU
    unit?: string;
    coverageFactor?: string;   // si:coverageFactor
    coverageProbability?: string;
    distribution?: string;
  };
}
export interface DccExtraction {
  schemaVersion: string;
  certificateUid?: string;      // coreData/uniqueIdentifier
  issueDate?: string;           // coreData/issueDate (optional in schema)
  validUntil?: string;          // coreData/endPerformanceDate (validity end used as due date)
  beginPerformanceDate?: string;
  performanceLocation?: string; // laboratory | customer | laboratoryBranch
  documentLang?: string;        // coreData/usedLangCodeISO639_1
  laboratory?: { code?: string; name?: string; eMail?: string; address?: string; cryptSignature?: boolean };
  respPersons: Array<{ name?: string; eMail?: string; role?: string; mainSigner?: string }>;
  customer?: { name?: string; address?: string };
  items: Array<{
    name?: string; description?: string; manufacturer?: string; model?: string;
    identifications: Array<{ issuer?: string; value?: string }>;
  }>;
  methods: Array<{ name?: string; description?: string }>;
  results: ExtractedResult[];
  influenceConditions: Array<{ name?: string; decimal?: string; unit?: string }>;
  comment?: string;
  signatureRefs: Array<{ x509Subject?: string; hasSignature: boolean }>;
  attachmentNames: string[];
}

type AnyNode = Record<string, unknown>;

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  preserveOrder: false,
  parseTagValue: false,   // digits remain strings — exact decimal passthrough
  parseAttributeValue: false,
  trimValues: true,
  isArray: (name) => [
    'content', 'measurementResult', 'result', 'respPerson', 'item', 'identification',
    'usedMethod', 'influenceCondition', 'software', 'document', 'Signature', 'SIQuantity',
    'measurementResult',
  ].includes(name),
});

export function parseDcc(xml: string): DccExtraction {
  const wellformed = XMLValidator.validate(xml, { allowBooleanAttributes: false });
  if (wellformed !== true) {
    const msg = typeof wellformed === 'object' ? wellformed.err?.msg : 'not well-formed';
    throw Object.assign(new Error(`XML not well-formed: ${msg}`), { code: 'XML_MALFORMED' });
  }

  const doc = PARSER.parse(xml) as AnyNode;
  const root = (doc['dcc:digitalCalibrationCertificate'] ??
    doc['digitalCalibrationCertificate'] ??
    doc[`${DCC_NS}digitalCalibrationCertificate`]) as AnyNode | undefined;
  if (!root) throw Object.assign(new Error('not a DCC document (root element missing)'), { code: 'NOT_DCC_ROOT' });

  const rawVersion = root['@schemaVersion'];
  const schemaVersion = typeof rawVersion === 'string' ? rawVersion : '';
  if (!schemaVersion) throw Object.assign(new Error('missing root attribute schemaVersion'), { code: 'SCHEMA_VERSION_MISSING' });

  const admin = opt(root, 'dcc:administrativeData', 'administrativeData');
  const core = opt(admin, 'dcc:coreData', 'coreData');
  const lang = firstText(core, 'dcc:usedLangCodeISO639_1', 'usedLangCodeISO639_1');

  const measurementResults = opt(root, 'dcc:measurementResults', 'measurementResults');
  const measurementResultNodes = arr(opt(measurementResults, 'dcc:measurementResult', 'measurementResult'));

  const results: ExtractedResult[] = [];
  for (const mr of measurementResultNodes) {
    const mrName = localizedText(mr, ['dcc:name', 'name'], lang);
    const resultsList = opt(mr, 'dcc:results', 'results');
    for (const r of arr(opt(resultsList, 'dcc:result', 'result'))) {
      results.push(...extractResult(r, mrName, lang));
    }
  }

  return {
    schemaVersion,
    certificateUid: firstText(core, 'dcc:uniqueIdentifier', 'uniqueIdentifier') ?? undefined,
    issueDate: firstText(core, 'dcc:issueDate', 'issueDate') ?? undefined,
    validUntil: firstText(core, 'dcc:endPerformanceDate', 'endPerformanceDate') ?? undefined,
    beginPerformanceDate: firstText(core, 'dcc:beginPerformanceDate', 'beginPerformanceDate') ?? undefined,
    performanceLocation: firstText(core, 'dcc:performanceLocation', 'performanceLocation') ?? undefined,
    documentLang: lang ?? undefined,
    laboratory: extractLaboratory(admin, lang),
    respPersons: extractRespPersons(admin, lang),
    customer: extractContactCustomer(admin, lang),
    items: extractItems(admin, lang),
    methods: extractMethods(measurementResults, lang),
    results,
    influenceConditions: extractInfluenceConditions(measurementResults, lang),
    comment: extractComment(root),
    signatureRefs: extractSignatureRefs(root),
    attachmentNames: extractAttachmentNames(root),
  };
}

// --------------------------------------------------------------- core helpers

function opt(node: AnyNode | undefined, ...names: string[]): AnyNode | undefined {
  if (!node) return undefined;
  for (const n of names) if (n in node) return node[n] as AnyNode;
  return undefined;
}

function arr(v: unknown): AnyNode[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? (v as AnyNode[]) : [v as AnyNode];
}

function firstText(node: AnyNode | undefined, ...names: string[]): string | undefined {
  if (!node) return undefined;
  for (const n of names) {
    if (n in node) {
      const raw = node[n];
      if (typeof raw === 'string') return raw.trim() || undefined;
      if (raw && typeof raw === 'object' && '#text' in (raw as AnyNode)) {
        const t = (raw as AnyNode)['#text'];
        return typeof t === 'string' ? t.trim() || undefined : undefined;
      }
    }
  }
  return undefined;
}

/** dcc:textType → dcc:content(lang) list; picks preferred lang, then en, then first. */
function localizedText(node: AnyNode | undefined, elementName: string | string[], preferred?: string): string | undefined {
  const holder = opt(node, ...(Array.isArray(elementName) ? elementName : [elementName]));
  if (!holder) return undefined;
  const contents = arr(holder['dcc:content'] ?? holder['content']);
  const parsed = contents.map((c) => ({
    lang: typeof c?.['@lang'] === 'string' ? (c['@lang'] as string) : undefined,
    text: typeof c === 'string' ? c : (typeof c?.['#text'] === 'string' ? (c['#text'] as string) : JSON.stringify(c)),
  }));
  const chosen = (preferred ? parsed.find((p) => p.lang === preferred) : undefined)
    ?? parsed.find((p) => p.lang === 'en')
    ?? parsed[0];
  return chosen?.text?.trim() || undefined;
}

function locationFlat(loc: AnyNode | undefined): string | undefined {
  if (!loc) return undefined;
  const parts = (['city', 'countryCode', 'postCode', 'state', 'street', 'streetNo'] as const)
    .map((k) => firstText(loc, `dcc:${k}`, k))
    .filter(Boolean) as string[];
  return parts.join(', ') || undefined;
}

// -------------------------------------------------------------- domain extracts

function extractLaboratory(admin: AnyNode | undefined, lang?: string): DccExtraction['laboratory'] {
  const lab = opt(admin, 'dcc:calibrationLaboratory', 'calibrationLaboratory');
  if (!lab) return undefined;
  const labCode = firstText(lab, 'dcc:calibrationLaboratoryCode', 'calibrationLaboratoryCode');
  const contact = opt(lab, 'dcc:contact', 'contact');
  if (!contact) return undefined;
  const location = opt(contact, 'dcc:location', 'location');
  return {
    code: labCode ?? undefined,
    name: localizedText(contact, 'dcc:name', lang),
    eMail: firstText(contact, 'dcc:eMail', 'eMail') ?? undefined,
    address: locationFlat(location),
    cryptSignature: firstText(lab, 'dcc:cryptElectronicSignature', 'cryptElectronicSignature') !== undefined,
  };
}

function extractRespPersons(admin: AnyNode | undefined, lang?: string): DccExtraction['respPersons'] {
  const persons = opt(admin, 'dcc:respPersons', 'respPersons');
  return arr(opt(persons, 'dcc:respPerson', 'respPerson')).map((p) => {
    const person = opt(p, 'dcc:person', 'person');
    return {
      name: localizedText(person, 'dcc:name', lang),
      eMail: firstText(person, 'dcc:eMail', 'eMail') ?? undefined,
      role: firstText(p, 'dcc:role', 'role') ?? undefined,
      mainSigner: firstText(p, 'dcc:mainSigner', 'mainSigner') ?? undefined,
    };
  });
}

function extractContactCustomer(admin: AnyNode | undefined, lang?: string): DccExtraction['customer'] {
  const c = opt(admin, 'dcc:customer', 'customer');
  if (!c) return undefined;
  return {
    name: localizedText(c, 'dcc:name', lang),
    address: locationFlat(opt(c, 'dcc:location', 'location')),
  };
}

function extractItems(admin: AnyNode | undefined, lang?: string): DccExtraction['items'] {
  const itemsNode = opt(admin, 'dcc:items', 'items');
  return arr(opt(itemsNode, 'dcc:item', 'item')).map((item) => ({
    name: localizedText(item, 'dcc:name', lang),
    description: localizedText(opt(item, 'dcc:description', 'description'), 'dcc:name', lang),
    manufacturer: localizedText(opt(item, 'dcc:manufacturer', 'manufacturer'), 'dcc:name', lang),
    model: firstText(item, 'dcc:model', 'model') ?? undefined,
    identifications: arr(
      opt(opt(item, 'dcc:identifications', 'identifications'), 'dcc:identification', 'identification'),
    ).map((id) => ({
      issuer: firstText(id, 'dcc:issuer', 'issuer') ?? undefined,
      value: firstText(id, 'dcc:value', 'value') ?? undefined,
    })),
  }));
}

function extractMethods(measurementResults: AnyNode | undefined, lang?: string): DccExtraction['methods'] {
  const usedMethods = opt(measurementResults, 'dcc:usedMethods', 'usedMethods');
  return arr(opt(usedMethods, 'dcc:usedMethod', 'usedMethod')).map((m) => ({
    name: localizedText(m, 'dcc:name', lang),
    description: localizedText(opt(m, 'dcc:description', 'description'), 'dcc:name', lang),
  }));
}

function extractInfluenceConditions(measurementResults: AnyNode | undefined, lang?: string): DccExtraction['influenceConditions'] {
  const list = opt(measurementResults, 'dcc:influenceConditions', 'influenceConditions');
  return arr(opt(list, 'dcc:influenceCondition', 'influenceCondition')).map((cond) => {
    const q = opt(opt(cond, 'dcc:data', 'data'), 'dcc:quantity', 'quantity');
    const real = opt(q, 'si:real', 'real');
    return {
      name: localizedText(cond, 'dcc:name', lang),
      decimal: firstText(real, 'si:value', 'value') ?? undefined,
      unit: firstText(real, 'si:unit', 'unit') ?? undefined,
    };
  });
}

function extractResult(r: AnyNode, measurementResultName?: string, lang?: string): ExtractedResult[] {
  const resultName = localizedText(r, 'dcc:name', lang) ?? 'unnamed result';
  const q = opt(opt(r, 'dcc:data', 'data'), 'dcc:quantity', 'quantity');
  const real = opt(q, 'si:real', 'real');
  if (!real) return [];
  const out: ExtractedResult = {
    resultName,
    measurementResultName,
    label: firstText(real, 'si:label', 'label') ?? undefined,
    decimal: firstText(real, 'si:value', 'value') ?? undefined,
    unit: firstText(real, 'si:unit', 'unit') ?? undefined,
  };
  const univariate = opt(real, 'si:measurementUncertaintyUnivariate', 'measurementUncertaintyUnivariate');
  const expandedMU = opt(univariate, 'si:expandedMU', 'expandedMU') ?? opt(univariate, 'si:expandedUnc', 'expandedUnc');
  if (expandedMU) {
    out.expandedUnc = {
      decimal: firstText(expandedMU, 'si:valueExpandedMU', 'valueExpandedMU') ?? undefined,
      unit: out.unit,
      coverageFactor: firstText(expandedMU, 'si:coverageFactor', 'coverageFactor') ?? undefined,
      coverageProbability: firstText(expandedMU, 'si:coverageProbability', 'coverageProbability') ?? undefined,
      distribution: firstText(expandedMU, 'si:distribution', 'distribution') ?? undefined,
    };
  }
  return [out];
}

function extractComment(root: AnyNode): string | undefined {
  const comment = opt(root, 'dcc:comment', 'comment');
  if (!comment) return undefined;
  // lax-content container: concatenate element text in document order
  const texts: string[] = [];
  for (const value of Object.values(comment)) {
    if (typeof value === 'string') texts.push(value);
    else if (value && typeof value === 'object' && typeof (value as AnyNode)['#text'] === 'string') {
      texts.push((value as AnyNode)['#text'] as string);
    }
  }
  return texts.join(' ').trim() || undefined;
}

function extractSignatureRefs(root: AnyNode): DccExtraction['signatureRefs'] {
  const sigs = arr(root['ds:Signature'] ?? root['Signature']);
  return sigs.map((sig) => {
    const keyinfo = opt(sig as AnyNode, 'ds:KeyInfo', 'KeyInfo');
    const cert = opt(opt(keyinfo, 'ds:X509Data', 'X509Data'), 'ds:X509Subject', 'X509Subject');
    return { hasSignature: Boolean(sig && typeof sig === 'object'), x509Subject: firstText(cert as AnyNode, '#text') ?? undefined };
  });
}

function extractAttachmentNames(root: AnyNode): string[] {
  const docs = arr(root['dcc:document'] ?? root['document']);
  return docs.map((d) => firstText(opt(d, 'dcc:file', 'file'), 'dcc:fileName', 'fileName')).filter((x): x is string => Boolean(x));
}
