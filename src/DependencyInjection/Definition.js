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
     * Dependency Injection Definition
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Definition = Class({

        'private object name'      : null,
        'private object fn'        : null,
        'private object instance'  : null,
        'private object api'       : null,
        'private object is_public' : true,
        'private object args'      : [],
        'private object calls'     : [],
        'private object tags'      : {},

        /**
         * @param string name The name of this definition.
         * @param mixed  fn   Function or string referencing the function.
         */
        'private __construct': function(fn)
        {
            if (typeof(fn) !== 'function') {
                this.fn = this.findFunctionFromString(fn);
            } else {
                this.fn = fn;
            }
        },

        /**
         * Adds an argument to pass to the service constructor.
         *
         * @param mixed value
         * @return DependencyInjection.Definition
         */
        'public function addArgument': function(argument)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.args.push(argument);
            return this;
        },

        /**
         * Sets the arguments to pass to the service constructor.
         *
         * @param mixed value
         * @return DependencyInjection.Definition
         */
        'public function setArguments': function(args)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.args = args;
            return this;
        },

        /**
         * Gets the arguments to pass to the service constructor.
         *
         * @return array
         */
        'public function getArguments': function()
        {
            return this.args;
        },

        /**
         * Sets the methods to call after service initialization.
         *
         * @param array calls
         * @return DependencyInjection.Definition
         */
        'public function setMethodCalls': function(calls)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.calls = [];
            for (var i in calls) {
                if (calls.hasOwnProperty(i)) {
                    this.calls[i] = calls[i];
                }
            }
            return this;
        },

        /**
         * Adds a method to call after service initialization.
         *
         * @param string method
         * @param array  args
         * @return DependencyInjection.Definition
         */
        'public function addMethodCall': function(method, args)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            args = args || [];
            this.calls.push([method, args]);
            return this;
        },

        /**
         * Removes a method call from this definition by the given name.
         *
         * @param string method
         * @return DependencyInjection.Definition
         */
        'public function removeMethodCall': function(method)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            for (var i in this.calls) {
                if (this.calls[i][0] === method) {
                    delete this.calls[i];
                }
            }

            return this;
        },

        /**
         * Check if the current definition has a given method to call after
         * service initialization.
         *
         * @return bool
         */
        'public function hasMethodCall': function(method)
        {
            for (var i in this.calls) {
                if (this.calls[i][0] === method) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets the methods to call after service initialization.
         *
         * @return array
         */
        'public function getMethodCalls': function()
        {
            return this.calls;
        },

        /**
         * Sets tags for this definition.
         *
         * @param array tags
         * @return DependencyInjection.Definition
         */
        'public function setTags': function(tags)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.tags = tags;
            return this;
        },

        /**
         * Returns all tags.
         *
         * @return array
         */
        'public function getTags': function()
        {
            return this.tags;
        },

        /**
         * Gets a tag by name.
         *
         * @param string name The tag name
         * @return array An array of attributes
         */
        'public function getTag': function(name)
        {
            return typeof(this.tags[name]) !== 'undefined'
                ? this.tags[name] : [];
        },

        /**
         * Add a tag for this definition.
         *
         * @param string name
         * @param array attributes
         * @return DependencyInjection.Definition
         */
        'public function addTag': function(name, attributes)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            if (typeof(this.tags[name]) === 'undefined') {
                this.tags[name] = [];
            }
            this.tags[name].push(attributes);
            return this;
        },

        /**
         * Returns true if this definition has a tag with the given name.
         *
         * @return bool
         */
        'public function hasTag': function(name)
        {
            return typeof(this.tags[name]) !== 'undefined';
        },

        /**
         * Clears tags with the given name.
         *
         * @return DependencyInjection.Definition
         */
        'public function clearTag': function(name)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            if (typeof(this.tags[name]) !== 'undefined') {
                delete this.tags[name];
            }
            return this;
        },

        /**
         * @return DependencyInjection.Definition
         */
        'public function clearTags': function()
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.tags = {};
            return this;
        },

        /**
         * Sets the visibility of this service.
         *
         * @return DependencyInjection.Definition
         */
        'public function setPublic': function(flag)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.is_public = flag;
            return this;
        },

        /**
         * Returns true if this definition is public.
         *
         * Being public means it's retrievable from the container. A private
         * service is only usable as a dependency on other services.
         *
         * @return bool
         */
        'public function isPublic': function()
        {
            return this.is_public;
        },

        /**
         * Returns true if this definition has an instance of the function
         * associated with it.
         *
         * @return bool
         */
        'public function hasInstance': function()
        {
            return !!this.instance;
        },

        /**
         * Returns the associated instance.
         *
         * @return Object
         */
        'public function getInstance': function()
        {
            if (typeof(this.instance) !== 'undefined') {
                return this.instance;
            }
            throw new Error('Definition is not initialized.');
        },

        /**
         * Sets the instance for this definition.
         *
         * @param object instance
         * @return DependencyInjection.Definition
         */
        'public function setInstance': function(instance)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.instance = instance;
            return this;
        },

        /**
         * Returns the function associated with this Definition.
         *
         * @return Function
         */
        'public function getFunction': function()
        {
            return this.fn;
        },

        /**
         * Finds the given function by string reference.
         *
         * @access private
         * @return function
         */
        'private function findFunctionFromString': function(str)
        {
            if (str.indexOf('.') === -1) {
                // There are no namespace separators, just return it.
                if (typeof(g[str]) === 'function') {
                    return g[str];
                }
                throw new Error(str + ' is undefined or not a function.');
            }
            var chunks  = str.split('.'),
                result  = g,
                str_rep = '',
                current;
            while ((current = chunks.shift())) {
                str_rep += current;
                if (typeof(result[current]) === 'undefined' || (
                    typeof(result[current]) !== 'object' &&
                    typeof(result[current]) !== 'function')) {
                    throw new Error(str_rep + ' is undefined or not iterable.');
                }
                result = result[current];
                str_rep += '.';
            }
            return result;
        }

    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
