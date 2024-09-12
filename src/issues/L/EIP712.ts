import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes } from '../../types';
import { instanceFromSRC } from '../../utils';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.L,  // 设置为低优先级问题
  title: 'Missing `version` or `salt` in EIP712 Domain',
  description:
    'The EIP712 Domain should include both `version` and `salt` to ensure future compatibility and avoid hash collisions. Missing these fields can result in protocol failures or security vulnerabilities.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];

    for (const file of files) {
      if (file.ast) {
        for (const contract of findAll('ContractDefinition', file.ast)) {
          for (const variableDecl of findAll('VariableDeclaration', contract)) {
            const value = variableDecl.value;
            if (
              value?.nodeType === 'FunctionCall' &&
              value.expression.nodeType === 'Identifier' && // 检查表达式是 Identifier 类型
              value.expression.name === 'keccak256' && // 确保调用的是 keccak256
              value.arguments.length > 0 &&
              value.arguments[0].nodeType === 'Literal' &&
              typeof value.arguments[0].value === 'string' &&
              value.arguments[0].value.includes('EIP712Domain')
            ) {
              const typeHash = value.arguments[0].value;
              if (
                !typeHash.includes('version') || // 检查是否缺少 version
                !typeHash.includes('salt') // 检查是否缺少 salt
              ) {
                instances.push(instanceFromSRC(file, variableDecl.src));
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
