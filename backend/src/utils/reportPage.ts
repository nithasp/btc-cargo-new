import { Column } from '../types/report.types';
import { escapeHtml } from './format';

// The embedding page calls iFrameResize() on these frames, which needs this script on the inside
export const IFRAME_RESIZER_ORIGIN = 'https://cdnjs.cloudflare.com';
const IFRAME_RESIZER = `${IFRAME_RESIZER_ORIGIN}/ajax/libs/iframe-resizer/4.3.2/iframeResizer.contentWindow.min.js`;

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 4px; font-family: 'Open Sans', 'Kanit', Arial, sans-serif; color: #32325d; background: #fff; font-size: 14px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .range { color: #8898aa; font-size: 12px; margin: 0 0 16px; }
  .cards { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .card { flex: 1 1 150px; padding: 14px 16px; border-radius: 8px; background: #f6f9fc; border: 1px solid #e9ecef; }
  .card span { display: block; color: #8898aa; font-size: 12px; margin-bottom: 6px; }
  .card strong { font-size: 20px; }
  .card.primary strong { color: #5e72e4; }
  .card.success strong { color: #2dce89; }
  .card.danger strong { color: #f5365c; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #8898aa; background: #f6f9fc; padding: 10px 12px; border-bottom: 1px solid #e9ecef; }
  td { padding: 10px 12px; border-bottom: 1px solid #e9ecef; }
  td.num, th.num { text-align: right; }
  .empty { padding: 28px; text-align: center; color: #8898aa; background: #f6f9fc; border-radius: 8px; }
  .chart { width: 100%; height: auto; margin-bottom: 12px; }
  .chart rect { fill: #5e72e4; }
  .chart text { fill: #8898aa; font-size: 10px; }
  .bar { height: 22px; border-radius: 11px; background: #e9ecef; overflow: hidden; margin: 10px 0 6px; }
  .bar div { height: 100%; border-radius: 11px; background: linear-gradient(90deg, #2dce89, #2dcecc); }
  .message { padding: 40px 16px; text-align: center; color: #8898aa; }
`;

export function reportPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${STYLES}</style>
  </head>
  <body>
    ${body}
    <script src="${IFRAME_RESIZER}"></script>
  </body>
</html>
`;
}

export const heading = (title: string, range: string): string =>
  `<h1>${escapeHtml(title)}</h1><p class="range">${escapeHtml(range)}</p>`;

export const messagePage = (title: string, message: string): string =>
  reportPage(title, `<div class="message">${escapeHtml(message)}</div>`);

export const cards = (items: { label: string; value: string; tone?: string }[]): string =>
  `<div class="cards">${items
    .map(
      (item) =>
        `<div class="card ${escapeHtml(item.tone ?? '')}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`,
    )
    .join('')}</div>`;

export function table(columns: Column[], rows: (string | number)[][], empty: string): string {
  if (!rows.length) return `<div class="empty">${escapeHtml(empty)}</div>`;

  const cell = (tag: 'th' | 'td', value: string | number, index: number): string =>
    `<${tag}${columns[index]?.numeric ? ' class="num"' : ''}>${escapeHtml(value)}</${tag}>`;

  const head = columns.map((column, index) => cell('th', column.label, index)).join('');
  const body = rows
    .map((row) => `<tr>${row.map((value, index) => cell('td', value, index)).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function barChart(points: { label: string; value: number }[]): string {
  if (!points.length) return '';

  const width = 720;
  const height = 200;
  const top = 12;
  const bottom = 24;
  const max = Math.max(...points.map((point) => point.value), 1);
  const slot = width / points.length;
  const labelEvery = Math.ceil(points.length / 10);

  const bars = points
    .map((point, index) => {
      const barHeight = Math.max(1, (point.value / max) * (height - top - bottom));
      const x = index * slot + slot * 0.15;
      const y = height - bottom - barHeight;
      const label =
        index % labelEvery === 0
          ? `<text x="${(index * slot + slot / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle">${escapeHtml(point.label)}</text>`
          : '';
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(slot * 0.7).toFixed(1)}" height="${barHeight.toFixed(1)}" rx="3"><title>${escapeHtml(`${point.label}: ${point.value.toFixed(2)}`)}</title></rect>${label}`;
    })
    .join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img">${bars}</svg>`;
}

export function progress(percent: number): string {
  const bounded = Math.min(100, Math.max(0, percent));
  return `<div class="bar"><div style="width:${bounded.toFixed(1)}%"></div></div>`;
}
