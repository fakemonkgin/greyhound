import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'require()/revert() statements should have descriptive reason strings',
  description: 'Consider adding a descriptive reason string to require()/revert() statements to make them more informative.',
  regex: /\b(require|revert)\s*\(([^,)]+)\s*\)\s*;/g,
};

export default issue;
