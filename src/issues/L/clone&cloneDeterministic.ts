import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Utilize cloneDeterministic rather than clone',
  description: 'an attacker can steal funds via a reorg attack if a contract is funded within a few blocks of being created inside a factory, cloneDeterministic uses the opcode and a salt to deterministically deploy the clone. Using the same implementation and salt multiple times will revert since the clones cannot be deployed twice at the same address.',
  regex: /\.clone\(\s*[^)]*\s*\)/g,
};

export default issue;
