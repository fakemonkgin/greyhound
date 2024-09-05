import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'using block.timestamp for deadline could result in loss of funds for the user',
  impact: 'protocols should let users who interact with AMMs set expiration deadlines. Without this, there is a risk of a serious loss of funds for anyone starting a swap, especially if there is no slippage parameter',
  // This regex attempts to capture "deadline: block.timestamp" with variable spaces around colon
  // and "UniswapV2Router.func(block.timestamp)" or similar patterns with Router as part of the larger function name
  regex: /(deadline\s*(:|=|<=|>=|!=|<|>)\s*block.timestamp|[\w]*Router\.\w+\(block.timestamp\)|[\w]*router\.\w+\(block.timestamp\))/g,
};

export default issue;

