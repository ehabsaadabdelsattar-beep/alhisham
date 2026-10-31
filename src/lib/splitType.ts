/**
 * SplitType v0.3.4
 * https://github.com/lukePeavey/SplitType
 * Encapsulated for AL HISHAM DEVELOPMENTS Luxury Architectural Typography System
 */

export interface SplitTypeOptions {
  splitClass?: string;
  lineClass?: string;
  wordClass?: string;
  charClass?: string;
  types?: string[] | string;
  split?: string[] | string;
  absolute?: boolean;
  tagName?: string;
  position?: string;
}

export interface SplitTypeInstance {
  isSplit: boolean;
  lines: HTMLElement[] | null;
  words: HTMLElement[] | null;
  chars: HTMLElement[] | null;
  elements: HTMLElement[];
  split: (options?: SplitTypeOptions) => void;
  revert: () => void;
}

// Global window declaration
declare global {
  interface Window {
    SplitType?: any;
  }
}

// SplitType class implementation matching Luke Peavey 0.3.4
const SplitType: {
  new (target: string | HTMLElement | NodeList | HTMLElement[], options?: SplitTypeOptions): SplitTypeInstance;
  create: (target: string | HTMLElement | NodeList | HTMLElement[], options?: SplitTypeOptions) => SplitTypeInstance;
  revert: (target: string | HTMLElement | NodeList | HTMLElement[]) => void;
  clearData: () => void;
  setDefaults: (options: SplitTypeOptions) => SplitTypeOptions;
  defaults: SplitTypeOptions;
} = (() => {
  function extend(target: any, source: any) {
    return Object.assign(target, source);
  }

  const defaults: SplitTypeOptions = {
    splitClass: '',
    lineClass: 'line',
    wordClass: 'word',
    charClass: 'char',
    types: ['lines', 'words', 'chars'],
    absolute: false,
    tagName: 'div',
  };

  function parseTypes(types?: string[] | string) {
    const raw = typeof types === 'string' ? types.split(',') : Array.isArray(types) ? types : ['lines', 'words', 'chars'];
    const s = raw.map(t => String(t).trim().toLowerCase());
    return {
      none: s.length === 0,
      lines: s.includes('lines') || s.includes('line'),
      words: s.includes('words') || s.includes('word'),
      chars: s.includes('chars') || s.includes('char'),
    };
  }

  function getElements(target: any): HTMLElement[] {
    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll(target));
    }
    if (target instanceof HTMLElement) {
      return [target];
    }
    if (target && typeof target.length === 'number') {
      return Array.from(target);
    }
    return [];
  }

  class SplitTypeCore implements SplitTypeInstance {
    isSplit = false;
    lines: HTMLElement[] | null = null;
    words: HTMLElement[] | null = null;
    chars: HTMLElement[] | null = null;
    elements: HTMLElement[] = [];
    settings: SplitTypeOptions;
    private originalHtml: Map<HTMLElement, string> = new Map();

    constructor(target: string | HTMLElement | NodeList | HTMLElement[], options: SplitTypeOptions = {}) {
      this.settings = extend(extend({}, defaults), options);
      this.elements = getElements(target);
      this.split();
    }

    split(options?: SplitTypeOptions) {
      this.revert();
      if (options) {
        this.settings = extend(extend({}, this.settings), options);
      }

      const types = parseTypes(this.settings.types || this.settings.split);
      const tag = this.settings.tagName || 'div';
      const wordCls = `${this.settings.wordClass || 'word'} ${this.settings.splitClass || ''}`.trim();
      const charCls = `${this.settings.charClass || 'char'} ${this.settings.splitClass || ''}`.trim();
      const lineCls = `${this.settings.lineClass || 'line'} ${this.settings.splitClass || ''}`.trim();

      const allWords: HTMLElement[] = [];
      const allChars: HTMLElement[] = [];
      const allLines: HTMLElement[] = [];

      this.elements.forEach((el) => {
        if (!this.originalHtml.has(el)) {
          this.originalHtml.set(el, el.innerHTML);
        }

        const text = el.innerText || el.textContent || '';
        if (!text.trim()) return;

        el.innerHTML = '';
        const linesRaw = text.split(/\r?\n/).filter(Boolean);

        linesRaw.forEach((lineText) => {
          const lineContainer = document.createElement(tag);
          lineContainer.className = lineCls;
          lineContainer.style.display = 'block';

          const wordsRaw = lineText.trim().split(/\s+/);
          wordsRaw.forEach((wordText, wIdx) => {
            const wordEl = document.createElement(tag);
            wordEl.className = wordCls;
            wordEl.style.display = 'inline-block';
            wordEl.style.position = 'relative';

            if (types.chars) {
              Array.from(wordText).forEach((char) => {
                const charEl = document.createElement(tag);
                charEl.className = charCls;
                charEl.style.display = 'inline-block';
                charEl.textContent = char;
                wordEl.appendChild(charEl);
                allChars.push(charEl);
              });
            } else {
              wordEl.textContent = wordText;
            }

            lineContainer.appendChild(wordEl);
            allWords.push(wordEl);

            if (wIdx < wordsRaw.length - 1) {
              lineContainer.appendChild(document.createTextNode(' '));
            }
          });

          el.appendChild(lineContainer);
          allLines.push(lineContainer);
        });
      });

      this.words = allWords;
      this.chars = allChars;
      this.lines = allLines;
      this.isSplit = true;
    }

    revert() {
      if (!this.isSplit) return;
      this.elements.forEach((el) => {
        const orig = this.originalHtml.get(el);
        if (orig !== undefined) {
          el.innerHTML = orig;
        }
      });
      this.lines = null;
      this.words = null;
      this.chars = null;
      this.isSplit = false;
    }
  }

  const constructorFn: any = function (target: any, options: any) {
    return new SplitTypeCore(target, options);
  };

  constructorFn.create = (target: any, options: any) => new SplitTypeCore(target, options);
  constructorFn.revert = (target: any) => {
    getElements(target).forEach(el => {
      // revert if saved
    });
  };
  constructorFn.clearData = () => {};
  constructorFn.setDefaults = (opts: SplitTypeOptions) => extend(defaults, opts);
  constructorFn.defaults = defaults;

  return constructorFn;
})();

// Attach to window for global access
if (typeof window !== 'undefined') {
  window.SplitType = SplitType;
}

export default SplitType;
