/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    var ns = namespace('DependencyInjection');

    /**
     * Dependency Injection Container
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Container = Class({

        'private object definitions'   : {},
        'private object parameters'    : {},
        'private object loading'       : {},
        'private object passes'        : [],
        'private boolean is_frozen'    : false,
        'private boolean is_compiling' : false,

        'private __construct': function() {
            return this.api;
        },

        /**
         * Creates a new Definition based on the passed name and function
         * and returns it.
         *
         * @param string name
         * @param mixed fn Function or string referencing the function.
         */
        'public function register': function(name, fn)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions[name] = new ns.Definition(fn);
            return this.definitions[name];
        },

        /**
         * Adds a CompilerPass to this container.
         *
         * A compiler pass must have a compile() method which accepts the
         * Container as its one and only argument. The CompilerPass may
         * add, alter or remove service definitions as it sees fit.
         *
         * @param CompilerPass compiler_pass
         */
        'public function addCompilerPass': function(compiler_pass)
        {
            if (typeof(compiler_pass) === 'function') {
                compiler_pass = new compiler_pass();
            }
            if (typeof(compiler_pass.compile) !== 'function') {
                throw new Error('The CompilerPass doesn\'t have a compile function.');
            }
            this.passes.push(compiler_pass);
        },

        /**
         * Runs all compiler passes. After this process is complete, the
         * container is marked as frozen and no more definitions may be
         * added.
         */
        'public function compile': function()
        {
            if (this.is_compiling) {
                throw new Error('The container is already compiling.');
            }
            this.is_compiling = true;
            if (this.is_frozen) {
                throw new Error('Unable to compile a container which is already compiled.');
            }
            for (var i in this.passes) {
                this.passes[i].compile(this);
            }
            this.is_compiling = false;
            this.is_frozen = true;
        },

        /**
         * Returns true if this container is already compiled.
         *
         * @return bool
         */
        'public function isFrozen': function()
        {
            return this.is_frozen;
        },

        /**
         * Returns the service with the associated id.
         *
         * @param string id
         * @return Object
         */
        'public function get': function(id)
        {
            // Compile the container first if it hasn't been compiled yet.
            if (!this.is_frozen) {
                this.compile();
            }

            if (typeof(this.definitions[id]) === 'undefined') {
                throw new Error('Service ' + id + ' does not exist.');
            }
            var definition = this.definitions[id];

            // Do we already have an instance of this definition?
            if (definition.hasInstance()) {
                return definition.getInstance();
            }

            // Circular reference check
            if (this.loading[id] === true) {
                throw new Error('Service ' + id + ' has a circular reference to itself.');
            }
            this.loading[id] = true;

            // Create the service
            var service = this.createService(definition);

            // Remove the circular reference check
            delete this.loading[id];
            return service;
        },

        /**
         * Initializes the service definition and returns its function
         * instance.
         *
         * @access private
         * @return Object
         */
        'public function createService': function(definition)
        {
            if (definition.hasInstance()) {
                throw new Error('Attempt to create a service that already has an instance.');
            }

            // Build up an array of arguments to pass to the constructor.
            var c_args = this.getParameterArray(definition.getArguments());

            // Construct function to use '.apply' on 'new' objects.
            var construct = function(c, args) {
                var cc = function() { return c.apply(this, args); };
                cc.prototype = c.prototype; return new cc();
            };

            var fn       = definition.getFunction(),
                instance = construct(fn, c_args);

            definition.setInstance(instance);

            var calls = definition.getMethodCalls();
            for (var i in calls) {
                if (!calls.hasOwnProperty(i)) {
                    continue;
                }
                var method = calls[i][0];
                var args   = this.getParameterArray(calls[i][1] || []);
                if (typeof(instance[method]) !== 'function') {
                    throw new Error('Method ' + method + ' does not exist.');
                }
                instance[method].apply(instance, args);
            }
            return instance;
        },

        'public function getServiceIds': function()
        {
            var result = [];
            for (var i in this.definitions) {
                if (this.definitions.hasOwnProperty(i)) {
                    result.push(i);
                }
            }
            return result;
        },

        /**
         * Sets the service definitions.
         *
         * @param DependencyInjection.Definition[] An array of Definitions.
         * @return DependencyInjection.Container
         */
        'public function setDefinitions': function(definitions)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions = {};
            this.addDefinitions(definitions);
            return this.api;
        },

        /**
         * Adds the service definitions.
         *
         * @param Definition[] definitions An array of service definitions.
         * @return DependencyInjection.Container
         */
        'public function addDefinitions': function(definitions)
        {
            for (var i in definitions) {
                if (definitions.hasOwnProperty(i)) {
                    var def = definitions[i];
                    this.setDefinition(i, def);
                }
            }
            return this.api;
        },

        /**
         * Sets a service definition.
         *
         * @param string id The id of the service
         * @param DepedencyInjection.Definition definition
         * @return DepedencyInjection.Container
         */
        'public function setDefinition': function(id, definition)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions[id] = definition;
            return this.api;
        },

        /**
         * Returns true if a service definition exists under the
         * given identifier.
         *
         * @return bool
         */
        'public function hasDefinition': function(id)
        {
            return typeof(this.definitions[id]) !== 'undefined';
        },

        /**
         * Gets a service definition.
         *
         * @param string id The service identifier
         * @return DependencyInjection.Definition
         */
        'public function getDefinition': function(id)
        {
            if (typeof(this.definitions[id]) === 'undefined') {
                throw new Error('The service definition ' + id + ' does not exist.');
            }
            return this.definitions[id];
        },

        /**
         * Returns an array of tag attributes indexed by service id.
         *
         * @param string name
         * @return array
         */
        'public function findTaggedServiceIds': function(name)
        {
            var result = {};
            for (var i in this.definitions) {
                if (!this.definitions.hasOwnProperty(i)) {
                    continue;
                }
                if (this.definitions[i].hasTag(name)) {
                    result[i] = this.definitions[i].getTag(name);
                }
            }
            return result;
        },

        /**
         * Sets the parameters array.
         *
         * @param  Object parameters
         * @return DepedencyInjection.Container
         */
        'public function setParameters': function(parameters)
        {
            if (this.is_frozen) {
                throw new Error('Unable to update parameters on a frozen container.');
            }
            this.parameters = parameters;
            return this.api;
        },

        /**
         * Sets a parameter.
         *
         * @param string name
         * @param mixed value
         * @return DepedencyInjection.Container
         */
        'public function setParameter': function(name, value)
        {
            if (this.is_frozen) {
                throw new Error('Unable to update parameters on a frozen container.');
            }
            this.parameters[name] = value;
            return this.api;
        },

        /**
         * Returns true if a parameter with the given name exists.
         *
         * @param string name
         * @return bool
         */
        'public function hasParameter': function(name)
        {
            return typeof(this.parameters[name]) !== 'undefined';
        },

        /**
         * Returns the value of the parameter with the given name.
         *
         * @param string name
         * @return mixed
         */
        'public function getParameter': function(name)
        {
            if (typeof(this.parameters[name]) !== 'undefined') {
                return this.parameters[name];
            }
            throw new Error('Parameter ' + name + ' does not exist.');
        },

        /**
         * Returns a parsed parameter array.
         *
         * @access private
         * @param array arr
         * @return arr
         */
        'private function getParameterArray': function(arr)
        {
            var args = [];
            for (var i in arr) {
                var arg = arr[i];
                if (typeof(arg) === 'string') {
                    arg = this.resolveParameter(arg);
                }
                args.push(arg);
            }
            return args;
        },

        /**
         * Resolves a parameter.
         *
         * If the value starts with an @, a service is referenced.
         * If the value is omitted with %, a parameter is referenced.
         *
         * @access private
         * @param string value
         * @return mixed
         */
        'private function resolveParameter': function(value)
        {
            if (typeof(value) !== 'string') {
                return value;
            }

            if (value.charAt(0) === '@') {
                return this.get(value.slice(1, value.length));
            }

            if (value.charAt(0) === '%' && value.charAt(value.length - 1) === '%') {
                return this.getParameter(value.slice(1, value.length - 1));
            }

            return value;
        }
    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
