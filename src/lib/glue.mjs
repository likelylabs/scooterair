// Line-break glue for Chinese text in headlines, buttons, fold titles, labels and links.
//
// Chinese has no spaces, so a browser may end a line between any two characters: at 320 px 特大
// 「廢氣」 can become 「廢 / 氣」. This wraps each short word (two to four Chinese characters, as
// the browser's own word segmenter finds them) in <span class="nobr"> (white-space: nowrap in
// global.css), so a line breaks between words, never inside one. A closing mark (，。？) and a
// 注音 group stay with the word before them, as before. Longer runs are left breakable, and only
// single words are glued, so nothing can grow wider than a line and push the page sideways.
//
// Used by the build step over the finished HTML (astro.config.mjs), by <Phrased> and by the
// home page's phrasedHtml() for text drawn in the browser. Text only: pass it a run of text
// with no tags in it (HTML entities are fine).

const HAN = /[㐀-鿿]/;
const ALL_HAN = /^[㐀-鿿]+$/;
const CLOSE = /^[，。？！；：、）」』〉》…\uE000-\uF8FF]+$/;
const ZHUYIN = /（[㄀-ㄯˇˊˋ˙]+）/g;
const OLD = /([㐀-鿿])([，。？！；：、）」』〉》…]+)/g;

let seg = null;
try {
  seg = new Intl.Segmenter('zh-Hant', { granularity: 'word' });
} catch {
  seg = null;
}

/** @param {string} text a run of text with no tags @returns {string} the same text, as HTML with nobr spans */
export function glueZh(text) {
  if (!HAN.test(text)) return text;
  if (!seg) return gluePunct(text);
  // a 注音 group is held as one private-use character while segmenting, so it travels with its word
  const zy = [];
  const held = text.replace(ZHUYIN, (m) => {
    zy.push(m);
    return String.fromCharCode(0xe000 + zy.length - 1);
  });
  const parts = [...seg.segment(held)].map((s) => s.segment);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    let marks = '';
    while (i + 1 < parts.length && CLOSE.test(parts[i + 1])) marks += parts[++i];
    const n = [...w].length;
    if (ALL_HAN.test(w) && n >= 2 && n <= 4) out += `<span class="nobr">${w}${marks}</span>`;
    else if (marks && HAN.test(w.slice(-1))) {
      // a one-character word before a closing mark takes the character before it along
      // (「證｜據：」 stays 「證據：」, 「換｜車，」 stays 「換車，」): never a lone character and its mark
      const lone = n === 1 && ALL_HAN.test(w) ? out.match(/([㐀-鿿])$/) : null;
      if (lone) out = out.slice(0, -1) + `<span class="nobr">${lone[1]}${w}${marks}</span>`;
      // after a glued word it joins that word (「一層｜裡。」 stays 「一層裡。」)
      else if (n === 1 && ALL_HAN.test(w) && out.endsWith('</span>')) out = out.slice(0, -7) + `${w}${marks}</span>`;
      else out += `${w.slice(0, -1)}<span class="nobr">${w.slice(-1)}${marks}</span>`;
    } else out += w + marks;
  }
  // nor a lone character at either end of the run: 「全部沒有｜了」 and 「中｜低收入｜戶」 keep it with its neighbour
  out = out
    .replace(/<span class="nobr">([^<]*)<\/span>([㐀-鿿][，。？！；：、）」』〉》…]*)$/, '<span class="nobr">$1$2</span>')
    .replace(/^([㐀-鿿])<span class="nobr">/, '<span class="nobr">$1');
  return wrap(out.replace(/[\uE000-\uF8FF]/g, (c) => zy[c.charCodeAt(0) - 0xe000] ?? c));
}

// The glued run is held in one inline span. Inside a flex or grid parent each child element is
// its own item, so loose nobr spans would each become an item, with the parent's gap opening
// inside a phrase and the words reflowing into columns. One span keeps the run one item, as the
// plain text was.
const wrap = (html) => (html.includes('class="nobr"') ? `<span class="gl">${html}</span>` : html);

/** Only the old rule: a Chinese character and the closing marks after it stay together (body-like text). */
export function gluePunct(text) {
  return wrap(text.replace(OLD, '<span class="nobr">$1$2</span>'));
}

/** glueZh over an HTML string: text between tags only. */
export function glueHtml(html) {
  return html
    .split(/(<[^>]+>)/)
    .map((x) => (x.startsWith('<') ? x : glueZh(x)))
    .join('');
}
