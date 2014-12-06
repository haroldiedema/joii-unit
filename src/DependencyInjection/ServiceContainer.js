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
     * Dependency Injection ServiceContainer
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.ServiceContainer = Class({

        'private object container' : null,

        'private __construct': function(container)
        {
            if (typeof(container) === 'undefined' || !container) {
                container = new ns.Container();
            }
            this.container = container;
        },

        /**
         * Returns the container.
         *
         * @return DependencyInjection.Container
         */
        'public function getContainer': function()
        {
            return this.container;
        },

        /**
         * Loads configuration which will be parsed and injected into
         * the Container.
         *
         * @return DependencyInjection.ContainerBuilder
         */
        'public function loadConfiguration': function(config)
        {
            if (typeof(config) !== 'object') {
                throw new Error('loadConfiguration expectes an object, ' + typeof(config) + ' given.');
            }
            if (typeof(config.parameters) === 'undefined' &&
                typeof(config.services) === 'undefined') {
                throw new Error("The configuration object must have a 'parameters' and/or 'services' element.");
            }

            // If we have 'parameters' object in the config...
            if (typeof(config.parameters) === 'object') {
                this.loadParameters(config.parameters);
            }

            // If we have a 'services' object in the config...
            if (typeof(config.services) === 'object') {
                for (var i in config.services) {
                    if (!config.services.hasOwnProperty(i)) {
                        continue;
                    }
                    this.loadService(i, config.services[i]);
                }
            }
        },

        /**
         * Iterates over the parameters object and injects them into the
         * Container being built.
         *
         * @access private
         */
        'private function loadParameters': function(parameters)
        {
            for (var i in parameters) {
                if (!parameters.hasOwnProperty(i)) {
                    continue;
                }
                this.container.setParameter(i, parameters[i]);
            }
        },

        /**
         * Creates a service definition.
         *
         * @access private
         * @param string id
         * @param object config
         */
        'private function loadService': function(id, config)
        {
            var def = this.container.register(id, config['class']);

            // Set constructor arguments
            if (typeof(config.arguments) !== 'undefined') {
                def.setArguments(config.arguments);
            }

            // Set method calls
            if (typeof(config.calls) !== 'undefined') {
                def.setMethodCalls(config.calls);
            }

            // Set tags
            if (typeof(config.tags) !== 'undefined') {
                def.setTags(config.tags);
            }
        }
    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
