import {IssueTypes} from "../../types";

const issue = {
    regexOrAST: 'Regex',
    type: IssueTypes.M,
    title: 'Users can’t repay their debts if contract is paused which can cause users to fall into liquidation and lose their collateral',
    description: 'repay() function has implemented the whenNotPaused modifier, which will prevent the function from being used if the contract is paused. The problem is that the usage of this function should not be prevented because if users are unable to repay their debts, their accounts can fall into liquidation status while the OmniPool contract is paused, and once the contract is unpaused, and liquidations are enabled too, if the account felt into liquidation status, now the users and liquidators will be in a mev run to either repay the debt or liquidate the collateral.This presents an unnecessary risk to users by preventing them from repaying their debts.The mitigation is very straight forward, don’t disable the borrower’s repayments, and don’t interrupt the repayments. Remove the whenNotPaused modifier',
    regex: /function\s+repay\w*\s*\([^)]*\)\s*(public|external|internal|private)?\s*((payable\s*)?(virtual\s*)?)?(whenNotPaused|.*pause.*)\s*\{/ig
};

export default issue;
