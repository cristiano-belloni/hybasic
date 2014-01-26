define(['require'], function() {
  
    var pluginConf = {
        name: "Delay Node",
        osc: false,
        audioOut: 1,
        audioIn: 1,
        version: '0.0.1',
	hyaId: 'BASICDelayNode',
        hostParameters : {
            enabled: true,
            parameters: {
                delayTimeS: {
                    name: ['sec.'],
                    label: 's',
                    range: {
                        min: 0,
                        default: 0,
                        max: 5
                    }
                },
                delayTimeMs: {
                    name: ['msec.'],
                    label: 'ms',
                    range: {
                        min: 0,
                        default: 0,
                        max: 1000
                    }
                }
            }
        }
    };
  
    var pluginFunction = function(args) {
        
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;

        this.delayNode = this.context.createDelay(pluginConf.hostParameters.parameters.delayTimeS.range.max + pluginConf.hostParameters.parameters.delayTimeMs.range.max / 1000);
        
        this.audioSource.connect(this.delayNode);
        this.delayNode.connect(this.audioDestination);

        /* Parameter callbacks */
        var onParmChange = function (id, value) {
            this.pluginState[id] = value;
            var delay = this.pluginState.delayTimeS + this.pluginState.delayTimeMs / 1000;
            this.delayNode.delayTime.value = delay;
        }

        if (args.initialState && args.initialState.data) {
            /* Load data */
            this.pluginState = args.initialState.data;
        }
        else {
            /* Use default data */
            this.pluginState = {
                delayTimeS: pluginConf.hostParameters.parameters.delayTimeS.range.default,
                delayTimeMs: pluginConf.hostParameters.parameters.delayTimeMs.range.default
            };
        }

        for (param in this.pluginState) {
            if (this.pluginState.hasOwnProperty(param)) {
                args.hostInterface.setParm (param, this.pluginState[param]);
                onParmChange.apply (this, [param, this.pluginState[param]]);
            }
        }

        var saveState = function () {
            return { data: this.pluginState };
        };
        args.hostInterface.setSaveState (saveState.bind(this));
        args.hostInterface.setHostCallback (onParmChange.bind(this));

        // Initialization made it so far: plugin is ready.
        args.hostInterface.setInstanceStatus ('ready');
    };
    
    
    var initPlugin = function(initArgs) {
        var args = initArgs;

        pluginFunction.call (this, args);
    
    };
        
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});
