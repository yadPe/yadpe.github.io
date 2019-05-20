//import { randomNum, convertRange } from './audiovisualizerUtils';

export default () => {
    const randomNum = (min, max) => Math.random() * (max - min) + min;

    const convertRange = (OldValue, OldMax, OldMin, NewMax, NewMin) => {
      return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    }
    
    let canvas, ctx, canvasHeight = 800, canvasWidth = 800, particlesToAnimate, speedRatio = 1;
    const imgArr = [], particles = [];
    console.log('worker: ini')

    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        const message = e.data.msg;
        const data = e.data;
        switch (message) {
            case 'ini':
                init(data);
            case 'addParticles':
                addParticles(data.amount);
            case 'resize':
                resizeCanvas(data.newSize);
            case 'updateSpeedRatio':
              speedRatio = data.newRatio;
            default:
                postMessage({ error: `Unknown command: '${message}'` });
        }
    });

    const init = async data => {
        console.log('Worker: received init ')
        canvas = data.canvas;
        canvas.height = 800;
        canvas.width = 800;
        ctx = canvas.getContext("2d");
        await createSprites(data.particulesSize);
        render();
        console.log('Worker: done init ')
    }

    const resizeCanvas = size => {
        //console.log(`${JSON.stringify(size.height)} size`)
        canvas.height = canvasHeight = size.height;
        canvas.width = canvasWidth = size.width;
    }

    const createSprites = (range) => {
        console.log('Worker: begin sprite creation')
        for (let i = range.min; i <= range.max; i++) {
            // set the canvas to the size of the image
            const size = i;
            canvas.width = size * 2;
            canvas.height = size * 2;

            // draw the image onto the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255, 255, 255," + 1 + ")";
            ctx.arc(size, size, size, 0, 2 * Math.PI);
            ctx.fill();

            // get the ImageData for the image.
            const imageData = ctx.getImageData(0, 0, size * 2, size * 2);
            // get the pixel component data from the image Data.
            const imagePixData = imageData.data;

            imgArr.push({
                data: imagePixData,
                width: size * 2,
                height: size * 2
            });
        }
        console.log(`Worker: done sprite calculation, sprite generated: ${imgArr.length}`)
        return true
    }

    const addParticles = n => {
        for (let i = 0; i < n; i++) {
            const index = Math.floor(randomNum(0, imgArr.length));
            console.log(`worker: adding ${n} particles`)
            particles.push({
                x: randomNum(10, canvas.width - 10),
                y: randomNum(canvas.height + 10, canvas.height + 100),
                speed: randomNum(0.1, 0.5),
                dx: randomNum(-0.8, 0.8),
                dy: -1,
                alpha: 1,
                width: imgArr[index].width,
                height: imgArr[index].height,
                data: imgArr[index].data
            });
        }
    }

    const render = time => {
        // ... some drawing using the gl context ...

        particlesToAnimate = particles.length;

        if (particlesToAnimate > 2000) {
            particles.shift();
            particlesToAnimate = particles.length;
          }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);


        // create new Image data
        const canvasData = ctx.createImageData(canvasWidth, canvasHeight),
          // get the pixel data
          cData = canvasData.data;

        // iterate over the opbects
        for (let nObject = 0; nObject < particlesToAnimate; nObject++) {
          // for ref the entity
          const entity = particles[nObject];

          entity.x += (entity.dx * entity.speed) * speedRatio;
          entity.y += (entity.dy * entity.speed) * speedRatio;

          // now iterate over the image we stored
          for (let w = 0; w < entity.width; w++) {
            for (let h = 0; h < entity.height; h++) {
              // make sure the edges of the image are still inside the canvas
              if (
                entity.x + w < canvasWidth &&
                entity.x + w > 0 &&
                entity.y + h > 0 &&
                entity.y + h < canvasHeight
              ) {
                // get the position pixel from the image canvas
                const iData = (h * entity.width + w) * 4;
                // get the position of the data we will write to on our main canvas
                const pData = (~~(entity.x + w) + ~~(entity.y + h) * canvasWidth) * 4;

                // copy the r/g/b/ and alpha values to our main canvas from
                // our image canvas data.

                if (entity.data[iData + 3] > 160) {
                  cData[pData] = entity.data[iData];
                  cData[pData + 1] = entity.data[iData + 1];
                  cData[pData + 2] = entity.data[iData + 2];
                  cData[pData + 3] = convertRange(nObject, particlesToAnimate, 0, 255, 0);
                }
              }
            }
          }
        }

        ctx.putImageData(canvasData, 0, 0);
        // //const bitmap = ctx.canvas.transferToImageBitmap();

        //ctx.fillRect(10,10, 100, 100)

        //postMessage({msg: 'render', bitmap});
        //console.log('rendering');
        //addParticles(2);
        requestAnimationFrame(render);
    }
}