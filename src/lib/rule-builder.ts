/**
 * Transaction Rule Builder
 *
 * Provides utilities for constructing and validating transaction rule JSON
 */

import type {
  StringCondition,
  NumericCondition,
  LogicOperator,
  ValidationResult,
  ValidationError,
  FieldName,
  StringOperator,
  NumericOperator,
} from "./rule-types";

import type { TransactionRule } from "./rule-types";

import {
  ERROR_CODES,
  STRING_FIELDS,
  NUMERIC_FIELDS,
  STRING_OPERATORS,
  NUMERIC_OPERATORS,
} from "./rule-types";

/**
 * Builder class for creating transaction rules
 */
export class RuleBuilder {
  private rule: Partial<TransactionRule> = {};

  constructor(logic: LogicOperator = "AND") {
    this.rule.logic = logic;
    this.rule.conditions = [];
  }

  /**
   * Set the logic operator for the rule
   */
  setLogic(logic: LogicOperator): this {
    this.rule.logic = logic;
    return this;
  }

  /**
   * Add a string condition to the rule
   */
  addStringCondition(
    field: Extract<
      FieldName,
      "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency"
    >,
    operator: StringOperator,
    value?: string,
    options?: {
      values?: string[];
      case_sensitive?: boolean;
    }
  ): this {
    const condition: StringCondition = {
      field,
      operator,
      case_sensitive: options?.case_sensitive ?? false,
    };

    if (operator === "contains_any") {
      if (!options?.values) {
        throw new Error("contains_any operator requires values array");
      }
      condition.values = options.values;
    } else {
      if (!value) {
        throw new Error(`${operator} operator requires value`);
      }
      condition.value = value;
    }

    this.rule.conditions!.push(condition);
    return this;
  }

  /**
   * Add a numeric condition to the rule
   */
  addNumericCondition(
    field: Extract<FieldName, "amount" | "tx_direction">,
    operator: NumericOperator,
    value?: number,
    options?: {
      min_value?: number;
      max_value?: number;
    }
  ): this {
    const condition: NumericCondition = {
      field,
      operator,
    };

    if (operator === "between") {
      if (options?.min_value === undefined || options?.max_value === undefined) {
        throw new Error("between operator requires min_value and max_value");
      }
      if (options.min_value >= options.max_value) {
        throw new Error("min_value must be less than max_value");
      }
      condition.min_value = options.min_value;
      condition.max_value = options.max_value;
    } else {
      if (value === undefined) {
        throw new Error(`${operator} operator requires value`);
      }
      condition.value = value;
    }

    this.rule.conditions!.push(condition);
    return this;
  }

  /**
   * Add a merchant condition (convenience method)
   */
  addMerchantCondition(
    operator: StringOperator,
    value?: string,
    options?: { values?: string[]; case_sensitive?: boolean }
  ): this {
    return this.addStringCondition("merchant", operator, value, options);
  }

  /**
   * Add an amount condition (convenience method)
   */
  addAmountCondition(
    operator: NumericOperator,
    value?: number,
    options?: { min_value?: number; max_value?: number }
  ): this {
    return this.addNumericCondition("amount", operator, value, options);
  }

  /**
   * Build and return the rule
   */
  build(): TransactionRule {
    if (!this.rule.logic) {
      throw new Error("Logic operator is required");
    }
    if (!this.rule.conditions || this.rule.conditions.length === 0) {
      throw new Error("At least one condition is required");
    }

    return {
      logic: this.rule.logic,
      conditions: this.rule.conditions,
    };
  }

  /**
   * Build and validate the rule
   */
  buildAndValidate(): { rule: TransactionRule; validation: ValidationResult } {
    const rule = this.build();
    const validation = validateRule(rule);
    return { rule, validation };
  }
}

/**
 * Create a new rule builder
 */
export function createRuleBuilder(logic: LogicOperator = "AND"): RuleBuilder {
  return new RuleBuilder(logic);
}

