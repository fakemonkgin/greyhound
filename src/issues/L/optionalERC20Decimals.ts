import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Function decimals() is not a part of the ERC-20 standard',
  description: 'The symbol() function is not a part of the ERC-20 standard, and was added later as an optional extension. As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function',
  regex: /ERC20\([^)]*\)\.decimals\(\)/g,
};

export default issue;