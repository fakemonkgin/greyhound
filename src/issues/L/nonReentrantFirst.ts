import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L, 
  title: 'The nonReentrant modifier should be first in a function declaration',
  description: `In Solidity, the nonReentrant modifier should be the first in a function declaration to ensure proper security checks. 
  If nonReentrant is placed after other modifiers, there's a risk of reentrancy attacks if other modifiers execute before the reentrancy protection.`,
  
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            const modifiers = Array.from(findAll('ModifierInvocation', func));

            // 检查是否存在 nonReentrant 修饰符
            const nonReentrantIndex = modifiers.findIndex(modifier =>
              modifier.modifierName.name === 'nonReentrant'
            );

            // 如果 nonReentrant 存在，但不是第一个修饰符
            if (nonReentrantIndex > 0) {
              instances.push(instanceFromSRC(file, func.src, 'The nonReentrant modifier should be first in the function declaration.'));
            }
          }
        }
      }
    }

    return instances;
  }
};

export default issue;
