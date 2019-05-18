import React, { Component } from 'react';
import { Particule, randomNum, convertRange, overallLoudess } from './audiovisualizerUtils';
import cursor from './cursor.png';
import './style.css';

class Audiovisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // This code is absolute trash and not meant to be reused.. Good luck

    if (!window.MEDIA_ELEMENT_NODES) {
      window.MEDIA_ELEMENT_NODES = new WeakMap();
    }

    const Yoffset = 50//document.getElementsByClassName('MuiToolbar-root-39 MuiToolbar-dense-42 MuiToolbar-gutters-40')[0].getBoundingClientRect().height || 100;
    console.log(Yoffset)

    const particules = [],
      imgArr = [],
      particulesSize = { max: 7, min: 4 },
      cursor = new Image(),
      clientPos = {},
      canvas = document.getElementById('visualizer'),
      ctx = canvas.getContext("2d"),
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
      canvasHeight;

    //SETUP cursor
    cursor.src = document.getElementById("cursorImg").src;



    this.inter = setInterval(resizeEventHandler, 1000);

    //Get cursor position
    window.addEventListener('mousemove',
      function (event) {
        clientPos.x = event.x;
        clientPos.y = event.y - Yoffset;
      }, false);


    function resizeEventHandler() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      barWidth = (canvas.width / bufferLength);
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      console.log("resizing ", canvas.width, " x ", canvas.height)
    }
    window.onload = () => resizeEventHandler();
    window.onresize = () => resizeEventHandler();

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

    //idle detect to hide controls
    let lastMouseSum,
      startIdle,
      idle;
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
            document.getElementById("controls").style.display = "none";
            //console.log("none");
          }
        }
      } else {
        lastMouseSum = mouse.x + mouse.y;
        document.getElementById("controls").style.display = "inline-block";
        idle = false;
      }
    }

    let lastLog,
      lastRun,
      lastFps = [],
      x = 0;

    function averageFps(fpsArray) {
      let sum = 0;
      for (let i = 0; i < fpsArray.length; i++) {
        sum += parseInt(fpsArray[i]);
      }
      lastFps = [];
      return Math.round(sum / fpsArray.length)
    }

    let h, //hue
      lastOverallLoudness, //loudness -100ms
      deltaLoudness,
      delta,
      FPS;

    this.animate = () => {
      // State and fps counter //
      if (!lastRun) {
        lastRun = performance.now();
        this.req = window.requestAnimFrame(this.animate);
        return;
      }
      delta = (performance.now() - lastRun) / 1000;
      lastRun = performance.now();
      FPS = Math.round(1 / delta);
      lastFps.push(FPS);

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

        console.log(effect);
        mouseIdle(clientPos);
        document.getElementById("fps").innerHTML = FPS = averageFps(lastFps);

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


      // Updates particules
      for (i = 0; i < particules.length; i++) {
        particules[i].alpha = i / particules.length;
        particules[i].speed = particules[i].ogSpeed * convertRange(frequency.high, 255, 0, 5.5, 0.15);
        particules[i].run();
      }

      if (particules.length > 3500) {
        particules.shift();
      }

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
          }

          //ctx.lineTo(x, canvas.height - (barHeight * ratio));
          ctx.lineTo(x, canvasHeight - (barHeight * ratio) > canvasHeight - 50 ? canvasHeight - 50 : canvasHeight - (barHeight * ratio));


          // ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)"; //hsv(360°, 73%, 96%)   "rgb(" + r + "," + g + "," + b + ")"
          // ctx.fillRect(x, canvas.height - (barHeight * ratio), barWidth, barHeight * ratio);
        }
        else {
          ctx.lineTo(x, canvasHeight - barHeight > canvasHeight - 50 ? canvasHeight - 50 : canvasHeight - barHeight);

          //ctx.fillStyle = "hsl(" + h + "," + s + "%," + l + "%)";;
          // ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }
        x += barWidth + 1;
      }
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.stroke();
      ctx.fill();
      //draw Cursor 
      ctx.drawImage(cursor, clientPos.x - cursorSize / 2, clientPos.y - cursorSize / 2, cursorSize, cursorSize);
    }

    //Animate all the css elements needed
    function updateBackground() {
      //backgroundFilter.scale = 1 + frequency.low / 2000;
      backgroundFilter.scale = 1;

      backgroundFilter.brightness = 0.3 + ((frequency.high / 100) * 1.1);

      backgroundFilter.borderOpacity = 0 + ((frequency.high / 100) * 0.20);

      backgroundFilter.bottomOpacity = 0 + ((frequency.overall / 100) * 1);

      cursorSize = 96 + frequency.cursor * 0.5;

      document.getElementById("blurFilter").style.filter = "blur(" + backgroundFilter.blur + "px)";

      document.getElementById("brightnessFilterLeft").style.opacity = backgroundFilter.borderOpacity;
      document.getElementById("brightnessFilterRight").style.opacity = backgroundFilter.borderOpacity;

      document.getElementById("newBrightnessFilter").style.filter = "brightness(" + backgroundFilter.brightness + ")";

      document.getElementById("saturateFilter").style.filter = "saturate(" + backgroundFilter.saturate + ")";
      document.getElementById("saturateFilter").style.opacity = backgroundFilter.bottomOpacity;
      document.getElementById("saturateFilter").style.background = "linear-gradient(to top, hsl(" + h + "," + 55 + "%," + 60 + "%) -65%, transparent 37%)";

      document.getElementById("background").style.transform = "scale(" + backgroundFilter.scale + ")";
    }



    // Init
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
      }
      this.src.connect(window.analyser);

      bufferLength = window.analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      barWidth = (canvasWidth / bufferLength);
      document.getElementById("visu").style.cursor = "none";

      this.animate();
    }
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.req);
    clearInterval(this.inter);
  }

  render() {
    return (
      <div className='visu' id='visu'>
        <img src={cursor} id="cursorImg" />

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
        </span>

        <canvas id="visualizer"></canvas>
        <canvas id="particles"></canvas>
      </div>
    );
  }
}

export default Audiovisualizer;