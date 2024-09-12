// import { findAll } from 'solidity-ast/utils';
// import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
// import { instanceFromSRC } from '../../utils';

//这个AST只检查了函数名是否为withdraw或者sweep，没有检查函数逻辑

// const issue: ASTIssue = {
//   regexOrAST: 'AST',
//   type: IssueTypes.M,
//   title: 'Contract contains payable functions but no withdraw/sweep function',
//   description: 'Payable functions allow the contract to receive Ether, but without a corresponding withdraw or sweep function, the Ether can become locked.',
//   detector: (files: InputType): Instance[] => {
//     let instances: Instance[] = [];

//     for (const file of files) {
//       if (!!file.ast) {
//         for (const contract of findAll('ContractDefinition', file.ast)) {
//           let hasPayableFunction = false;
//           let hasWithdrawFunction = false;

//           // 查找所有函数定义
//           for (const func of findAll('FunctionDefinition', contract)) {
//             // 检查是否有 payable 函数
//             if (func.stateMutability === 'payable') {
//               hasPayableFunction = true;
//             }

//             // 检查是否有 withdraw 或 sweep 函数
//             if (func.name === 'withdraw' || func.name === 'sweep') {
//               hasWithdrawFunction = true;
//             }
//           }

//           // 如果有 payable 函数但没有 withdraw 函数，记录为问题
//           if (hasPayableFunction && !hasWithdrawFunction) {
//             instances.push(instanceFromSRC(file, contract.src));
//           }
//         }
//       }
//     }

//     return instances;
//   },
// };

// export default issue;

import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Contract contains payable functions but no withdraw/sweep/transfer function',
  description: 'Payable functions allow the contract to receive Ether, but without a corresponding withdraw, sweep, or transfer function, the Ether can become locked.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          let hasPayableFunction = false;
          let hasTransferFunction = false;

          // 查找所有函数定义
          for (const func of findAll('FunctionDefinition', contract)) {
            // 检查是否有 payable 函数
            if (func.stateMutability === 'payable') {
              hasPayableFunction = true;
            }

            // 查找资金转移逻辑 (包括 transfer(), send(), call() )
            for (const statement of findAll('FunctionCall', func)) {
              if (statement.expression?.nodeType === 'MemberAccess') {
                const memberAccess = statement.expression;

                if (
                  memberAccess.memberName === 'transfer' || // 检查 transfer
                  memberAccess.memberName === 'send' || // 检查 send
                  (memberAccess.memberName === 'call' && statement.arguments.length > 0) // 检查 call{value:}
                ) {
                  hasTransferFunction = true;
                  break;
                }
              }
            }
          }

          // 如果有 payable 函数但没有转移资金的函数，记录为问题
          if (hasPayableFunction && !hasTransferFunction) {
            instances.push(instanceFromSRC(file, contract.src));
          }
        }
      }
    }

    return instances;
  },
};

export default issue;
