// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestToken {
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        // 这里没有对 from 和 to 地址进行检查
        return true;
    }

    function safeTransferFrom1(address from, address to, uint256 amount) public returns (bool) {
        // 这里使用了 from != to 检查
        require(from != to, "From and To addresses can't be the same");
        return true;
    }

    function safeTransferFrom2(address from, address to, uint256 amount) public returns (bool) {
        // 这里使用了 to != from 检查
        require(to != from, "To and From addresses can't be the same");
        return true;
    }
}
