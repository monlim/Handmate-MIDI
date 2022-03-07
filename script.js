//Hide or show control-panel
function toggleControl(){
  let controlPanel = document.getElementsByClassName('control-panel')[0];
  let controlButton = document.getElementById('controlButton');
  if (controlPanel.style.display === "none"){
    controlPanel.style.display = "block";
    controlButton.innerHTML = "Hide controls";
  } else {
    controlPanel.style.display = "none";
    controlButton.innerHTML = "Show controls";
  }     
}

//Reset audio context
document.documentElement.addEventListener('mousedown', () => {
  if (Tone.context.state !== 'running') Tone.context.resume();
});

//Get HTML elements and create global variables
const videoElement = document.getElementsByClassName('input_video')[0];
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const showTracking = document.getElementById("showTracking");
const selfie = document.getElementById("selfie");
const fpsoutput = document.getElementById("fps");
const gesture = document.getElementById("gesture");
const device = document.getElementById('device');
const sendMidi = document.getElementById("sendMidi");
const bpm = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");
//const bpmControlInput = document.getElementById("bpmControlInput");
//const autoBpm = document.getElementById("autoBpm");
const midiChannel = document.getElementById("midiChannel");
const trigger1Channel = document.getElementById("trigger1Channel");
const midi1NoteInput = document.getElementById("midi1NoteInput");
const trigger2Channel = document.getElementById("trigger2Channel");
const midi2NoteInput = document.getElementById("midi2NoteInput");
const trigger3Channel = document.getElementById("trigger3Channel");
const midi3NoteInput = document.getElementById("midi3NoteInput");
const midiControlInput = document.getElementById("midiControlInput");
const midiVelInput = document.getElementById("midiVelInput");
const pitchBendInput = document.getElementById("pitchBendInput");
const aftertouchInput = document.getElementById("aftertouchInput");
const cc1Input = document.getElementById("cc1Input");
const cc1Controller = document.getElementById("cc1Controller");
const cc1Channel = document.getElementById("cc1Channel");
const cc2Input = document.getElementById("cc2Input");
const cc2Controller = document.getElementById("cc2Controller");
const cc2Channel = document.getElementById("cc2Channel");
const cc3Input = document.getElementById("cc3Input");
const cc3Controller = document.getElementById("cc3Controller");
const cc3Channel = document.getElementById("cc3Channel");
const cc4Input = document.getElementById("cc4Input");
const cc4Controller = document.getElementById("cc4Controller");
const cc4Channel = document.getElementById("cc4Channel");
let leftWrist, leftIndex, leftPinky, rightPinky, rightWrist, rightIndex, leftThumb, rightThumb, leftThumbX, rightThumbX, leftIndexX, leftPinkyX, leftIndexY, leftWristX, leftWristY, rightIndexX, rightIndexY, rightPinkyX, rightWristX, rightWristY, leftClose, rightClose, distance;
let output, midiControlValue=0.5, midiVel=1;

