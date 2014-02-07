define(['require', 'github:mout/mout@master/src/function/throttle'], function(require, throttle) {
  
    var pluginConf = {
        name: "Gain Node",
        audioOut: 1,
        audioIn: 1,
        version: '0.0.1',
	hyaId: 'BASICGainNode',
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


        this.setAudioParm = function (param, value, when) {
            switch (param) {
                case 'gain':
                    if (when) {
                        this.gainNode.gain.setValueAtTime(value, when);
                    }
                    else {
                        this.gainNode.gain.setValueAtTime(value, this.context.currentTime);
                    }
                break;
            }
        };
        this.getAudioParam = function (param) {
            return this.gainNode.gain.value;
        };

        this.modelToAudio = function (param) {
            this.setAudioParm(param, this.pluginState[param], 0);
        };
        this.setModel = function (param, value) {
            this.pluginState[param] = value;
        };
        this.modelToGUI = function (param) {
            args.hostInterface.setParm (param, this.pluginState[param]);
        };
        this.audioToModel = function (param) {
                this.setModel(param, this.getAudioParam(param));
        };
        this.animate = function (param) {
            // This changes the plugin state and the GUI in the future, loosely 
            this.tAudioToModel[param]();
            this.modelToGUI(param);
        }.bind(this);

        this.tAudioToModel = {
            "gain": throttle(function () {
                this.audioToModel("gain");
            } , 500).bind(this)
        };

        /* Parameter callbacks */
        var onParmChange = function (id, value) {
            this.setModel(id, value);
            this.modelToAudio(id);
        };

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

        for (var param in this.pluginState) {
            if (this.pluginState.hasOwnProperty(param)) {
                this.modelToAudio (param);
                this.modelToGUI (param);
            }
        }

        var onMIDIMessage = function (message, when) {
            var now, parmName, setValue, delta;
            
            if (message.type === 'controlchange') {
                /* http://tweakheadz.com/midi-controllers/ */
                // Using control number 21
                if (message.control === 21) {
                        parmName = "gain";
                }
                else {
                    return;
                }
            }
             
            if (parmName) {

                setValue = message.value / 127 * pluginConf.hostParameters.parameters[parmName].range.max;
                now = this.context.currentTime;
                delta = when - now;

                if (delta < 0) {
                    console.error ("Gain: Out of time CC Message", delta);
                }
                                
                if (!when || delta < 0) {
                    // Immediately
                    this.setModel(parmName, setValue);
                    this.modelToAudio (parmName);
                    this.modelToGUI (parmName);
                }
                else {
                    // Deferred
                    setTimeout (this.animate, delta * 1000, parmName);
                    // This automates audio in the future.
                    this.setAudioParm(parmName, setValue, when);
                }
            }
        };
        args.MIDIHandler.setMIDICallback (onMIDIMessage.bind (this));

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
