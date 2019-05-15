import React, { Component } from 'react';
import './style.css';

class Audiovisualizer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // This code is absolute trash and not meant to be reused.. Good luck

        const Yoffset = 50//document.getElementsByClassName('MuiToolbar-root-39 MuiToolbar-dense-42 MuiToolbar-gutters-40')[0].getBoundingClientRect().height || 100;
        console.log(Yoffset)

        //WIP
        var particules = [];

        class Particule {
            constructor(x, y, dx, dy, size, speed, alpha) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.radius = size;
                this.ogSpeed = speed;
                this.speed = speed;
                this.alpha = alpha;
            }

            run() {
                this.draw();
                this.update();
            }

            draw() {
                ctx.save();
                ctx.beginPath();

                ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255," + this.alpha + ")";
                ctx.fill();
                ctx.restore();
            }

            update() {
                this.x += this.dx * this.speed;
                this.y += this.dy * this.speed;
            }
        }

        function addParticules(n) {
            for (let i = 0; i < n; i++) {
                var x = randomNum(10, window.innerWidth - 10);
                var y = randomNum(window.innerHeight + 10, window.innerHeight + 100);
                var dx = randomNum(-0.8, 0.8);
                var speed = randomNum(0.1, 1);
                var size = Math.floor(randomNum(1, 6));
                particules.push(new Particule(x, y, dx, -1, size, speed, 1));
            }
        }

        function randomNum(min, max) {
            return Math.random() * (max - min) + min;
        }

        function convertRange(OldValue, OldMax, OldMin, NewMax, NewMin) {
            return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
        }

        var audio, audioCtx, src, analyser, canvas, ctx, dataArray, bufferLength, barWidth, barHeight;
        var running = true;

        //audio = document.getElementById('audio');
        var file = document.getElementById("thefile");

        canvas = document.getElementById('visualizer');
        ctx = canvas.getContext("2d");

        var effect;

        var frequency = {
            overall: 0,
            low: 0,
            mid: 0,
            high: 0,
            cursor: 0
        }

        //SETUP cursor
        var cursor = new Image();
        cursor.src = document.getElementById("cursorImg").src;


        //Store cursor position
        var clientPos = {
            x: undefined,
            y: undefined
        }

        window.inter = setInterval(resizeEventHandler, 1000);

        //Get cursor position
        window.addEventListener('mousemove',
            function (event) {
                clientPos.x = event.x;
                clientPos.y = event.y - Yoffset;

                //console.log(clientPos);
            }, false);


        function resizeEventHandler() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            barWidth = (canvas.width / bufferLength);
            console.log("resizing ", canvas.width, " x ", canvas.height)
        }
        document.onreadystatechange = () => resizeEventHandler();
        window.onresize = () =>  resizeEventHandler();

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(function () {

                        callback(+performance.now());
                    }, 1000 / 150); //max fps but capped to screen refreshRate
                };
        })();


        //change audio volume
        document.getElementById('volumeControl')
            .addEventListener('change', updateAudioVolume, false);

        function updateAudioVolume() {
            var value = document.getElementById('volumeControl').value;
            var range = (100 - 1);
            var newRange = (1 - 0.01);
            var newValue = (((value - 1) * newRange) / range) + 0.01;
            console.log(newValue);
            audio.volume = newValue;
        }



        //idle detect to hide controls
        var lastMouseSum;
        var startIdle;
        var idle;
        function mouseIdle(mouse) {
            if (!lastMouseSum) {
                lastMouseSum = mouse.x + mouse.y;
            }
            var sum = mouse.x + mouse.y;
            if (sum == lastMouseSum) {
                if (!idle) {
                    startIdle = performance.now();
                    idle = true;
                } else {
                    var time = performance.now();
                    if (idle && time - startIdle > 3000) {
                        document.getElementById("controls").style.display = "none";
                        //console.log("none");
                    }
                }

            } else {
                lastMouseSum = mouse.x + mouse.y;

                document.getElementById("controls").style.display = "inline-block";
                //console.log("inline-block");

                idle = false;
            }
            //console.log(idle, lastMouseSum, sum, time, startIdle);
        }


        var video = document.getElementById('video');
        file.onchange = function () {
            var files = this.files;
            audio.src = URL.createObjectURL(files[0]);
            audio.load();
            audio.play();

            video.src = URL.createObjectURL(files[0]);
            video.load();
            video.play();
            audioCtx = new AudioContext();
            src = audioCtx.createMediaElementSource(audio);
            analyser = audioCtx.createAnalyser();

            src.connect(analyser);
            analyser.connect(audioCtx.destination);

            analyser.fftSize = 2048;//2048

            bufferLength = analyser.frequencyBinCount;
            console.log(bufferLength);

            dataArray = new Uint8Array(bufferLength);

            //console.log(dataArray);

            barWidth = (canvas.width / bufferLength);
            //barWidth = 50

            document.getElementById("visu").style.cursor = "none";


            animate();

        }

        if (window.playing){
            audioCtx = new AudioContext();
            //window.audioPlayer.audio.crossOrigin = "anonymous";
            src = audioCtx.createMediaElementSource(window.audioPlayer.audio);
            analyser = audioCtx.createAnalyser();

            src.connect(analyser);
            analyser.connect(audioCtx.destination);

            analyser.fftSize = 2048;//2048

            bufferLength = analyser.frequencyBinCount;
            console.log(bufferLength);

            dataArray = new Uint8Array(bufferLength);

            //console.log(dataArray);

            barWidth = (canvas.width / bufferLength);
            //barWidth = 50

            document.getElementById("visu").style.cursor = "none";


            animate();

        }

        var lastLog;
        var lastRun;//performance.now();
        var lastFps = [];
        var x = 0;
        //console.log(x);


        function averageFps(fpsArray) {
            var sum = 0;
            for (let i = 0; i < fpsArray.length; i++) {
                sum += parseInt(fpsArray[i]);
            }

            lastFps = [];

            return Math.round(sum / fpsArray.length)

        }

        //shockwave vars
        var shockwave = 1;
        var lastCursorSize;
        var deltaCursor;
        var alpha = 255;
        //other vars
        var h; //hue
        var lastOverallLoudness; //loudness -100ms
        var deltaLoudness;
        //req;

        function animate() {

            // State and fps counter //
            if (!lastRun) {
                lastRun = performance.now();
                window.req = window.requestAnimFrame(animate);
                return;
            }
            var delta = (performance.now() - lastRun) / 1000;
            lastRun = performance.now();
            var FPS = Math.round(1 / delta);
            lastFps.push(FPS);

            if (running) {
                window.req = window.requestAnimFrame(animate);
            } else {
                //var FPS = "PAUSED";
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            x = 0;
            //console.log(x);




            // Run every 0.1s - logs and idle handeling //
            if (!lastLog) {
                //console.log(frequency);

                lastLog = performance.now();
            }
            var currentTime = performance.now();
            if (currentTime - lastLog > 100) {
                //console.log(frequency);
                //console.log(deltaLoudness);

                console.log(effect);
                mouseIdle(clientPos);
                document.getElementById("fps").innerHTML = FPS = averageFps(lastFps);


                lastLog = performance.now();

                lastOverallLoudness = frequency.overall;
            }



            // analyse frequency and make average by range  //
            analyser.getByteFrequencyData(dataArray);
            overallLoudess(dataArray);
            // Animate css elements
            updateBackground();


            if (!lastOverallLoudness) {
                lastOverallLoudness = frequency.overall;
            }

            deltaLoudness = frequency.overall - lastOverallLoudness;


            if (frequency.overall > 101 || deltaLoudness > 38) {
                h += 1;
                console.log("Jump");
                addParticules(1);
            }
            if (!h) {
                h = 0;
            }
            if (h <= 360) {
                h += ((frequency.overall * 2.4) / bufferLength);
            } else {
                h = 0;
            }


            for (i = 0; i < particules.length; i++) {
                particules[i].alpha = i / particules.length;
                particules[i].speed = particules[i].ogSpeed * convertRange(frequency.high, 255, 0, 5.5, 0.15);
                particules[i].run();
            }


            if (particules.length > 500) {
                particules.shift();
            }

            for (var i = 0; i < dataArray.length; i++) { //dataArray.length
                barHeight = dataArray[i];
                //console.log(barHeight);

                //console.log(h);
                var s = (barHeight / 255) * 100;
                var l = 50;

                // ctx.fillStyle =  "rgb(" + r + "," + g + "," + b + ")";;//"rgb(140, 66, 244)";
                // ctx.fillRect(x, (canvas.height/2) - barHeight, barHeight, barHeight);
                var ze = clientPos.x - x;
                var bi = clientPos.x - x;





                if (clientPos.y - canvas.height / 2 > 0) {
                    var deltaX = clientPos.x - x;
                    var deltaY = clientPos.y - canvas.height / 2;

                    var value = clientPos.y - canvas.height / 2

                    var range = (canvas.height - 0);
                    var newRange = (2 - 1);
                    let ratio = (((value - 0) * newRange) / range) + 1;

                    //ratio *= epicRange;

                    //idk what ive done here but it works guys
                    if (Math.abs(clientPos.x - x) <= 200) {
                        var value = -Math.abs(clientPos.x - x);
                        //console.log(value);
                        if (value == 0) {
                            ratio = 1;
                        } else {
                            var range = (150 - 1);
                            var newRange = (2.77 - 1);
                            var epiic = (((value - 0) * newRange) / range) + 2.77;
                            //var epiic2 = (((value - 0) * newRange) / (canvas.width/2)) + 1.5;
                            //console.log(epiic);
                            if (epiic < 1) {
                                epiic = 1;
                            }
                            //ratio *= epiic;
                            var masterRoyal = (epiic * (deltaY / (canvas.height)) + 0.4);
                            if (masterRoyal < 1) {
                                //ratio *= 1;
                            }
                            else {
                                ratio *= masterRoyal;
                            }

                        }
                        effect = i + " x" + ratio;
                    }

                    ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)"; //hsv(360°, 73%, 96%)   "rgb(" + r + "," + g + "," + b + ")"
                    ctx.fillRect(x, canvas.height - (barHeight * ratio), barWidth, barHeight * ratio);

                }
                else {
                    const ratio = 1;
                    ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)";;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                }


                x += barWidth + 1;
                //console.log(x);
            }


            //Shitty Shockwave need rework//
            ///
            // shockwave += 5;
            // if(alpha >= 0){
            //     alpha += -5;
            // }


            // ctx.beginPath();
            // ctx.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
            // ctx.lineWidth = 2;
            // ctx.arc(clientPos.x, clientPos.y, shockwave, 0, Math.PI * 2, false);
            // ctx.stroke();
            // //console.log(deltaCursor);

            // if (deltaCursor > 11) {
            //     shockwave = 0;
            //     alpha = 200;
            //     ctx.arc(clientPos.x, clientPos.y, shockwave, 0, Math.PI * 2, false);
            //     ctx.stroke();
            //     console.log("wavyy");
            // }

            // ctx.closePath();

            //draw Cursor 
            ctx.drawImage(cursor, clientPos.x - cursorSize / 2, clientPos.y - cursorSize / 2, cursorSize, cursorSize);



        }


        function overallLoudess(array) {
            var sum = 0;
            var start = array.length * 0;
            var stop = array.length * 1;
            for (var i = start; i < stop; i++) {
                sum += parseInt(array[i]);
            }
            lowFreq(array);
            midFreq(array);
            highFreq(array);
            cursorFreq(array);
            return frequency.overall = sum / array.length
        }


        function cursorFreq(array) {
            var sum = 0;
            var start = array.length * 0;
            var stop = array.length * 0.390625;
            for (var i = start; i < stop; i++) {
                sum += parseInt(array[i]);
            }

            //old//
            //frequency.cursor = sum / array.length;

            //new//
            frequency.cursor = sum / (stop - start);

            return frequency.cursor
        }

        function highFreq(array) {
            var sum = 0;
            var start = array.length * 0.5419921875;
            var stop = array.length * 0.9326171875;
            for (var i = start; i < stop; i++) {
                sum += parseInt(array[i]);
            }

            //old//
            //frequency.high = sum / array.length;

            //new//
            frequency.high = sum / (stop - start);


            return frequency.high
        }

        function midFreq(array) {
            var sum = 0;
            var start = array.length * 0.140625;
            var stop = array.length * 0.3466796875;
            for (var i = start; i < stop; i++) {
                sum += parseInt(array[i]);
            }

            //old//
            //frequency.mid = sum / array.length

            //new//
            frequency.mid = sum / (stop - start);

            return frequency.mid
        }

        function lowFreq(array) {
            var sum = 0;
            var start = array.length * 0;
            var stop = array.length * 0.107421875;
            for (var i = start; i < stop; i++) {
                sum += parseInt(array[i]);
            }

            //old//
            //frequency.low = sum / array.length;

            //new//
            frequency.low = sum / (stop - start);

            return frequency.low
        }

        var cursorSize = 112;
        var backgroundFilter = {
            blur: 3,
            brightness: 0.75,
            saturate: 0.75,
            scale: 1,
            borderOpacity: 0,
            bottomOpacity: 0
        }

        //Animate all the css elements needed
        function updateBackground() {

            //backgroundFilter.scale = 1 + frequency.low / 2000;
            backgroundFilter.scale = 1; 

            backgroundFilter.brightness = 0.3 + ((frequency.high / 100) * 1.1);

            backgroundFilter.borderOpacity = 0 + ((frequency.high / 100) * 0.35);

            backgroundFilter.bottomOpacity = 0 + ((frequency.overall / 100) * 1);

            //backgroundFilter.blur = 1 + frequency.low / 5;

            //backgroundFilter.saturate = 0.85 + (frequency.mid/100 * 1.1);



            lastCursorSize = cursorSize;
            cursorSize = 96 + frequency.cursor * 0.5;
            deltaCursor = cursorSize - lastCursorSize;



            //console.log(cursorSize);


            document.getElementById("blurFilter").style.filter = "blur(" + backgroundFilter.blur + "px)";

            document.getElementById("brightnessFilterLeft").style.opacity = backgroundFilter.borderOpacity;
            document.getElementById("brightnessFilterRight").style.opacity = backgroundFilter.borderOpacity;

            //document.getElementById("brightnessFilterLeft").style.background = "radial-gradient(ellipse at 35%, hsl(" + 231 + "," + 100 + "%," + 98 + "%) 1%, transparent 70%, transparent)"; //"hsl(" + h + "," + s + "%," + l + "%)"
            //document.getElementById("brightnessFilterRight").style.background = "radial-gradient(ellipse at 65%, hsl(" + 231 + "," + 100 + "%," + 98 + "%) 1%, transparent 70%, transparent)"; //"radial-gradient(ellipse at 65%, hsl(" + h + "," + 55 + "%," + 60 + "%) 1%, transparent 70%, transparent)";

            document.getElementById("newBrightnessFilter").style.filter = "brightness(" + backgroundFilter.brightness + ")";

            document.getElementById("saturateFilter").style.filter = "saturate(" + backgroundFilter.saturate + ")";
            document.getElementById("saturateFilter").style.opacity = backgroundFilter.bottomOpacity;
            document.getElementById("saturateFilter").style.background = "linear-gradient(to top, hsl(" + h + "," + 55 + "%," + 60 + "%) -65%, transparent 37%)";


            document.getElementById("background").style.transform = "scale(" + backgroundFilter.scale + ")";


            //shockwave
            var shockwave = 0;

        }


    }

    componentWillUnmount() {
        window.cancelAnimationFrame(window.req)
        clearInterval(window.inter)
    }
    render() {
        return (
            <div className='visu' id='visu'>
                <img src="https://imgur.com/download/6oA8BAV" id="cursorImg" />


                <div id="blurFilter" className="background filter">
                    <div id="saturateFilter" className="background filter">
                        <div id="newBrightnessFilter" className="background filter">
                            <div id="background" className="background"></div>
                        </div>
                    </div>
                </div>


                <div id="brightnessFilterLeft" className="brightnessFilter"></div>
                <div id="brightnessFilterRight" className="brightnessFilter"></div>

                <div id="background" className="background"></div>

                <span id="controls">
                    <span id="fps"></span>
                    <input type="file" id="thefile" accept="audio/*" />
                    <audio id="audio" controls volume="0.1"></audio>
                    Volume <input type="range" min="1" max="100" value="100" className="slider" id="volumeControl" /></span>

                <canvas id="visualizer"></canvas>
                <video id="video" muted></video>
            </div>
        );
    }
}

export default Audiovisualizer;