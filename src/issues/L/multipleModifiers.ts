import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

// 定义问题的 AST 规则
const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, // Maintainability issue
  title: 'Contracts with multiple onlyXYZ modifiers can introduce complexities when managing privileges',
  description: `Using multiple onlyXYZ modifiers for different roles can complicate privilege management. 
  It is recommended to use OpenZeppelin's AccessControl for streamlined role-based permission handling.`,
  
  // 解析输入文件并检测问题
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        // 遍历合约
        for (const contract of findAll('ContractDefinition', file.ast)) {
          let modifiersWithRoles = [];

          // 查找合约中的所有修饰符
          for (const modifier of findAll('ModifierDefinition', contract)) {
            let hasRoleCheck = false;

            // 遍历修饰符中的所有表达式语句
            for (const statement of findAll('ExpressionStatement', modifier)) {
              const expression = statement.expression;

              if (expression.nodeType === 'FunctionCall') {
                const functionName = expression.expression;
                if (functionName.nodeType === 'Identifier') {
                  // 检查权限相关函数调用，如 require(msg.sender == owner)
                  if (functionName.name === 'require' && expression.arguments.length > 0) {
                    const arg = expression.arguments[0];
                    if (
                      arg.nodeType === 'BinaryOperation' &&
                      arg.leftExpression.nodeType === 'MemberAccess' &&
                      arg.leftExpression.expression.nodeType === 'Identifier' &&
                      arg.leftExpression.expression.name === 'msg' &&
                      arg.leftExpression.memberName === 'sender'
                    ) {
                      hasRoleCheck = true;
                    }
                  }
                }
              }
            }

            // 如果修饰符中有权限检查逻辑，记录它
            if (hasRoleCheck) {
              modifiersWithRoles.push(modifier);
            }
          }

          // 如果发现多个修饰符涉及权限检查，标记为问题
          if (modifiersWithRoles.length > 1) {
            // 将合约中的所有相关修饰符标记为实例
            for (const modifier of modifiersWithRoles) {
              instances.push(instanceFromSRC(file, modifier.src));
            }
          }
        }
      }
    }

    return instances;
  },
};

export default issue;
