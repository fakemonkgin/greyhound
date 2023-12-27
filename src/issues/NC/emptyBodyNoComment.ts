// import { IssueTypes, RegexIssue } from '../../types';

// const issue: RegexIssue = {
//   regexOrAST: 'Regex',
//   type: IssueTypes.NC,
//   title: 'Empty function body without comments',
//   description: 'Empty function body in Solidity is not recommended, consider adding some comments to the body. This regex detects functions that have an empty body.',
//   regex: /\bfunction\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(public|private|internal|external|view|pure|override|virtual)?\s*(public|private|internal|external|view|pure|override|virtual)?\s*\{\s*\}/g,
// };

// export default issue;

import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'Empty function body without comments',
  description: 'Empty function body in Solidity is not recommended, consider adding some comments to the body.',
  regex: /\bfunction\s+[a-zA-Z_]\w*\s*\([^)]*\)\s+([a-zA-Z_]\w*\s+)*\{\s*\}/g,
};

export default issue;

