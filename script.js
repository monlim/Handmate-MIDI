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
};

//Reset audio context
document.documentElement.addEventListener('mousedown', () => {
  if (Tone.context.state !== 'running') Tone.context.resume();
});

//Get HTML elements and create global variables
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const showTracking = document.getElementById("showTracking");
const selfie = document.getElementById("selfie");
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
let leftWrist, leftIndex, rightWrist, rightIndex, leftThumb, rightThumb, leftThumbX, rightThumbX, leftIndexX, leftIndexY, leftWristX, leftWristY, rightIndexX, rightIndexY, rightWristX, rightWristY, leftClose, rightClose, distance;
let output, midiControlValue, midiVel;
//create noteEvent to play continuous stream of midi notes at a particular duration
const noteEvent = new Tone.ToneEvent((time) => {
  output.playNote(scaleValue(midiControlValue, [0, 1], [1, 127]), midiChannel.value, {velocity: midiVel, duration:"4n"}, time);
});

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

const triggerNote = new Tone.ToneEvent((time) => {
  output.playNote(midi1Note, trigger1Channel.value, time);
});
const trigger2Note = new Tone.ToneEvent((time) => {
  output.playNote(midi2Note, trigger2Channel.value, time);
});
const trigger3Note = new Tone.ToneEvent((time) => {
  output.playNote(midi3Note, trigger3Channel.value, time);
});

Tone.Transport.bpm.value = 120;

//enable WebMidi and output list of Midi Out devices
WebMidi.enable(function (err) {
  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
    for (let i = 0; i < WebMidi.outputs.length; i++) {
      jQuery('<option/>', {
        value: WebMidi.outputs[i].name,
        html: WebMidi.outputs[i].name
        }).appendTo('#dropdown select');
    }
    output = WebMidi.outputs[0]; 
  }  
});

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
};

//general scaling function
function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return (capped * scale + to[0]);
};

/*bpmControlInput.onchange = function(){
  bpmControlNow = bpmControlInput.value;
};*/

//start midi note loop
midiControlInput.onchange = function(){
  if (midiControlInput.value === "nil") {noteEvent.stop();
  } else {
    noteEvent.start();
    noteEvent.loop = true;
    noteEvent.loopEnd = "4n";
  }
};

//adjust BPM
bpm.addEventListener("input", function(ev){
  Tone.Transport.bpm.rampTo(bpm.value, 0.1);  
  bpmValue.innerHTML = bpm.value;
});

//function bpmControl(controlValue) {
//  Tone.Transport.bpm.rampTo((scaleValue (controlValue, [0, 1], [20, 500])), 0.05);  
//};

function midiVelControl(controlValue) {
  midiVel = clamp(controlValue, 0, 1);
};

function pitchBendControl(controlValue) {
  output.sendPitchBend(scaleValue(controlValue, [0, 1], [-1, 1]));
};

function aftertouchControl(controlValue) {
  output.sendChannelAftertouch(controlValue, "all");
};

function cc1Control(controlValue) {
  output.sendControlChange(Number(cc1Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), cc1Channel.value);
};

function cc2Control(controlValue) {
  output.sendControlChange(Number(cc2Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), cc2Channel.value);
};

function cc3Control(controlValue) {
  output.sendControlChange(Number(cc3Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), cc3Channel.value);
};

function cc4Control(controlValue) {
  output.sendControlChange(Number(cc4Controller.value), scaleValue(controlValue, [0, 1], [0, 127]), cc4Channel.value);
};

function Trigger1(distance) {
  setTimeout(function(){
    if (distance < 0.03) {
      triggerNote.start();
    }
  }, 300);
  triggerNote.stop();
};

function Trigger2(leftThumbX, leftIndexX) {
  setTimeout(function(){
    if ((leftThumbX - leftIndexX) < -0.05) {
      trigger2Note.start();
    }
  }, 300);
  trigger2Note.stop();
};

function Trigger3(rightThumbX, rightIndexX) {
  setTimeout(function(){
    if ((rightIndexX- rightThumbX) < -0.05) {
      trigger3Note.start();
    }
  }, 300);
  trigger3Note.stop();
};

