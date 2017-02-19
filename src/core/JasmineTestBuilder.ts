// TODO: let the user choice using a single instance through the test or one for every one

class JasmineTestBuilder<T> {

    private describe_name:string;
    private test_class_instance_arr:Array<T>;

    private destroy_method:string;
    private init_method:string;
    private generic_class:{new():T;};
    private init_params:Array<any>;

    private test_index:number;
    private chained_test_index_arr:Array<number>;
    private it_method_arr:Array<any>;
    private test_func_arr:Array<any>;
    private prop_arr:Array<any>;
    private before_func_arr:Array<any>;
    private spec_name_arr:Array<string>;
    private params_arr:Array<Array<any>>;


    /**
     * @constructor
     */
    public constructor() {}

////////////////////////////////
//////////// PUBLIC ////////////
////////////////////////////////

    /**
     *
     * @param describe_name
     * @param c
     * @param init_params
     */
    public init(describe_name:string,
                c: {new(): T; },
                init_params:Array<any> = []):void {

        this.describe_name = describe_name;
        this.generic_class = c;

        this.init_params = init_params;

        this.destroy_method = "destroy";
        this.init_method = "init";
        this.test_class_instance_arr = [];
        this.it_method_arr = [];
        this.test_func_arr = [];
        this.before_func_arr = [];
        this.spec_name_arr = [];
        this.params_arr = [];
        this.prop_arr = [];
        this.test_index = 0;
        this.chained_test_index_arr = [];

        this.params_arr[this.test_index] = [];
        this.test_func_arr[this.test_index] = [];
        this.chained_test_index_arr[this.test_index] = 0;

        this.createObject();
    }

    /**
     *
     * @param destroy_method
     */
    public setDestroyMethod(destroy_method:string):void {
        this.destroy_method = destroy_method;
    }

    /**
     *
     * @param init_method
     */
    public setInitMethod(init_method:string):void {
        this.init_method = init_method;
    }

    /**
     * Specify a test name
     *
     * @param test_name
     * @returns {JasmineTestBuilder}
     */
    public test(test_name:string):JasmineTestBuilder<T> {
        this.spec_name_arr[this.test_index] = test_name + " TEST";
        return this;
    }

    /**
     * Params array for the testing method if needed
     *
     * @param params
     * @returns {JasmineTestBuilder}
     */
    public withInput(params:Array<any>):JasmineTestBuilder<T> {
        this.params_arr[this.test_index] = params;
        return this;
    }

    /**
     *
     * @param method_name
     * @returns {JasmineTestBuilder}
     */
    public method(method_name:string):JasmineTestBuilder<T> {

        //this.createObject();

        var last_index:number = this.test_class_instance_arr.length - 1;

        if (this.test_class_instance_arr[last_index]) {
            this.spec_name_arr[this.test_index] = method_name + " TEST";
            this.test_func_arr[this.test_index] = {
                type: "method",
                func: this.test_class_instance_arr[last_index][method_name]
            };
        }
        else {
            throw new Error("Fatal Error: " + method_name +
                " doesn't exists, check your project for the correct method name");
        }

        return this;
    }

    /**
     * Custom function to test, need a test name
     *
     * @param func
     * @returns {JasmineTestBuilder}
     */
    public withCustomTestFunc(func:Function):JasmineTestBuilder<T> {
        //this.createObject();
        this.pushTestCustomFunc(func);
        return this;
    }

