import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Potentially unsafe low-level call without extcodesize check in assembly',
  impact: 'Low-level call may succeed even if the contract does not exist at the target address, which can result in unexpected behavior.',
  regex: /function\s+[^\{]*\{[^}]*\bassembly(\s*\([^)]*\))?\s*\{[^}]*\bcall\((?![^}]*extcodesize)/gs,
  // Explanation:
  // function\s+[^\{]*\{ : Matches the start of the function block
  // [^}]* : Matches everything inside the function block
  // \bassembly(\s*\([^)]*\))?\s*\{ : Matches assembly blocks, including memory-safe versions
  // [^}]* : Matches everything inside the assembly block
  // \bcall\((?![^}]*extcodesize) : Ensures call is used without extcodesize in the function
};

export default issue;
