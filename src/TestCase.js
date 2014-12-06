/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    // Namespace declaration
    var ns = namespace('');

    /**
     * JOII-Unit TestCase
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.TestCase = Class({

        /**
         * Allow executing this class as a function and delegate the call to
         * TestCase.Register
         */
        __call: function() {
            ns.TestCase.Register.apply(undefined, arguments);
        },

        // Callbacks
        'final public object on_pass' : null,
        'final public object on_fail' : null,

        'final private __construct' : function (on_pass, on_fail) {
            this.on_pass = on_pass || function (m, a, e, t) {};
            this.on_fail = on_fail || function (m, a, e, t) {
                throw new Error(m + "\n  Expected : " + JSON.stringify(e) + "\n  Actual   : " + JSON.stringify(a) + "\n");
            };
        },

        // Registers a passed test.
        'final private function pass' : function(message, actual, expected) {
            try { throw new Error(message); } catch (e) { trace = e.stack; }
            this.on_pass(message, actual, expected, trace);
        },

        // Registers a failed test.
        'final private function fail' : function(message, actual, expected) {
            // Throw an Error to generate a trace
            var trace = [];
            try { throw new Error(message); } catch (e) { trace = e.stack; }
            this.on_fail(message, actual, expected, trace);
        }

    });

    ns.TestCase.Register = function(name, body) {

        var unit = JOII.Unit.instance;
        if (typeof unit === 'undefined') {
            throw new Error('Unable to register a TestCase without an active JOII.Unit instance.');
        }

        // Append "Test" to the TestCase name.
        if (name.substr(name.length - 4) !== 'Test') {
            name += 'Test';
        }

        // Gather and apply traits
        var i, traits = [];
        for (i in JOII.Unit.TestCase.Traits) {
            traits.push(JOII.Unit.TestCase.Traits[i]);
        }

        var testcase = Class(name, { 'extends': JOII.Unit.TestCase, uses: traits }, body)
        unit.getContainer().get('joii.unit.test_manager').addTest(testcase);
    }

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
