const camera = function () {
  let width = 0;
  let height = 0;

  const createObjects = function () {
    const video = document.createElement('video');
    video.id = 'video';
    video.width = width;
    video.height = height;
    video.autoplay = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
  };

  return {
    video: null as HTMLVideoElement | null,
    context: null as CanvasRenderingContext2D | null,
    canvas: null as HTMLCanvasElement | null,
    stream: null as MediaStream | null,

    startCamera: function (w = 680, h = 480) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        width = w;
        height = h;

        createObjects();

        this.video = document.getElementById('video') as HTMLVideoElement;
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d');

        return new Promise<void>((resolve, reject) => {
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
              if (this.video) {
                this.stream = stream;
                this.video.srcObject = stream;
                this.video.play();
                resolve();
              }
            })
            .catch((error) => {
              console.error('Error accessing camera:', error);
              reject(error);
            });
        });
      } else {
        return Promise.reject(new Error('Camera not supported'));
      }
    },

    takeSnapshot: function (): string | null {
      if (this.context && this.video) {
        this.context.drawImage(this.video, 0, 0, width, height);
        return this.canvas?.toDataURL('image/png') || null;
      }
      return null;
    },

    stopCamera: function () {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
      if (this.video) {
        this.video.srcObject = null;
        this.video.remove();
      }
      if (this.canvas) {
        this.canvas.remove();
      }
      this.video = null;
      this.canvas = null;
      this.context = null;
      this.stream = null;
    },
  };
}();

export default camera;
