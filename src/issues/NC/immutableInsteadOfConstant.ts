import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.NC,
  title: 'Use `immutable` for calculated values and `constant` for literal values',
  description: 'While it does not save any gas because the compiler knows that developers often make this mistake, it is still best to use the right tool for the task at hand. There is a difference between constant variables and immutable variables, and they should each be used in their appropriate contexts. constants should be used for literal values written into the code, and immutable variables should be used for expressions, or values calculated in, or passed into the constructor.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const variable of findAll('VariableDeclaration', file.ast)) {
          const isConstant = variable.stateVariable && variable.constant;
          const isImmutable = variable.stateVariable && variable.mutability === 'immutable';
          const isLiteral = variable.value?.nodeType === 'Literal';
          const isComplexExpression = variable.value && variable.value.nodeType !== 'Literal';
          const isAssignedAtDeclaration = variable.value !== null;

          // Flag constants that should be immutable due to complex expressions, excluding unassigned immutables.
          if (isConstant && isComplexExpression) {
            instances.push(instanceFromSRC(file, variable.src));
          }

          // Alternatively, flag immutables that should be constants due to simple literal values.
          // Exclude immutable variables that are not assigned at declaration, as they might be assigned in the constructor.
          else if (isImmutable && isLiteral && isAssignedAtDeclaration) {
            instances.push(instanceFromSRC(file, variable.src));
          }
        }
      }
    }
    return instances;
  },
};

export default issue;
