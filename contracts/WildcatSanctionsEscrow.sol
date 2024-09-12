// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestArrayFunction {

    // 这是不安全的函数，接受一个没有限制大小的数组
    function unsafeArrayFunction(bytes[] calldata data) external {
        for (uint256 i = 0; i < data.length; i++) {
            // 处理每个元素
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Call failed");
        }
    }

    // 这是一个安全的函数，限制了数组长度
    function safeArrayFunction(bytes[] calldata data) external {
        require(data.length <= 100, "Array too large"); // 添加限制，避免过大的数组
        for (uint256 i = 0; i < data.length; i++) {
            // 处理每个元素
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Call failed");
        }
    }

    // 不涉及数组参数的函数，不会被标记
    function regularFunction(address target) external {
        (bool success, ) = target.call("");
        require(success, "Call failed");
    }

    function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) { // <= FOUND
         results = new bytes[](data.length);
         for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            if (!success) {               
               assembly {
                   revert(add(result, 0x20), mload(result))
               }
           }
             results[i] = result;
         }
     }
}
