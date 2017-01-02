(function (ext) {
    var embeditAppID = "dbhfnkcnljcbbpocflmbfcobkmagpgpf";
    //port connecting to chrome app
    var hPort;
    //connection status
    var hStatus = 0;
    var isDuo;
	var ledStatus = 0;
    //sensor info
    var sensorvalue = new Array(32);
    //when a new message is recieved, save all the info
    var onMsgCircuitPlayground = function (msg) {
        sensorvalue = msg;
    };
    function fitTo255(num) {
        return Math.max(Math.min(num,255.0),0.0);
    }
	
	//convert scratch hex color to rgb for neopixels
	function hexToRgb(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

	
    //gets the connection status fo the circuit playground
    var getCircuitPlaygroundStatus = function () {
        //console.log("status"); 
        chrome.runtime.sendMessage(embeditAppID, {message: "STATUS"}, function (response) {
            if (response === undefined) { //Chrome app not found
                console.log("Chrome app not found");
                hStatus = 0;
                setTimeout(getCircuitPlaygroundStatus, 2000);
            }
            else if (response.status === false) { //Chrome app says not connected
                if (hStatus !== 1) {
                    console.log("Not connected");
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 1;
                setTimeout(getCircuitPlaygroundStatus, 2000);
            }
            else {// successfully connected
                if (hStatus !==2) {
                    console.log("Connected");
                    isDuo = response.duo;
                    console.log("isDuo: " + isDuo);
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 2;
                setTimeout(getCircuitPlaygroundStatus, 2000);
            }
        });
    };
	
    //all the below functions take in a portnum, it is assumed that the port
    //has the appropriate device connected to it.
	
	//set a neopixel on the circuit playground
	ext.setRingLed = function (lednum, redC, greenC, blueC) {
        lednum--;
		if(lednum < 0) lednum = 0;//make sure our neopixel number is in bounds
		if(lednum > 9) lednum = 9;
		
		redC = fitTo255(redC); //fit our input to 0-255 range
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo ring:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);//output result to console
		
		//our hid report to send to the circuit playground. Letter "O" tells it this is the neopixel ring command
        var report = {
            message: "O".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
    };
	
	ext.setRowLed = function (lednum, redC, greenC, blueC) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        lednum--;
		
		if(lednum < 0) lednum = 0;
		//if(lednum > 7) lednum = 7;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo row:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "R".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
    };
	
	ext.setColLed = function (lednum, redC, greenC, blueC) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        lednum--;
		
		if(lednum < 0) lednum = 0;
		//if(lednum > 4) lednum = 4;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo col:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "C".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
    };
	
	ext.setMatrixConfig = function (tileX, tileY) {
		
		console.log("neo matrix setup:" + tileX + " by:" + tileY);
		
        var report = {
            message: "D".charCodeAt(0),
            tile1: tileX,
            tile2: tileY
        };
        hPort.postMessage(report);
    };
	
	ext.setFullLed = function (redC, greenC, blueC) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var lednum = 0;
        
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo full matrix R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "F".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
    };
	
	ext.setPixLed = function (lednumx, lednumy, redC, greenC, blueC) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var lednum = 0;
        lednumx--;
		lednumy--;
		
		if(lednumx < 0) lednumx = 0;
		//if(lednumx > 7) lednumx = 7;
		if(lednumy < 0) lednumy = 0;
		//if(lednumy > 4) lednumy = 4;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo pix:" + lednumx + "," + lednumy + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "P".charCodeAt(0),
            lednumx: lednumx,
			lednumy: lednumy,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
    };
	
	ext.setTriLedHex = function (lednum, hexColor) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        var realRed = hexToR(hexColor);
        var realGreen = hexToR(hexColor);
        var realBlue = hexToR(hexColor);
        var report = {
            message: "O".charCodeAt(0),
            lednum: lednum,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
    };

    ext.setLed = function () {
        //var realPort = portnum - 1;
        //var portString = realPort.toString();
        //var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
		//var realPort = 1 - 1; //convert from zero-indexed
        //var portString = realPort.toString(); //convert to string
		
		ledStatus ^= true;
		
        var report = {
            message: "L".charCodeAt(0),
            intensity: ledStatus
        };
        hPort.postMessage(report);
    };
	
	ext.setTone = function (tone) {
        //var realPort = portnum - 1;
        //var portString = realPort.toString();
        //var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
		var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var led_set = 0;
		
        var report = {
            message: "P".charCodeAt(0),
			port: portString.charCodeAt(0),
            intensity: tone
        };
        hPort.postMessage(report);
    };
	
	ext.setupServo = function (serv, servo_num) {
        //var realPort = portnum - 1; //convert to zero-indexed number
        //var portString = realPort.toString(); //convert to string
        var servo_setup = 1;
		//setup servos
		if(serv == 'Start')
		{
			servo_setup = 1;
		}
		else
		{
			servo_setup = 0;
		}
		console.log("Setup Servo: " + servo_setup + "  " + servo_num);
        var report = {
            message: "s".charCodeAt(0),
			servo_num: servo_num,
            servo_setup: servo_setup
        };
        hPort.postMessage(report);
    };

    ext.setServo = function (servo_num, ang) {
        //var realPort = portnum - 1; //convert to zero-indexed number
        //var portString = realPort.toString(); //convert to string
		
		//set servo bounds
		if(ang < 5)
		{
			ang = 5;
		}
		if(ang > 175)
		{
			ang = 175;
		}
		console.log("Set Servo: " + servo_num + "  " + ang);
        var report = {
            message: "S".charCodeAt(0),
            servo_num: servo_num,
            angle: ang
        };
        hPort.postMessage(report);
    };

    //getters for sensor information

	/*Capsense x4	0-3
	Light			4
	Microphone		5
	Temperature		6
	Pushbutton x2	7,8
	Switch			9
	Acc x3			10,11,12
	*/
    ext.getTemp = function (deg) {
        //returns temperature in Celsius degrees
		if(deg == '°F')
		{
			return sensorvalue[6];
		}
		else
		{
			return Math.round((sensorvalue[6]-32)*0.555);
		}
        
    };
	
	ext.getSound = function (port) {
        //returns microphone value
        return sensorvalue[5];
    };
	
	ext.getLight = function (port) {
        //returns light sensor value
		
		console.log("light: " + sensorvalue[4]);
        return sensorvalue[4];
    };
	
	ext.getPush = function (port) {
        //returns push button status
		if(port == 1)
		{
			return sensorvalue[7];
		}
		if(port == 2)
		{
			return sensorvalue[8];
		}
        
    };
	
	ext.getSwitch = function (port) {
        //returns switch status
        return sensorvalue[9];
    };
	
	ext.getAcc = function (axis) {
        //returns accerolerometer values
		if(axis == 'x')
			return sensorvalue[10];
		else if(axis == 'y')
			return sensorvalue[11];
		else
			return sensorvalue[12];
    };

    ext.getRaw = function (port) {
        //converts to 0 to 100 scale
        return sensorvalue[port];//Math.floor(sensorvalue[port - 1] / 2.55);
    };
	
	ext.getCap = function (port) {
        //converts to 0 to 100 scale
        var cap1 = sensorvalue[port];//Math.floor(sensorvalue[port - 1] / 2.55); 
		console.log("cap " + port + ": " + cap1);
		if(cap1 > 80)
		{
			return 1;
		}
		else
		{
			return 0;
		}
    };
	
	ext.mapVal = function(val, bMin, bMax) {
		var aMin = 0;
		var aMax = 255;

		var output = (((bMax - bMin) * (val - aMin)) / (aMax - aMin)) + bMin;
		return Math.round(output);
	};

    ext.hSpeak = function (phrase) {
        //uses Chrome text to speech API to speak the phrase
        var report = {message: "SPEAK", val: phrase};
        hPort.postMessage(report);
    };

    ext._shutdown = function () {
        //sends disconnect
        var report = {message: "R".charCodeAt(0)};
        hPort.postMessage(report);
    };

    ext.resetAll = function () {
        //sends reset to Circuit Playground
        var report = {message: "X".charCodeAt(0)};
        hPort.postMessage(report);
    };

    ext._getStatus = function () {
        var currStatus = hStatus;
        if (currStatus === 2)
            return {status: 2, msg: 'Connected'};
        else if (currStatus === 1)
            return {status: 1, msg: 'Circuit Playground Not Connected'};
        else
            return {status: 1, msg: 'Chrome App Not Connected'};
    };

	/*Capsense x4	0-3
	Light			4
	Microphone		5
	Temperature		6
	Pushbutton x2	7,8
	Switch			9 
	Acc x3			10,11,12
	*/
    var descriptor = {
        blocks: [
			['b', "Touch sensor %n touched?", "getCap", 0],
			[' ', "Set Neopixel Ring %n to R:%n G:%n B:%n", "setRingLed", 1, 255, 0, 0],
			[' ', "Set Neopixel Matrix Row %n to R:%n G:%n B:%n", "setRowLed", 1, 255, 0, 0],
			[' ', "Setup Neopixel Matrix Tiling to %n by %n", "setMatrixConfig", 1, 1],
			[' ', "Set Neopixel Matrix Column %n to R:%n G:%n B:%n", "setColLed", 1, 0, 255, 0],
			[' ', "Set Neopixel Matrix Pixel %n , %n to R:%n G:%n B:%n", "setPixLed", 1, 1, 0, 0, 255],
			[' ', "Set Full Neopixel Matrix to R:%n G:%n B:%n", "setFullLed", 0, 0, 0],
            [' ', "Toggle LED", "setLed"],
			[' ', "%m.servo_s Servo %m.push_s", "setupServo", 'Start', 1],
            [' ', "Set Servo %m.push_s angle to %n", "setServo", 1, 90],
			['r', "Get Light Brightness", "getLight"],
            ['r', "Get Board Temperature in %m.temp_s", "getTemp", '°F'],
            ['r', "Get Microphone Loudness", "getSound"],
			['r', "Get Accelerometer %m.acc_s axis", "getAcc", 'x'],
			['b', "Pushbutton %m.push_s pushed?", "getPush", 1],
			['b', "Switch on?", "getSwitch"],
			['r', "Map value: %n to range %n - %n", "mapVal", 127, -180,180],
            ['r', "Debug value on port %m.debug_s", "getRaw", 1]
        ],
        menus: {
            port: ['1', '2', '3', '4'],
			cap_s: [0,1,2,3],
			acc_s: ['x','y','z'],
			push_s: [1,2],
			debug_s: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,18,19,20,21,22,29,30,31,32],
            two: ['1', '2'],
			ten: [1,2,3,4,5,6,7,8,9,10],
			row_s: [1,2,3,4,5,6,7,8],
			col_s: [1,2,3,4,5],
			colors: ['Red','Green','Blue','Orange','Yellow','Violet', 'Teal','White', 'Off '],
			servo_s: ['Start','Stop'],
			coor_s: ['x','y'],
			temp_s: ['°F', '°C'],
			binary_s: ['On','Off']
        },
        url: 'http://www.embeditelectronics.com/blog/learn/'
    };
    getCircuitPlaygroundStatus();
    ScratchExtensions.register('Circuit Playground Advanced', descriptor, ext);
})({});