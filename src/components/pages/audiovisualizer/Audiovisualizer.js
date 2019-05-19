import React, { Component } from 'react';
import { Particule, randomNum, convertRange, overallLoudess } from './audiovisualizerUtils';
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

    //Get cursor position
    window.addEventListener('mousemove',
      function (event) {
        clientPos.x = event.x;
        clientPos.y = event.y - Yoffset;
      }, false);

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
      imagePixData;

    //SETUP cursor
    cursor.src = document.getElementById("cursorImg").src;

    this.inter = setInterval(resizeEventHandler, 1000);




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
      this.worker.postMessage({msg: 'resize', newSize: {width, height}})
    }

    function resizeEventHandler() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      //particlesCanvas.width = window.innerWidth;
      //particlesCanvas.height = window.innerHeight;
      //workerCanvas.height = window.innerHeight;
      //workerCanvas.width = window.innerWidth;
      barWidth = (canvas.width / bufferLength);
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      //addParticules(1000);

      resizeWorker(canvasWidth, canvasHeight);
      
      console.log("resizing ", canvas.width, " x ", canvas.height)
    }

    window.onload = () => resizeEventHandler();
    window.onresize = () => resizeEventHandler();

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

    // function averageFps(fpsArray) {
    //   let sum = 0;
    //   for (let i = 0; i < fpsArray.length; i++) {
    //     sum += parseInt(fpsArray[i]);
    //   }
    //   lastFps = [];
    //   return Math.round(sum / fpsArray.length)
    // }


    // function addParticules(n) {
    //   for (let i = 0; i < n; i++) {
    //     const index = Math.floor(randomNum(0, imgArr.length));

    //     particules.push({
    //       x: randomNum(10, canvas.width - 10),
    //       y: randomNum(canvas.height + 10, canvas.height + 100),
    //       speed: randomNum(0.1, 0.5),
    //       dx: randomNum(-0.8, 0.8),
    //       dy: -1,
    //       alpha: 1,
    //       width: imgArr[index].width,
    //       height: imgArr[index].height,
    //       data: imgArr[index].data
    //     });
    //   }
    // }


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
      // for (i = 0; i < particules.length; i++) {
      //   particules[i].alpha = i / particules.length;
      //   particules[i].speed = particules[i].ogSpeed * convertRange(frequency.high, 255, 0, 5.5, 0.15);
      //   particules[i].run();
      // }

      if (particules.length > 3500) {
        particules.shift();
      }


      // particlesCtx.clearRect(0, 0, canvasWidth, canvasHeight);


      // // create new Image data
      // const canvasData = particlesCtx.createImageData(canvas.width, canvas.height),
      //   // get the pixel data
      //   cData = canvasData.data;

      // // iterate over the opbects
      // for (let nObject = 0; nObject < particules.length; nObject++) {
      //   // for ref the entity
      //   const entity = particules[nObject];

      //   entity.x += entity.dx * entity.speed;
      //   entity.y += entity.dy * entity.speed;

      //   // now iterate over the image we stored
      //   for (let w = 0; w < entity.width; w++) {
      //     for (let h = 0; h < entity.height; h++) {
      //       // make sure the edges of the image are still inside the canvas
      //       if (
      //         entity.x + w < canvasWidth &&
      //         entity.x + w > 0 &&
      //         entity.y + h > 0 &&
      //         entity.y + h < canvasHeight
      //       ) {
      //         // get the position pixel from the image canvas
      //         const iData = (h * entity.width + w) * 4;
      //         // get the position of the data we will write to on our main canvas
      //         const pData = (~~(entity.x + w) + ~~(entity.y + h) * canvasWidth) * 4;

      //         // copy the r/g/b/ and alpha values to our main canvas from
      //         // our image canvas data.

      //         if (entity.data[iData + 3] > 160) {
      //           cData[pData] = entity.data[iData];
      //           cData[pData + 1] = entity.data[iData + 1];
      //           cData[pData + 2] = entity.data[iData + 2];
      //           cData[pData + 3] = convertRange(nObject, particules.length, 0, 255, 0);
      //         }
      //       }
      //     }
      //   }
      // }

      // particlesCtx.putImageData(canvasData, 0, 0);

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



    // Init
    // imageCanvas = document.createElement("canvas");
    // iCtx = imageCanvas.getContext("2d");
    // for (let i = particulesSize.min; i <= particulesSize.max; i++) {
    //   // set the canvas to the size of the image
    //   const size = i;
    //   imageCanvas.width = size * 2;
    //   imageCanvas.height = size * 2;

    //   // draw the image onto the canvas
    //   iCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    //   iCtx.fillStyle = "rgba(255, 255, 255," + 1 + ")";
    //   iCtx.arc(size, size, size, 0, 2 * Math.PI);
    //   iCtx.fill();

    //   // get the ImageData for the image.
    //   imageData = iCtx.getImageData(0, 0, size * 2, size * 2);
    //   // get the pixel component data from the image Data.
    //   imagePixData = imageData.data;

    //   imgArr.push({
    //     data: imagePixData,
    //     width: size * 2,
    //     height: size * 2
    //   });
    // }

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




      this.initCanvasWorker();
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

        {/* <span id="controls">
          <span id="fps"></span>
        </span> */}

        <canvas id="visualizer"></canvas>
        <canvas id="particles"></canvas>
        <canvas id="workerCanvas"></canvas>
      </div>
    );
  }
}

export default Audiovisualizer;