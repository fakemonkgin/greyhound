import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Use abi.encodeCall() instead of abi.encodeWithSignature()/abi.encodeWithSelector()',
  description: 'Since 0.8.11, abi.encodeCall() provides type-safe encode utility comparing with abi.encodeWithSignature()/abi.encodeWithSelector()',
  regex: /abi\.(encodeWithSignature|encodeWithSelector)\(([^)]*)\)/g,
};

export default issue;