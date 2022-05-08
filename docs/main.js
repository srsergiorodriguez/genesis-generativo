const a = new Aventura('es');
let textHTML;
const pobsNum = 20;
let stp = {v:0};
const stepHandler = {
  set: function (obj, prop, value) {
    if (prop === 'v') {
      console.log(value);
    }
    obj[prop] = value;
  }
};

let step = new Proxy(stp, stepHandler);
let started = false;
let f; // forma principal
const pobs = []; // pobladores
let t = 0;
let trans = 0;

// me gusta como se ven los punticos moviendose
// que los cantos sean hexadecimales

async function setup() {
  frameRate(10);
  angleMode(DEGREES);
  setSound();
  const {synth, voice} = await prepareSpeech();

  const cnv = createCanvas(960, 540).parent('#canvas-container');

  textHTML = createElement('h1','').class('subtitle').parent('#text-container');

  createButton('GENERAR').parent('#gui-container').mouseClicked(async () => {
    reset();
    setSound();
    outputVolume(0);
    oscs.map(o => {o.start()});
    lfo.start();
    noiseLfo.start();
    noiseOsc.start();
    outputVolume(0.7, 1);

    setTimeout(() => {
      started = true;
      const texto = a.expandirGramatica('init');
      console.log(texto);
      f = new Forma(hexes.general[gramatica.forma.c], gramatica.forma.f);

      const orderIndex = gramatica.secuencia.indexOf(gramatica.elemento.s[0]);
      const order = getOrder(orderIndex);
      for (let i = 0; i < pobsNum - 1; i++) {
        pobs[i] = new Forma(hexes.general[gramatica.elemento.c], gramatica.elemento.e);
        pobs[i].update(...order(i));
      }
      textToSpeech(texto, synth, voice);
      outputVolume(0.05, 0.5);
    }, 4000);
  });

  createButton('PARAR').parent('#gui-container').mouseClicked(() => {
    reset();
  });

  function reset() {
    oscs.map(o => {o.stop()});
    lfo.stop();
    noiseLfo.stop();
    noiseOsc.stop();

    background(255);
    step.v = 0;
    started = false;
    selectAll('.image-glitch').map(d => d.remove());
    gramatica = JSON.parse(JSON.stringify(copiaGramatica)); 
    a.fijarGramatica(gramatica).probarGramatica();
    synth.pause();
    synth.cancel();
    
    
  }
}

function draw() {
  if (started) {
    drawShapes();
    soundDinamics();
    t++;
  }

  if (step.v >= 10) {
    oscs.map(o => {o.stop()});
    lfo.stop();
    noiseLfo.stop();
    noiseOsc.stop();

    background(255);
    step.v = 0;
    started = false;
    textHTML.html('');
  }
}

function drawShapes() {
  if (step.v === 1) {
    trans = t;
  }
  if (step.v < 2) {
    background(255);
  } else if (step.v === 2) {
    const c = map(t, trans, trans * 1.2, 255, 0);
    background(c);
  } else {
    background(0);
  }

  grain();
  
  if (step.v > 0) {
    const wCol = step.v < 3 || step.v === 8 ? false : true;
    f.draw(wCol);
  }

  if (step.v >= 6) {
    for (let i = 0; i < pobsNum - 1; i++) {
      const wCol = step.v === 6 || step.v === 8 ? false : true;
      pobs[i].draw(wCol);
    }
  }
  
  if (step.v === 4 || step.v === 9) {
    if (random() > 0.6) {
      granular(Math.floor(noise(t) * 100)); // para los cantos
    }
  } else if (step.v === 8) {
    if (random() > 0.6) {
      granular(10);
    }
  } else if (random() > 0.99) {
    granular(100);
  } else {
    displace();
  }  
}

function grain() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    if (random() > 0.99) {
      pixels[i + 0] = random(255);
      pixels[i + 1] = random(255);
      pixels[i + 2] = random(255);
    }
  }
  updatePixels();
}