/**
 * Validate a transaction rule
 */
export function validateRule(rule: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if it's valid JSON structure
  if (typeof rule !== "object" || rule === null) {
    return {
      isValid: false,
      errors: [
        {
          code: ERROR_CODES.INVALID_JSON,
          message: "Rule must be a valid object",
        },
      ],
    };
  }

  const ruleObj = rule as Record<string, unknown>;

  // Validate logic field
  if (!ruleObj.logic) {
    errors.push({
      code: ERROR_CODES.REQUIRED_FIELD,
      message: "logic field is required",
      field: "logic",
    });
  } else if (ruleObj.logic !== "AND" && ruleObj.logic !== "OR") {
    errors.push({
      code: ERROR_CODES.INVALID_VALUE,
      message: "logic must be 'AND' or 'OR'",
      field: "logic",
    });
  }

  // Validate conditions field
  if (!ruleObj.conditions) {
    errors.push({
      code: ERROR_CODES.REQUIRED_FIELD,
      message: "conditions field is required",
      field: "conditions",
    });
  } else if (!Array.isArray(ruleObj.conditions)) {
    errors.push({
      code: ERROR_CODES.INVALID_VALUE,
      message: "conditions must be an array",
      field: "conditions",
    });
  } else if (ruleObj.conditions.length === 0) {
    errors.push({
      code: ERROR_CODES.INVALID_VALUE,
      message: "At least one condition is required",
      field: "conditions",
    });
  } else {
    // Validate each condition
    ruleObj.conditions.forEach((condition: unknown, index: number) => {
      const conditionErrors = validateCondition(condition as Record<string, unknown>, index);
      errors.push(...conditionErrors);
    });
  }

  return errors.length === 0 ? { isValid: true } : { isValid: false, errors };
}

/**
 * Validate a single condition
 */
