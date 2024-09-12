import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,  
  title: 'Avoid using return in Yul assembly blocks',
  description: 'Avoid using `return` in Yul assembly blocks as it halts the performance of logic outside of the Yul block.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            for (const statement of findAll('InlineAssembly', func)) {
              if (statement.nodeType === 'InlineAssembly' && statement.AST) {
                const assemblyBlock = statement.AST;

                // Traverse the Yul block's statements
                for (const yulStatement of assemblyBlock.statements) {
                  if (yulStatement.nodeType === 'YulExpressionStatement') {
                    const expression = yulStatement.expression;
                    if (expression.nodeType === 'YulFunctionCall' && expression.functionName.name === 'return') {
                      instances.push(instanceFromSRC(file, statement.src));
                    }
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
