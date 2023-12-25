import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'Names of private/internal functions should be prefixed with an underscore',
  description: 'It is recommended by the Solidity Style Guide. Please refer to this link: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#underscore-prefix-for-non-external-functions-and-variables',
  regex: /\bfunction\s+([a-zA-Z][^\s(]*)\s*\([^\)]*\)\s+(internal|private)[^{]*\{/g,
};

export default issue;
