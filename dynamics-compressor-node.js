define(['require'], function() {
  
    var pluginConf = {
        name: "Compressor Node",
        osc: false,
        audioOut: 1,
        audioIn: 1,
        version: '0.0.1-alpha1',
        hostParameters : {
            enabled: true,
            parameters: {
                threshold: {
                    name: ['Threshold', 'Thrs'],
                    label: 'dB',
                    range: {
                        min: -100,
                        default: -24,
                        max: 0
                    }
                },
                knee: {
                    name: ['Knee', 'Kn'],
                    label: 'dB',
                    range: {
                        min: 0,
                        default: 30,
                        max: 40
                    }
                },
                ratio: {
                    name: ['Ratio', 'Rt'],
                    label: 'dB',
                    range: {
                        min: 1,
                        default: 12,
                        max: 20
                    }
                },
                attack: {
                    name: ['Attack', 'A'],
                    label: 'ms',
                    range: {
                        min: 0,
                        default: 3,
                        max: 1000
                    }
                },
                release: {
                    name: ['Release', 'R'],
                    label: 'ms',
                    range: {
                        min: 0,
                        default: 250,
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
        this.compNode = this.context.createDynamicsCompressor();
        this.audioSource.connect(this.compNode);
        this.compNode.connect(this.audioDestination);

        /* Parameter callback */
        var onParmChange = function (id, value) {
            this.pluginState[id] = value;
            var val = value;
            if ((id === 'attack') || (id === 'release')) {
                val /= 1000;
            }
            this.compNode[id].value = val;
        };

        if (args.initialState && args.initialState.data) {
            /* Load data */
            this.pluginState = args.initialState.data;
        }
        else {
            /* Use default data */
            this.pluginState = {
                threshold: pluginConf.hostParameters.parameters.threshold.range.default,
                knee: pluginConf.hostParameters.parameters.knee.range.default,
                ratio: pluginConf.hostParameters.parameters.ratio.range.default,
                attack: pluginConf.hostParameters.parameters.attack.range.default,
                release: pluginConf.hostParameters.parameters.release.range.default
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