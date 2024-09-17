import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Do not use deprecated library functions',
  description: 'The use of `safeApprove` has been deprecated in favor of `safeIncreaseAllowance` and `safeDecreaseAllowance`. This is to avoid potential issues with resetting allowances and to ensure future compatibility and functionality. Transitioning to these alternatives helps prevent allowance race conditions and ensures safer contract behavior.',
  regex: /_setupRole\(|safeApprove\(/g,
};

export default issue;
