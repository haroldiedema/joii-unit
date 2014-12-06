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

    ns.DataProvider = Class('JOII.Unit.Annotation.DataProvider', {
        'extends'    : JOII.Unit.AbstractAnnotation,
        'implements' : ['UAB_TestExecutor']
    }, {

        'private string provider' : null,

        /** @override */
        'public function accepts' : function(name) {
            return name.toLowerCase() === 'dataprovider';
        },

        /** @override */
        'public function init' : function() {
            this.provider = JSON.parse(this.getData());
            if (!this.getDefinition().reflector.hasMethod(this.provider)) {
                throw new Error('DataProvider \'' + this.provider + '\' for method \'' + this.getMethod() + '\' in TestCase \'' + this.getDefinition().reflector.getName() + '\' does not exist.');
            }
        },

        /**
         * @see UA_TestExecutorBehavior.execute
         */
        'public function execute' : function(fn) {
            var inst     = new this.definition;
            var args_col = inst[this.provider]();

            for (var i in args_col) {
                fn.apply(undefined, args_col[i]);
            }
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));