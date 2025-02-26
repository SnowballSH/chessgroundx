import { HeadlessState } from './state';
import { setVisible, createEl } from './util';
import { colors, files, ranks, ranks10, shogiVariants, xiangqiVariants, Elements, Notation } from './types';
import { createElement as createSVG, setAttributes } from './svg';

export function renderWrap(element: HTMLElement, s: HeadlessState): Elements {
  // .cg-wrap (element passed to Chessground)
  //   cg-container
  //     cg-board
  //     svg.cg-shapes
  //       defs
  //       g
  //     svg.cg-custom-svgs
  //       g
  //     coords.ranks
  //     coords.files
  //     piece.ghost

  element.innerHTML = '';

  // ensure the cg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling chessground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('cg-wrap');

  for (const c of colors) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const container = createEl('cg-container');
  element.appendChild(container);

  const extension = createEl('extension');
  container.appendChild(extension);
  const board = createEl('cg-board');
  container.appendChild(board);

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  if (s.drawable.visible) {
    const width = s.dimensions.width;
    const height = s.dimensions.height;
    svg = setAttributes(createSVG('svg'), {
      class: 'cg-shapes',
      viewBox: `${-width / 2} ${-height / 2} ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid slice',
    });
    svg.appendChild(createSVG('defs'));
    svg.appendChild(createSVG('g'));
    customSvg = setAttributes(createSVG('svg'), {
      class: 'cg-custom-svgs',
      viewBox: `${-(width - 1) / 2} ${-(height - 1) / 2} ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid slice',
    });
    customSvg.appendChild(createSVG('g'));
    container.appendChild(svg);
    container.appendChild(customSvg);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    if (shogiVariants.includes(s.variant)) {
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.height).reverse(), 'files' + orientClass));
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'ranks' + orientClass));
    } else if (s.notation === Notation.JANGGI) {
      container.appendChild(renderCoords(['0'].concat(ranks.slice(0, 9).reverse()), 'ranks' + orientClass));
      container.appendChild(renderCoords(ranks.slice(0, 9), 'files' + orientClass));
    } else if (xiangqiVariants.includes(s.variant)) {
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'files' + orientClass));
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'ranks' + orientClass));
    } else {
      container.appendChild(renderCoords(ranks10.slice(0, s.dimensions.height), 'ranks' + orientClass));
      container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + orientClass));
    }
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.showGhost) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return {
    board,
    container,
    wrap: element,
    ghost,
    svg,
    customSvg,
  };
}

function renderCoords(elems: readonly string[], className: string): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (const elem of elems) {
    f = createEl('coord');
    f.textContent = elem;
    el.appendChild(f);
  }
  return el;
}
