import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,
  title: 'Missing zero address check in constructor',
  description: 'Constructors often take address parameters to initialize important components of a contract, such as owner or linked contracts. However, without a checking, there is a risk that an address parameter could be mistakenly set to the zero address (0x0). This could be due to an error or oversight during contract deployment. A zero address in a crucial role can cause serious issues, as it cannot perform actions like a normal address, and any funds sent to it will be irretrievable. It is therefore crucial to include a zero address check in constructors to prevent such potential problems. If a zero address is detected, the constructor should revert the transaction',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const constructorDef of findAll('FunctionDefinition', contract)) {
            if (constructorDef.kind === 'constructor') {  // Ensure it's a constructor
              for (const param of constructorDef.parameters.parameters) {
                if (param.typeName?.nodeType === 'ElementaryTypeName' && param.typeName?.name === 'address') {
                  let isZeroCheckPresent = false;

                  // Traverse statements in the body of the constructor
                  const bodyStatements = constructorDef.body?.statements || [];
                  for (const statement of bodyStatements) {
                    if (statement.nodeType === 'ExpressionStatement' &&
                        statement.expression.nodeType === 'FunctionCall') {
                      const functionCall = statement.expression;
                      if (functionCall.expression.nodeType === 'Identifier' &&
                          functionCall.expression.name === 'require' &&
                          functionCall.arguments.length > 0) {
                        const argument = functionCall.arguments[0];
                        // Check if the require statement is checking the parameter is not the zero address
                        if (argument.nodeType === 'BinaryOperation' &&
                            argument.operator === '!=' &&
                            ((argument.leftExpression.nodeType === 'Identifier' &&
                              argument.leftExpression.name === param.name &&
                              argument.rightExpression.nodeType === 'Literal' &&
                              argument.rightExpression.hexValue === '00') ||
                             (argument.rightExpression.nodeType === 'Identifier' &&
                              argument.rightExpression.name === param.name &&
                              argument.leftExpression.nodeType === 'Literal' &&
                              argument.leftExpression.hexValue === '00'))) {
                          isZeroCheckPresent = true;
                          break; // Found the require statement for this parameter
                        }
                      }
                    }
                  }

                  if (!isZeroCheckPresent) {
                    instances.push(instanceFromSRC(file, param.src));
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
