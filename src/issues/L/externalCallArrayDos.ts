import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, // 高级别问题
  title: 'Using an unbounded array as a parameter in an external function call can be exploited for DoS',
  description: 'External functions that accept unbounded arrays as input can be exploited by sending overly large arrays, consuming excessive gas, and potentially leading to denial of service (DoS) attacks. Add length checks or gas checks to prevent this.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            // 检查是否是 external 或 public 函数
            if (func.visibility === 'external' || func.visibility === 'public') {
              // 遍历函数的参数
              for (const param of func.parameters.parameters) {
                // 检查是否有数组类型的参数，确保 typeName 存在
                if (param.typeName && param.typeName.nodeType === 'ArrayTypeName') {
                  let hasLoop = false;
                  let hasLengthCheck = false;
                  
                  // 查找函数体是否有循环结构
                  if (func.body?.statements) {
                    // 查找是否有数组长度的 require 语句
                    for (const requireStatement of findAll('FunctionCall', func.body)) {
                      const expression = requireStatement.expression;
                      if (expression.nodeType === 'Identifier' && expression.name === 'require') {
                        const args = requireStatement.arguments;
                        if (
                          args.length > 0 &&
                          args[0].nodeType === 'BinaryOperation' &&
                          args[0].operator === '<=' &&
                          args[0].leftExpression.nodeType === 'MemberAccess' &&
                          args[0].leftExpression.memberName === 'length'
                        ) {
                          hasLengthCheck = true;
                          break; // 如果已经有长度检查，跳过后续检查
                        }
                      }
                    }

                    // 检查函数内是否有循环结构
                    for (const statement of findAll('ForStatement', func.body)) {
                      hasLoop = true;
                    }
                  }

                  // 如果有数组参数，并且有循环，但是没有长度检查，则标记为潜在漏洞
                  if (hasLoop && !hasLengthCheck) {
                    instances.push(instanceFromSRC(file, func.src));
                  }
                }
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
