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

    ns.AbstractAnnotation = Class({ 'abstract': true }, {

        'final public immutable name'          : null,
        'final protected immutable definition' : null,
        'final protected immutable method'     : null,
        'final protected immutable data'       : null,

        'final private __construct' : function (definition, method, name, data) {
            this.definition = definition;
            this.method     = method;
            this.name       = name;
            this.data       = data;
        },

        'final public function toString' : function () {
            return '[Annotation ' + this.getName() + ': ' + this.getData() + ']';
        },

        /**
         * Returns true if this Annotation accepts the given name.
         *
         * @param string name
         * @return bool
         */
        'abstract public function accepts' : function (name) {}
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));