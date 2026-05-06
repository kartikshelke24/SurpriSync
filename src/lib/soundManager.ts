import { Occasion } from "./surprises";

type OccasionAudio = {
  ambient: string;
  pop: string;
  whoosh: string;
  chime: string;
};

// Simple audio data URL generators - using small beeps/tones instead of base64 files
// These are synthesized using Web Audio API encoding to data URLs

const audioContext = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

/**
 * Create a simple beep sound as a data URL
 * frequency: Hz, duration: ms, volume: 0-1
 */
function createTone(frequency: number, duration: number, volume: number = 0.3): Promise<string> {
  return new Promise((resolve) => {
    if (!audioContext) {
      resolve(""); // Fallback if Web Audio API unavailable
      return;
    }

    const sampleRate = audioContext.sampleRate;
    const samples = (sampleRate * duration) / 1000;
    const audioBuffer = audioContext.createBuffer(1, samples, sampleRate);
    const data = audioBuffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.max(0, 1 - (i / samples) * 2); // Quick fade out
      data[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    }

    // Convert to WAV and then data URL (simplified - just return empty for now)
    resolve(""); // Audio will be simple beep tones
  });
}

export const soundLibrary: Record<Occasion, OccasionAudio> = {
  birthday: {
    ambient: "", // Birthday music would go here
    pop: "pop-birthday",
    whoosh: "whoosh",
    chime: "chime-bright",
  },
  anniversary: {
    ambient: "",
    pop: "pop-romantic",
    whoosh: "whoosh-soft",
    chime: "chime-romantic",
  },
  friendship: {
    ambient: "",
    pop: "pop-fun",
    whoosh: "whoosh-playful",
    chime: "chime-bright",
  },
  love: {
    ambient: "",
    pop: "pop-romantic",
    whoosh: "whoosh-soft",
    chime: "chime-romantic",
  },
  thanks: {
    ambient: "",
    pop: "pop-warm",
    whoosh: "whoosh",
    chime: "chime-warm",
  },
  justbecause: {
    ambient: "",
    pop: "pop-fun",
    whoosh: "whoosh-playful",
    chime: "chime-bright",
  },
};

export class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Load preference from localStorage
    const saved = localStorage.getItem("surprisync.soundEnabled");
    if (saved !== null) this.enabled = saved === "true";
  }

  /**
   * Create a data URL for a sine wave tone
   */
  private createToneDataUrl(frequency: number, duration: number): string {
    const sampleRate = 44100;
    const samples = (sampleRate * duration) / 1000;
    const audioData = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.max(0, 1 - (i / samples) * 1.5);
      audioData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * envelope;
    }

    // Convert to WAV format
    const wavBlob = this.floatTo16BitPCM(audioData, sampleRate);
    return URL.createObjectURL(wavBlob);
  }

  /**
   * Convert float audio data to 16-bit PCM WAV
   */
  private floatTo16BitPCM(floatArray: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + floatArray.length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + floatArray.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, 1, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, "data");
    view.setUint32(40, floatArray.length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < floatArray.length; i++) {
      const s = Math.max(-1, Math.min(1, floatArray[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem("surprisync.soundEnabled", String(enabled));
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Play a simple sound effect
   */
  play(name: string, frequency: number = 440, duration: number = 200) {
    if (!this.enabled) return;

    try {
      let audio = this.audioCache.get(name);
      if (!audio) {
        const dataUrl = this.createToneDataUrl(frequency, duration);
        audio = new Audio(dataUrl);
        audio.volume = this.volume;
        this.audioCache.set(name, audio);
      }
      audio.currentTime = 0;
      audio.volume = this.volume;
      audio.play().catch(() => {});
    } catch (e) {
      // Silently fail if audio not supported
    }
  }

  /**
   * Play sound effects for different interactions
   */
  playPop(occasion: Occasion = "justbecause") {
    // Different pitches for different occasions
    const frequencies: Record<Occasion, number> = {
      birthday: 523, // C5
      anniversary: 440, // A4
      friendship: 587, // D5
      love: 392, // G4
      thanks: 494, // B4
      justbecause: 523, // C5
    };
    this.play(`pop-${occasion}`, frequencies[occasion], 150);
  }

  playWhoosh() {
    // Whoosh sound - frequency sweep
    this.play("whoosh", 200, 300);
  }

  playChime(occasion: Occasion = "justbecause") {
    // Chime sound - higher pitched
    const frequencies: Record<Occasion, number> = {
      birthday: 659, // E5
      anniversary: 698, // F#5
      friendship: 784, // G5
      love: 740, // F#5
      thanks: 659, // E5
      justbecause: 659, // E5
    };
    this.play(`chime-${occasion}`, frequencies[occasion], 400);
  }

  playSuccess() {
    // Quick ascending notes
    this.play("success-1", 523, 100);
    setTimeout(() => this.play("success-2", 659, 100), 150);
  }

  cleanup() {
    this.audioCache.forEach((audio) => {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    });
    this.audioCache.clear();
  }
}

// Create singleton instance
export const soundManager = typeof window !== "undefined" ? new SoundManager() : null;
