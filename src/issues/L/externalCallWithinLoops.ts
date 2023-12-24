import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,
  title: 'External Function Calls within Loops',
  description: 'Calling external functions within loops can easily result in insufficient gas. This greatly increases the likelihood of transaction failures, DOS attacks, and other unexpected actions. It is recommended to limit the number of loops within loops that call external functions, and to limit the gas line for each external call.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        // First, find all loop statements: ForStatement, WhileStatement, etc.
        const loops = [...findAll('ForStatement', file.ast), ...findAll('WhileStatement', file.ast)];

        for (const loop of loops) {
          // Now, find all function calls within each loop.
          const funcCalls = findAll('FunctionCall', loop);

          for (const funcCall of funcCalls) {
            // Add extra condition or analysis to determine if this is an external call
            // For now, we assume all function calls within loops are of interest.
            // More sophisticated analysis might check for calls that are known to be external or have certain patterns.
            instances.push(instanceFromSRC(file, funcCall.src));  // Assuming instanceFromSRC can handle this
          }
        }
      }
    }

    return instances;
  },
};

export default issue;

// Implement or ensure this function exists and correctly converts src strings to line numbers.
function getLineNumberFromSrc(src: string): number {
  // Implement logic here based on the format of src in your AST.
  return 0;  // Placeholder, replace with actual implementation.
}
