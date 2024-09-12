import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.NC,
  title: 'Try-catch without human-readable error handling',
  description: 'A try-catch block should include a catch Error(string memory reason) to properly capture and log human-readable error messages for easier debugging and improved maintainability.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            for (const tryStmt of findAll('TryStatement', func)) {
              let hasErrorCatch = false;

              // 遍历 `clauses` 来检查 catch 块
              for (const catchClause of tryStmt.clauses) {
                if (catchClause.errorName === 'Error' && catchClause.parameters?.parameters?.length) {
                  hasErrorCatch = true;
                  break;
                }
              }

              // 如果没有找到包含 `Error(string)` 的 catch 块
              if (!hasErrorCatch) {
                instances.push(instanceFromSRC(file, tryStmt.src));
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
