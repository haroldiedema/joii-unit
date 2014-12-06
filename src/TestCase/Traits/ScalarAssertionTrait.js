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
    var ns = namespace('TestCase.Traits');

    /**
     * Contains assertion methods to be used in a TestCase.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AssertScalar = {

        'final protected assert' : function (p, m, a, e) {
            this[(p === true) ? 'pass' : 'fail'](m, a, e);
        },

        /**
         * Assert the given value equals true in a strict comparison.
         *
         * @param mixed  a
         * @param string message
         */
        'final protected function assertTrue' : function(a, message) {
            this.assert(a === true, message, a, true);
        },

        /**
         * Assert the given value equals false in a strict comparison.
         *
         * @param mixed  a
         * @param string message
         */
        'final protected function assertFalse' : function(a, message) {
            this.assert(a === false, message, a, false);
        },

        /**
         * Perform a non-strict equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertEqual' : function(a, b, message) {
            this.assert(a == b, message, a, b);
        },

        /**
         * Perform a non-strict not-equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertNotEqual' : function(a, b, message) {
            this.assert(a != b, message, a, b);
        },

        /**
         * Perform a strict equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertEqualStrict' : function(a, b, message) {
            this.assert(a === b, message, a, b);
        },

        /**
         * Perform a strict not-equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertNotEqualStrict' : function(a, b, message) {
            this.assert(a !== b, message, a, b);
        }
    };

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
