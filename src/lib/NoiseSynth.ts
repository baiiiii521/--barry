import { t } from "../i18n";

export class NoiseSynth {
   ctx: AudioContext;
   nodes: Record<string, { masterGain: GainNode, elements: any[] }> = {};
   
   constructor() {
     this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
   }
 
   createWhiteNoise() {
     const bufferSize = 2 * this.ctx.sampleRate;
     const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const output = noiseBuffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
         output[i] = Math.random() * 2 - 1;
     }
     const whiteNoise = this.ctx.createBufferSource();
     whiteNoise.buffer = noiseBuffer;
     whiteNoise.loop = true;
     return whiteNoise;
   }
 
   createPinkNoise() {
     const bufferSize = 2 * this.ctx.sampleRate;
     const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const output = noiseBuffer.getChannelData(0);
     let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
     for (let i = 0; i < bufferSize; i++) {
         const white = Math.random() * 2 - 1;
         b0 = 0.99886 * b0 + white * 0.0555179;
         b1 = 0.99332 * b1 + white * 0.0750759;
         b2 = 0.96900 * b2 + white * 0.1538520;
         b3 = 0.86650 * b3 + white * 0.3104856;
         b4 = 0.55000 * b4 + white * 0.5329522;
         b5 = -0.7616 * b5 - white * 0.0168980;
         output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
         output[i] *= 0.11; 
         b6 = white * 0.115926;
     }
     const pinkNoise = this.ctx.createBufferSource();
     pinkNoise.buffer = noiseBuffer;
     pinkNoise.loop = true;
     return pinkNoise;
   }
   
   createBrownNoise() {
     const bufferSize = 2 * this.ctx.sampleRate;
     const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const output = noiseBuffer.getChannelData(0);
     let lastOut = 0;
     for (let i = 0; i < bufferSize; i++) {
         const white = Math.random() * 2 - 1;
         output[i] = (lastOut + (0.02 * white)) / 1.02;
         lastOut = output[i];
         output[i] *= 3.5; 
     }
     const brownNoise = this.ctx.createBufferSource();
     brownNoise.buffer = noiseBuffer;
     brownNoise.loop = true;
     return brownNoise;
   }
 
   play(type: string) {
      if (this.nodes[type]) return; // already playing
      
      if (this.ctx.state === 'suspended') {
         this.ctx.resume();
      }
      
      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(this.ctx.destination);
      
      let elements: any[] = [];
      this.nodes[type] = { masterGain, elements };
      
      if (type === 'rain') {
          const rumble = this.createBrownNoise();
          const rumbleFilter = this.ctx.createBiquadFilter();
          rumbleFilter.type = 'lowpass';
          rumbleFilter.frequency.value = 400;
          const rumbleGain = this.ctx.createGain();
          rumbleGain.gain.value = 0.8;
          rumble.connect(rumbleFilter);
          rumbleFilter.connect(rumbleGain);
          rumbleGain.connect(masterGain);
          rumble.start();
          elements.push(rumble);

          const rainNoise = this.createPinkNoise();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1200;
          const rainGain = this.ctx.createGain();
          rainGain.gain.value = 0.5;
          rainNoise.connect(filter);
          filter.connect(rainGain);
          rainGain.connect(masterGain);
          rainNoise.start();
          elements.push(rainNoise);

          const dropNoise = this.createWhiteNoise();
          const dropFilter = this.ctx.createBiquadFilter();
          dropFilter.type = 'bandpass';
          dropFilter.frequency.value = 2500;
          dropFilter.Q.value = 1.0;
          const dropGainNode = this.ctx.createGain();
          dropGainNode.gain.value = 0;
          dropNoise.connect(dropFilter);
          dropFilter.connect(dropGainNode);
          dropGainNode.connect(masterGain);
          dropNoise.start();
          elements.push(dropNoise);

          const triggerDrop = () => {
              if (!this.nodes[type]) return;
              const now = this.ctx.currentTime;
              dropGainNode.gain.cancelScheduledValues(now);
              dropGainNode.gain.setValueAtTime(0, now);
              dropGainNode.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.3, now + 0.01);
              dropGainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
              setTimeout(triggerDrop, 50 + Math.random() * 200);
          };
          triggerDrop();
          triggerDrop();
      } else if (type === 'ocean') {
          const noise = this.createPinkNoise();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 400;
          filter.Q.value = 0.5;
          const filterGain = this.ctx.createGain();
          filterGain.gain.value = 2.0;

          const lfo = this.ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.08; 
          const lfoFreqGain = this.ctx.createGain();
          lfoFreqGain.gain.value = 300;
          lfo.connect(lfoFreqGain);
          lfoFreqGain.connect(filter.frequency);
          
          noise.connect(filter);
          filter.connect(filterGain);
          filterGain.connect(masterGain);
          noise.start();
          lfo.start();
          elements.push(noise, lfo);
      } else if (type === 'wind') {
          const noise = this.createPinkNoise();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          
          const lfo = this.ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.15; 
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.value = 200;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          noise.connect(filter);
          filter.connect(masterGain);
          noise.start();
          lfo.start();
          elements.push(noise, lfo);
      } else if (type === 'fire') {
          const base = this.createBrownNoise();
          const baseFilter = this.ctx.createBiquadFilter();
          baseFilter.type = 'lowpass';
          baseFilter.frequency.value = 300;
          const baseGain = this.ctx.createGain();
          baseGain.gain.value = 2.0;
          base.connect(baseFilter);
          baseFilter.connect(baseGain);
          baseGain.connect(masterGain);
          base.start();
          elements.push(base);
          
          // Crackles
          const crackleBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
          const crackleData = crackleBuffer.getChannelData(0);
          for(let i=0; i<crackleBuffer.length; i++) {
              if (Math.random() > 0.9997) crackleData[i] = Math.random() * 2 - 1;
              else crackleData[i] = 0;
          }
          const crackleSource = this.ctx.createBufferSource();
          crackleSource.buffer = crackleBuffer;
          crackleSource.loop = true;
          const crackleFilter = this.ctx.createBiquadFilter();
          crackleFilter.type = 'highpass';
          crackleFilter.frequency.value = 5000;
          const crackleGain = this.ctx.createGain();
          crackleGain.gain.value = 6.0; 
          crackleSource.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(masterGain);
          crackleSource.start();
          elements.push(crackleSource);
      } else if (type === 'stream') {
          const noise = this.createPinkNoise();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1500;
          filter.Q.value = 0.5;
          const gain = this.ctx.createGain();
          gain.gain.value = 4.0;
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          noise.start();
          elements.push(noise);
      } else if (type === 'train') {
          const noise = this.createBrownNoise();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          
          const lfo = this.ctx.createOscillator();
          lfo.type = 'square';
          lfo.frequency.value = 4; // fast chunks
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.value = 200;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.value = 3.0;
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start();
          lfo.start();
          elements.push(noise, lfo);
      } else if (type === 'birds') {
          const windNoise = this.createBrownNoise();
          const windFilter = this.ctx.createBiquadFilter();
          windFilter.type = 'lowpass';
          windFilter.frequency.value = 300;
          const windGain = this.ctx.createGain();
          windGain.gain.value = 0.4;
          windNoise.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(masterGain);
          windNoise.start();
          elements.push(windNoise);

          const makeBird = () => {
              if (!this.nodes[type]) return;

              const osc = this.ctx.createOscillator();
              osc.type = 'sine';
              const birdGain = this.ctx.createGain();
              birdGain.gain.value = 0;
              osc.connect(birdGain);
              birdGain.connect(masterGain);
              
              const now = this.ctx.currentTime;
              osc.start(now);
              
              const chirps = 1 + Math.floor(Math.random() * 3);
              const baseFreq = 3000 + Math.random() * 2000;
              
              let t = now;
              for(let i = 0; i < chirps; i++) {
                 if (Math.random() < 0.5) {
                    osc.frequency.setValueAtTime(baseFreq - 500, t);
                    osc.frequency.linearRampToValueAtTime(baseFreq + 1000, t + 0.1);
                 } else {
                    osc.frequency.setValueAtTime(baseFreq + 1000, t);
                    osc.frequency.linearRampToValueAtTime(baseFreq - 500, t + 0.1);
                 }
                 birdGain.gain.setValueAtTime(0, t);
                 birdGain.gain.linearRampToValueAtTime(0.5, t + 0.02);
                 birdGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                 t += 0.15 + Math.random() * 0.1;
              }
              osc.stop(t + 0.1);
              
              setTimeout(makeBird, 1500 + Math.random() * 5000);
          };
          makeBird();
          setTimeout(makeBird, 2000);
      } else if (type === 'keyboard') {
          const keyNoise = this.createWhiteNoise();
          const keyFilter = this.ctx.createBiquadFilter();
          keyFilter.type = 'bandpass';
          keyFilter.frequency.value = 1500;
          keyFilter.Q.value = 1.0;
          const keyGain = this.ctx.createGain();
          keyGain.gain.value = 0;
          keyNoise.connect(keyFilter);
          keyFilter.connect(keyGain);
          keyGain.connect(masterGain);
          keyNoise.start();
          elements.push(keyNoise);
          
          let isTyping = false;

          const typeCharacter = () => {
              if (!this.nodes[type]) return;
              if (isTyping) {
                  const now = this.ctx.currentTime;
                  keyGain.gain.cancelScheduledValues(now);
                  keyGain.gain.setValueAtTime(0, now);
                  keyGain.gain.linearRampToValueAtTime(0.6 + Math.random() * 0.4, now + 0.005);
                  keyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
                  
                  if (Math.random() < 0.15) {
                      isTyping = false;
                      setTimeout(typeWord, 200 + Math.random() * 600);
                  } else {
                      setTimeout(typeCharacter, 50 + Math.random() * 120);
                  }
              }
          };

          const typeWord = () => {
              if (!this.nodes[type]) return;
              isTyping = true;
              typeCharacter();
          };
          
          typeWord();
      } else if (type === 'clock') {
          const tickOsc = this.ctx.createOscillator();
          tickOsc.type = 'sine';
          const tickGain = this.ctx.createGain();
          tickGain.gain.value = 0;
          tickOsc.connect(tickGain);
          tickGain.connect(masterGain);
          tickOsc.start();
          elements.push(tickOsc);
          
          const tickNoise = this.createWhiteNoise();
          const tickNoiseFilter = this.ctx.createBiquadFilter();
          tickNoiseFilter.type = 'highpass';
          tickNoiseFilter.frequency.value = 3500;
          const tickNoiseGain = this.ctx.createGain();
          tickNoiseGain.gain.value = 0;
          tickNoise.connect(tickNoiseFilter);
          tickNoiseFilter.connect(tickNoiseGain);
          tickNoiseGain.connect(masterGain);
          tickNoise.start();
          elements.push(tickNoise);

          let tickCount = 0;

          const tick = () => {
              if (!this.nodes[type]) return;
              const now = this.ctx.currentTime;
              
              const isTock = tickCount % 2 !== 0;
              tickCount++;
              
              const oscFreq = isTock ? 900 : 1100;
              tickOsc.frequency.setValueAtTime(oscFreq, now);
              tickOsc.frequency.exponentialRampToValueAtTime(oscFreq * 0.7, now + 0.05);
              
              tickGain.gain.cancelScheduledValues(now);
              tickGain.gain.setValueAtTime(0, now);
              tickGain.gain.linearRampToValueAtTime(0.5, now + 0.005);
              tickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

              tickNoiseGain.gain.cancelScheduledValues(now);
              tickNoiseGain.gain.setValueAtTime(0, now);
              tickNoiseGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
              tickNoiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
              
              setTimeout(tick, 1000);
          };
          tick();
      } else {
          // Default
          const noise = this.createBrownNoise();
          const gain = this.ctx.createGain();
          gain.gain.value = 1.0;
          noise.connect(gain);
          gain.connect(masterGain);
          noise.start();
          elements.push(noise);
      }
      
      // Fade in base volume based on sound type
      let maxVol = 1.0;
      if (type === 'ocean' || type === 'wind' || type === 'stream') maxVol = 0.6;
      if (type === 'fire') maxVol = 1.5;
      if (type === 'rain') maxVol = 1.2;
      if (type === 'birds' || type === 'keyboard' || type === 'clock') maxVol = 0.8;
      
      masterGain.gain.setTargetAtTime(maxVol, this.ctx.currentTime, 1.0);
   }
   
   stop(type: string) {
       const node = this.nodes[type];
       if (!node) return;
       
       // Fade out
       node.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
       setTimeout(() => {
           node.elements.forEach((el: any) => {
               try { el.stop(); } catch(e) {}
               try { el.disconnect(); } catch(e) {}
           });
           try { node.masterGain.disconnect(); } catch (e) {}
       }, 2000);
       delete this.nodes[type];
   }
   
   stopAll() {
       Object.keys(this.nodes).forEach(type => this.stop(type));
   }
 }
 
 let synthSingleton: NoiseSynth | null = null;
 
 export const getNoiseSynth = () => {
    if (!synthSingleton) {
        synthSingleton = new NoiseSynth();
    }
    return synthSingleton;
 }
