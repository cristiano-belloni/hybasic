define(['require'], function() {
  
    var pluginConf = {
        name: "Dynamics Compressore Node",
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
  
    var pluginFunction = function(args, resources) {
        
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;

        this.compNode = this.context.createDynamicsCompressor();
        
        this.audioSource.connect(this.compNode);
        this.compNode.connect(this.audioDestination);

        /* Parameter callbacks */
        this.onParmChange = function (id, value) {
            var val = value;
            if ((id === 'attack') || (id === 'release')) {
                val /= 1000;
            }
            this.compNode[id].value = val;
        }

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