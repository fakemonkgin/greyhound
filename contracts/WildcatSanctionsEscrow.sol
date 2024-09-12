// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MathOperations {
    uint256 public result;

    // 乘法在除法之前，符合预期
    function multiplyThenDivide(uint256 a, uint256 b, uint256 c) public returns (uint256) {
        result = (a * b) / c; // 这里没有问题，乘法在除法之前
        return result;
    }

    // 除法在乘法之前，应该被检测到
    function divideThenMultiply(uint256 a, uint256 b) public returns (uint256) {
        result = (a / b) * b; // 这里存在问题，除法在乘法之前
        return result;
    }

    // 只有除法操作
    function onlyDivide(uint256 a, uint256 b) public returns (uint256) {
        require(b != 0, "Cannot divide by zero");
        result = a / b; // 这里没有问题
        return result;
    }

    // 只有乘法操作
    function onlyMultiply(uint256 a, uint256 b) public returns (uint256) {
        result = a * b; // 这里没有问题
        return result;
    }
   

    // 另一个除法在乘法之前的情况
    function anotherDivideThenMultiply(uint256 a, uint256 b, uint256 c) public returns (uint256) {
        result = (a * b) / c; // 这里存在问题，除法在乘法之前
        return result;
    }

    function maxUsableTick(int24 tickSpacing) internal pure returns (int24) { 
         unchecked {
           return (30000 / tickSpacing) * tickSpacing; 
         }
   }
}
