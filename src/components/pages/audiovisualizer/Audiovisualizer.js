import React, { Component } from 'react';
import { randomNum, convertRange, overallLoudess } from './audiovisualizerUtils';
import worker from './worker.js';
import WebWorker from '../../../webWorker';
import cursor from './cursor.png';
import './style.css';

class Audiovisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // This code is absolute trash and not meant to be reused.. Good luck

    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
          window.setTimeout(function () {

            callback(+performance.now());
          }, 1000 / 60);
        };
    })();



    if (!window.MEDIA_ELEMENT_NODES) {
      window.MEDIA_ELEMENT_NODES = new WeakMap();
    }






    const particules = [],
      imgArr = [],
      particulesSize = { max: 7, min: 4 },
      cursor = new Image(),
      clientPos = {},
      canvas = document.getElementById('visualizer'),
      ctx = canvas.getContext("2d"),
      particlesCanvas = document.getElementById('particles'),
      workerCanvas = document.getElementById('workerCanvas'),
      //particlesCtx = particlesCanvas.getContext("2d"),
      backgroundFilter = {
        blur: 3,
        brightness: 0.75,
        saturate: 0.75,
        scale: 1,
        borderOpacity: 0,
        bottomOpacity: 0
      };

    let dataArray,
      bufferLength,
      barWidth,
      barHeight,
      effect,
      running = true,
      frequency = {},
      canvasWidth,
      cursorSize = 112,
      canvasHeight,
      lastLog,
      lastRun,
      lastFps = [],
      x = 0,
      lastMouseSum,
      startIdle,
      idle,
      h, //hue
      lastOverallLoudness, //loudness -100ms
      deltaLoudness,
      delta,
      FPS,
      imageCanvas,
      iCtx,
      imageData,
      imagePixData,
      Yoffset = 50;

    //SETUP cursor
    cursor.src = document.getElementById("cursorImg").src;

    //this.inter = setInterval( () => this.resizeEventHandler(), 1000);




    this.initCanvasWorker = () => {
      this.worker = new WebWorker(worker);
      this.worker.onmessage = event => {
        if (event.data.msg === 'render') {
          //particlesCtx.transferFromImageBitmap(event.data.bitmap);
        }
      };
      this.offscreenCanvas = particlesCanvas.transferControlToOffscreen();
      this.worker.postMessage({ msg: 'ini', particulesSize, canvas: this.offscreenCanvas }, [this.offscreenCanvas]);
    }

    const resizeWorker = (width, height) => {
      if (this.worker)
        this.worker.postMessage({ msg: 'resize', newSize: { width, height } })
    }

    this.resizeEventHandler = () => {


      Yoffset = 0//document.getElementsByClassName('MuiToolbar-root-39 MuiToolbar-dense-42 MuiToolbar-gutters-40')[0].getBoundingClientRect().height || 50;
      //const container = document.getElementById('visu');

      const width = window.innerWidth;
      const height = window.innerHeight - Yoffset;

      canvas.width = canvasWidth = width;
      canvas.height = canvasHeight = height;





      // console.log('ressssss')
      // canvas.width = window.innerWidth;
      // canvas.height = window.innerHeight;
      //particlesCanvas.width = window.innerWidth;
      //particlesCanvas.height = window.innerHeight;
      //workerCanvas.height = window.innerHeight;
      //workerCanvas.width = window.innerWidth;
      barWidth = (width / bufferLength);
      // canvasWidth = canvas.width;
      // canvasHeight = canvas.height;
      //addParticules(1000);

      resizeWorker(width, height);

      //console.log("resizing ", canvas.width, " x ", canvas.height)
    }

    window.onload = () => this.resizeEventHandler();
    window.onresize = () => this.resizeEventHandler();

    //idle detect to hide controls
    function mouseIdle(mouse) {
      if (!lastMouseSum) {
        lastMouseSum = mouse.x + mouse.y;
      }
      let sum = mouse.x + mouse.y;
      if (sum == lastMouseSum) {
        if (!idle) {
          startIdle = performance.now();
          idle = true;
        } else {
          const time = performance.now();
          if (idle && time - startIdle > 3000) {
            //document.getElementById("controls").style.display = "none";
            //console.log("none");
          }
        }
      } else {
        lastMouseSum = mouse.x + mouse.y;
        //document.getElementById("controls").style.display = "inline-block";
        idle = false;
      }
    }


    this.animate = () => {

      //window.biquadFilter.frequency.value++

      // State and fps counter //
      if (!lastRun) {
        lastRun = performance.now();
        this.req = window.requestAnimFrame(this.animate);
        return;
      }

      // delta = (performance.now() - lastRun) / 1000;
      // lastRun = performance.now();
      // FPS = Math.round(1 / delta);
      // lastFps.push(FPS);

      if (running) {
        this.req = window.requestAnimFrame(this.animate);
      }

      // Run every 0.1s - logs and idle handeling //
      if (!lastLog) {
        lastLog = performance.now();
      }
      const currentTime = performance.now();
      if (currentTime - lastLog > 100) {
        //console.log(frequency);
        //console.log(deltaLoudness);
        this.worker.postMessage('bruuu');
        //console.log(effect);
        mouseIdle(clientPos);
        //document.getElementById("fps").innerHTML = FPS = averageFps(lastFps);

        lastLog = performance.now();

        lastOverallLoudness = frequency.overall;
      }

      // analyse frequency and make average by range  //
      window.analyser.getByteFrequencyData(dataArray);
      frequency = overallLoudess(dataArray);
      // Animate css elements
      updateBackground();


      if (!lastOverallLoudness) {
        lastOverallLoudness = frequency.overall;
      }

      // Detect high volume variations
      deltaLoudness = frequency.overall - lastOverallLoudness;
      if (frequency.overall > 101 || deltaLoudness > 38) {
        h += 1;
        console.log("Jump");
        //addParticules(1);
        this.worker.postMessage({msg: 'addParticles', amount: 1})
      }

      // Updates the bars color

      let sum = dataArray.reduce((previous, current) => current += previous),
        avg = sum / dataArray.length,
        s = (avg) * 100,
        l = 50;

      if (!h) {
        h = 0;
      }
      if (h <= 360) {
        h += ((frequency.overall * 2.4) / bufferLength);
      } else {
        h = 0;
      }

      // Update particles speed
      this.worker.postMessage({msg: 'updateSpeedRatio', newRatio: convertRange(frequency.high, 255, 0, 15, 0.15)});


      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "hsla(" + h + "," + s + "%," + 25 + "%, 1)";
      ctx.lineCap = 'round';

      ctx.fillStyle = "hsla(" + h + "," + s + "%," + l + "%, 0.3)";;

      // go back to the left of the screen
      x = 0;
      // Animate the bars
      for (var i = 0; i < dataArray.length; i++) { //dataArray.length
        barHeight = dataArray[i] * 1.5;


        if (clientPos.y - canvasHeight / 2 > 0) {
          const deltaX = clientPos.x - x, deltaY = clientPos.y - canvasHeight / 2;
          let ratio = convertRange(clientPos.y - canvasHeight / 2, canvasHeight, 0, 2, 1)

          //idk what ive done here but it works guys
          if (Math.abs(clientPos.x - x) <= 200) {
            var value = -Math.abs(clientPos.x - x);
            if (value == 0) {
              //ratio = 1;
            } else {
              const range = (150 - 1), newRange = (2.77 - 1);
              let epiic = (((value - 0) * newRange) / range) + 2.77;
              if (epiic < 1) {
                epiic = 1;
              }
              const masterRoyal = (epiic * (deltaY / (canvasHeight)) + 0.4);
              if (masterRoyal >= 1) {
                ratio *= masterRoyal;
              }
            }
            effect = i + " x" + ratio;

            //window.biquadFilter.gain.value = Math.abs(Math.round(convertRange(clientPos.y, canvasHeight, 0, 100, 0))) * 1;
          }

          //ctx.lineTo(x, canvas.height - (barHeight * ratio));
          ctx.lineTo(x, canvasHeight - (barHeight * ratio) > canvasHeight - Yoffset ? canvasHeight - Yoffset : canvasHeight - (barHeight * ratio));


          // ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)"; //hsv(360°, 73%, 96%)   "rgb(" + r + "," + g + "," + b + ")"
          // ctx.fillRect(x, canvas.height - (barHeight * ratio), barWidth, barHeight * ratio);
        }
        else {
          ctx.lineTo(x, canvasHeight - barHeight > canvasHeight - Yoffset ? canvasHeight - Yoffset : canvasHeight - barHeight);

          //ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)";;
          // ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }
        x += barWidth + 1;
      }
      window.biquadFilter.frequency.value = convertRange(clientPos.x, canvasWidth, 0, 15000, 50) || 500;
      window.biquadFilter.Q.value = convertRange(clientPos.y, canvasHeight, canvasHeight / 2.5, 1.45, 0) || 0; //1.5

      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.stroke();
      ctx.fill();
      //draw Cursor 
      ctx.drawImage(cursor, clientPos.x - cursorSize / 2, clientPos.y - cursorSize / 2, cursorSize, cursorSize);
    }

    //Animate all the css elements needed
    const blurFilter = document.getElementById("blurFilter").style,
      brightnessFilterLeft = document.getElementById("brightnessFilterLeft").style,
      brightnessFilterRight = document.getElementById("brightnessFilterRight").style,
      newBrightnessFilter = document.getElementById("newBrightnessFilter").style,
      saturateFilter = document.getElementById("saturateFilter").style,
      background = document.getElementById("background").style;

    function updateBackground() {
      //backgroundFilter.scale = 1 + frequency.low / 2000;
      backgroundFilter.scale = 1;

      backgroundFilter.brightness = 0.3 + ((frequency.high / 100) * 1.1);

      backgroundFilter.borderOpacity = 0 + ((frequency.high / 100) * 0.20);

      backgroundFilter.bottomOpacity = 0 + ((frequency.overall / 100) * 1);

      backgroundFilter.blur = convertRange(frequency.high, 255, 0, 3, 0.22) //  0.2// + ((frequency.high / 100) * 1.5);

      cursorSize = 96 + frequency.cursor * 0.5;

      blurFilter.filter = "blur(" + backgroundFilter.blur + "px)";

      brightnessFilterLeft.opacity = backgroundFilter.borderOpacity;
      brightnessFilterRight.opacity = backgroundFilter.borderOpacity;

      newBrightnessFilter.filter = "brightness(" + backgroundFilter.brightness + ")";

      saturateFilter.filter = "saturate(" + backgroundFilter.saturate + ")";
      saturateFilter.opacity = backgroundFilter.bottomOpacity;
      saturateFilter.background = "linear-gradient(to top, hsl(" + h + "," + 55 + "%," + 60 + "%) -65%, transparent 37%)";

      background.transform = "scale(" + backgroundFilter.scale + ")";
    }


    // init
    if (window.playing) {
      if (window.audioCtx == undefined) {
        const audioContext = window.AudioContext // Default
          || window.webkitAudioContext // Safari and old versions of Chrome
          || false;
        window.audioCtx = new audioContext();
      }

      if (window.MEDIA_ELEMENT_NODES.has(window.audioPlayer.audio)) {
        this.src = window.MEDIA_ELEMENT_NODES.get(window.audioPlayer.audio);
      } else {
        this.src = window.audioCtx.createMediaElementSource(window.audioPlayer.audio);
        window.MEDIA_ELEMENT_NODES.set(window.audioPlayer.audio, this.src);
        window.analyser = window.audioCtx.createAnalyser();
        window.analyser.connect(window.audioCtx.destination);
        window.analyser.fftSize = 2048;//2048

        window.gainNode = window.audioCtx.createGain();
        window.biquadFilter = window.audioCtx.createBiquadFilter();
      }

      window.gainNode.connect(window.analyser);
      window.biquadFilter.connect(window.gainNode);
      this.src.connect(window.biquadFilter);

      bufferLength = window.analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      barWidth = (canvasWidth / bufferLength);
      document.getElementById("visu").style.cursor = "none";

      window.biquadFilter.type = "bandpass";
      window.biquadFilter.frequency.value = 100;
      window.biquadFilter.gain.value = -1;
      window.biquadFilter.detune.value = 5;
      window.biquadFilter.Q.value = 0;



      //Get cursor position
      window.addEventListener('mousemove',
        function (event) {
          clientPos.x = event.x;
          clientPos.y = event.y - Yoffset;
        }, false);

      this.initCanvasWorker();
      this.resizeEventHandler()
      this.animate();
    }

  }

  // componentDidUpdate(_prevProps, _prevState) {
  //   this.resizeEventHandler();
  // }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.req);
    //clearInterval(this.inter);
  }

  render() {
    // if (this.resizeEventHandler){

    //   this.resizeEventHandler();
    // }
    return (
      <div className='visu' id='visu'>
        <img src={cursor} id="cursorImg" />

        <div id="blurFilter" className="background filter">
        <div id="saturateFilter" className="background filter"></div>
        <div id="newBrightnessFilter" className="background filter"></div>
        <div id="background" className="background"></div>




        <div id="brightnessFilterLeft" className="brightnessFilter"></div>
        <div id="brightnessFilterRight" className="brightnessFilter"></div>

        <div id="background" className="background"></div>

        {/* <span id="controls">
          <span id="fps"></span>
        </span> */}

        
        <canvas id="particles"></canvas>
        </div>
        <canvas id="visualizer"></canvas>
        {/* <canvas id="workerCanvas"></canvas> */}
      </div>
    );
  }
}

export default Audiovisualizer;