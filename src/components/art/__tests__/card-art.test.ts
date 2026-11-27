// The share cards: every card has a picture of the card's shape, its words sit inside the
// central square and 60 px from every edge, and its headline is short and carries no number.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARD, CARD_ART_KINDS, SQUARE, TAG_H, cardArt } from '../card-art.ts';
import { ogText, shareCard, shareCardContent, shareCardIds } from '../../../lib/share-cards.ts';

const o = { inlet: { lo: 2.5, hi: 3.5 }, red: 90 };

test('every picture has the card’s shape and draws without a missing number', () => {
  for (const kind of CARD_ART_KINDS) {
    const a = cardArt(kind, o);
    assert.ok(Math.abs(a.box.w / a.box.h - CARD.w / CARD.h) < 0.001, `${kind}: frame is not 1200 × 630`);
    assert.doesNotMatch(a.svg, /NaN|undefined/, `${kind}: a coordinate is missing`);
    assert.ok(a.svg.length > 2000, `${kind}: the picture is empty`);
  }
});

test('the words sit inside the central square, 60 px from every edge', () => {
  for (const kind of CARD_ART_KINDS) {
    const { head, tag } = cardArt(kind, o).layout;
    assert.ok(head.x >= SQUARE.x0 && head.x + head.w <= SQUARE.x1, `${kind}: headline box leaves the central square`);
    assert.ok(head.y >= CARD.edge && head.y + head.h <= CARD.h - CARD.edge, `${kind}: headline box is too near the top or bottom`);
    assert.ok(tag.x >= SQUARE.x0 && tag.x <= SQUARE.x1 && tag.y >= CARD.edge && tag.y + TAG_H <= CARD.h - CARD.edge, `${kind}: the 示意圖 plate is outside the safe area`);
    // X lays the link's title over the card's bottom-left: the plate is on the right half
    assert.ok(tag.end && tag.x > CARD.w / 2, `${kind}: the 示意圖 plate is in the bottom-left corner`);
  }
});

test('headlines are short and carry no number; alt text says it is an illustration', () => {
  for (const id of shareCardIds) {
    const zh = shareCardContent(id, 'zh-TW');
    const en = shareCardContent(id, 'en');
    const han = [...zh.title].filter((c) => /\p{Script=Han}/u.test(c)).length;
    assert.ok(han <= 10, `${id}: Chinese headline has ${han} characters (max 10)`);
    const words = en.title.replaceAll('|', '').trim().split(/\s+/).length;
    assert.ok(words <= 6, `${id}: English headline has ${words} words (max 6)`);
    assert.doesNotMatch(zh.title + en.title, /\d/, `${id}: a headline with a number needs its 推估 mark; keep numbers on the page`);
    assert.match(zh.alt, /示意圖/, `${id}: zh alt`);
    assert.match(en.alt, /illustration/i, `${id}: en alt`);
    assert.equal(shareCard(id, 'en').wide, `/share/en/${id}.png`);
  }
});

test('og text is found by the page’s path; question pages keep their own', () => {
  assert.equal(ogText('', 'zh-TW')?.title, ogText('/', 'zh-TW')?.title);
  assert.ok(ogText('90/', 'en')?.title.includes('One red light') || ogText('90/', 'en')?.title.includes('one red light'));
  assert.ok(ogText('/evidence/', 'en'));
  assert.equal(ogText('questions/smell', 'zh-TW'), null);
  for (const loc of ['zh-TW', 'en'] as const)
    for (const p of ['', 'about', 'act', 'electric', 'estimate', 'evidence', 'sources', 'questions', '90']) {
      const t = ogText(p, loc);
      assert.ok(t && t.title && t.description, `${p} ${loc}`);
      // one sentence: no full stop before the end
      assert.doesNotMatch(t!.description.slice(0, -1), loc === 'en' ? /\.\s/ : /。/, `${p} ${loc}: description is more than one sentence`);
    }
});
