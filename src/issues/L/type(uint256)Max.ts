import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L, // Logical issue
  title: 'Large approval with type(uint256).max may cause issues',
  impact: 'Using type(uint256).max as the approval amount in the approve function can cause unexpected behaviors in some tokens, especially those with custom transferFrom implementations, fee mechanisms, or burning mechanisms.',
  // This regex attempts to capture approve(address, type(uint256).max) with variable spaces around the parentheses and commas
  regex: /approve\s*\(\s*\w+\s*,\s*type\(uint256\)\.max\s*\)/g,
};

export default issue;
