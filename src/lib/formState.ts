// What a form's server action hands back when it fails.
// `values` lets the form refill the fields the person typed (never passwords).
export type FormState = { error: string; values?: Record<string, string> } | null
