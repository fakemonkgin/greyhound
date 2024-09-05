import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'swapExactTokensForTokens calls with zero as minimal amount out',
  impact: 'look out for swap calls that have 0 as one of the parameters. Setting 0 for slippage means that the swap may return 0 tokens, resulting in a catastrophic loss of funds for the user, who can be exploited by MEV bots',
  // This regex attempts to capture swapExactTokensForTokens calls with the second parameter (amountOutMin) explicitly set to 0
  regex: /swapExactTokensForTokens\s*\(\s*\w+\s*,\s*0\s*,/g,
};

export default issue;
