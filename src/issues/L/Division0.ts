//need fix later, has false positive

import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,  // 设置为低优先级问题
  title: 'Potential Division by Zero Without Zero Check',
  description: 'Division by zero can lead to runtime errors. Ensure a zero check (require/assert) is in place before division operations.',
  // 匹配除法操作，确保除数不是常量且没有零检查
  regex: /(?<!require\s*\(\s*(\w+)\s*(?:!=|>|>=|<|<=)\s*0\s*\);\s*(?:.*[\r\n]+)?)\b\w+\s*=\s*\w+\s*\/\s*(?!\d)(\w+)\b/g,
};

export default issue;

