// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AssemblyReturnTest {
    uint256 public result;

    // 一个不安全的 Yul block 中有 return 语句
    function unsafeAssembly() public returns (uint256) {
        assembly {
            let x := 10
            let y := 20
            let sum := add(x, y)
            return(0, 0x20) // <= 这里会被 AST 规则识别为问题
        }
    }

    // 安全的 Yul block 没有 return 语句
    function safeAssembly() public returns (uint256) {
        assembly {
            let x := 10
            let y := 20
            let sum := add(x, y)
            mstore(0x40, sum)  // 没有 return，这个不会触发问题
        }
        return result;  // 这是 Solidity 的 return，不会被 AST 检测为问题
    }
}
