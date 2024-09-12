import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,  // Non-critical issue
  title: 'Solidity Version 0.8.23 or Above Detected',
  description:
    'Solidity version 0.8.23 introduces the MCOPY opcode, which may not be supported on all chains and L2 networks. Consider using an earlier version to ensure compatibility.',
  // 匹配 Solidity 版本 0.8.23 或更高版本的 pragma 声明
  regex: /pragma\s+solidity\s+\^?(0\.8\.(23|[2-9]\d)|0\.9\.0)/g,
};

export default issue;
