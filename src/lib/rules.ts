/**
 * Transaction Rules - Main Export
 *
 * Central export file for all transaction rule functionality
 */

// Types
export type {
  TransactionRule,
  RuleCondition,
  StringCondition,
  NumericCondition,
  LogicOperator,
  StringOperator,
  NumericOperator,
  FieldName,
  TransactionDirection,
  ValidationResult,
  ValidationError,
} from "./rule-types";

export {
  ERROR_CODES,
  STRING_FIELDS,
  NUMERIC_FIELDS,
  STRING_OPERATORS,
  NUMERIC_OPERATORS,
} from "./rule-types";

// Builder and validation
export {
  RuleBuilder,
  createRuleBuilder,
  validateRule,
  ruleToJson,
  parseRule,
} from "./rule-builder";

// Examples and patterns
export { exampleRules, rulePatterns, ruleTemplates, getExampleRulesAsJson } from "./rule-examples";

// Re-export everything for convenience
export * from "./rule-types";
export * from "./rule-builder";
export * from "./rule-examples";
