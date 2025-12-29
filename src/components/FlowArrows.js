/**
 * Flow Arrows Component
 * Renders SVG arrows between connected screens - Figma style (Orthogonal)
 */

export function renderFlowArrows(screens, flows) {
  if (!flows || flows.length === 0) return '';

  const screenPositions = {};
  screens.forEach(screen => {
    screenPositions[screen.id] = {
      x: screen.position.x,
      y: screen.position.y,
      centerX: screen.position.x + 140,
      centerY: screen.position.y + 300,
      right: screen.position.x + 280,
      bottom: screen.position.y + 600,
      width: 280,
      height: 600
    };
  });

  // Definition of markers and filters
  let arrowsHtml = `
    <svg class="flow-arrows" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 100;">
      <defs>
        <!-- Start Dot Marker -->
        <marker 
          id="arrow-start-dot" 
          markerWidth="8" 
          markerHeight="8" 
          refX="4" 
          refY="4" 
          orient="auto"
        >
          <circle cx="4" cy="4" r="3" fill="#333333" />
        </marker>
        
        <!-- End Arrowhead Marker -->
        <marker 
          id="arrow-head" 
          markerWidth="10" 
          markerHeight="10" 
          refX="9" 
          refY="5" 
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 10 5 L 0 10 L 2 5 Z" fill="#333333" />
        </marker>
      </defs>
  `;

  flows.forEach((flow, idx) => {
    const fromPos = screenPositions[flow.from];
    const toPos = screenPositions[flow.to];

    if (!fromPos || !toPos) return;

    // Determine Anchor Points specifically for orthogonal routing
    // Figma usually prefers Right -> Left connections for horizontal progression

    const deltaX = toPos.centerX - fromPos.centerX;
    const deltaY = toPos.centerY - fromPos.centerY;

    let start, end;
    let direction = 'right'; // Main flow direction relative to source

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal flow
      if (deltaX > 0) {
        // Right
        start = { x: fromPos.right, y: fromPos.centerY };
        end = { x: toPos.x, y: toPos.centerY };
        direction = 'right';
      } else {
        // Left (Back flow)
        start = { x: fromPos.x, y: fromPos.centerY };
        end = { x: toPos.right, y: toPos.centerY };
        direction = 'left';
      }
    } else {
      // Vertical flow
      if (deltaY > 0) {
        // Down
        start = { x: fromPos.centerX, y: fromPos.bottom };
        end = { x: toPos.centerX, y: toPos.y };
        direction = 'down';
      } else {
        // Up
        start = { x: fromPos.centerX, y: fromPos.y };
        end = { x: toPos.centerX, y: toPos.bottom };
        direction = 'up';
      }
    }

    const pathD = getOrthogonalPath(start, end, direction);

    // Flow labels (optional, keeping minimal if present)
    const label = flow.label || '';

    // Simple midpoint for label
    const midX = (start.x + end.x) / 2;
    const isVertical = direction === 'down' || direction === 'up';
    const labelX = isVertical ? start.x + 10 : midX;
    const labelY = isVertical ? (start.y + end.y) / 2 : start.y - 10;

    arrowsHtml += `
      <g class="flow-arrow">
        <path 
          d="${pathD}" 
          stroke="#333333"
          stroke-width="2"
          fill="none"
          marker-start="url(#arrow-start-dot)"
          marker-end="url(#arrow-head)"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        ${label ? `
          <rect x="${labelX - 4}" y="${labelY - 14}" width="${label.length * 7 + 8}" height="20" rx="4" fill="#333333" />
          <text x="${labelX}" y="${labelY}" fill="#ffffff" font-size="10" font-family="sans-serif" dominant-baseline="middle">${label}</text>
        ` : ''}
      </g>
    `;
  });

  arrowsHtml += '</svg>';
  return arrowsHtml;
}

function getOrthogonalPath(start, end, direction) {
  const radius = 12; // Radius for rounded corners
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // We construct the path as points to visit
  // Standard "Z" or "C" shape orthogonal: 
  // Start -> (Halfway X) -> (Target Y) -> End

  let points = [];
  points.push({ x: start.x, y: start.y });

  if (direction === 'right' || direction === 'left') {
    // Horizontal start: Move to Mid X, then turn to Target Y, then turn to Target X
    points.push({ x: midX, y: start.y });
    points.push({ x: midX, y: end.y });
    points.push({ x: end.x, y: end.y });
  } else {
    // Vertical start: Move to Mid Y, turn to Target X, then turn to Target Y
    points.push({ x: start.x, y: midY });
    points.push({ x: end.x, y: midY });
    points.push({ x: end.x, y: end.y });
  }

  // Build Path String with Rounded Corners
  if (points.length < 3) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Vector from Prev to Curr
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);

    // Vector from Curr to Next
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

    // If segment is too short for radius, skip rounding
    if (len1 < radius * 2 || len2 < radius * 2) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    // Shorten line to corner start
    // Normalized input vector
    const n1x = v1x / len1;
    const n1y = v1y / len1;

    const arcStartX = curr.x - n1x * radius;
    const arcStartY = curr.y - n1y * radius;

    d += ` L ${arcStartX} ${arcStartY}`;

    // Calculate arc end point
    const n2x = v2x / len2;
    const n2y = v2y / len2;

    const arcEndX = curr.x + n2x * radius;
    const arcEndY = curr.y + n2y * radius;

    // Quadratric Bezier control point is exactly the corner (curr)
    d += ` Q ${curr.x} ${curr.y} ${arcEndX} ${arcEndY}`;
  }

  // Final segment
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
}

export default renderFlowArrows;
