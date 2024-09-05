import {IssueTypes} from "../../types";

const issue = {
    regexOrAST: 'Regex',
    type: IssueTypes.L,
    title: 'Use of .transfer() or .send() for sending Ether',
    description: 'In Solidity, when transferring Ether, `.transfer()` and `.send()` are commonly used. However, they have a limitation: they forward only a stipend of 2300 gas, which is not enough to execute any code in the recipient contract beyond a simple event emission. Thus, if the recipient is a contract, the transfer may fail unexpectedly. To overcome this, Solidity introduced the `.call{value: _amount}("")` method, which forwards all available gas and can invoke more complex functionality. It is also safer in that it does not revert on failure but instead returns a boolean value to indicate success or failure. Therefore, it is generally a better choice to use `.call` when transferring Ether to a payable address, with the necessary safety checks implemented to handle potential errors.',
    regex: /\bpayable\s*\([^)]*\)\s*\.\s*(transfer|send)\s*\([^)]*\)/g
};

export default issue;
