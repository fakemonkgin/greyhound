import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, // Logical issue
  title: 'Missing address comparison check between `to` and `from` addresses',
  description: 'Functions that involve `from` and `to` address parameters should include a check to ensure they are not the same. Missing such a check can lead to unintended behavior or vulnerabilities.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            const parameters = func.parameters?.parameters || [];
            let hasFrom = false;
            let hasTo = false;

            // 检查函数是否包含 `from` 和 `to` 参数
            for (const param of parameters) {
              if (param.name === 'from') {
                hasFrom = true;
              }
              if (param.name === 'to') {
                hasTo = true;
              }
            }

            // 如果函数中包含 `from` 和 `to` 参数，检查是否有 `require(to != from)` 或 `require(from != to)` 的检查
            if (hasFrom && hasTo) {
              let hasComparisonCheck = false;

              // 遍历函数体，查找是否存在 `require(to != from)` 或 `require(from != to)` 的检查
              if (func.body && func.body.statements) {
                for (const statement of func.body.statements) {
                  if (statement.nodeType === 'ExpressionStatement' &&
                      statement.expression.nodeType === 'FunctionCall' &&
                      statement.expression.expression.nodeType === 'Identifier' &&
                      statement.expression.expression.name === 'require') {

                    const args = statement.expression.arguments;
                    if (args.length > 0) {
                      const condition = args[0];
                      // 查找 `require(to != from)` 或 `require(from != to)` 检查
                      if (condition.nodeType === 'BinaryOperation' &&
                          condition.operator === '!=' &&
                          ((condition.leftExpression.nodeType === 'Identifier' &&
                            condition.leftExpression.name === 'to' &&
                            condition.rightExpression.nodeType === 'Identifier' &&
                            condition.rightExpression.name === 'from') ||
                           (condition.leftExpression.nodeType === 'Identifier' &&
                            condition.leftExpression.name === 'from' &&
                            condition.rightExpression.nodeType === 'Identifier' &&
                            condition.rightExpression.name === 'to'))) {
                        hasComparisonCheck = true;
                      }
                    }
                  }
                }
              }

              // 如果没有找到 `require(to != from)` 或 `require(from != to)` 的检查，则标记为漏洞
              if (!hasComparisonCheck) {
                instances.push(instanceFromSRC(file, func.src));
              }
            }
          }
        }
      }
    }

    return instances;
  },
};

export default issue;
