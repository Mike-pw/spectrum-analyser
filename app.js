let source
let stream

options.addEventListener("submit", function (e) {
  let sampleRate = document.querySelector("#sampleRate").value

  let audioCtx = new AudioContext({ sampleRate: sampleRate })

  let analyser = audioCtx.createAnalyser();

  //Sets the size of FFT window
  let options = document.querySelector("#options")

  e.preventDefault()

  let fftSize = document.querySelector("#fftSize").value
  analyser.fftSize = fftSize

  //get user microphone input
  if (navigator.getUserMedia) {

    navigator.getUserMedia(
      {
        audio: true
      },

      // Success callback
      function (stream) {
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        analyze();
      },

      // Error callback
      function (error) {
        console.log('Error: ' + error);
      }
    );
  }

  //analyze function
  function analyze() {

    let dataArray = new Float32Array(analyser.frequencyBinCount);

    //setup canvas and context
    let canvas = document.getElementById("myCanvas");
    let canvasCtx = canvas.getContext("2d");

    //specify width and height
    let width = 720;
    let height = 360;

    //function to update graph
    function update() {
      requestAnimationFrame(update);

      //get frequency data
      analyser.getFloatFrequencyData(dataArray)

      //convert into array
      let data = Array.from(dataArray)
      let maxFrequency = sampleRate / 2

      //// only want 6000Hz or MAYBE 8000Hz so slice off array iff too long

      //normalize data
      normalizeData(data)

      //normalize function
      function normalizeData(array) {

        //find min and max outside of foreach for better performance
        const min = Math.min(...array)
        const max = Math.max(...array)

        //min-max scaling
        array.forEach(minMaxScaling)

        //foreach loop for min-max scaling
        function minMaxScaling(element, index, arr) {
          arr[index] = (((element - min) / (max - min)) * height) - (height / 2);
        }
      }

      document.querySelector("#frequency").textContent = data.indexOf((Math.max(...data))) * (sampleRate / data.length)

      let xDistance = (1 / (data.length - 1)) * width;

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.strokeRect(0, 0, width, height)

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, data[0]);
      for (var x = 1; x < data.length; x++) {
        canvasCtx.lineTo(x * xDistance, (height / 2) - data[x]);
      }

      canvasCtx.stroke();
    };

    update()

  }

});



