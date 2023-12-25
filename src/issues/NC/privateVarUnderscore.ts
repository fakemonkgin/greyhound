import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'Names of private/internal state variables should be prefixed with an underscore',
  description: 'It is recommended by the Solidity Style Guide. Please refer to this link: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#underscore-prefix-for-non-external-functions-and-variables',
  // 改进了类型匹配部分，使其更通用
  regex: /\b(?:bool|int\d*|uint\d*|bytes\d*|address|string|enum|struct|mapping\([^)]+\)|[A-Z][a-zA-Z0-9]*)\s+(?:internal|private)\s+([a-z][^\s=;]*);/g,
};

export default issue;








