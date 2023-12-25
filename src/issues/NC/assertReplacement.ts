import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.NC,
  title: 'assert() should be replaced with require() or revert()',
  description: 'In versions of Solidity prior to 0.8.0, when encountering an assert all the remaining gas will be consumed. Even after solidity 0.8.0, the assert function is still not recommended, as described in the documentation: Assert should only be used to test for internal errors, and to check invariants. Properly functioning code should never create a Panic, not even on invalid external input. If this happens, then there is a bug in your contract which you should fix.',
  regex: /assert\(([^)]*)\)/g,
};

export default issue;