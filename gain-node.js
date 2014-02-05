define(['require', 'github.com:mout/mout@0.9.0/src/function/throttle'], function(require, throttle) {
  
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

        this.updateModel = function (param, value) {
            this.pluginState[param] = value;
        };

        this.updateGUIView = function (param) {
            args.hostInterface.setParm (param, this.pluginState[param]);
        };

        this.updateAudioView = function (param, value, when) {
            if (param === 'gain') {
                // Immediate
                if (!when || !value) {
                    this.gainNode.gain.value = this.pluginState[param];
                }
                else {
                    // Deferred, use a value
                    // TODO automate the gain node.
                }
            }
        };

        this.tUpdateGUIView = {
            "gain": throttle(function () {
                this.updateGUIView("gain");
            } , 500).bind(this)
        };

        /* Parameter callbacks */
        var onParmChange = function (id, value) {
            this.updateModel(id, value);
            this.updateAudioView (id);
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
                this.updateAudioView (param);
                this.updateGUIView (param);
            }
        }

        var onMIDIMessage = function (message, when) {
            var now, parmName, setValue, delta;
            
            if (message.type === 'controlchange') {
                /* http://tweakheadz.com/midi-controllers/ */
                // Using undefined controls
                if (message.control === 21) {
                        parmName = "gain";
                }
                else {
                    return;
                }
            }
             
            if (parmName) {

                setValue = K2.MathUtils.linearRange (message.value / 127 * pluginConf.hostParameters.parameters[parmName].range.max);
                now = this.context.currentTime;
                delta = when - now;

                if (delta < 0) {
                    console.eror ("Gain: Out of time CC Message", delta);
                }
                                
                if (!when || delta < 0) {
                    // Immediately
                    this.updateModel(parmName, setValue);
                    this.updateAudioView (parmName);
                    this.updateGUIView (parmName);
                }
                else {
                    // Deferred
                    setTimeout (function() {
                        // This changes the plugin state and the GUI in the future, loosely 
                        this.updateModel(parmName, setValue);
                        this.tUpdateGUIView[parmName]();
                    }, delta * 1000);
                    // This changes the audio view in the future
                    this.updateAudioView (parmName, setValue, when);
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
