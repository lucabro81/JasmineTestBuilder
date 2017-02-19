"use strict";
var jasmine_test_builder_1 = require("jasmine-test-builder");
var TestClass_1 = require("../app/core/TestClass");
var tb = new jasmine_test_builder_1.JasmineTestBuilder();
tb.init("TestClass - SUITE", TestClass_1.TestClass, [TestClass_1.TestClass]);
tb.test("test test")
    .withMethod("method_test")
    .result("something");
tb.run();
