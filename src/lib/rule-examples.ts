/**
 * Transaction Rule Examples
 *
 * Provides example rules and utility functions for common use cases
 */

import { createRuleBuilder } from "./rule-builder";
import type { TransactionRule } from "./rule-types";

/**
 * Example rules demonstrating various use cases
 */
export const exampleRules = {
  /**
   * Simple merchant match - case insensitive
   */
  starbucksRule: (): TransactionRule => {
    return createRuleBuilder("AND")
      .addMerchantCondition("contains", "starbucks", { case_sensitive: false })
      .build();
  },

  /**
   * Amount range with multiple merchant conditions
   */
  groceryExpenseRule: (): TransactionRule => {
    return createRuleBuilder("AND")
      .addAmountCondition("between", undefined, {
        min_value: 50.0,
        max_value: 200.0,
      })
      .addMerchantCondition("contains_any", undefined, {
        values: ["grocery", "market", "food"],
        case_sensitive: false,
      })
      .addStringCondition("currency", "equals", "USD")
      .build();
  },

  /**
   * OR logic with multiple merchants
   */
  amazonRule: (): TransactionRule => {
    return createRuleBuilder("OR")
      .addMerchantCondition("equals", "Amazon", { case_sensitive: false })
      .addMerchantCondition("regex", "^AMZN.*", { case_sensitive: false })
      .build();
  },

  /**
   * Transaction direction filter with amount threshold
   */
  largeDebitRule: (): TransactionRule => {
    return createRuleBuilder("AND")
      .addNumericCondition("tx_direction", "equals", 2) // debit
      .addAmountCondition("greater_than", 100.0)
      .build();
  },

  /**
   * Complex rule with multiple conditions
   */
  restaurantDinnerRule: (): TransactionRule => {
    return createRuleBuilder("AND")
      .addMerchantCondition("contains_any", undefined, {
        values: ["restaurant", "cafe", "bistro", "grill"],
        case_sensitive: false,
      })
      .addAmountCondition("between", undefined, { min_value: 25.0, max_value: 150.0 })
      .addNumericCondition("tx_direction", "equals", 2) // debit
      .build();
  },

  /**
   * Bank-specific rule
   */
  chaseAccountRule: (): TransactionRule => {
    return createRuleBuilder("AND")
      .addStringCondition("bank", "contains", "chase", { case_sensitive: false })
      .addStringCondition("account_type", "equals", "checking", { case_sensitive: false })
      .build();
  },
};

/**
 * Utility functions for common rule patterns
 */
export const rulePatterns = {
  /**
   * Create a simple merchant contains rule
   */
  merchantContains: (merchant: string, caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addMerchantCondition("contains", merchant, { case_sensitive: caseSensitive })
      .build();
  },

  /**
   * Create a merchant equals rule
   */
  merchantEquals: (merchant: string, caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addMerchantCondition("equals", merchant, { case_sensitive: caseSensitive })
      .build();
  },

  /**
   * Create an amount range rule
   */
  amountRange: (minAmount: number, maxAmount: number, currency?: string): TransactionRule => {
    const builder = createRuleBuilder("AND").addAmountCondition("between", undefined, {
      min_value: minAmount,
      max_value: maxAmount,
    });

    if (currency) {
      builder.addStringCondition("currency", "equals", currency);
    }

    return builder.build();
  },

  /**
   * Create an amount threshold rule
   */
  amountGreaterThan: (amount: number, currency?: string): TransactionRule => {
    const builder = createRuleBuilder("AND").addAmountCondition("greater_than", amount);

    if (currency) {
      builder.addStringCondition("currency", "equals", currency);
    }

    return builder.build();
  },

  /**
   * Create an amount threshold rule
   */
  amountLessThan: (amount: number, currency?: string): TransactionRule => {
    const builder = createRuleBuilder("AND").addAmountCondition("less_than", amount);

    if (currency) {
      builder.addStringCondition("currency", "equals", currency);
    }

    return builder.build();
  },

  /**
   * Create a transaction direction rule
   */
  transactionDirection: (direction: 0 | 1 | 2): TransactionRule => {
    return createRuleBuilder("AND")
      .addNumericCondition("tx_direction", "equals", direction)
      .build();
  },

  /**
   * Create a multi-merchant OR rule
   */
  anyMerchant: (merchants: string[], caseSensitive = false): TransactionRule => {
    const builder = createRuleBuilder("OR");
    merchants.forEach((merchant) => {
      builder.addMerchantCondition("equals", merchant, { case_sensitive: caseSensitive });
    });
    return builder.build();
  },

  /**
   * Create a merchant keywords rule using contains_any
   */
  merchantKeywords: (keywords: string[], caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addMerchantCondition("contains_any", undefined, {
        values: keywords,
        case_sensitive: caseSensitive,
      })
      .build();
  },

  /**
   * Create a description contains rule
   */
  descriptionContains: (description: string, caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addStringCondition("tx_desc", "contains", description, { case_sensitive: caseSensitive })
      .build();
  },

  /**
   * Create an account type rule
   */
  accountType: (accountType: string, caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addStringCondition("account_type", "equals", accountType, { case_sensitive: caseSensitive })
      .build();
  },

  /**
   * Create a bank rule
   */
  bankEquals: (bank: string, caseSensitive = false): TransactionRule => {
    return createRuleBuilder("AND")
      .addStringCondition("bank", "equals", bank, { case_sensitive: caseSensitive })
      .build();
  },
};

/**
 * Convert example rules to JSON for testing/demonstration
 */
export function getExampleRulesAsJson(): Record<string, string> {
  const jsonRules: Record<string, string> = {};

  Object.entries(exampleRules).forEach(([key, ruleFactory]) => {
    jsonRules[key] = JSON.stringify(ruleFactory(), null, 2);
  });

  return jsonRules;
}

/**
 * Common rule templates that can be customized
 */
export const ruleTemplates = {
  /**
   * Basic merchant categorization
   */
  basicMerchant: {
    description: "Match transactions from a specific merchant",
    template: {
      logic: "AND" as const,
      conditions: [
        {
          field: "merchant" as const,
          operator: "contains" as const,
          value: "{{merchant_name}}",
          case_sensitive: false,
        },
      ],
    },
  },

  /**
   * Amount-based categorization
   */
  amountThreshold: {
    description: "Match transactions above a certain amount",
    template: {
      logic: "AND" as const,
      conditions: [
        {
          field: "amount" as const,
          operator: "greater_than" as const,
          value: "{{amount_threshold}}",
        },
      ],
    },
  },

  /**
   * Combined merchant and amount
   */
  merchantAndAmount: {
    description: "Match specific merchant with amount constraints",
    template: {
      logic: "AND" as const,
      conditions: [
        {
          field: "merchant" as const,
          operator: "contains" as const,
          value: "{{merchant_name}}",
          case_sensitive: false,
        },
        {
          field: "amount" as const,
          operator: "between" as const,
          min_value: "{{min_amount}}",
          max_value: "{{max_amount}}",
        },
      ],
    },
  },

  /**
   * Multiple merchant keywords
   */
  merchantKeywords: {
    description: "Match transactions containing any of several keywords",
    template: {
      logic: "AND" as const,
      conditions: [
        {
          field: "merchant" as const,
          operator: "contains_any" as const,
          values: ["{{keyword1}}", "{{keyword2}}", "{{keyword3}}"],
          case_sensitive: false,
        },
      ],
    },
  },
};