function displace() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    for (let j = 0; j < 30; j += 4) {
      pixels[i + j] = pixels[i + j + 4];
    }
  }
  updatePixels();
}

function scanlines() {
  for (let i = 0; i < height; i++) {
    if (random() > 0.7) {
      const r1 = random(0, width);
      const r2 = r1 + random(0, width - r1);
      stroke(0);
      line(r1, i, r2, i);
    }
  }
}

function granular(divs) {
  loadPixels();
  let newPixels = [];
  const chunk = Math.floor(pixels.length/divs);
  for (let i = 0; i < divs; i++) {
    const sli = [...pixels.slice(i * chunk, (i + 1) * chunk)];
    newPixels.push(sli);
  }
  const flattened = newPixels.sort(() => Math.random() - 0.5).flat();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = flattened[i];
    pixels[i + 1] = flattened[i + 1];
    pixels[i + 2] = flattened[i + 2];
  }
  updatePixels();
}

function getOrder(index) {
  const pobsSizeW = width / pobsNum;
  const pobsSizeH = height / pobsNum;
  const order = [
    () => [{x:(width/2)+random(-width/4,width/4), y:(height/2)+random(-height/4, height/4)}, pobsSizeH],
    () => [{x:(width/2)+random(-width/4,width/4), y:(height/2)+random(-height/4, height/4)}, pobsSizeH],
    (i) => [{x:(cos((360/pobsNum + 1) * i) * (height*0.4)) + width/2, y:(sin((360/pobsNum + 1) * i) * (height*0.4)) + height/2}, pobsSizeH],
    () => [{x:(width/2)+random(-width/4,width/4), y:(height/2)+random(-height/4, height/4)}, pobsSizeH],
    (i) => [{x:pobsSizeW+(pobsSizeW*i), y:pobsSizeH+(pobsSizeH*i)}, pobsSizeH],
    (i) => [{x:pobsSizeW+(pobsSizeW*i), y:pobsSizeH+(pobsSizeH*i)}, pobsSizeH],
    (i) => [{x:pobsSizeW+(pobsSizeW*i), y:height/2}, pobsSizeH],
    (i) => [{x:pobsSizeW+(pobsSizeW*i), y:height/2}, pobsSizeH],
    (i) => [{x:(cos((360/pobsNum + 1) * i) * (height*0.4)) + width/2, y:(sin((360/pobsNum + 1) * i) * (height*0.4)) + height/2}, pobsSizeH]
  ]
  return order[index]
}

async function prepareSpeech() {
  await  new Promise(res => {speechSynthesis.onvoiceschanged = () => res()});
  const synth = window.speechSynthesis;
  const voice = synth.getVoices()[9];
  if (performance.navigation.type == 1) {synth.pause(),synth.cancel();}
  return {synth, voice}
}

function textToSpeech(text, synth, voice) {
  const frase = new SpeechSynthesisUtterance(text);
  frase.pitch = 0.1;
  frase.rate = 0.6;
  frase.voice = voice;
  frase.volume = 0.3;
  synth.speak(frase);

  frase.addEventListener('boundary', function(event) {
    // console.log(event.elapsedTime);
    const index = event.charIndex;
    let word = text.slice(index).split(' ')[0].split('\n')[0];
    if (word.includes('-')) {
      step.v++;
      word = word.replace('-','');
    }
    textHTML.html(word);
  });

  frase.addEventListener('mark', function(event) {
    console.log('A mark was reached: ' + event.name);
  });
}

async function base64_arraybuffer(data) {
  const base64url = await new Promise((r) => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result)
    reader.readAsDataURL(new Blob([data]))
  })
  return base64url.split(",", 2)[1]
}

function randnum(n) {
  let num = ''
  for (let i = 0; i < n; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return num
}

const hexes = {
  mundo: {oscuro: '#000000', claro: '#ffffff'},
  general: {verde: '#50bf7e', rojo: '#f53b11', púrpura: '#9c50bf', azul: '#345ec7', amarillo: '#fcc728', anaranjado: '#ff821c', rosado: '#ff54b8'}
}