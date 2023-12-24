import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Ensure `ecrecover` address is checked for non-zero',
  description: 'During an audit of a function that employs ecrecover, it is essential to verify that the recovered address is not 0. This is crucial because ecrecover returns 0 for invalid signatures as well(such as when the value of v is neither 27 nor 28), enabling a malicious user to execute numerous undesirable actions',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            for (const variableDeclaration of findAll('VariableDeclarationStatement', func)) {
              const assignments = variableDeclaration.initialValue;

              if (assignments?.nodeType === 'FunctionCall' &&
                  assignments.expression?.nodeType === 'Identifier' &&
                  assignments.expression.name === 'ecrecover') {
                
                const declarations = variableDeclaration.declarations;
                if (declarations?.length > 0 && declarations[0]?.nodeType === 'VariableDeclaration') {
                  const recoveredVarName = declarations[0]?.name;  // Use optional chaining
                  let isZeroCheckPresent = false;

                  // Look for a require statement that checks the variable is not zero
                  for (const statement of findAll('ExpressionStatement', func)) {
                    const expression = statement.expression;
                    if (expression?.nodeType === 'FunctionCall' &&
                        expression.expression?.nodeType === 'Identifier' &&
                        expression.expression.name === 'require' &&
                        expression.arguments.length > 0 &&
                        expression.arguments[0]?.nodeType === 'BinaryOperation' &&
                        expression.arguments[0].operator === '!=' &&
                        ((expression.arguments[0].leftExpression?.nodeType === 'Identifier' &&
                          expression.arguments[0].leftExpression.name === recoveredVarName &&
                          expression.arguments[0].rightExpression?.nodeType === 'Literal' &&
                          expression.arguments[0].rightExpression.value === '0') ||
                         (expression.arguments[0].rightExpression?.nodeType === 'Identifier' &&
                          expression.arguments[0].rightExpression.name === recoveredVarName &&
                          expression.arguments[0].leftExpression?.nodeType === 'Literal' &&
                          expression.arguments[0].leftExpression.value === '0'))) {

                      isZeroCheckPresent = true;
                      break;
                    }
                  }

                  if (!isZeroCheckPresent) {
                    instances.push(instanceFromSRC(file, variableDeclaration.src));
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
