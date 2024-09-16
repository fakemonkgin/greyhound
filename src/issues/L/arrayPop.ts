import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, // Maintainability issue
  title: 'Array can grow in size without a way to shrink it',
  description: 'Arrays that grow dynamically without a removal mechanism can lead to inefficiencies. Ensure that arrays which can `push` elements have a mechanism to remove or resize the array to prevent bloated state variables and gas inefficiency.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const variable of findAll('VariableDeclaration', contract)) {
            if (variable.typeName && variable.typeName.nodeType === 'ArrayTypeName') {
              const arrayName = variable.name;

              let hasPush = false;
              let hasRemove = false;

              // 遍历合约中的函数定义
              for (const func of findAll('FunctionDefinition', contract)) {
                // 检查函数体是否存在
                if (func.body && func.body.statements) {
                  // 查找函数中的 `push` 操作
                  for (const pushOperation of findAll('FunctionCall', func.body)) {
                    const expression = pushOperation.expression;

                    // 确保 expression 是 MemberAccess 类型并有 name 属性
                    if (expression.nodeType === 'MemberAccess' && expression.expression.nodeType === 'Identifier') {
                      const arrayName = expression.expression.name;
                      if (expression.memberName === 'push' && arrayName === variable.name) {
                        hasPush = true;
                      }
                    }
                  }

                  // 查找删除数组的操作，支持 pop、delete、或手动调整 length
                  for (const modifyOperation of findAll('ExpressionStatement', func.body)) {
                    const expression = modifyOperation.expression;

                    // 检查是否通过数组的 length 属性调整
                    if (
                      expression.nodeType === 'Assignment' &&
                      expression.leftHandSide.nodeType === 'MemberAccess' &&
                      expression.leftHandSide.expression.nodeType === 'Identifier' &&
                      expression.leftHandSide.expression.name === variable.name &&
                      expression.leftHandSide.memberName === 'length'
                    ) {
                      hasRemove = true;
                    }

                    // 检查 delete 操作
                    if (
                      expression.nodeType === 'UnaryOperation' &&
                      expression.operator === 'delete' &&
                      expression.subExpression.nodeType === 'IndexAccess' &&
                      expression.subExpression.baseExpression.nodeType === 'Identifier' &&
                      expression.subExpression.baseExpression.name === variable.name
                    ) {
                      hasRemove = true;
                    }

                    // 检查通过索引直接覆盖
                    if (
                      expression.nodeType === 'Assignment' &&
                      expression.leftHandSide.nodeType === 'IndexAccess' &&
                      expression.leftHandSide.baseExpression.nodeType === 'Identifier' &&
                      expression.leftHandSide.baseExpression.name === variable.name
                    ) {
                      hasRemove = true;
                    }
                  }
                }
              }

              // 如果有 push 操作但没有相应的删除操作，标记为漏洞
              if (hasPush && !hasRemove) {
                instances.push(instanceFromSRC(file, variable.src));
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
