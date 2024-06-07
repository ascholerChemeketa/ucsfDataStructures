

export class Colors {
  static BASE = "var(--svgColor)";
  static HIGHLIGHT = "var(--svgColor--highlight)";
  static ALT_HIGHLIGHT = "var(--svgColor--althighlight)";
  static FILL = "var(--svgFillColor)";
}

export class RandomGenerator {
  constructor(seed) {
    this.generator = RandomGenerator.sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
  }
  static sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }
  
  nextInt(min, max) {
    return Math.floor(this.generator() * max) + min;
  }

  getInts(min, max, count) {
    let ints = [];
    for (let i = 0; i < count; i++) {
      ints.push(this.nextInt(min, max));
    }
    return ints;
  }
}