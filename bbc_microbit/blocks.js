// mBot.js


(function(ext) {
    var device = null;
   

       
	var tones ={"B0":31,"C1":33,"D1":37,"E1":41,"F1":44,"G1":49,"A1":55,"B1":62,
			"C2":65,"D2":73,"E2":82,"F2":87,"G2":98,"A2":110,"B2":123,
			"C3":131,"D3":147,"E3":165,"F3":175,"G3":196,"A3":220,"B3":247,
			"C4":262,"D4":294,"E4":330,"F4":349,"G4":392,"A4":440,"B4":494,
			"C5":523,"D5":587,"E5":659,"F5":698,"G5":784,"A5":880,"B5":988,
			"C6":1047,"D6":1175,"E6":1319,"F6":1397,"G6":1568,"A6":1760,"B6":1976,
			"C7":2093,"D7":2349,"E7":2637,"F7":2794,"G7":3136,"A7":3520,"B7":3951,
	"C8":4186,"D8":4699};
	var beats = {"Half":500,"Quarter":250,"Eighth":125,"Whole":1000,"Double":2000,"Zero":0};
	
	var startTimer = 0;
	
    ext.resetAll = function(){
    	device.send([0xff, 0x55, 2, 0, 4]);
    };
	ext.runArduino = function(){
		responseValue();
	};
		
	ext.showPixels = function(bytes){
		// convertir el string a butes
		runPackage(100,bytes);

	};

	ext.clearScreen = function(){

		runPackage(101);
	};

	ext.showNumber = function(num){
		runPackage(102, float2array(num) );
	};

	ext.showNumber100k = function(num){
		runPackage(103, float2array(num) );
	};

	ext.showText = function(text){
		runPackage(104, text.length, string2array(text) );
	};

	ext.plot = function(x, y){
		runPackage(105, x, y );
	};

	ext.unplot = function(x, y){
		runPackage(106, x, y  );
	};

	ext.togglePixel = function(x, y){
		runPackage(108, x, y  );
	};

	ext.setPixel = function(x, y, onoff){
		var state = 1;
		if(onoff=='Off' || onoff==0 || onoff==-1 || onoff=="LOW") state=0;
		runPackage(109, x, y, state  );
	};

	ext.stopAnim = function(){
		runPackage(107);
	};

	ext.getTemp = function(nextID){
	 getPackage(nextID,120);
	 };
	 
	ext.getLight = function(nextID){
		getPackage(nextID,121);
	};

	ext.getBtn = function(nextID, btn){
		btnid = 0; //A
		if(btn=="B") btnid=1;
		getPackage(nextID,125, btnid);
	};

	ext.getPin = function(nextID, pin){
		pinid = 0; //P0
		if(pin=="P1") pinid=1;
		if(pin=="P2") pinid=2;
		getPackage(nextID,126, pinid);
	};
	ext.runTone = function(tone, beat){
		if(typeof tone == "string"){
			tone = tones[tone];
		}
		if(typeof beat == "string"){
			beat = parseInt(beat) || beats[beat];
		}
		runPackage(34,short2array(tone), short2array(beat));
	};
	
	ext.stopTone = function(){
		runPackage(34,short2array(0));
	};

    ext.runServo = function(port,slot,angle) {
		if(typeof port=="string"){
			port = ports[port];
		}
		if(typeof slot=="string"){
			slot = slots[slot];
		}
		if(angle > 180){
			angle = 180;
		}
        runPackage(11,port,slot,angle);
    };
	

	ext.resetTimer = function(){
		startTimer = (new Date().getTime())/1000.0;
		responseValue();
	};
	


 	 

    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        potentialDevices.push(dev);
        if (!device) {
            tryNextDevice();
        }
    }

    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        if (device) {
            device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 0 }, deviceOpened);
        }
    }

    var watchdog = null;
    function deviceOpened(dev) {
        if (!dev) {
            // Opening the port failed.
            tryNextDevice();
            return;
        }
        device.set_receive_handler('bbc_microbit',processDataMProtocol/*processData*/);
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
    };

    ext._shutdown = function() {
        if(device) device.close();
        device = null;
    };

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'micro:bit'};
        if(watchdog) return {status: 1, msg: 'Probing for micro:bit'};
        return {status: 2, msg: 'micro:bit connected'};
    }
    var descriptor = {};
	ScratchExtensions.register('bbc_microbit', descriptor, ext, {type: 'serial'});
})({});