//create dictionary of midi Notes and set default values
const midiDic = {0: "C0", 1: "C#0", 2: "D0", 3: "D#0", 4: "E0", 5: "F0", 6: "F#0", 7: "G0", 8: "G#0", 9: "A0", 10: "A#0", 11: "B0", 
12: "C1", 13: "C#1", 14: "D1", 15: "D#1", 16: "E1", 17: "F1", 18: "F#1", 19: "G1", 20: "G#1", 21: "A1", 22: "A#1", 23: "B1",
24: "C2", 25: "C#2", 26: "D2", 27: "D#2", 28: "E2", 29: "F2", 30: "F#2", 31: "G2", 32: "G#2", 33: "A2", 34: "A#2", 35: "B2",
36: "C3", 37: "C#3", 38: "D3", 39: "D#3", 40: "E3", 41: "F3", 42: "F#3", 43: "G3", 44: "G#3", 45: "A3", 46: "A#3", 47: "B3",
48: "C4", 49: "C#4", 50: "D4", 51: "D#4", 52: "E4", 53: "F4", 54: "F#4", 55: "G4", 56: "G#4", 57: "A4", 58: "A#4", 59: "B4",
60: "C5", 61: "C#5", 62: "D5", 63: "D#5", 64: "E5", 65: "F5", 66: "F#5", 67: "G5", 68: "G#5", 69: "A5", 70: "A#5", 71: "B5",
72: "C6", 73: "C#6", 74: "D6", 75: "D#6", 76: "E6", 77: "F6", 78: "F#6", 79: "G6", 80: "G#6", 81: "A6", 82: "A#6", 83: "B6",
84: "C7", 85: "C#7", 86: "D7", 87: "D#7", 88: "E7", 89: "F7", 90: "F#7", 91: "G7", 92: "G#7", 93: "A7", 94: "A#7", 95: "B7",
96: "C8", 97: "C#8", 98: "D8", 99: "D#8", 100: "E8", 101: "F8", 102: "F#9", 103: "G9", 104: "G#9", 105: "A9", 106: "A#9", 107: "B9",
108: "C9", 109: "C#9", 110: "D9", 111: "D#9", 112: "E9", 113: "F9", 114: "F#9", 115: "G9", 116: "G#9", 117: "A9", 118: "A#9", 119: "B9",
120: "C10", 121: "C#10", 122: "D10", 123: "D#10", 124: "E10", 125: "F10", 126: "F#10", 127: "G10"};
let midi1Note = "C5";
let midi2Note = "C5";
let midi3Note = "C5";

Tone.Transport.bpm.value = 120;

WebMidi
  .enable()
  .then(onEnabled)
  .catch(err => alert(err));

function onEnabled(){
  for (let i = 0; i < WebMidi.outputs.length; i++) {
      jQuery('<option/>', {
        value: WebMidi.outputs[i].name,
        html: WebMidi.outputs[i].name
        }).appendTo('#dropdown select');
    }
    output = WebMidi.outputs[0]; 
}

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } 
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

//send Midi notes out when "send Midi" box checked
sendMidi.addEventListener("change", function(){
  if (this.checked) {
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
  }
});

//listen for updates to Midi1 trigger note
midi1NoteInput.onchange = function(){
  midi1Note = midiDic[midi1NoteInput.value];
};

//listen for updates to Midi2 trigger note
midi2NoteInput.onchange = function(){
  midi2Note = midiDic[midi2NoteInput.value];
};

//listen for updates to Midi3 trigger note
midi3NoteInput.onchange = function(){
  midi3Note = midiDic[midi3NoteInput.value];
};

//choose Midi output
function changeDevice(){
  for (let i = 0; i < WebMidi.outputs.length; i++) {
    if (WebMidi.outputs[i].name === device.value) {
      output = WebMidi.outputs[i];
    }
  };
}

//general scaling function
function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return (capped * scale + to[0]);
}

//create midi note loop
const loop = new Tone.Loop((time) => {
  output.playNote(scaleValue(midiControlValue, [0, 1], [1, 127]), [midiChannel.value], {attack: midiVel, duration: 250}, time)
}, "4n");
midiControlInput.onchange = function(){
  if (midiControlInput.value === "nil") {loop.stop();
  } else {
    loop.start();
  }
};

//adjust BPM
bpm.addEventListener("input", function(ev){
  Tone.Transport.bpm.rampTo(bpm.value, 0.1);  
  bpmValue.innerHTML = bpm.value;
});

function midiVelControl(controlValue) {
  midiVel = clamp(controlValue, 0, 1);
}

function pitchBendControl(controlValue) {
  if(output)output.sendPitchBend(scaleValue(controlValue, [0, 1], [-1, 1]));
}

function aftertouchControl(controlValue) {
  if(output)output.sendChannelAftertouch(clamp(controlValue, 0, 1), "all");
}

function cc1Control(controlValue) {
  if(output)output.sendControlChange(Number(cc1Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), [cc1Channel.value]);
}

