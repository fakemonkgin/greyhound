import {IssueTypes} from "../../types";

const issue = {
    regexOrAST: 'Regex',
    type: IssueTypes.L,
    title: 'Potential front-running issue with balance check',
    description: 'Checks using require(...balanceOf(address(this)) == ...) with any token might be susceptible to front-running attacks, where an attacker sends a small amount of the token to the contract, altering its balance and causing reversion.',
    regex: /require\(\s*.*\.balanceOf\(address\(this\)\)\s*==/g,
};

export default issue;

