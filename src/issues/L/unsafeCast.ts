// import { findAll } from 'solidity-ast/utils';
// import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
// import { instanceFromSRC } from '../../utils';

// const issue: ASTIssue = {
//   regexOrAST: 'AST',
//   type: IssueTypes.L,
//   title: 'Unsafe conversion from unsigned to signed values',
//   description: 'The int type in Solidity uses the two‘s complement system, so it is possible to accidentally overflow a very large uint to an int, even if they share the same number of bytes (e.g. a uint256 number > type(uint128).max will overflow a int256 cast). Consider using the SafeCast library to prevent any overflows',
//   detector: (files: InputType): Instance[] => {
//     let instances: Instance[] = [];

//     for (const file of files) {
//       if (!!file.ast) {
//         for (const contract of findAll('ContractDefinition', file.ast)) {
//           for (const func of findAll('FunctionDefinition', contract)) {
//             for (const statement of func.body?.statements || []) {
//               if (statement.nodeType === 'ExpressionStatement') {
//                 const expression = statement.expression;
//                 // Look for function calls
//                 if (expression.nodeType === 'FunctionCall') {
//                   // Check each argument of the function call
//                   for (const arg of expression.arguments) {
//                     // Specifically look for type casts to signed types
//                     if (arg.nodeType === 'FunctionCall' &&
//                         arg.expression.nodeType === 'ElementaryTypeNameExpression' &&
//                         ['int', 'int8', 'int16', 'int24', 'int32', 'int40','int48','int56','int64','int72','int80','int88','int96','int104','int112','int120','int128','int136','int144','int152','int160','int168','int176','int184','int192','int200','int208','int216','int224','int232','int240','int248', 'int256'] // add all relevant int types here
//                         .includes(arg.expression.typeName.name)) {
//                       instances.push(instanceFromSRC(file, arg.src));
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     return instances;
//   },
// };

// export default issue;

// import { findAll } from 'solidity-ast/utils';
// import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
// import { instanceFromSRC } from '../../utils';

// const intTypes = ['int', 'int8', 'int16', 'int24', 'int32', 'int40', 'int48', 'int56', 'int64', 'int72', 'int80', 'int88', 'int96', 'int104', 'int112', 'int120', 'int128', 'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192', 'int200', 'int208', 'int216', 'int224', 'int232', 'int240', 'int248', 'int256'];

// const issue: ASTIssue = {
//   regexOrAST: 'AST',
//   type: IssueTypes.L,
//   title: 'Unsafe conversion from unsigned to signed values',
//   description: 'The int type in Solidity uses the two‘s complement system, so it is possible to accidentally overflow a very large uint to an int, even if they share the same number of bytes (e.g. a uint256 number > type(uint128).max will overflow a int256 cast). Consider using the SafeCast library to prevent any overflows',
//   detector: (files: InputType): Instance[] => {
//     let instances: Instance[] = [];

//     for (const file of files) {
//       if (!!file.ast) {
//         for (const contract of findAll('ContractDefinition', file.ast)) {
//           for (const func of findAll('FunctionDefinition', contract)) {
//             for (const statement of func.body?.statements || []) {
//               if (statement.nodeType === 'ExpressionStatement') {
//                 traverseExpression(statement.expression, file);
//               }
//             }
//           }
//         }
//       }
//     }

//     function traverseExpression(expression:any, file:any) {
//       if (expression.nodeType === 'FunctionCall' && expression.expression.nodeType === 'ElementaryTypeNameExpression' && intTypes.includes(expression.expression.typeName.name)) {
//         instances.push(instanceFromSRC(file, expression.src));
//       } else if (expression.nodeType === 'UnaryOperation' && expression.operator === '-' && expression.subExpression) {
//         traverseExpression(expression.subExpression, file);
//       } else if (expression.nodeType === 'FunctionCall') {
//         // Check each argument of the function call
//         expression.arguments.forEach((arg:any) => traverseExpression(arg, file));
//       }
//     }

//     return instances;
//   },
// };

// export default issue;

import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const intTypes = ['int', 'int8', 'int16', 'int24', 'int32', 'int40', 'int48', 'int56', 'int64', 'int72', 'int80', 'int88', 'int96', 'int104', 'int112', 'int120', 'int128', 'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192', 'int200', 'int208', 'int216', 'int224', 'int232', 'int240', 'int248', 'int256'];

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,
  title: 'Unsafe conversion from unsigned to signed values',
  description: 'The int type in Solidity uses the two‘s complement system, so it is possible to accidentally overflow a very large uint to an int, even if they share the same number of bytes (e.g. a uint256 number > type(uint128).max will overflow a int256 cast). Consider using the SafeCast library to prevent any overflows',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            for (const statement of func.body?.statements || []) {
              if (statement.nodeType === 'ExpressionStatement') {
                traverseExpression(statement.expression, file);
              }
            }
          }
        }
      }
    }


function traverseExpression(expression: any, file: any) {
    if (expression.nodeType === 'FunctionCall' &&
        expression.expression.nodeType === 'ElementaryTypeNameExpression' &&
        intTypes.includes(expression.expression.typeName.name)) {
      instances.push(instanceFromSRC(file, expression.src));
    } else if (expression.nodeType === 'UnaryOperation' &&
               ['-', '+', '~'].includes(expression.operator) && // 你可能需要考虑更多的一元操作符
               expression.subExpression) {
      traverseExpression(expression.subExpression, file);
    } else {
      // Recursively check all possible sub-nodes for expressions
      Object.values(expression).forEach(subNode => {
        if (subNode && typeof subNode === 'object' && 'nodeType' in subNode) {
          traverseExpression(subNode, file);
        }
      });
    }
  
    // Check arguments of function calls
    if (expression.nodeType === 'FunctionCall') {
      expression.arguments.forEach((arg: any) => traverseExpression(arg, file));
    }
  }
  
    return instances;
  },
};

export default issue;


