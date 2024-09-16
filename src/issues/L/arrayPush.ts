import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, 
  title: 'Array push without existence check',
  description: 'Using `push` to add elements to an array without checking if the element already exists can lead to bloated arrays and gas inefficiency. Add a check to ensure the element does not already exist in the array before pushing.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            // 查找函数体是否有 push 操作
            if (func.body?.statements) {
              let hasPush = false;
              let hasExistenceCheck = false;

              // 遍历函数中的所有表达式，查找是否有数组 push 操作
              for (const expression of findAll('FunctionCall', func.body)) {
                // 检查是否有 push 操作
                if (expression.expression.nodeType === 'MemberAccess' && expression.expression.memberName === 'push') {
                  hasPush = true;

                  // 检查该 push 操作前是否有元素存在性的检查
                  for (const ifStatement of findAll('IfStatement', func.body)) {
                    const condition = ifStatement.condition;

                    // 查找条件是否为检查数组中是否存在某元素
                    if (
                      condition.nodeType === 'BinaryOperation' &&
                      condition.operator === '!=' &&
                      condition.leftExpression.nodeType === 'MemberAccess' &&
                      condition.leftExpression.memberName === 'length' &&
                      condition.rightExpression.nodeType === 'Literal' &&
                      condition.rightExpression.value === '0'
                    ) {
                      hasExistenceCheck = true;
                      break; // 如果找到检查存在性，就跳过后续检查
                    }
                  }
                }
              }

              // 如果有 push 操作但没有进行存在性检查，则标记为潜在漏洞
              if (hasPush && !hasExistenceCheck) {
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
