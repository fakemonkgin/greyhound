import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.M,
  title: 'Using msg.value in a loop',
  impact: 'Using msg.value inside a loop is dangerous because this might allow the sender to “re-use” the msg.value.This can show up with payable multicalls. Multicalls enable a user to submit a list of transactions to avoid paying the 21,000 gas transaction fee over and over. However, msg.value gets “re-used” while looping through the functions to execute, potentially enabling the user to double spend',
  // This regex attempts to capture loops (for, while, do) that might contain a msg.value inside a call expression.
  regex: /for\s*\(.*;.*;.*\)\s*{[^{}]*\bcall\s*{[^{}]*value\s*:\s*msg\.value[^{}]*}[^{}]*;|while\s*\(.*\)\s*{[^{}]*\bcall\s*{[^{}]*value\s*:\s*msg\.value[^{}]*}[^{}]*;|do\s*{[^{}]*\bcall\s*{[^{}]*value\s*:\s*msg\.value[^{}]*}[^{}]*;.*\}\s*while\s*\(.*\)/g,
};

export default issue;
