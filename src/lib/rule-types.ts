/**
 * Transaction Rule JSON Schema Types
 *
 * Defines TypeScript interfaces for transaction rules that use JSON format
 * to define conditions for automatically categorizing financial transactions.
 */

export type LogicOperator = "AND" | "OR";

export type StringOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "contains_any"
  | "regex";

export type NumericOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "between";

export type FieldName =
  | "merchant"
  | "tx_desc"
  | "tx_direction"
  | "account_type"
  | "account_name"
  | "bank"
  | "currency"
  | "amount";

export type TransactionDirection = 0 | 1 | 2; // 0=unknown, 1=credit, 2=debit

export interface BaseCondition {
  field: FieldName;
  case_sensitive?: boolean;
}

export interface StringCondition extends BaseCondition {
  field: "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency";
  operator: StringOperator;
  value?: string;
  values?: string[];
}

export interface NumericCondition extends BaseCondition {
  field: "amount" | "tx_direction";
  operator: NumericOperator;
  value?: number;
  min_value?: number;
  max_value?: number;
}

export type RuleCondition = StringCondition | NumericCondition;

export interface TransactionRule {
  logic: LogicOperator;
  conditions: RuleCondition[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  path?: string;
}

export type ValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      errors: ValidationError[];
    };

// Error codes
export const ERROR_CODES = {
  INVALID_JSON: "INVALID_JSON",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_VALUE: "INVALID_VALUE",
  INVALID_FIELD: "INVALID_FIELD",
  INVALID_OPERATOR_FOR_FIELD: "INVALID_OPERATOR_FOR_FIELD",
  CONFLICTING_FIELDS: "CONFLICTING_FIELDS",
  INVALID_RANGE: "INVALID_RANGE",
  INVALID_FIELD_FOR_TYPE: "INVALID_FIELD_FOR_TYPE",
  INVALID_REGEX: "INVALID_REGEX",
} as const;

// Field type mappings
export const STRING_FIELDS: FieldName[] = [
  "merchant",
  "tx_desc",
  "account_type",
  "account_name",
  "bank",
  "currency",
];

export const NUMERIC_FIELDS: FieldName[] = ["amount", "tx_direction"];

export const STRING_OPERATORS: StringOperator[] = [
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "contains_any",
  "regex",
];

export const NUMERIC_OPERATORS: NumericOperator[] = [
  "equals",
  "not_equals",
  "greater_than",
  "less_than",
  "between",
];
