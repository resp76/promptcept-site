// Generates sat/questions-extra.js: 100 original questions per domain, answers computed from parameters.
// Run: node sat/tools/generate-questions.mjs
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let seed = 20260927;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = list => list[Math.floor(rand() * list.length)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`; };
const pi = k => (k === 1 ? 'π' : `${k}π`);
const signed = n => (n < 0 ? `− ${-n}` : `+ ${n}`);

// Each template returns { prompt, answer, wrong: [common-mistake answers], hint, explanation }.
// `fmt` turns a numeric near-miss into an option string when mistakes don't fill four options.
const T = {
  algebra: [
    ['Linear equations', 'foundation', () => {
      const x = int(2, 15), a = int(2, 9), b = int(1, 30), c = a * x + b;
      return { prompt: `If ${a}x + ${b} = ${c}, what is the value of x?`, answer: x, wrong: [c - b, x + 1, x - 1],
        hint: `Subtract ${b} from both sides, then divide by ${a}.`, explanation: `${a}x = ${c} − ${b} = ${c - b}, so x = ${c - b} ÷ ${a} = ${x}.` };
    }],
    ['Linear equations with variables on both sides', 'medium', () => {
      const x = int(-6, 12), c = int(1, 5), a = c + int(1, 6), b = int(-20, 20), d = (a - c) * x + b;
      return { prompt: `If ${a}x ${signed(b)} = ${c}x ${signed(d)}, what is the value of x?`, answer: x, wrong: [-x, x + 2, x - 1],
        hint: `Collect x-terms on one side: subtract ${c}x from both sides.`, explanation: `${a - c}x = ${d} − (${b}) = ${d - b}, so x = ${x}.` };
    }],
    ['Systems of equations', 'medium', () => {
      const x = int(3, 20), y = int(1, x - 1);
      return { prompt: `If x + y = ${x + y} and x − y = ${x - y}, what is the value of x?`, answer: x, wrong: [y, x + y, x - y],
        hint: 'Add the two equations to eliminate y.', explanation: `Adding gives 2x = ${2 * x}, so x = ${x}.` };
    }],
    ['Slope of a line', 'foundation', () => {
      const m = pick([-4, -3, -2, 2, 3, 4, 5]), x1 = int(-5, 5), dx = int(1, 6), y1 = int(-9, 9);
      const x2 = x1 + dx, y2 = y1 + m * dx;
      return { prompt: `What is the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, answer: m, wrong: [-m, m * dx, m + 1],
        hint: 'Slope = (change in y) ÷ (change in x).', explanation: `(${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${dx} = ${m}.` };
    }],
    ['Function notation', 'foundation', () => {
      const m = int(2, 9), b = int(-12, 12), k = int(2, 12), v = m * k + b;
      return { prompt: `If f(x) = ${m}x ${signed(b)} and f(k) = ${v}, what is k?`, answer: k, wrong: [m * v + b, v, k + 1],
        hint: `Set ${m}k ${signed(b)} = ${v} and solve for k.`, explanation: `${m}k = ${v - b}, so k = ${k}.` };
    }],
    ['Linear models in context', 'medium', () => {
      const fee = pick([15, 20, 25, 30, 40, 50]), rate = pick([6, 8, 9, 12, 15]), n = int(3, 14), total = fee + rate * n;
      return { prompt: `A gym charges a $${fee} sign-up fee plus $${rate} per class. A member paid $${total} in total. How many classes did the member take?`,
        answer: n, wrong: [Math.round(total / rate), n + 1, n - 1],
        hint: 'Write total = fee + rate × classes.', explanation: `${fee} + ${rate}n = ${total}, so ${rate}n = ${total - fee} and n = ${n}.` };
    }],
    ['Linear inequalities', 'medium', () => {
      const a = int(2, 8), x = int(3, 15), b = int(1, 20), c = a * x + b;
      return { prompt: `What is the smallest integer x that satisfies ${a}x + ${b} > ${c}?`, answer: x + 1, wrong: [x, x + 2, x - 1],
        hint: 'Solve like an equation, then check whether the boundary itself works.', explanation: `${a}x > ${c - b}, so x > ${x}. The smallest integer greater than ${x} is ${x + 1}.` };
    }],
    ['Writing linear equations', 'medium', () => {
      const m = pick([-3, -2, 2, 3, 4]), p = int(1, 8), b = int(-10, 10), q = m * p + b;
      return { prompt: `A line has slope ${m} and passes through (${p}, ${q}). What is its y-intercept?`, answer: b, wrong: [q, q + m * p, -b],
        hint: 'Substitute the point into y = mx + b.', explanation: `${q} = ${m}(${p}) + b = ${m * p} + b, so b = ${b}.` };
    }],
    ['Systems of equations', 'advanced', () => {
      const x = int(-5, 8), y = int(-5, 8), a = int(2, 5), b = int(1, 4), d = int(1, 5), e = -int(1, 4);
      if (a * e - b * d === 0) return null;
      return { prompt: `If ${a}x + ${b}y = ${a * x + b * y} and ${d}x − ${-e}y = ${d * x + e * y}, what is the value of y?`, answer: y, wrong: [x, -y, y + 1],
        hint: 'Use elimination: scale one equation so the x-coefficients match, then subtract.', explanation: `Solving the system gives x = ${x} and y = ${y}.` };
    }],
    ['Systems with no solution', 'advanced', () => {
      const a = int(2, 7), b = int(2, 7), n = int(2, 4), c = int(1, 15), d = n * c + int(1, 9);
      return { prompt: `For what value of k does the system ${a}x + ${b}y = ${c} and kx + ${n * b}y = ${d} have no solution?`, answer: n * a, wrong: [a, n * a + n, b * n],
        hint: 'No solution means parallel lines: same slope, different intercepts.', explanation: `The y-coefficient was multiplied by ${n}, so k must be ${n} × ${a} = ${n * a}. The constants (${c} × ${n} ≠ ${d}) keep the lines distinct.` };
    }]
  ],
  advanced: [
    ['Solving quadratics', 'foundation', () => {
      const r = int(1, 12), s = int(r + 1, 15);
      return { prompt: `What is the larger solution of x² − ${r + s}x + ${r * s} = 0?`, answer: s, wrong: [r, r + s, -s],
        hint: `Find two numbers that multiply to ${r * s} and add to ${r + s}.`, explanation: `(x − ${r})(x − ${s}) = 0, so x = ${r} or x = ${s}. The larger is ${s}.` };
    }],
    ['Sum of solutions', 'medium', () => {
      const r = int(-9, 9), s = int(-9, 9); if (r === s || Math.abs(r + s) <= 1) return null;
      return { prompt: `What is the sum of the solutions of x² ${signed(-(r + s))}x ${signed(r * s)} = 0?`, answer: r + s, wrong: [-(r + s), r * s, r - s],
        hint: 'For x² + bx + c = 0, the solutions add to −b.', explanation: `The factors are (x − ${r})(x − ${s}), so the sum is ${r} + ${s} = ${r + s}.` };
    }],
    ['Vertex form', 'foundation', () => {
      const h = int(-8, 8), k = int(-15, 15);
      return { prompt: `What is the minimum value of y = (x ${signed(-h)})² ${signed(k)}?`, answer: k, wrong: [h, -k, h + k],
        hint: 'A squared term is never negative, so the minimum occurs when it equals 0.', explanation: `At x = ${h} the squared term is 0, leaving y = ${k}.` };
    }],
    ['Quadratic vertex', 'medium', () => {
      const h = int(-9, 9), c = int(-20, 20); if (h === 0) return null;
      return { prompt: `What is the x-coordinate of the vertex of y = x² ${signed(-2 * h)}x ${signed(c)}?`, answer: h, wrong: [-h, 2 * h, -2 * h],
        hint: 'The vertex x-coordinate is −b ÷ (2a).', explanation: `−(${-2 * h}) ÷ 2 = ${h}.` };
    }],
    ['Exponential growth', 'medium', () => {
      const a = pick([50, 75, 100, 120, 150, 200, 250, 300]), t = int(2, 5);
      return { prompt: `A population of ${a} bacteria doubles every hour. How many bacteria are there after ${t} hours?`, answer: a * 2 ** t, wrong: [a * 2 * t, a + 2 ** t, a * 2 ** (t - 1)],
        hint: 'Doubling t times multiplies by 2^t.', explanation: `${a} × 2^${t} = ${a} × ${2 ** t} = ${a * 2 ** t}.` };
    }],
    ['Exponential decay', 'medium', () => {
      const t = int(2, 4), a = int(3, 40) * 2 ** t, h = pick([3, 5, 8, 10, 12]);
      return { prompt: `A ${a}-milligram sample has a half-life of ${h} days. How many milligrams remain after ${h * t} days?`, answer: a / 2 ** t, wrong: [a / 2, a / 2 ** (t - 1), a - a / 2 ** t],
        hint: `Count the half-lives: ${h * t} ÷ ${h}.`, explanation: `${t} half-lives: ${a} × (1/2)^${t} = ${a / 2 ** t}.` };
    }],
    ['Function composition', 'advanced', () => {
      const a = int(2, 6), b = int(-9, 9), c = int(-5, 8), k = int(-4, 4);
      const g = k * k + c, v = a * g + b;
      return { prompt: `If f(x) = ${a}x ${signed(b)} and g(x) = x² ${signed(c)}, what is f(g(${k}))?`, answer: v, wrong: [(a * k + b) ** 2 + c, g, a * k * k + b],
        hint: `Work inside out: find g(${k}) first.`, explanation: `g(${k}) = ${k * k} ${signed(c)} = ${g}; f(${g}) = ${a}(${g}) ${signed(b)} = ${v}.` };
    }],
    ['Radical equations', 'medium', () => {
      const b = int(2, 12), a = int(-20, 20), x = b * b - a;
      return { prompt: `If √(x ${signed(a)}) = ${b}, what is the value of x?`, answer: x, wrong: [b - a, b * b + a, b * b],
        hint: 'Square both sides to remove the root.', explanation: `x ${signed(a)} = ${b * b}, so x = ${x}.` };
    }],
    ['Equivalent expressions', 'medium', () => {
      const a = int(-9, 9), b = int(-9, 9); if (!a || !b || a + b === 0) return null;
      return { prompt: `(x ${signed(a)})(x ${signed(b)}) is equivalent to x² + kx ${signed(a * b)}. What is k?`, answer: a + b, wrong: [a * b, a - b, -(a + b)],
        hint: 'Expand using FOIL and combine the middle terms.', explanation: `The x-terms are ${a}x and ${b}x, giving k = ${a + b}.` };
    }],
    ['Rational equations', 'advanced', () => {
      const c = int(2, 6), q = int(2, 9), a = c * q, b = int(-8, 8);
      return { prompt: `If ${a} / (x ${signed(-b)}) = ${c}, what is the value of x?`, answer: b + q, wrong: [q, b - q, a * c + b],
        hint: `Multiply both sides by (x ${signed(-b)}).`, explanation: `x ${signed(-b)} = ${a} ÷ ${c} = ${q}, so x = ${b + q}.` };
    }]
  ],
  data: [
    ['Percentages', 'foundation', () => {
      const p = pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75]), n = int(2, 40) * 20;
      return { prompt: `What is ${p}% of ${n}?`, answer: (p * n) / 100, wrong: [(p * n) / 10, n - (p * n) / 100, p + n / 100],
        hint: `Convert ${p}% to a decimal and multiply.`, explanation: `${p / 100} × ${n} = ${(p * n) / 100}.` };
    }],
    ['Percent change', 'medium', () => {
      const old = int(2, 30) * 20, p = pick([-40, -25, -20, -15, -10, 10, 15, 20, 25, 30, 40, 50, 75]), neu = old + (old * p) / 100;
      return { prompt: `A value changes from ${old} to ${neu}. What is the percent change? (Negative means a decrease.)`, answer: p, wrong: [-p, Math.round(((neu - old) / neu) * 100), p / 2],
        hint: 'Percent change = (new − old) ÷ old × 100.', explanation: `(${neu} − ${old}) ÷ ${old} × 100 = ${p}%.` };
    }],
    ['Mean', 'foundation', () => {
      const m = int(10, 90), d = [int(1, 9), int(1, 9)], vals = [m - d[0], m + d[0], m - d[1], m + d[1], m].sort((x, y) => x - y);
      return { prompt: `What is the mean of ${vals.join(', ')}?`, answer: m, wrong: [m + 1, vals[4] - vals[0], m - 2],
        hint: 'Add the values and divide by how many there are.', explanation: `Sum = ${5 * m}; ${5 * m} ÷ 5 = ${m}.` };
    }],
    ['Missing value from a mean', 'medium', () => {
      const n = int(4, 6), mean = int(60, 95), known = Array.from({ length: n - 1 }, () => int(mean - 15, mean + 15));
      const missing = mean * n - known.reduce((s, v) => s + v, 0); if (missing < 0 || missing > 100) return null;
      return { prompt: `A student's first ${n - 1} test scores are ${known.join(', ')}. What score on test ${n} gives a mean of exactly ${mean}?`, answer: missing, wrong: [mean, missing + n, missing - n],
        hint: `The ${n} scores must add to ${n} × ${mean}.`, explanation: `Required total = ${mean * n}. The first ${n - 1} add to ${mean * n - missing}, so the last is ${missing}.` };
    }],
    ['Ratios', 'foundation', () => {
      const a = int(1, 7), b = int(1, 7); if (gcd(a, b) !== 1 || a === b) return null;
      const k = int(3, 15), total = (a + b) * k;
      return { prompt: `A club has ${total} members, and the ratio of juniors to seniors is ${a}:${b}. How many juniors are there?`, answer: a * k, wrong: [b * k, total / a, a * k + b],
        hint: `The ratio splits the club into ${a + b} equal parts.`, explanation: `One part = ${total} ÷ ${a + b} = ${k}; juniors = ${a} × ${k} = ${a * k}.` };
    }],
    ['Unit rates', 'foundation', () => {
      const r = int(35, 70), h = int(2, 5), t = int(2, 9);
      if (t === h) return null;
      return { prompt: `A car travels ${r * h} miles in ${h} hours at a constant speed. How far does it travel in ${t} hours?`, answer: r * t, wrong: [r * h * t, r, r * (t + 1)],
        hint: 'Find the miles per hour first.', explanation: `${r * h} ÷ ${h} = ${r} mph; ${r} × ${t} = ${r * t} miles.` };
    }],
    ['Probability', 'medium', () => {
      const r = int(2, 12), b = int(2, 12), g = int(1, 10), tot = r + b + g;
      return { prompt: `A bag has ${r} red, ${b} blue, and ${g} green marbles. If one is picked at random, what is the probability it is red?`, answer: frac(r, tot), wrong: [frac(r, b + g), frac(b, tot), frac(1, 3)],
        hint: 'Probability = favorable outcomes ÷ total outcomes.', explanation: `${r} red out of ${tot} total = ${frac(r, tot)}.` };
    }],
    ['Median', 'medium', () => {
      const vals = Array.from({ length: pick([5, 7]) }, () => int(1, 60));
      const sorted = [...vals].sort((x, y) => x - y), med = sorted[(sorted.length - 1) / 2];
      if (new Set(vals).size !== vals.length || vals[(vals.length - 1) / 2] === med) return null;
      return { prompt: `What is the median of ${vals.join(', ')}?`, answer: med, wrong: [vals[(vals.length - 1) / 2], Math.round(vals.reduce((s, v) => s + v, 0) / vals.length), sorted[sorted.length - 1] - sorted[0]],
        hint: 'Order the values first; the median is the middle one.', explanation: `In order: ${sorted.join(', ')}. The middle value is ${med}.` };
    }],
    ['Successive percent change', 'advanced', () => {
      const k = int(1, 9), P = 100 * k, x = pick([10, 20, 30, 40, 50]), y = pick([10, 20, 30, 40]);
      const final = k * (100 + x) * (100 - y) / 100;
      if (x === y) return null;
      return { prompt: `A $${P} jacket's price is increased by ${x}%, then the new price is decreased by ${y}%. What is the final price in dollars?`, answer: final, wrong: [P + (P * (x - y)) / 100, P * (100 + x) / 100, P * (100 - y) / 100],
        hint: 'Apply each percent change to the price at that moment.', explanation: `${P} × ${(100 + x) / 100} = ${P * (100 + x) / 100}; then × ${(100 - y) / 100} = ${final}.` };
    }],
    ['Unit conversion', 'advanced', () => {
      const v = int(2, 30) * 3;
      return { prompt: `A cyclist rides at ${v} kilometers per hour. What is this speed in meters per minute?`, answer: (v * 1000) / 60, wrong: [v * 60, v * 100, v * 1000],
        hint: '1 km = 1,000 m and 1 hour = 60 minutes.', explanation: `${v} × 1,000 ÷ 60 = ${(v * 1000) / 60} meters per minute.` };
    }]
  ],
  geometry: [
    ['Triangle area', 'foundation', () => {
      const b = int(2, 20) * 2, h = int(3, 25);
      return { prompt: `A triangle has a base of ${b} cm and a height of ${h} cm. What is its area in square centimeters?`, answer: (b * h) / 2, wrong: [b * h, b + h, (b * h) / 4],
        hint: 'Area = ½ × base × height.', explanation: `½ × ${b} × ${h} = ${(b * h) / 2}.` };
    }],
    ['Rectangles', 'foundation', () => {
      const w = int(3, 15), l = int(w + 1, 25);
      return { prompt: `A rectangle has an area of ${w * l} square feet and a width of ${w} feet. What is its perimeter in feet?`, answer: 2 * (w + l), wrong: [l, w + l, w * l],
        hint: 'Find the length from the area, then add all four sides.', explanation: `Length = ${w * l} ÷ ${w} = ${l}; perimeter = 2(${w} + ${l}) = ${2 * (w + l)}.` };
    }],
    ['Pythagorean theorem', 'foundation', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k = int(1, 6);
      return { prompt: `A right triangle has legs of length ${a * k} and ${b * k}. What is the length of the hypotenuse?`, answer: c * k, wrong: [(a + b) * k, c * k + 1, b * k + 1],
        hint: 'a² + b² = c².', explanation: `${a * k}² + ${b * k}² = ${(c * k) ** 2}, so c = ${c * k}.` };
    }],
    ['Right triangles', 'medium', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = int(1, 5);
      return { prompt: `A right triangle has a hypotenuse of ${c * k} and one leg of ${a * k}. What is the length of the other leg?`, answer: b * k, wrong: [(c - a) * k, a * k, b * k + 2],
        hint: 'Subtract the square of the known leg from the square of the hypotenuse.', explanation: `${(c * k) ** 2} − ${(a * k) ** 2} = ${(b * k) ** 2}, so the leg is ${b * k}.` };
    }],
    ['Circle area', 'foundation', () => {
      const r = int(2, 20);
      return { prompt: `A circle has a radius of ${r}. What is its area?`, answer: pi(r * r), wrong: [pi(2 * r), pi(r), pi(4 * r * r)],
        hint: 'Area = πr².', explanation: `π × ${r}² = ${pi(r * r)}.` };
    }],
    ['Circumference', 'medium', () => {
      const r = int(2, 30);
      return { prompt: `A circle has a circumference of ${pi(2 * r)}. What is its radius?`, answer: r, wrong: [2 * r, r * r, r + 2],
        hint: 'Circumference = 2πr.', explanation: `2πr = ${pi(2 * r)}, so r = ${r}.` };
    }],
    ['Triangle angles', 'foundation', () => {
      const a = int(25, 90), b = int(20, 150 - a);
      return { prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the measure of the third angle, in degrees?`, answer: 180 - a - b, wrong: [360 - a - b, a + b, 90 - Math.abs(a - b)],
        hint: 'The angles of a triangle add to 180°.', explanation: `180 − ${a} − ${b} = ${180 - a - b}.` };
    }],
    ['Similar triangles', 'medium', () => {
      const a = int(2, 9), b = int(a + 1, 14), k = int(2, 5);
      return { prompt: `Triangle ABC is similar to triangle DEF. AB = ${a}, BC = ${b}, and DE = ${a * k}. What is EF?`, answer: b * k, wrong: [b + (a * k - a), a * k, b * k + k],
        hint: 'Corresponding sides share one scale factor.', explanation: `Scale factor = ${a * k} ÷ ${a} = ${k}; EF = ${b} × ${k} = ${b * k}.` };
    }],
    ['Volume', 'medium', () => {
      const r = int(2, 10), h = int(2, 15);
      return { prompt: `A cylinder has a radius of ${r} and a height of ${h}. What is its volume?`, answer: pi(r * r * h), wrong: [pi(2 * r * h), pi(r * h), pi(4 * r * r * h)],
        hint: 'Volume = πr²h.', explanation: `π × ${r}² × ${h} = ${pi(r * r * h)}.` };
    }],
    ['Circle equations', 'advanced', () => {
      const h = int(-7, 7), k = int(-7, 7), r = int(2, 9); if (!h || !k) return null;
      return { prompt: `The equation x² + y² ${signed(-2 * h)}x ${signed(-2 * k)}y ${signed(h * h + k * k - r * r)} = 0 defines a circle. What is its radius?`, answer: r, wrong: [r * r, h * h + k * k, r + 1],
        hint: 'Complete the square in x and in y.', explanation: `(x ${signed(-h)})² + (y ${signed(-k)})² = ${r * r}, so r = ${r}.` };
    }],
    ['Trigonometry', 'advanced', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = int(1, 4);
      return { prompt: `In a right triangle, the side opposite angle θ is ${a * k} and the hypotenuse is ${c * k}. What is cos θ?`, answer: `${b}/${c}`, wrong: [`${a}/${c}`, `${a}/${b}`, `${c}/${b}`],
        hint: 'Find the adjacent side, then use cos = adjacent ÷ hypotenuse.', explanation: `Adjacent = ${b * k}, so cos θ = ${b * k}/${c * k} = ${b}/${c}.` };
    }],
    ['Arc length', 'advanced', () => {
      const angle = pick([30, 45, 60, 90, 120, 135, 150, 180, 240, 270]), r = int(2, 24);
      const num = angle * 2 * r; if (num % 360) return null;
      return { prompt: `A circle has a radius of ${r}. What is the length of an arc with a central angle of ${angle}°?`, answer: pi(num / 360), wrong: [pi(2 * r), pi(num / 180), pi(r)],
        hint: 'Arc length = (angle ÷ 360) × 2πr.', explanation: `(${angle} ÷ 360) × ${pi(2 * r)} = ${pi(num / 360)}.` };
    }]
  ]
};

function nearMisses(answer) {
  const s = String(answer), m = s.match(/^(-?\d+)(π?)$/);
  if (!m) return [];
  const n = Number(m[1]), p = m[2];
  return [1, -1, 2, -2, 5, 10].filter(d => !p || n + d > 0).map(d => (p ? pi(n + d) : `${n + d}`));
}

function build(domain, prefix) {
  const out = [], prompts = new Set(), templates = T[domain];
  templates.forEach(([skill, difficulty, make], t) => {
    const per = Math.floor(100 / templates.length) + (t < 100 % templates.length ? 1 : 0);
    let made = 0, tries = 0;
    while (made < per) {
      assert(++tries < 5000, `${domain}/${skill}: parameter space too small`);
      const q = make(); if (!q || prompts.has(q.prompt)) continue;
      const answer = String(q.answer);
      const options = [answer];
      for (const w of [...q.wrong.map(String), ...nearMisses(answer)]) {
        if (options.length === 4) break;
        if (w !== answer && !options.includes(w) && !/NaN|Infinity|undefined|\.\d{3,}/.test(w)) options.push(w);
      }
      if (options.length < 4) continue;
      for (let i = 3; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
      prompts.add(q.prompt);
      out.push({ id: `${prefix}-${String(out.length + 1).padStart(3, '0')}`, domain, skill, difficulty, prompt: q.prompt, options, answer: options.indexOf(answer), hint: q.hint, explanation: q.explanation });
      made++;
    }
  });
  return out;
}

const bank = [...build('algebra', 'g-alg'), ...build('advanced', 'g-adv'), ...build('data', 'g-data'), ...build('geometry', 'g-geo')];

// Self-check: 100 per domain, unique ids/prompts, 4 distinct options, answer index valid.
for (const d of ['algebra', 'advanced', 'data', 'geometry']) assert.equal(bank.filter(q => q.domain === d).length, 100, d);
assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
assert.equal(new Set(bank.map(q => q.prompt)).size, bank.length);
for (const q of bank) {
  assert.equal(new Set(q.options).size, 4, q.id);
  assert.ok(q.answer >= 0 && q.answer < 4, q.id);
}

const url = new URL('../questions-extra.js', import.meta.url);
writeFileSync(url, `// Generated by tools/generate-questions.mjs. Do not edit by hand; edit the templates and re-run.\nwindow.ORBIT_EXTRA_QUESTIONS = ${JSON.stringify(bank, null, 1)};\n`);
console.log(`Wrote ${bank.length} questions to ${url.pathname}`);
