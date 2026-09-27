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

const SLIP = 'Close, but it doesn’t check out. Substitute it back into the original problem to find the arithmetic slip.';
const SIGN = 'Right size, wrong sign. Recheck each step where a term moves across the equals sign or gets subtracted.';

// Template: [skill, difficulty, rule, make]. make() returns
// { prompt, answer, wrong: [[value, why this wrong answer is tempting], ...], hint, explanation, figure? } or null to retry.
// Figures are computed from the question's own numbers (never from rand) and drawn by figureSvg() in app.js.
const T = {
  algebra: [
    ['Linear equations', 'foundation', 'Inverse operations: undo each operation in reverse order, doing the same thing to both sides.', () => {
      const x = int(2, 15), a = int(2, 9), b = int(1, 30), c = a * x + b;
      return { prompt: `If ${a}x + ${b} = ${c}, what is the value of x?`, answer: x,
        wrong: [[c - b, `That’s ${a}x. You subtracted ${b} but still need to divide by ${a}.`], [x + 1, SLIP], [x - 1, SLIP]],
        hint: `Subtract ${b} from both sides, then divide by ${a}.`, explanation: `${a}x = ${c} − ${b} = ${c - b}, so x = ${c - b} ÷ ${a} = ${x}.` };
    }],
    ['Linear equations with variables on both sides', 'medium', 'Addition property of equality: you can add or subtract the same term, including a variable term, on both sides.', () => {
      const x = int(-6, 12), c = int(1, 5), a = c + int(1, 6), b = int(-20, 20), d = (a - c) * x + b;
      return { prompt: `If ${a}x ${signed(b)} = ${c}x ${signed(d)}, what is the value of x?`, answer: x,
        wrong: [[-x, SIGN], [x + 2, SLIP], [x - 1, SLIP]],
        hint: `Collect x-terms on one side: subtract ${c}x from both sides.`, explanation: `${a - c}x = ${d} − (${b}) = ${d - b}, so x = ${x}.` };
    }],
    ['Systems of equations', 'medium', 'Elimination method: add or subtract whole equations so one variable cancels.', () => {
      const x = int(3, 20), y = int(1, x - 1);
      return { prompt: `If x + y = ${x + y} and x − y = ${x - y}, what is the value of x?`, answer: x,
        wrong: [[y, 'That’s the value of y. The question asks for x.'], [x + y, `${x + y} is x + y, given in the problem, not x.`], [x - y, `${x - y} is x − y, given in the problem, not x.`]],
        hint: 'Add the two equations to eliminate y.', explanation: `Adding gives 2x = ${2 * x}, so x = ${x}.` };
    }],
    ['Slope of a line', 'foundation', 'Slope formula: m = (y₂ − y₁) ÷ (x₂ − x₁), subtracting in the same order on top and bottom.', () => {
      const m = pick([-4, -3, -2, 2, 3, 4, 5]), x1 = int(-5, 5), dx = int(1, 6), y1 = int(-9, 9);
      const x2 = x1 + dx, y2 = y1 + m * dx;
      return { prompt: `What is the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, answer: m,
        wrong: [[-m, 'Right size, wrong sign. Subtract the coordinates in the same order on top and bottom.'], [m * dx, `That’s the change in y. You still need to divide by the change in x, ${dx}.`], [m + 1, SLIP]],
        hint: 'Slope = (change in y) ÷ (change in x).', explanation: `(${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${dx} = ${m}.` };
    }],
    ['Function notation', 'foundation', 'Function notation: f(k) is the output when the input is k.', () => {
      const m = int(2, 9), b = int(-12, 12), k = int(2, 12), v = m * k + b;
      return { prompt: `If f(x) = ${m}x ${signed(b)} and f(k) = ${v}, what is k?`, answer: k,
        wrong: [[m * v + b, `That’s f(${v}). The question gives the output f(k) = ${v} and asks for the input k.`], [v, `${v} is the output f(k), not the input k.`], [k + 1, SLIP]],
        hint: `Set ${m}k ${signed(b)} = ${v} and solve for k.`, explanation: `${m}k = ${v - b}, so k = ${k}.` };
    }],
    ['Linear models in context', 'medium', 'Linear model: total = starting amount + rate × number of units.', () => {
      const fee = pick([15, 20, 25, 30, 40, 50]), rate = pick([6, 8, 9, 12, 15]), n = int(3, 14), total = fee + rate * n;
      return { prompt: `A gym charges a $${fee} sign-up fee plus $${rate} per class. A member paid $${total} in total. How many classes did the member take?`, answer: n,
        wrong: [[Math.round(total / rate), `You divided the whole $${total} by $${rate} without first taking out the $${fee} sign-up fee.`], [n + 1, SLIP], [n - 1, SLIP]],
        hint: 'Write total = fee + rate × classes.', explanation: `${fee} + ${rate}n = ${total}, so ${rate}n = ${total - fee} and n = ${n}.` };
    }],
    ['Linear inequalities', 'medium', 'Strict inequality: > leaves out the boundary value; ≥ includes it.', () => {
      const a = int(2, 8), x = int(3, 15), b = int(1, 20), c = a * x + b;
      return { prompt: `What is the smallest integer x that satisfies ${a}x + ${b} > ${c}?`, answer: x + 1,
        wrong: [[x, `x = ${x} makes both sides equal, but the inequality is strict (>), so ${x} itself doesn’t work.`], [x + 2, 'It satisfies the inequality, but it isn’t the smallest integer that does.'], [x - 1, `Check it: ${a}(${x - 1}) + ${b} = ${c - a}, which is less than ${c}.`]],
        hint: 'Solve like an equation, then check whether the boundary itself works.', explanation: `${a}x > ${c - b}, so x > ${x}. The smallest integer greater than ${x} is ${x + 1}.` };
    }],
    ['Writing linear equations', 'medium', 'Slope-intercept form: y = mx + b, where b is the value of y when x = 0.', () => {
      const m = pick([-3, -2, 2, 3, 4]), p = int(1, 8), b = int(-10, 10), q = m * p + b;
      return { prompt: `A line has slope ${m} and passes through (${p}, ${q}). What is its y-intercept?`, answer: b,
        wrong: [[q, `${q} is the y-coordinate of the given point, not the y-intercept.`], [q + m * p, `Sign slip: b = y − mx, so subtract ${m}(${p}) rather than adding it.`], [-b, SIGN]],
        hint: 'Substitute the point into y = mx + b.', explanation: `${q} = ${m}(${p}) + b = ${m * p} + b, so b = ${b}.` };
    }],
    ['Systems of equations', 'advanced', 'Elimination method: scale the equations so one variable’s coefficients match, then add or subtract.', () => {
      const x = int(-5, 8), y = int(-5, 8), a = int(2, 5), b = int(1, 4), d = int(1, 5), e = -int(1, 4);
      if (a * e - b * d === 0) return null;
      return { prompt: `If ${a}x + ${b}y = ${a * x + b * y} and ${d}x − ${-e}y = ${d * x + e * y}, what is the value of y?`, answer: y,
        wrong: [[x, 'That’s the value of x. The question asks for y.'], [-y, SIGN], [y + 1, SLIP]],
        hint: 'Use elimination: scale one equation so the x-coefficients match, then subtract.', explanation: `Solving the system gives x = ${x} and y = ${y}.` };
    }],
    ['Systems with no solution', 'advanced', 'Parallel lines: a linear system has no solution when the lines have the same slope but different intercepts.', () => {
      const a = int(2, 7), b = int(2, 7), n = int(2, 4), c = int(1, 15), d = n * c + int(1, 9);
      return { prompt: `For what value of k does the system ${a}x + ${b}y = ${c} and kx + ${n * b}y = ${d} have no solution?`, answer: n * a,
        wrong: [[a, `With k = ${a}, only the y-coefficient was multiplied by ${n}, so the slopes differ and the lines cross.`], [n * a + n, `Multiply the x-coefficient ${a} by the same factor, ${n}, and nothing more.`], [b * n, `${b * n} is the y-coefficient. k must be the x-coefficient ${a} scaled by ${n}.`]],
        hint: 'No solution means parallel lines: same slope, different intercepts.', explanation: `The y-coefficient was multiplied by ${n}, so k must be ${n} × ${a} = ${n * a}. The constants (${c} × ${n} ≠ ${d}) keep the lines distinct.` };
    }]
  ],
  advanced: [
    ['Solving quadratics', 'foundation', 'Zero-product property: if (x − r)(x − s) = 0, then x = r or x = s.', () => {
      const r = int(1, 12), s = int(r + 1, 15);
      return { prompt: `What is the larger solution of x² − ${r + s}x + ${r * s} = 0?`, answer: s,
        wrong: [[r, 'That’s the smaller solution.'], [r + s, `${r + s} is the sum of the two solutions, not a solution.`], [-s, `Sign slip: x − ${s} = 0 gives x = ${s}.`]],
        hint: `Find two numbers that multiply to ${r * s} and add to ${r + s}.`, explanation: `(x − ${r})(x − ${s}) = 0, so x = ${r} or x = ${s}. The larger is ${s}.` };
    }],
    ['Sum of solutions', 'medium', 'Vieta’s formulas: for x² + bx + c = 0, the solutions add to −b and multiply to c.', () => {
      const r = int(-9, 9), s = int(-9, 9); if (r === s || Math.abs(r + s) <= 1) return null;
      return { prompt: `What is the sum of the solutions of x² ${signed(-(r + s))}x ${signed(r * s)} = 0?`, answer: r + s,
        wrong: [[-(r + s), `That’s b itself (${-(r + s)}). The sum of the solutions is −b.`], [r * s, `${r * s} is the constant term, which is the product of the solutions, not their sum.`], [r - s, 'You subtracted the two solutions instead of adding them.']],
        hint: 'For x² + bx + c = 0, the solutions add to −b.', explanation: `The factors are (x − ${r})(x − ${s}), so the sum is ${r} + ${s} = ${r + s}.` };
    }],
    ['Vertex form', 'foundation', 'Vertex form: y = a(x − h)² + k has its vertex at (h, k); when a > 0, k is the minimum value.', () => {
      const h = int(-8, 8), k = int(-15, 15);
      return { prompt: `What is the minimum value of y = (x ${signed(-h)})² ${signed(k)}?`, answer: k,
        wrong: [[h, `${h} is the x-value where the minimum happens, not the minimum value of y.`], [-k, 'Right size, wrong sign. The minimum is the constant added outside the square, sign included.'], [h + k, 'You added the vertex coordinates. The minimum value is only the y-coordinate.']],
        hint: 'A squared term is never negative, so the minimum occurs when it equals 0.', explanation: `At x = ${h} the squared term is 0, leaving y = ${k}.` };
    }],
    ['Quadratic vertex', 'medium', 'Axis of symmetry: the vertex of y = ax² + bx + c is at x = −b ÷ (2a).', () => {
      const h = int(-9, 9), c = int(-20, 20); if (h === 0) return null;
      return { prompt: `What is the x-coordinate of the vertex of y = x² ${signed(-2 * h)}x ${signed(c)}?`, answer: h,
        wrong: [[-h, `Sign slip: x = −b ÷ (2a), and here b = ${-2 * h}.`], [2 * h, 'That’s −b. You still need to divide by 2a = 2.'], [-2 * h, 'That’s b itself. Use x = −b ÷ (2a).']],
        hint: 'The vertex x-coordinate is −b ÷ (2a).', explanation: `−(${-2 * h}) ÷ 2 = ${h}.` };
    }],
    ['Exponential growth', 'medium', 'Exponential growth: amount = start × (growth factor)^(number of periods).', () => {
      const a = pick([50, 75, 100, 120, 150, 200, 250, 300]), t = int(2, 5);
      return { prompt: `A population of ${a} bacteria doubles every hour. How many bacteria are there after ${t} hours?`, answer: a * 2 ** t,
        wrong: [[a * 2 * t, `You multiplied by 2 × ${t}. Doubling ${t} times multiplies by 2^${t} = ${2 ** t}.`], [a + 2 ** t, `You added 2^${t} instead of multiplying by it.`], [a * 2 ** (t - 1), `One doubling short: after ${t} hours the population has doubled ${t} times.`]],
        hint: 'Doubling t times multiplies by 2^t.', explanation: `${a} × 2^${t} = ${a} × ${2 ** t} = ${a * 2 ** t}.` };
    }],
    ['Exponential decay', 'medium', 'Half-life: each half-life multiplies the amount by ½, so after n half-lives the amount is start × (½)ⁿ.', () => {
      const t = int(2, 4), a = int(3, 40) * 2 ** t, h = pick([3, 5, 8, 10, 12]);
      return { prompt: `A ${a}-milligram sample has a half-life of ${h} days. How many milligrams remain after ${h * t} days?`, answer: a / 2 ** t,
        wrong: [[a / 2, `That’s only one half-life. ${h * t} days is ${t} half-lives.`], [a / 2 ** (t - 1), `One half-life short: ${h * t} ÷ ${h} = ${t} half-lives.`], [a - a / 2 ** t, 'That’s the amount that decayed, not the amount remaining.']],
        hint: `Count the half-lives: ${h * t} ÷ ${h}.`, explanation: `${t} half-lives: ${a} × (1/2)^${t} = ${a / 2 ** t}.` };
    }],
    ['Function composition', 'advanced', 'Function composition: f(g(x)) means apply g first, then apply f to the result.', () => {
      const a = int(2, 6), b = int(-9, 9), c = int(-5, 8), k = int(-4, 4);
      const g = k * k + c, v = a * g + b;
      return { prompt: `If f(x) = ${a}x ${signed(b)} and g(x) = x² ${signed(c)}, what is f(g(${k}))?`, answer: v,
        wrong: [[(a * k + b) ** 2 + c, `That’s g(f(${k})). Work from the inside out: g first, then f.`], [g, `That’s g(${k}). You still need to apply f to it.`], [a * k * k + b, `You applied f to ${k}² but dropped the ${signed(c)} inside g.`]],
        hint: `Work inside out: find g(${k}) first.`, explanation: `g(${k}) = ${k * k} ${signed(c)} = ${g}; f(${g}) = ${a}(${g}) ${signed(b)} = ${v}.` };
    }],
    ['Radical equations', 'medium', 'Squaring both sides removes a square root; always check the answer in the original equation.', () => {
      const b = int(2, 12), a = int(-20, 20), x = b * b - a;
      return { prompt: `If √(x ${signed(a)}) = ${b}, what is the value of x?`, answer: x,
        wrong: [[b - a, `Square both sides first: x ${signed(a)} = ${b}² = ${b * b}, not ${b}.`], [b * b + a, 'Sign slip: moving the constant to the other side changes its sign.'], [b * b, `${b * b} is the value of x ${signed(a)}, not x.`]],
        hint: 'Square both sides to remove the root.', explanation: `x ${signed(a)} = ${b * b}, so x = ${x}.` };
    }],
    ['Equivalent expressions', 'medium', 'Distributive property (FOIL): (x + a)(x + b) = x² + (a + b)x + ab.', () => {
      const a = int(-9, 9), b = int(-9, 9); if (!a || !b || a + b === 0) return null;
      return { prompt: `(x ${signed(a)})(x ${signed(b)}) is equivalent to x² + kx ${signed(a * b)}. What is k?`, answer: a + b,
        wrong: [[a * b, `${a * b} is the constant term (the product). k comes from adding the two middle terms.`], [a - b, `Add the middle terms ${a}x and ${b}x rather than subtracting them.`], [-(a + b), SIGN]],
        hint: 'Expand using FOIL and combine the middle terms.', explanation: `The x-terms are ${a}x and ${b}x, giving k = ${a + b}.` };
    }],
    ['Rational equations', 'advanced', 'Clearing denominators: multiply both sides by the denominator to remove the fraction.', () => {
      const c = int(2, 6), q = int(2, 9), a = c * q, b = int(-8, 8);
      return { prompt: `If ${a} / (x ${signed(-b)}) = ${c}, what is the value of x?`, answer: b + q,
        wrong: [[q, `${q} is the value of x ${signed(-b)}. Finish solving for x.`], [b - q, 'Sign slip in the last step: undo the constant by doing the opposite operation.'], [a * c + b, `You multiplied by ${c} instead of dividing: x ${signed(-b)} = ${a} ÷ ${c}.`]],
        hint: `Multiply both sides by (x ${signed(-b)}).`, explanation: `x ${signed(-b)} = ${a} ÷ ${c} = ${q}, so x = ${b + q}.` };
    }]
  ],
  data: [
    ['Percentages', 'foundation', 'Percent means “per hundred”: p% of n = (p ÷ 100) × n.', () => {
      const p = pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75]), n = int(2, 40) * 20;
      return { prompt: `What is ${p}% of ${n}?`, answer: (p * n) / 100,
        wrong: [[(p * n) / 10, `Decimal slip: ${p}% is ${p / 100}, not ${p / 10}.`], [n - (p * n) / 100, `That’s what is left after taking ${p}% away, not ${p}% of ${n}.`], [p + n / 100, `Multiply ${n} by ${p / 100}; percents don’t add.`]],
        hint: `Convert ${p}% to a decimal and multiply.`, explanation: `${p / 100} × ${n} = ${(p * n) / 100}.` };
    }],
    ['Percent change', 'medium', 'Percent change = (new − old) ÷ old × 100.', () => {
      const old = int(2, 30) * 20, p = pick([-40, -25, -20, -15, -10, 10, 15, 20, 25, 30, 40, 50, 75]), neu = old + (old * p) / 100;
      return { prompt: `A value changes from ${old} to ${neu}. What is the percent change? (Negative means a decrease.)`, answer: p,
        wrong: [[-p, `Wrong direction: the value went ${neu > old ? 'up' : 'down'}.`], [Math.round(((neu - old) / neu) * 100), `You divided by the new value. Percent change divides by the original value, ${old}.`], [p / 2, `Divide the change (${neu - old}) by the original (${old}), then multiply by 100.`]],
        hint: 'Percent change = (new − old) ÷ old × 100.', explanation: `(${neu} − ${old}) ÷ ${old} × 100 = ${p}%.` };
    }],
    ['Mean', 'foundation', 'Mean = sum of the values ÷ number of values.', () => {
      const m = int(10, 90), d = [int(1, 9), int(1, 9)], vals = [m - d[0], m + d[0], m - d[1], m + d[1], m].sort((x, y) => x - y);
      return { prompt: `What is the mean of ${vals.join(', ')}?`, answer: m,
        wrong: [[m + 1, SLIP], [vals[4] - vals[0], 'That’s the range (largest − smallest), not the mean.'], [m - 2, SLIP]],
        hint: 'Add the values and divide by how many there are.', explanation: `Sum = ${5 * m}; ${5 * m} ÷ 5 = ${m}.` };
    }],
    ['Missing value from a mean', 'medium', 'Mean to total: sum of the values = mean × number of values.', () => {
      const n = int(4, 6), mean = int(60, 95), known = Array.from({ length: n - 1 }, () => int(mean - 15, mean + 15));
      const missing = mean * n - known.reduce((s, v) => s + v, 0); if (missing < 0 || missing > 100) return null;
      return { prompt: `A student's first ${n - 1} test scores are ${known.join(', ')}. What score on test ${n} gives a mean of exactly ${mean}?`, answer: missing,
        wrong: [[mean, `Scoring ${mean} on the last test only works if the earlier scores already average ${mean}. These don’t.`], [missing + n, SLIP], [missing - n, SLIP]],
        hint: `The ${n} scores must add to ${n} × ${mean}.`, explanation: `Required total = ${mean * n}. The first ${n - 1} add to ${mean * n - missing}, so the last is ${missing}.` };
    }],
    ['Ratios', 'foundation', 'Part-to-part ratio: a ratio a:b splits a total into a + b equal parts.', () => {
      const a = int(1, 7), b = int(1, 7); if (gcd(a, b) !== 1 || a === b) return null;
      const k = int(3, 15), total = (a + b) * k;
      return { prompt: `A club has ${total} members, and the ratio of juniors to seniors is ${a}:${b}. How many juniors are there?`, answer: a * k,
        wrong: [[b * k, 'That’s the number of seniors.'], [total / a, `Divide the total by all ${a + b} parts of the ratio, not by ${a}.`], [a * k + b, `Find one part (${total} ÷ ${a + b}), then multiply by ${a}.`]],
        hint: `The ratio splits the club into ${a + b} equal parts.`, explanation: `One part = ${total} ÷ ${a + b} = ${k}; juniors = ${a} × ${k} = ${a * k}.` };
    }],
    ['Unit rates', 'foundation', 'Unit rate: find the amount for one unit, then scale it.', () => {
      const r = int(35, 70), h = int(2, 5), t = int(2, 9);
      if (t === h) return null;
      return { prompt: `A car travels ${r * h} miles in ${h} hours at a constant speed. How far does it travel in ${t} hours?`, answer: r * t,
        wrong: [[r * h * t, `You multiplied the total distance by ${t}. Find the speed first: ${r * h} ÷ ${h}.`], [r, `${r} is the speed in miles per hour. Multiply it by ${t} hours.`], [r * (t + 1), 'That’s one hour too many.']],
        hint: 'Find the miles per hour first.', explanation: `${r * h} ÷ ${h} = ${r} mph; ${r} × ${t} = ${r * t} miles.` };
    }],
    ['Probability', 'medium', 'Probability = favorable outcomes ÷ total possible outcomes.', () => {
      const r = int(2, 12), b = int(2, 12), g = int(1, 10), tot = r + b + g;
      return { prompt: `A bag has ${r} red, ${b} blue, and ${g} green marbles. If one is picked at random, what is the probability it is red?`, answer: frac(r, tot),
        wrong: [[frac(r, b + g), `You divided by the non-red marbles only. The total includes the red ones: ${tot}.`], [frac(b, tot), 'That’s the probability of blue.'], [frac(1, 3), 'There are three colors, but they aren’t equally likely. Count marbles, not colors.']],
        hint: 'Probability = favorable outcomes ÷ total outcomes.', explanation: `${r} red out of ${tot} total = ${frac(r, tot)}.` };
    }],
    ['Median', 'medium', 'Median: the middle value once the data are in order.', () => {
      const vals = Array.from({ length: pick([5, 7]) }, () => int(1, 60));
      const sorted = [...vals].sort((x, y) => x - y), med = sorted[(sorted.length - 1) / 2];
      if (new Set(vals).size !== vals.length || vals[(vals.length - 1) / 2] === med) return null;
      return { prompt: `What is the median of ${vals.join(', ')}?`, answer: med,
        wrong: [[vals[(vals.length - 1) / 2], 'That’s the middle of the list as written. Put the values in order first.'], [Math.round(vals.reduce((s, v) => s + v, 0) / vals.length), 'That’s the mean (rounded), not the median.'], [sorted[sorted.length - 1] - sorted[0], 'That’s the range, not the median.']],
        hint: 'Order the values first; the median is the middle one.', explanation: `In order: ${sorted.join(', ')}. The middle value is ${med}.` };
    }],
    ['Successive percent change', 'advanced', 'Successive percent changes multiply: each change applies to the current value, so +x% then −y% is × (1 + x/100) × (1 − y/100).', () => {
      const k = int(1, 9), P = 100 * k, x = pick([10, 20, 30, 40, 50]), y = pick([10, 20, 30, 40]);
      const final = k * (100 + x) * (100 - y) / 100;
      if (x === y) return null;
      return { prompt: `A $${P} jacket's price is increased by ${x}%, then the new price is decreased by ${y}%. What is the final price in dollars?`, answer: final,
        wrong: [[P + (P * (x - y)) / 100, `You combined the percents into one ${x - y}% change. The ${y}% decrease applies to the new, higher price.`], [P * (100 + x) / 100, 'That’s the price after only the increase.'], [P * (100 - y) / 100, 'That’s the price after only the decrease.']],
        hint: 'Apply each percent change to the price at that moment.', explanation: `${P} × ${(100 + x) / 100} = ${P * (100 + x) / 100}; then × ${(100 - y) / 100} = ${final}.` };
    }],
    ['Unit conversion', 'advanced', 'Dimensional analysis: multiply by conversion factors arranged so the unwanted units cancel.', () => {
      const v = int(2, 30) * 3;
      return { prompt: `A cyclist rides at ${v} kilometers per hour. What is this speed in meters per minute?`, answer: (v * 1000) / 60,
        wrong: [[v * 60, 'An hour is 60 minutes, so per-minute speed is smaller: divide by 60. Kilometers also need converting to meters.'], [v * 100, 'Check both conversions: × 1,000 for kilometers to meters, then ÷ 60 for hours to minutes.'], [v * 1000, 'That’s meters per hour. Divide by 60 to get meters per minute.']],
        hint: '1 km = 1,000 m and 1 hour = 60 minutes.', explanation: `${v} × 1,000 ÷ 60 = ${(v * 1000) / 60} meters per minute.` };
    }]
  ],
  geometry: [
    ['Triangle area', 'foundation', 'Triangle area: A = ½ × base × height.', () => {
      const b = int(2, 20) * 2, h = int(3, 25);
      return { prompt: `A triangle has a base of ${b} cm and a height of ${h} cm. What is its area in square centimeters?`, answer: (b * h) / 2,
        wrong: [[b * h, 'You forgot the ½. Base × height is the area of a rectangle.'], [b + h, 'Area multiplies base and height; it doesn’t add them.'], [(b * h) / 4, 'You halved twice. Area = ½ × base × height.']],
        hint: 'Area = ½ × base × height.', explanation: `½ × ${b} × ${h} = ${(b * h) / 2}.`,
        figure: { type: 'triangle-height', base: b, height: h, baseLabel: `${b} cm`, heightLabel: `${h} cm` } };
    }],
    ['Rectangles', 'foundation', 'Rectangle: area = length × width, and perimeter = 2(length + width).', () => {
      const w = int(3, 15), l = int(w + 1, 25);
      return { prompt: `A rectangle has an area of ${w * l} square feet and a width of ${w} feet. What is its perimeter in feet?`, answer: 2 * (w + l),
        wrong: [[l, 'That’s the length. Perimeter adds all four sides.'], [w + l, 'That’s half the perimeter: one length plus one width.'], [w * l, 'That’s the area, which the problem gave you.']],
        hint: 'Find the length from the area, then add all four sides.', explanation: `Length = ${w * l} ÷ ${w} = ${l}; perimeter = 2(${w} + ${l}) = ${2 * (w + l)}.`,
        figure: { type: 'rectangle', width: w, length: l, widthLabel: `${w} ft`, lengthLabel: '?', inside: `Area = ${w * l} sq ft` } };
    }],
    ['Pythagorean theorem', 'foundation', 'Pythagorean theorem: in a right triangle, a² + b² = c², where c is the hypotenuse.', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k = int(1, 6);
      return { prompt: `A right triangle has legs of length ${a * k} and ${b * k}. What is the length of the hypotenuse?`, answer: c * k,
        wrong: [[(a + b) * k, 'You added the legs. Square them, add the squares, then take the square root.'], [c * k + 1, SLIP], [b * k + 1, SLIP]],
        hint: 'a² + b² = c².', explanation: `${a * k}² + ${b * k}² = ${(c * k) ** 2}, so c = ${c * k}.`,
        figure: { type: 'right-triangle', a: a * k, b: b * k, aLabel: `${a * k}`, bLabel: `${b * k}`, cLabel: '?' } };
    }],
    ['Right triangles', 'medium', 'Pythagorean theorem: in a right triangle, a² + b² = c², so a missing leg is √(c² − a²).', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = int(1, 5);
      return { prompt: `A right triangle has a hypotenuse of ${c * k} and one leg of ${a * k}. What is the length of the other leg?`, answer: b * k,
        wrong: [[(c - a) * k, 'You subtracted the lengths. Subtract their squares, then take the square root.'], [a * k, 'That’s the leg you were given.'], [b * k + 2, SLIP]],
        hint: 'Subtract the square of the known leg from the square of the hypotenuse.', explanation: `${(c * k) ** 2} − ${(a * k) ** 2} = ${(b * k) ** 2}, so the leg is ${b * k}.`,
        figure: { type: 'right-triangle', a: a * k, b: b * k, aLabel: `${a * k}`, bLabel: '?', cLabel: `${c * k}` } };
    }],
    ['Circle area', 'foundation', 'Circle area: A = πr².', () => {
      const r = int(2, 20);
      return { prompt: `A circle has a radius of ${r}. What is its area?`, answer: pi(r * r),
        wrong: [[pi(2 * r), 'That’s the circumference (2πr), not the area.'], [pi(r), 'You forgot to square the radius.'], [pi(4 * r * r), `You used the diameter (${2 * r}) in πr² instead of the radius.`]],
        hint: 'Area = πr².', explanation: `π × ${r}² = ${pi(r * r)}.`,
        figure: { type: 'circle', radiusLabel: `${r}` } };
    }],
    ['Circumference', 'medium', 'Circumference: C = 2πr.', () => {
      const r = int(2, 30);
      return { prompt: `A circle has a circumference of ${pi(2 * r)}. What is its radius?`, answer: r,
        wrong: [[2 * r, 'That’s the diameter. The radius is half of it.'], [r * r, 'C = 2πr has no square in it.'], [r + 2, SLIP]],
        hint: 'Circumference = 2πr.', explanation: `2πr = ${pi(2 * r)}, so r = ${r}.`,
        figure: { type: 'circle', radiusLabel: 'r = ?', caption: `C = ${pi(2 * r)}` } };
    }],
    ['Triangle angles', 'foundation', 'Triangle angle sum: the three interior angles of any triangle add to 180°.', () => {
      const a = int(25, 90), b = int(20, 150 - a);
      return { prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the measure of the third angle, in degrees?`, answer: 180 - a - b,
        wrong: [[360 - a - b, 'Triangle angles add to 180°, not 360°.'], [a + b, 'That’s the sum of the two given angles. Subtract it from 180°.'], [90 - Math.abs(a - b), `Use the angle-sum rule: 180° − ${a}° − ${b}°.`]],
        hint: 'The angles of a triangle add to 180°.', explanation: `180 − ${a} − ${b} = ${180 - a - b}.`,
        figure: { type: 'triangle-angles', A: a, B: b, aLabel: `${a}°`, bLabel: `${b}°`, cLabel: '?' } };
    }],
    ['Similar triangles', 'medium', 'Similar triangles: corresponding sides are proportional, all multiplied by one scale factor.', () => {
      const a = int(2, 9), b = int(a + 1, 14), k = int(2, 5);
      return { prompt: `Triangle ABC is similar to triangle DEF. AB = ${a}, BC = ${b}, and DE = ${a * k}. What is EF?`, answer: b * k,
        wrong: [[b + (a * k - a), `You added the difference DE − AB = ${a * k - a}. Similar figures scale by multiplying, not adding.`], [a * k, 'That’s DE, which the problem gave you.'], [b * k + k, SLIP]],
        hint: 'Corresponding sides share one scale factor.', explanation: `Scale factor = ${a * k} ÷ ${a} = ${k}; EF = ${b} × ${k} = ${b * k}.` };
    }],
    ['Volume', 'medium', 'Cylinder volume: V = πr²h, the area of the circular base times the height.', () => {
      const r = int(2, 10), h = int(2, 15);
      return { prompt: `A cylinder has a radius of ${r} and a height of ${h}. What is its volume?`, answer: pi(r * r * h),
        wrong: [[pi(2 * r * h), 'You multiplied by 2r instead of r².'], [pi(r * h), 'You forgot to square the radius.'], [pi(4 * r * r * h), 'You used the diameter instead of the radius.']],
        hint: 'Volume = πr²h.', explanation: `π × ${r}² × ${h} = ${pi(r * r * h)}.` };
    }],
    ['Circle equations', 'advanced', 'Standard form of a circle: (x − h)² + (y − k)² = r², reached by completing the square.', () => {
      const h = int(-7, 7), k = int(-7, 7), r = int(2, 9); if (!h || !k) return null;
      return { prompt: `The equation x² + y² ${signed(-2 * h)}x ${signed(-2 * k)}y ${signed(h * h + k * k - r * r)} = 0 defines a circle. What is its radius?`, answer: r,
        wrong: [[r * r, 'That’s r², the number on the right after completing the square. Take its square root.'], [h * h + k * k, 'That’s h² + k². Completing the square also has to account for the constant term.'], [r + 1, SLIP]],
        hint: 'Complete the square in x and in y.', explanation: `(x ${signed(-h)})² + (y ${signed(-k)})² = ${r * r}, so r = ${r}.` };
    }],
    ['Trigonometry', 'advanced', 'SOH-CAH-TOA: sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent.', () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = int(1, 4);
      return { prompt: `In a right triangle, the side opposite angle θ is ${a * k} and the hypotenuse is ${c * k}. What is cos θ?`, answer: `${b}/${c}`,
        wrong: [[`${a}/${c}`, 'That’s sin θ (opposite ÷ hypotenuse).'], [`${a}/${b}`, 'That’s tan θ (opposite ÷ adjacent).'], [`${c}/${b}`, 'Upside down: cos θ = adjacent ÷ hypotenuse.']],
        hint: 'Find the adjacent side, then use cos = adjacent ÷ hypotenuse.', explanation: `Adjacent = ${b * k}, so cos θ = ${b * k}/${c * k} = ${b}/${c}.`,
        figure: { type: 'right-triangle', a: a * k, b: b * k, aLabel: `${a * k}`, bLabel: '?', cLabel: `${c * k}`, theta: true } };
    }],
    ['Arc length', 'advanced', 'Arc length = (central angle ÷ 360°) × 2πr.', () => {
      const angle = pick([30, 45, 60, 90, 120, 135, 150, 180, 240, 270]), r = int(2, 24);
      const num = angle * 2 * r; if (num % 360) return null;
      return { prompt: `A circle has a radius of ${r}. What is the length of an arc with a central angle of ${angle}°?`, answer: pi(num / 360),
        wrong: [[pi(2 * r), `That’s the whole circumference. The arc is only ${angle}/360 of it.`], [pi(num / 180), 'Divide the angle by 360°, not 180°.'], [pi(r), `Use (${angle} ÷ 360) × 2π(${r}).`]],
        hint: 'Arc length = (angle ÷ 360) × 2πr.', explanation: `(${angle} ÷ 360) × ${pi(2 * r)} = ${pi(num / 360)}.`,
        figure: { type: 'sector', angle, radiusLabel: `${r}`, arcLabel: '?' } };
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
  templates.forEach(([skill, difficulty, rule, make], t) => {
    const per = Math.floor(100 / templates.length) + (t < 100 % templates.length ? 1 : 0);
    let made = 0, tries = 0;
    while (made < per) {
      assert(++tries < 5000, `${domain}/${skill}: parameter space too small`);
      const q = make(); if (!q || prompts.has(q.prompt)) continue;
      const answer = String(q.answer);
      const choices = [[answer, null]];
      for (const [w, why] of [...q.wrong.map(([v, why]) => [String(v), why]), ...nearMisses(answer).map(v => [v, SLIP])]) {
        if (choices.length === 4) break;
        if (w !== answer && !choices.some(([c]) => c === w) && !/NaN|Infinity|undefined|\.\d{3,}/.test(w)) choices.push([w, why]);
      }
      if (choices.length < 4) continue;
      for (let i = 3; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
      prompts.add(q.prompt);
      const options = choices.map(([v]) => v);
      out.push({ id: `${prefix}-${String(out.length + 1).padStart(3, '0')}`, domain, skill, difficulty, prompt: q.prompt, options, answer: options.indexOf(answer),
        hint: q.hint, explanation: q.explanation, rule, mistakes: choices.map(([, why]) => why), ...(q.figure ? { figure: q.figure } : {}) });
      made++;
    }
  });
  return out;
}

const bank = [...build('algebra', 'g-alg'), ...build('advanced', 'g-adv'), ...build('data', 'g-data'), ...build('geometry', 'g-geo')];

// Self-check: 100 per domain, unique ids/prompts, 4 distinct options, valid answer, a reason for every wrong option.
for (const d of ['algebra', 'advanced', 'data', 'geometry']) assert.equal(bank.filter(q => q.domain === d).length, 100, d);
assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
assert.equal(new Set(bank.map(q => q.prompt)).size, bank.length);
for (const q of bank) {
  assert.equal(new Set(q.options).size, 4, q.id);
  assert.ok(q.answer >= 0 && q.answer < 4, q.id);
  assert.ok(q.rule, q.id);
  q.mistakes.forEach((why, i) => assert.ok(i === q.answer ? why === null : typeof why === 'string' && why.length > 10, q.id));
}

const url = new URL('../questions-extra.js', import.meta.url);
writeFileSync(url, `// Generated by tools/generate-questions.mjs. Do not edit by hand; edit the templates and re-run.\nwindow.ORBIT_EXTRA_QUESTIONS = ${JSON.stringify(bank)};\n`);
console.log(`Wrote ${bank.length} questions to ${url.pathname}`);
