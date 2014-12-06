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
    var ns = namespace('Annotation');

    ns.ExpectedException = Class('JOII.Unit.Annotation.ExpectedException', {
        'extends'    : JOII.Unit.AbstractAnnotation,
        'implements' : ['UAB_Exception']
    }, {

        /** @override */
        'public function accepts' : function(name) {
            return name.toLowerCase() === 'expectedexception';
        },

        /** @override */
        'public function init' : function() {
            var message = JSON.parse(this.getData());
        },

        /**
         * @see UAB_Exception.isValid
         */
        'public function isValid' : function(e) {
            return this.getExceptionString(e) === this.getExpectedExceptionString();
        },

        /**
         * @see UAB_Exception.getExceptionString
         */
        'public function getExceptionString' : function (e) {
            if (typeof e === 'object') {
                return e.message;
            }
            return e;
        },

        /**
         * @see UAB_Exception.getExpectedExceptionString
         */
        'public function getExpectedExceptionString' : function () {
            return JSON.parse(this.getData());
        }
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));