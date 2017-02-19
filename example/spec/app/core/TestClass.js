"use strict";
var TestClass = (function () {
    function TestClass() {
    }
    TestClass.prototype.init = function () {
    };
    TestClass.prototype.method_test = function () {
        return "something";
    };
    return TestClass;
}());
exports.TestClass = TestClass;