//Output movement to midi
function myMidi(leftIndex, leftWrist, leftThumb, rightIndex, rightWrist, rightThumb) {
  if (midiVelInput.value === "nil"){midiVel = 1};
  if (leftIndex){
    leftIndexX = leftIndex.x;
    leftIndexY = 1 - leftIndex.y; 
    leftThumbX = leftThumb.x;
    leftWristX = leftWrist.x;
    leftWristY = 1 - leftWrist.y;
    leftClose = scaleValue((Math.sqrt(((leftIndexX - leftWristX)**2)+((leftIndexY - leftWristY)**2))), [0.1, 0.4], [1, 0]); //0.4 - 0.1
    /*if (autoBpm.checked){
      if (bpmControlInput.value === "leftIndexX"){bpmControl(leftIndexX)};
      if (bpmControlInput.value === "leftIndexY"){bpmControl(leftIndexY)};
      if (bpmControlInput.value === "leftClosed"){bpmControl(leftClose)};
      };*/
    if (midiControlInput.value === "leftIndexX"){midiControlValue = leftIndexX};
    if (midiControlInput.value === "leftIndexY"){midiControlValue = leftIndexY};
    if (midiControlInput.value === "leftClosed"){midiControlValue = leftClose};
    if (midiVelInput.value === "leftIndexX"){midiVelControl(leftIndexX)};
    if (midiVelInput.value === "leftIndexY"){midiVelControl(leftIndexY)};
    if (midiVelInput.value === "leftClosed"){midiVelControl(leftClose)};
    if (pitchBendInput.value === "leftIndexX"){pitchBendControl(leftIndexX)};
    if (pitchBendInput.value === "leftIndexY"){pitchBendControl(leftIndexY)};
    if (pitchBendInput.value === "leftClosed"){pitchBendControl(leftClose)};
    if (aftertouchInput.value === "leftIndexX"){aftertouchControl(leftIndexX)};
    if (aftertouchInput.value === "leftIndexY"){aftertouchControl(leftIndexY)};
    if (aftertouchInput.value === "leftClosed"){aftertouchControl(leftClose)};
    if (cc1Input.value === "leftIndexX"){cc1Control(leftIndexX)};
    if (cc1Input.value === "leftIndexY"){cc1Control(leftIndexY)};
    if (cc1Input.value === "leftClosed"){cc1Control(leftClose)};
    if (cc2Input.value === "leftIndexX"){cc2Control(leftIndexX)};
    if (cc2Input.value === "leftIndexY"){cc2Control(leftIndexY)};
    if (cc2Input.value === "leftClosed"){cc2Control(leftClose)};
    if (cc3Input.value === "leftIndexX"){cc3Control(leftIndexX)};
    if (cc3Input.value === "leftIndexY"){cc3Control(leftIndexY)};
    if (cc3Input.value === "leftClosed"){cc3Control(leftClose)};
    if (cc4Input.value === "leftIndexX"){cc4Control(leftIndexX)};
    if (cc4Input.value === "leftIndexY"){cc4Control(leftIndexY)};
    if (cc4Input.value === "leftClosed"){cc4Control(leftClose)};
    if ((leftThumbX - leftIndexX) < -0.05) {Trigger2(leftThumbX, leftIndexX)};//reverse left hand trigger
  };
  if (rightIndex){
    rightIndexX = rightIndex.x;
    rightIndexY = 1 - rightIndex.y;
    rightThumbX = rightThumb.x;
    rightWristX = rightWrist.x;
    rightWristY = 1 - rightWrist.y;
    rightClose = scaleValue((Math.sqrt(((rightIndexX - rightWristX)**2)+((rightIndexY - rightWristY)**2))), [0.1, 0.4], [1, 0]); //0.4 - 0.1
    /*if (autoBpm.checked){
      if (bpmControlInput.value === "rightIndexX"){bpmControl(rightIndexX)};
      if (bpmControlInput.value === "rightIndexY"){bpmControl(rightIndexY)};
      if (bpmControlInput.value === "rightClosed"){bpmControl(rightClose)};
      };*/
    if (midiControlInput.value === "rightIndexX"){midiControlValue = rightIndexX};
    if (midiControlInput.value === "rightIndexY"){midiControlValue = rightIndexY};
    if (midiControlInput.value === "rightClosed"){midiControlValue = rightClose};
    if (midiVelInput.value === "rightIndexX"){midiVelControl(rightIndexX)};
    if (midiVelInput.value === "rightIndexY"){midiVelControl(rightIndexY)};
    if (midiVelInput.value === "rightClosed"){midiVelControl(rightClose)};
    if (pitchBendInput.value === "rightIndexX"){pitchBendControl(rightIndexX)};
    if (pitchBendInput.value === "rightIndexY"){pitchBendControl(rightIndexY)};
    if (pitchBendInput.value === "rightClosed"){pitchBendControl(rightClose)};
    if (aftertouchInput.value === "rightIndexX"){aftertouchControl(rightIndexX)};
    if (aftertouchInput.value === "rightIndexY"){aftertouchControl(rightIndexY)};
    if (aftertouchInput.value === "rightClosed"){aftertouchControl(rightClose)};
    if (cc1Input.value === "rightIndexX"){cc1Control(rightIndexX)};
    if (cc1Input.value === "rightIndexY"){cc1Control(rightIndexY)};
    if (cc1Input.value === "rightClosed"){cc1Control(rightClose)};
    if (cc2Input.value === "rightIndexX"){cc2Control(rightIndexX)};
    if (cc2Input.value === "rightIndexY"){cc2Control(rightIndexY)};
    if (cc2Input.value === "rightClosed"){cc2Control(rightClose)};
    if (cc3Input.value === "rightIndexX"){cc3Control(rightIndexX)};
    if (cc3Input.value === "rightIndexY"){cc3Control(rightIndexY)};
    if (cc3Input.value === "rightClosed"){cc3Control(rightClose)};
    if (cc4Input.value === "rightIndexX"){cc4Control(rightIndexX)};
    if (cc4Input.value === "rightIndexY"){cc4Control(rightIndexY)};
    if (cc4Input.value === "rightClosed"){cc4Control(rightClose)};
    if ((rightIndexX- rightThumbX) < -0.05) {Trigger3(rightThumbX, rightIndexX)}; // reverse right hand trigger
  };
  if (leftIndex && rightIndex){
    leftIndexX = leftIndex.x;
    leftIndexY = 1 - leftIndex.y;
    rightIndexX = rightIndex.x;
    rightIndexY = 1 - rightIndex.y;
    distance = Math.sqrt(((leftIndexX - rightIndexX)**2)+((leftIndexY - rightIndexY)**2));
    /*if (autoBpm.checked) {
      if (bpmControlInput.value === "indexDistance"){bpmControl(distance)};
    };*/
    if (midiControlInput.value === "indexDistance"){midiControlValue = distance};
    if (midiVelInput.value === "indexDistance"){midiVelControl(distance)};
    if (pitchBendInput.value === "indexDistance"){pitchBendControl(distance)};
    if (aftertouchInput.value === "indexDistance"){aftertouchControl(distance)};
    if (cc1Input.value === "indexDistance"){cc1Control(distance)};
    if (cc2Input.value === "indexDistance"){cc2Control(distance)};
    if (cc3Input.value === "indexDistance"){cc3Control(distance)};
    if (cc4Input.value === "indexDistance"){cc4Control(distance)};
    if (distance < 0.03){Trigger1(distance)};
  };
};

//Draw Hand landmarks on screen}
function onResults(results) {
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
      } else {
      rightIndex = landmarks[8];
      rightWrist = landmarks[0];
      rightThumb = landmarks[4];
      }
    }
  canvasCtx.restore();
  myMidi(leftIndex, leftWrist, leftThumb, rightIndex, rightWrist, rightThumb);
  };
};

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
