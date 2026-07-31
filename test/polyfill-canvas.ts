/** Minimal 2d context so Konva 10's hit-color / farbling probe works under jsdom. */
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value() {
    const data = new Uint8ClampedArray(400)
    return {
      clearRect() {},
      fillStyle: '',
      fillRect() {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 40
          data[i + 1] = 40
          data[i + 2] = 40
          data[i + 3] = 255
        }
      },
      getImageData() {
        return { data }
      },
    }
  },
})
