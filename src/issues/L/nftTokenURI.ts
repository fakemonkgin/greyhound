import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,
  title: 'TokenURI returns hardcoded URI',
  description: 'The tokenURI function returns a hardcoded URI without checking whether the token exists or dynamically generating the URI.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (!!file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const func of findAll('FunctionDefinition', contract)) {
            if (func.name === 'tokenURI') {
              let hasHardcodedURI = false;

              if (func.body && func.body.statements) {
                for (const statement of func.body.statements) {
                  // 使用可选链来安全访问属性
                  if (statement?.nodeType === 'Return' && statement.expression?.nodeType === 'Literal') {
                    // 检查返回值是否是硬编码的字符串
                    if (statement.expression?.kind === 'string' && statement.expression?.value?.startsWith("http")) {
                      hasHardcodedURI = true;
                      break;
                    }
                  }
                }
              }

              if (hasHardcodedURI) {
                instances.push(instanceFromSRC(file, func.src));
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
