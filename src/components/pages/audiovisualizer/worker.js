export default () => {
    let canvas, ctx;
    const imgArr = [];
    console.log('worker: ini')

    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        const message = e.data.msg;
        const data = e.data;
        switch (message) {
            case 'ini':
                init(data)
            default:
                postMessage({error: `Unknown command: '${message}'`})
        }
    });

    const init = async data => {
        console.log('Worker: received init ')
        canvas = data.canvas;
        ctx = canvas.getContext("2d");
        await createSprites(data.particulesSize);
        render();
        console.log('Worker: done init ')
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
        console.log(`Worker: done sprite creation, sprite generated: ${imgArr.length}`)
        return true
    }

    const render = time => {
        // ... some drawing using the gl context ...
        
        console.log('rendering');
        requestAnimationFrame(render);
    }
}