function cc2Control(controlValue) {
  if(output)output.sendControlChange(Number(cc2Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), [cc2Channel.value]);
};

function cc3Control(controlValue) {
  if(output)output.sendControlChange(Number(cc3Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), [cc3Channel.value]);
}

function cc4Control(controlValue) {
  if(output) output.sendControlChange(Number(cc4Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), [cc4Channel.value]);
}

//Trigger note if index fingers touching
let t1on = false;
let fingerDistanceActivate = 0.02;
let fingerDistanceDeactivate = 0.05;
function Trigger1(distance) {
  if(distance <= fingerDistanceActivate){
    if(t1on)return;
    t1on = true;
    output.playNote(midi1Note, [trigger1Channel.value]);
    setTimeout(function(){output.stopNote(midi1Note, [trigger1Channel.value])}, 500);
  }
  if(distance > fingerDistanceDeactivate){
    t1on = false;
  }
}

//Trigger note if left hand reversed
let t2on = false;
let t2DistanceActivate = -0.1;
let t2DistanceDeactivate = 0;
function Trigger2(leftThumbX, leftPinkyX) {
  if ((leftThumbX - leftPinkyX) <= t2DistanceActivate){
    if(t2on)return;
    t2on = true;
    output.playNote(midi2Note, [trigger2Channel.value]);
    setTimeout(function(){output.stopNote(midi2Note, [trigger2Channel.value])}, 500);
  }
  if((leftThumbX - leftPinkyX) > t2DistanceDeactivate){
    t2on = false;
  }
}

//Trigger note if right hand reversed
let t3on = false;
let t3DistanceActivate = -0.1;
let t3DistanceDeactivate = 0;
function Trigger3(rightThumbX, rightPinkyX) {
  if ((rightPinkyX - rightThumbX) <= t3DistanceActivate){
    if(t3on)return;
    t3on = true;
    output.playNote(midi3Note, [trigger3Channel.value]);
    setTimeout(function(){output.stopNote(midi3Note, [trigger3Channel.value])}, 500);
  }
  if((rightPinkyX - rightThumbX) > t3DistanceDeactivate){
    t3on = false;
  }
}

