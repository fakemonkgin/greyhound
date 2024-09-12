import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,  // 低优先级问题
  title: 'Division before Multiplication detected',
  description: 'Division operations should be performed after multiplication to avoid potential precision loss.',
  // 匹配除法在乘法之前的情况，如 `(a / b) * c`
  regex: /\(\s*\w+\s*\/\s*\w+\s*\)\s*\*\s*\w+/g,
};

export default issue;
