let oscs = [];
let oscsNr = 8;
let arpNr = 5;
let playing = false;
let baseFreq = 220;
let offsets = [];
let freqs = [];
let lfoFreq = 1;

let timer;
let notes = ['C', 'Db', 'D', 'E', 'Eb', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
const arp = [];
let arpStep = 0;
let arpStep2 = 0;  

let lfo;
let noiseLfo;
let noiseOsc;
let noiseEnv;
let lead;

function soundDinamics() {
  // noise 1
  const n1 = (noise(t * 100) - 0.5) * 30;
  for (let i = 0; i < oscsNr * 2; i++) {
    let freq = freqs[i];
    freqs[i] = freq + n1;
    oscs[i].freq(freqs[i], 0.1);
  }

  // noise 2
  const n2 = (noise(t + 100) - 0.5) * 0.5;
  lfoFreq = lfoFreq + n2;
  lfo.freq(lfoFreq);

  if (t % 3 === 0) {
    const note = arp[arpStep % arpNr] + 4;
    lead.play(note, 1, 0, 0.5);
    arpStep++;
  }

  if (t % 5 === 0) {
    const note = arp[arpNr - (arpStep2 % arpNr)] + 3;
    lead.play(note, random(), 0, 0.1);
    arpStep2++;
  }

  if (t % 10 === 0) {
    noiseEnv.play(noiseOsc);
  }

  if (t % 20 === 0) {
    for (let i = 0; i < arpNr; i++) {
      arp[i] = random(notes);
    }
  }

  noiseOsc.pan(sin(t * 0.5));

  for (let i = 0; i < oscsNr * 2; i++) {
    const pan = i % 2 === 0 ? sin(t) : cos(t);
    oscs[i].pan(pan);
  } 

  if (step.v === 4 || step.v === 9) {
    outputVolume(0.6, 0.5);
  } else {
    outputVolume(0.1);
  }
}

function setSound() {
  for (let i = 0; i < arpNr; i++) {
    arp[i] = random(notes);
  }

  // LEAD
  lead = new p5.MonoSynth();
  lead.disconnect();
  lead.amp(0.1);
  const leadDistort = new p5.Distortion(0.5, 'none');
  leadDistort.process(lead);
  leadDistort.amp(0.03);
  const leadReverb = new p5.Reverb();
  leadDistort.chain(leadReverb);
  leadReverb.set(20, 30);
  const leadFilter = new p5.LowPass();
  leadFilter.set(0);
  leadDistort.chain(leadFilter);

  // NOISE
  noiseOsc = new p5.Noise('brown');
  noiseEnv = new p5.Envelope(0.05, 0.04, 2.5, 0);
  noiseOsc.amp(0.06);
  noiseLfo = new p5.Oscillator(100, 'sine');
  noiseLfo.disconnect();
  noiseLfo.amp(1000);
  const noiseFilter = new p5.LowPass();
  noiseFilter.freq(noiseLfo);

  // DRONE
  const filter = new p5.LowPass();
  const reverb = new p5.Reverb();

  for (let i = 0; i < oscsNr * 2; i++) {
    let type = 'sawtooth';
    let freq = i < oscsNr ? baseFreq : baseFreq * 2;
    offsets[i] = Math.floor(random(-20, 20));
    freq += offsets[i];
    freqs[i] = freq;
    oscs[i] = new p5.Oscillator(freqs[i], type);
    oscs[i].amp(0.02);
    oscs[i].disconnect();
    oscs[i].connect(filter);
    filter.chain(reverb);
    reverb.set(3, 10);
  }

  lfo = new p5.Oscillator(lfoFreq, 'sine');
  lfo.disconnect();
  lfo.amp(500);

  filter.freq(lfo);
}