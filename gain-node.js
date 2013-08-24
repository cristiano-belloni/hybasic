define(['require'], function() {
  
    var pluginConf = {
        name: "Gain Node",
        osc: false,
        audioOut: 1,
        audioIn: 1,
        version: '0.0.1-alpha1',
        hostParameters : {
            enabled: true,
            parameters: {
                gain: {
                    name: ['Gain'],
                    label: 'ms',
                    range: {
                        min: 0,
                        default: 1,
                        max: 12
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

        this.gainNode = this.context.createGain();
        
        this.audioSource.connect(this.gainNode);
        this.gainNode.connect(this.audioDestination);

        /* Parameter callbacks */
        var onParmChange = function (id, value) {
            this.pluginState[id] = value;
            if (id === 'gain') {
                this.gainNode.gain.value = value;
            }
        }

        if (args.initialState && args.initialState.data) {
            /* Load data */
            this.pluginState = args.initialState.data;
        }
        else {
            /* Use default data */
            this.pluginState = {
                gain: pluginConf.hostParameters.parameters.gain.range.default
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
        args.hostInterface.setSaveState (saveState);
        args.hostInterface.setHostCallback (onParmChange);

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