function validateCondition(condition: Record<string, unknown>, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `conditions[${index}]`;

  // Validate field
  if (!condition.field) {
    errors.push({
      code: ERROR_CODES.REQUIRED_FIELD,
      message: "field is required",
      field: "field",
      path,
    });
    return errors; // Can't continue without field
  }

  const allFields = [...STRING_FIELDS, ...NUMERIC_FIELDS];
  if (!allFields.includes(condition.field)) {
    errors.push({
      code: ERROR_CODES.INVALID_FIELD,
      message: `Invalid field: ${condition.field}`,
      field: "field",
      path,
    });
    return errors;
  }

  // Validate operator
  if (!condition.operator) {
    errors.push({
      code: ERROR_CODES.REQUIRED_FIELD,
      message: "operator is required",
      field: "operator",
      path,
    });
    return errors;
  }

  const isStringField = STRING_FIELDS.includes(condition.field);
  const isNumericField = NUMERIC_FIELDS.includes(condition.field);

  if (isStringField && !STRING_OPERATORS.includes(condition.operator)) {
    errors.push({
      code: ERROR_CODES.INVALID_OPERATOR_FOR_FIELD,
      message: `Invalid operator '${condition.operator}' for string field '${condition.field}'`,
      field: "operator",
      path,
    });
  } else if (isNumericField && !NUMERIC_OPERATORS.includes(condition.operator)) {
    errors.push({
      code: ERROR_CODES.INVALID_OPERATOR_FOR_FIELD,
      message: `Invalid operator '${condition.operator}' for numeric field '${condition.field}'`,
      field: "operator",
      path,
    });
  }

  // Validate value requirements based on operator
  if (condition.operator === "contains_any") {
    if (!condition.values || !Array.isArray(condition.values)) {
      errors.push({
        code: ERROR_CODES.CONFLICTING_FIELDS,
        message: "contains_any operator requires values array",
        field: "values",
        path,
      });
    }
    if (condition.value !== undefined) {
      errors.push({
        code: ERROR_CODES.CONFLICTING_FIELDS,
        message: "contains_any operator should not have value field",
        field: "value",
        path,
      });
    }
  } else if (condition.operator === "between") {
    if (condition.min_value === undefined || condition.max_value === undefined) {
      errors.push({
        code: ERROR_CODES.CONFLICTING_FIELDS,
        message: "between operator requires min_value and max_value",
        field: "min_value,max_value",
        path,
      });
    } else if (condition.min_value >= condition.max_value) {
      errors.push({
        code: ERROR_CODES.INVALID_RANGE,
        message: "min_value must be less than max_value",
        field: "min_value,max_value",
        path,
      });
    }
    if (condition.value !== undefined) {
      errors.push({
        code: ERROR_CODES.CONFLICTING_FIELDS,
        message: "between operator should not have value field",
        field: "value",
        path,
      });
    }
  } else {
    if (condition.value === undefined) {
      errors.push({
        code: ERROR_CODES.REQUIRED_FIELD,
        message: `${condition.operator} operator requires value`,
        field: "value",
        path,
      });
    }
    if (condition.values !== undefined) {
      errors.push({
        code: ERROR_CODES.CONFLICTING_FIELDS,
        message: `${condition.operator} operator should not have values field`,
        field: "values",
        path,
      });
    }
  }

  // Validate field-specific constraints
  if (condition.case_sensitive !== undefined && isNumericField) {
    errors.push({
      code: ERROR_CODES.INVALID_FIELD_FOR_TYPE,
      message: "case_sensitive only applies to string fields",
      field: "case_sensitive",
      path,
    });
  }

  if (condition.currency !== undefined) {
    errors.push({
      code: ERROR_CODES.INVALID_FIELD_FOR_TYPE,
      message:
        "currency property is not supported. Use a separate currency field condition instead",
      field: "currency",
      path,
    });
  }

  // Validate tx_direction values
  if (condition.field === "tx_direction" && condition.value !== undefined) {
    if (![0, 1, 2].includes(condition.value)) {
      errors.push({
        code: ERROR_CODES.INVALID_VALUE,
        message: "tx_direction must be 0, 1, or 2",
        field: "value",
        path,
      });
    }
  }

  // Validate amount values
  if (condition.field === "amount") {
    if (condition.value !== undefined && condition.value < 0) {
      errors.push({
        code: ERROR_CODES.INVALID_VALUE,
        message: "amount must be non-negative",
        field: "value",
        path,
      });
    }
    if (condition.min_value !== undefined && condition.min_value < 0) {
      errors.push({
        code: ERROR_CODES.INVALID_VALUE,
        message: "min_value must be non-negative",
        field: "min_value",
        path,
      });
    }
    if (condition.max_value !== undefined && condition.max_value < 0) {
      errors.push({
        code: ERROR_CODES.INVALID_VALUE,
        message: "max_value must be non-negative",
        field: "max_value",
        path,
      });
    }
  }

  // Validate regex patterns
  if (condition.operator === "regex" && condition.value) {
    try {
      new RegExp(condition.value);
    } catch (e) {
      errors.push({
        code: ERROR_CODES.INVALID_REGEX,
        message: `Invalid regex pattern: ${e instanceof Error ? e.message : "Unknown error"}`,
        field: "value",
        path,
      });
    }
  }

  return errors;
}

/**
 * Convert a rule object to JSON string
 */
export function ruleToJson(rule: TransactionRule): string {
  return JSON.stringify(rule, null, 2);
}

/**
 * Parse JSON string to rule object with validation
 */
export function parseRule(json: string): { rule?: TransactionRule; validation: ValidationResult } {
  try {
    const rule = JSON.parse(json);
    const validation = validateRule(rule);

    if (validation.isValid) {
      return { rule: rule as TransactionRule, validation };
    }

    return { validation };
  } catch (e) {
    return {
      validation: {
        isValid: false,
        errors: [
          {
            code: ERROR_CODES.INVALID_JSON,
            message: `Invalid JSON: ${e instanceof Error ? e.message : "Unknown error"}`,
          },
        ],
      },
    };
  }
}
