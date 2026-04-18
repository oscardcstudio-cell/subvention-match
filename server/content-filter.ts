/**
 * Input sanitization and content moderation for user-submitted text.
 *
 * Defends against:
 *  - Zalgo / Unicode combining-character bombs (fuzzing vector)
 *  - Slur submissions that would embarrass the platform
 */

// Matches sequences of ≥3 consecutive Unicode combining characters
// (Diacritical Marks, Extended, Supplement, Half Marks, etc.)
// After NFC normalisation, legitimate French accents are pre-composed
// and produce zero combining chars, so this only hits abuse payloads.
const ZALGO_RE =
  /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]{3,}/g;

/** Strip Zalgo-style combining-character bombs while preserving normal text. */
export function stripZalgo(text: string): string {
  return text.normalize("NFC").replace(ZALGO_RE, "");
}

/** Sanitize a single free-text field: strip Zalgo then enforce max length. */
export function sanitizeTextInput(text: string, maxLength = 3000): string {
  return stripZalgo(text).slice(0, maxLength);
}

// ---------------------------------------------------------------------------
// Content moderation blocklist
// ---------------------------------------------------------------------------

const SLUR_PATTERNS: RegExp[] = [
  // English racial / homophobic slurs
  /\bnigger\b/i,
  /\bnigga\b/i,
  /\bfaggot\b/i,
  /\bchink\b/i,
  /\bkike\b/i,
  /\bwetback\b/i,
  /\bspic\b/i,
  /\bgook\b/i,
  // French slurs
  /\bnègre\b/i,
  /\bbougnoule\b/i,
  /\byoupin\b/i,
  /\bsalopard\b/i,
  /\bpédé\b/i,
];

/** Return true if the text contains any blocked content. */
function isBlocked(text: string): boolean {
  const normalised = text.normalize("NFC");
  return SLUR_PATTERNS.some((re) => re.test(normalised));
}

// Text fields in the form submission that should be screened
const MODERATED_FIELDS = [
  "projectDescription",
  "statusOther",
  "artisticDomainOther",
  "projectTypeOther",
  "innovationOther",
  "socialDimensionOther",
  "aidTypesOther",
] as const;

/** Return the first offending field name, or null if clean. */
export function findBlockedField(
  body: Record<string, unknown>
): string | null {
  for (const field of MODERATED_FIELDS) {
    const val = body[field];
    if (typeof val === "string" && isBlocked(val)) {
      return field;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bulk sanitization
// ---------------------------------------------------------------------------

const FIELD_MAX_LENGTHS: Partial<Record<string, number>> = {
  projectDescription: 3000,
  statusOther: 300,
  artisticDomainOther: 300,
  projectTypeOther: 300,
  innovationOther: 300,
  socialDimensionOther: 300,
  aidTypesOther: 300,
};

/**
 * Return a shallow copy of `body` with all text fields sanitized.
 * Does NOT mutate the original object.
 */
export function sanitizeFormBody(
  body: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...body };
  for (const [field, maxLen] of Object.entries(FIELD_MAX_LENGTHS)) {
    if (typeof result[field] === "string") {
      result[field] = sanitizeTextInput(result[field] as string, maxLen);
    }
  }
  return result;
}
