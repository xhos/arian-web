export const FIELD_OPTIONS = [
  { value: "merchant", label: "Merchant" },
  { value: "tx_desc", label: "Description" },
  { value: "amount", label: "Amount" },
  { value: "tx_direction", label: "Direction" },
  { value: "account_type", label: "Account Type" },
  { value: "account_name", label: "Account Name" },
  { value: "bank", label: "Bank" },
  { value: "currency", label: "Currency" },
] as const;

export const STRING_OPERATOR_OPTIONS = [
  { value: "contains", label: "contains" },
  { value: "equals", label: "equals" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "not_contains", label: "does not contain" },
  { value: "not_equals", label: "not equals" },
  { value: "contains_any", label: "contains any of" },
  { value: "regex", label: "matches regex" },
] as const;

export const NUMERIC_OPERATOR_OPTIONS = [
  { value: "equals", label: "equals" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "between", label: "between" },
  { value: "not_equals", label: "not equals" },
] as const;

export const TX_DIRECTION_OPTIONS = [
  { value: 0, label: "Unknown" },
  { value: 1, label: "Credit (Incoming)" },
  { value: 2, label: "Debit (Outgoing)" },
] as const;

export const STEP_LABELS = [
  { number: 1, title: "Name" },
  { number: 2, title: "Conditions" },
  { number: 3, title: "Action" },
  { number: 4, title: "Review" },
];
