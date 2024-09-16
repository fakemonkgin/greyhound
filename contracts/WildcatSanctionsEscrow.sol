// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    uint256 public minimumValue;
    uint256 public maximumValue;
    uint256 public cap;
    uint256 public threshold;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // 没有 require 检查的设置函数
    function setMinimumValue(uint256 _minimumValue) public onlyOwner {
        minimumValue = _minimumValue;  // <= 测试目标：没有 require 检查
    }

    // 有 require 检查的设置函数
    function setMaximumValue(uint256 _maximumValue) public onlyOwner {
        require(_maximumValue > 0, "Maximum value must be greater than 0");
        maximumValue = _maximumValue;  // <= 测试目标：有 require 检查
    }

    // 没有 require 检查的设置函数
    function setCap(uint256 _cap) public onlyOwner {
        cap = _cap;  // <= 测试目标：没有 require 检查
    }

    // 有 require 检查的设置函数
    function setThreshold(uint256 _threshold) public onlyOwner {
        require(_threshold > minimumValue, "Threshold must be greater than the minimum value");
        threshold = _threshold;  // <= 测试目标：有 require 检查
    }
}