//Output movement to midi
let controls_io = [
  {in:midiVelInput,          out:midiVelControl},
  {in:pitchBendInput,        out:pitchBendControl},
  {in:aftertouchInput,       out:aftertouchControl},
  {in:cc1Input,              out:cc1Control},
  {in:cc2Input,              out:cc2Control},
  {in:cc3Input,              out:cc3Control},
  {in:cc4Input,              out:cc4Control},
];
function myMidi(leftIndex, leftWrist, leftThumb, leftPinky, rightIndex, rightWrist, rightThumb, rightPinky) {
  if (midiVelInput.value === "nil"){midiVel = 1};
  if (pitchBendInput.value === "nil" && output && output.sendPitchBend){output.sendPitchBend(0)};
  if (aftertouchInput.value === "nil" && output && output.sendChannelAftertouch){output.sendChannelAftertouch(0, "all")};
  if (cc1Input.value === "nil"){cc1Control(0)};
  if (cc2Input.value === "nil"){cc2Control(0)};
  if (cc3Input.value === "nil"){cc3Control(0)};
  if (midiControlInput.value === "leftIndexX" && leftIndex){midiControlValue = leftIndex.x}
    else if (midiControlInput.value === "leftIndexY" && leftIndex){midiControlValue = leftIndex.y}
    else if (midiControlInput.value === "leftClosed" && leftIndex){midiControlValue = (scaleValue((Math.sqrt(((leftIndex.x - leftWrist.x)**2)+((leftIndex.y - leftWrist.y)**2))), [0.1, 0.4], [1, 0]))}
    else if (midiControlInput.value === "rightIndexX" && rightIndex){midiControlValue = rightIndex.x}
    else if (midiControlInput.value === "rightIndexY" && rightIndex){midiControlValue = rightIndex.y}
    else if (midiControlInput.value === "rightClosed" && rightIndex){midiControlValue = (scaleValue((Math.sqrt(((rightIndex.x - rightWrist.x)**2)+((rightIndex.y - rightWrist.y)**2))), [0.1, 0.4], [1, 0]))}
    else if (midiControlInput.value === "indexDistance" && leftIndex && rightIndex){midiControlValue = (Math.sqrt(((leftIndex.x - rightIndex.x)**2)+((leftIndex.y - rightIndex.y)**2)))};
  controls_io.forEach(io => {
    if(io.in.value === "leftIndexX" && leftIndex){io.out(leftIndex.x)};
    if(io.in.value === "leftIndexY" && leftIndex){io.out((1 - leftIndex.y))};
    if(io.in.value === "leftClosed" && leftIndex){io.out((scaleValue((Math.sqrt(((leftIndex.x - leftWrist.x)**2)+((leftIndex.y - leftWrist.y)**2))), [0.1, 0.4], [1, 0])))};
    if(io.in.value === "rightIndexX" && rightIndex){io.out(rightIndex.x)};
    if(io.in.value === "rightIndexY" && rightIndex){io.out((1 - rightIndex.y))};
    if(io.in.value === "rightClosed" && rightIndex){io.out((scaleValue((Math.sqrt(((rightIndex.x - rightWrist.x)**2)+((rightIndex.y - rightWrist.y)**2))), [0.1, 0.4], [1, 0])))};
    if(io.in.value === "indexDistance" && leftIndex && rightIndex){io.out((Math.sqrt(((leftIndex.x - rightIndex.x)**2)+((leftIndex.y - rightIndex.y)**2))))}
  });  
  if (gesture.checked && output && leftThumb && leftPinky){Trigger2(leftThumb.x, leftPinky.x)};
  if (gesture.checked && output && rightThumb && rightPinky){Trigger3(rightThumb.x, rightPinky.x)};
  if (gesture.checked && output && leftIndex && rightIndex){Trigger1((Math.sqrt(((leftIndex.x - rightIndex.x)**2)+((leftIndex.y - rightIndex.y)**2))))};
}

//Calculate FPS
let counter = 0;
let counterTracker = new Date();
function onResults(results) {
  counter++;
  let now = new Date();
  let timeDiff = now.getTime() - counterTracker.getTime()
  if(timeDiff >= 1000){
    let fps = Math.floor(counter / (timeDiff/1000));
    fpsoutput.innerHTML = fps;
    // reset
    counter = 0;
    counterTracker = new Date();
  };

  //Draw Hand landmarks on screen
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index]; 

      if (showTracking.checked) {
        drawConnectors(
          canvasCtx, landmarks, HAND_CONNECTIONS,
          {color: isRightHand ? '#fff' : '#056df5'}),
      drawLandmarks(canvasCtx, landmarks, {
        color: isRightHand ? '#fff' : '#056df5',
        fillColor: isRightHand ? '#056df5' : '#fff',
        radius: (x) => {
          return lerp(x.from.z, -0.15, .1, 10, 1);
        }
      })};
      if (isRightHand === false){
        leftIndex = landmarks[8];
        leftWrist = landmarks[0];
        leftThumb = landmarks[4];
        leftPinky = landmarks[20];
      } else {
        rightIndex = landmarks[8];
        rightWrist = landmarks[0];
        rightThumb = landmarks[4];
        rightPinky = landmarks[20];
      }
    }
  canvasCtx.restore();
  myMidi(leftIndex, leftWrist, leftThumb, leftPinky, rightIndex, rightWrist, rightThumb, rightPinky);
  };
}

//Toggle selfie view
selfie.addEventListener('change', function() {
  if (this.checked) {
    hands.setOptions({selfieMode: true});
  } else {
    hands.setOptions({selfieMode: false});
  }
});

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3/${file}`;
}});

hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();

function start() {
  const videoSource = videoSelect.value;
  const constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined} 
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

videoSelect.onchange = start;
