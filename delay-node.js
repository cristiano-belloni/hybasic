define(['require'], function() {
  
    var pluginConf = {
        name: "Delay Node",
        osc: false,
        audioOut: 1,
        audioIn: 1,
        version: '0.0.1-alpha1',
        hostParameters : {
            enabled: true,
            parameters: {
                delayTime: {
                    name: ['Delay'],
                    label: 'ms',
                    range: {
                        min: 0,
                        default: 0,
                        max: 5000
                    }
                }
            }
        }
    };
  
    var pluginFunction = function(args, resources) {
        
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;

        if (args.initialState && args.initialState.data) {
            /* Load data */
            this.pluginState = args.initialState.data;    
        }
        else {
            /* Use default data */
            this.pluginState = {
                delayTime: 0
            };
        }

        this.delayNode = this.context.createDelay(pluginConf.hostParameters.parameters.delayTime.range.max / 1000);
        
        this.audioSource.connect(this.delayNode);
        this.delayNode.connect(this.audioDestination);

        /* Parameter callbacks */
        var onParmChange = function (id, value) {
            this.pluginState[id] = value;
            if (id === 'delayTime') {
                this.delayNode.delayTime.value = value / 1000;
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