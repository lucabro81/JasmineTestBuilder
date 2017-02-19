import {JasmineTestBuilder} from "jasmine-test-builder";
import {TestClass} from "../app/core/TestClass";

var tb:JasmineTestBuilder<TestClass> = new JasmineTestBuilder<TestClass>();

tb.init("TestClass - SUITE", TestClass, [TestClass]);
    tb.test("test test")
        .withMethod("method_test")
        .result("something");
tb.run();