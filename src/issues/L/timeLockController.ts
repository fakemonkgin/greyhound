import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'TimelockController admin is disabled with address(0)',
  description: 'Detecting instances of TimelockController initialization where the fourth parameter (admin) is set to address(0). This is identified as a misconfiguration, check openzeppelin for details, https://github.com/OpenZeppelin/openzeppelin-contracts/blob/a72c9561b9c200bac87f14ffd43a8c719fd6fa5a/contracts/governance/TimelockController.sol#L108C19-L108C87',
  regex: /TimelockController\(([^,]*,){3}\s*address\(0\)\s*\)/g,
};

export default issue;
