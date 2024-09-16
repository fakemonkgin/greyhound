import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, // 逻辑漏洞
  title: 'No limits when setting min/max amounts',
  description: `When setting min/max state variables, ensure there are require checks in place to prevent incorrect values from being set. Lack of such checks can lead to potential issues with invalid configurations.`,
  
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    // 定义可能用于 min/max 的关键词
    const minMaxKeywords = ['min', 'max', 'minimum', 'maximum', 'limit', 'cap', 'threshold'];

    for (const file of files) {
      if (file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          
          // 遍历所有的函数定义，查找与 min/max 相关的函数
          for (const func of findAll('FunctionDefinition', contract)) {
            const funcName = func.name || '';
            
            // 如果函数名包含 min/max 相关的关键词，检测该函数是否有 require 检查
            if (minMaxKeywords.some(keyword => funcName.toLowerCase().includes(keyword.toLowerCase()))) {
              let hasRequire = false;

              // 检查函数体中是否存在 require 语句
              if (func.body && func.body.statements) {
                for (const statement of func.body.statements) {
                  if (statement.nodeType === 'ExpressionStatement' &&
                      statement.expression.nodeType === 'FunctionCall' &&
                      statement.expression.expression.nodeType === 'Identifier' &&
                      statement.expression.expression.name === 'require') {
                    hasRequire = true;
                    break;
                  }
                }
              }

              // 如果没有 require 语句，记录漏洞实例
              if (!hasRequire) {
                instances.push(instanceFromSRC(file, func.src, `Function ${funcName} sets min/max amounts without require checks.`));
              }
            }
          }
        }
      }
    }

    return instances;
  }
};

export default issue;
