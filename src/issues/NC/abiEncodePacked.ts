import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'abi.encodePacked() should be replaced with bytes.concat()',
  description: 'Solidity version 0.8.4 introduces bytes.concat(), which can be used to replace abi.encodePacked() on bytes/strings. It can make the intended operation clearer, leading to less reviewer confusion.',
  regex: /abi\.encodePacked\(([^)]*)\)/g,
};

export default issue;