    /**
     * Property to test
     *
     * @param prop_name
     */
    public withProp(prop_name:string):JasmineTestBuilder<T> {
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public withMethod(method_name:string, params:Array<any> = []):JasmineTestBuilder<T> {
        //this.createObject();
        this.pushTestInstanceMethod(method_name, params);
        return this;
    }

    /**
     * Property to test, chain with a previous method or prop to test
     *
     * @param prop_name
     */
    public andProp(prop_name:string):JasmineTestBuilder<T> {
        this.pushTestInstanceProp(prop_name);
        return this;
    }

    /**
     *
     * Method to test, chain with a previous method or prop to test
     *
     * @param method_name
     * @param params
     */
    public andMethod(method_name:string, params:Array<any> = []):JasmineTestBuilder<T> {
        this.pushTestInstanceMethod(method_name, params);
        return this;
    }

    /**
     * Method to test, chain with a previous method or prop to test
     *
     * @param func
     * @returns {JasmineTestBuilder}
     */
    public andCustomTestFunc(func:(ll:T) => T):JasmineTestBuilder<T> {
        this.pushTestCustomFunc(func);
        return this;
    }

    /**
     * @deprecated
     * @returns {JasmineTestBuilder}
     */
    public after(func:Function):JasmineTestBuilder<T> {

        var last_index:number = this.test_class_instance_arr.length - 1;

        // this.before_func_arr.push({
        this.before_func_arr[this.test_index] = {
            func: func,
            instance_index: last_index
        };

        return this;
    }

    /**
     *
     * @param expected_value
     * @returns {JasmineTestBuilder}
     */
    public result(expected_value:any):JasmineTestBuilder<T> {
        this.push_it_method("toEqual", expected_value);
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public resultFalse():JasmineTestBuilder<T> {
        this.push_it_method("toBe", false);
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public resultTrue():JasmineTestBuilder<T> {
        this.push_it_method("toBe", true);
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public resultUndefined():JasmineTestBuilder<T> {
        this.push_it_method("toBeUndefined", null);
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public resultNull():JasmineTestBuilder<T> {
        this.push_it_method("toBeNull", null);
        return this;
    }

    /**
     *
     * @returns {JasmineTestBuilder}
     */
    public resultNan():JasmineTestBuilder<T> {
        this.push_it_method("toBeNaN", null);
        return this;
    }

    /**
     * Run all tests one after one
     */
    public run():void {
        describe(this.describe_name, () => {
            this.startTests(0);
        });
    }

    /**
     *
     */
    public destroy():void {

        this.destroyArray(this.it_method_arr);
        this.it_method_arr = null;

        this.destroyArray(this.test_func_arr);
        this.test_func_arr = null;

        this.destroyArray(this.prop_arr);
        this.prop_arr = null;

        this.destroyArray(this.spec_name_arr);
        this.spec_name_arr = null;

        this.destroyArray(this.params_arr);
        this.params_arr = null;

        this.destroyArray(this.before_func_arr);
        this.before_func_arr = null;

        this.destroyObject();

        this.destroyArray(this.test_class_instance_arr);
        this.test_class_instance_arr = null;

        this.describe_name = null;
        this.destroy_method = null;
        this.init_method = null;
    }

/////////////////////////////////
//////////// PRIVATE ////////////
/////////////////////////////////

    /**
     * Collect method to test in the array test_func_arr with type "method"
     *
     * @param method_name
     * @param params
     */
    private pushTestInstanceMethod(method_name:string, params:Array<any>):void {

        var last_index:number = this.test_class_instance_arr.length - 1;

        if (this.test_class_instance_arr[last_index][method_name]) {
            this.params_arr[this.test_index][this.chained_test_index_arr[this.test_index]] = params;
            this.test_func_arr[this.test_index][this.chained_test_index_arr[this.test_index]] = {
                type: "method",
                func: this.test_class_instance_arr[last_index][method_name]
            };
        }
        else {
            throw new Error("Fatal Error: " + method_name +
                " doesn't exists, check your project for the correct method name");
        }

        this.chained_test_index_arr[this.test_index]++;
    }

    /**
     * Collect properties to test in the array test_func_arr with type "prop"
     *
     * @param prop_name
     */
    private pushTestInstanceProp(prop_name:string):void {
        var last_index:number = this.test_class_instance_arr.length - 1;

        if (this.test_class_instance_arr[last_index].hasOwnProperty(prop_name)) {
            this.test_func_arr[this.test_index][this.chained_test_index_arr[this.test_index]] = {
                type: "prop",
                prop: prop_name
            };
        }
        else {
            throw new Error("Fatal Error: " + prop_name +
                " doesn't exists, check your project for the correct property name");
        }

        this.chained_test_index_arr[this.test_index]++;
    }

    /**
     * Collect custom func to test in the array test_func_arr with type "custom"
     *
     * @param func
     */
    private pushTestCustomFunc(func:Function):void {
        this.test_func_arr[this.test_index][this.chained_test_index_arr[this.test_index]] = {
            type: "custom",
            func: func
        };
        this.chained_test_index_arr[this.test_index]++;
    }

    /**
     *
     * @param index
     */
    private startTests(index:number):void {
        this.it_method_arr[index](index);
        index++;
        this.nextTest(index);
    }

    /**
     *
     * @param index
     */
    private nextTest(index:number):void {
        if (this.it_method_arr[index]) {
            this.it_method_arr[index](index);
            index++;
            this.nextTest(index);
        }
    }

    /**
     * Collect all the Jasmine's it functions
     *
     * @param expect_name
     * @param expected_value
     */
    private push_it_method(expect_name:string, expected_value:any) {
        this.it_method_arr.push(
            (index:number):void => {

                let spec_name:string = this.spec_name_arr[index];

                it(spec_name, () => {

                    let expect_func:jasmine.Matchers;

                    expect_func = expect(this.methodListToTest(index));

                    //TODO: expected value and second params
                    expect_func[expect_name](expected_value);
                });
            }
        );

        this.test_index++;
        this.params_arr[this.test_index] = [];
        this.test_func_arr[this.test_index] = [];
        this.chained_test_index_arr[this.test_index] = 0;

    }

    /**
     * Compose sequence of methods and props to run, to obtain the desidered value used in the expect()
     * Jasmine's function
     *
     * @param index
     */
    private methodListToTest(index:number):T {

        /*console.log("\n\nindex", index);
        console.log("this.chained_test_index", this.chained_test_index_arr[index]);
        console.log("this.test_index", this.test_index);
        console.log("this.test_func_arr", this.test_func_arr);*/

        //var test_instance:T = this.test_class_instance_arr[index];
        var test_instance:T = this.test_class_instance_arr[0];

        for(let i = 0; i < this.chained_test_index_arr[index]; i++) {

            // TODO: def type of the follow
            var test_func_elem:any = this.test_func_arr[index][i];
            var test_type:string = test_func_elem.type;

            if (test_type === "prop") {
                test_instance = test_instance[test_func_elem.prop];
            }
            else {

                var test_func: any = test_func_elem.func;
                var params: Array<any> = this.params_arr[index][i];

                if (test_type === "custom") {
                    test_instance = test_func(test_instance);
                }
                else {
                    test_instance = test_func.apply(test_instance, params);
                }
            }
        }

        return test_instance;
    }

    /**
     *
     * @param arr
     */
    private destroyArray(arr:Array<any>) {
        var l:number = arr.length;
        for (var i = l - 1; i >= 0; i++) {
            arr.pop();
        }
    }

    /**
     * Create the test instance of the class passed in the init method
     */
    private createObject():void {

        var test_class_instance = new this.generic_class();

        this.test_class_instance_arr.push(test_class_instance);
        //this.test_class_instance_arr[0] = test_class_instance;

        var last_position = this.test_class_instance_arr.length - 1;
        var last_instance:T = this.test_class_instance_arr[last_position];

        // execution of init method if specified
        if (this.init_method == null) {
            return;
        }
        else if (last_instance[this.init_method]) {
            last_instance[this.init_method].apply(last_instance, this.init_params);
        }
        else {
            throw new Error("Fatal Error: " + this.init_method +
                " doesn't exists, use setInitMethod to set an initializer. " +
                "If not needed use setInitMethod(null)");
        }
    }

    /**
     *
     */
    private destroyObject() {

        var l:number = this.test_class_instance_arr.length;
        for(var i = 0; i < l; i++) {

            var instance:T = this.test_class_instance_arr[i];

            if (instance[this.destroy_method]) {
                instance[this.destroy_method]();
            }
            else {
                throw new Error("“Fatal Error: " + this.destroy_method + " doesn't exists, use setDestroyMethod " +
                    "to set a destroyer”")
            }

            instance = null;
        }

    }

} export {JasmineTestBuilder};