'use strict';

const LEGACY_STORAGE_KEY = 'orbitSatMathV1';
const USERS_KEY = 'orbitSatMathUsers';
const SESSION_KEY = 'orbitSatMathCurrentUser';
const stateKey = id => `orbitSatMathV1:${id}`;

const DOMAINS = {
  algebra: { name: 'Algebra', short: 'Linear equations & functions', symbol: 'x', weight: 35 },
  advanced: { name: 'Advanced Math', short: 'Quadratics & nonlinear math', symbol: 'x²', weight: 35 },
  data: { name: 'Problem-Solving & Data', short: 'Rates, ratios & statistics', symbol: '%', weight: 15 },
  geometry: { name: 'Geometry & Trigonometry', short: 'Shapes, circles & triangles', symbol: '△', weight: 15 }
};

// These are original practice questions aligned to publicly described SAT Math skills.
// They are not copied from or endorsed by College Board.
const QUESTION_BANK = [
  {
    id: 'alg-01', domain: 'algebra', skill: 'Linear equations in one variable', difficulty: 'foundation', diagnostic: true,
    prompt: 'If 5x − 7 = 3x + 9, what is the value of x?',
    options: ['1', '4', '8', '16'], answer: 2,
    hint: 'Move both x terms to one side and both constants to the other.',
    explanation: 'Subtract 3x from both sides: 2x − 7 = 9. Add 7: 2x = 16, so x = 8.'
  },
  {
    id: 'alg-02', domain: 'algebra', skill: 'Slope and linear functions', difficulty: 'medium', diagnostic: true,
    prompt: 'A line passes through (2, 5) and (6, 17). Which equation represents the line?',
    options: ['y = 2x + 1', 'y = 3x − 1', 'y = 3x + 1', 'y = 4x − 3'], answer: 1,
    hint: 'First calculate slope using change in y divided by change in x.',
    explanation: 'The slope is (17 − 5)/(6 − 2) = 3. Using (2, 5): 5 = 3(2) + b, so b = −1. Therefore y = 3x − 1.'
  },
  {
    id: 'alg-03', domain: 'algebra', skill: 'Systems of equations', difficulty: 'medium',
    prompt: 'At a school play, adult tickets cost $12 and student tickets cost $7. A total of 85 tickets brought in $770. How many student tickets were sold?',
    options: ['35', '45', '50', '65'], answer: 2,
    hint: 'Let a + s = 85 and 12a + 7s = 770. Substitute a = 85 − s.',
    explanation: 'Substitute a = 85 − s: 12(85 − s) + 7s = 770. Then 1,020 − 5s = 770, so s = 50.'
  },
  {
    id: 'alg-04', domain: 'algebra', skill: 'Linear inequalities', difficulty: 'foundation',
    prompt: 'A streaming plan costs $18 per month plus $3 per movie. If Maya can spend at most $42, what is the greatest number of movies she can rent?',
    options: ['6', '8', '10', '14'], answer: 1,
    hint: 'Translate “at most” into the inequality 18 + 3m ≤ 42.',
    explanation: '18 + 3m ≤ 42 gives 3m ≤ 24, so m ≤ 8. The greatest whole number is 8.'
  },
  {
    id: 'alg-05', domain: 'algebra', skill: 'Interpreting linear models', difficulty: 'advanced',
    prompt: 'For the function f(t) = 72 − 4.5t, f(t) gives the liters of water left in a tank t minutes after draining begins. What does 4.5 represent?',
    options: ['The tank starts with 4.5 liters', 'The tank fills at 4.5 liters per minute', 'The tank drains at 4.5 liters per minute', 'The tank empties after 4.5 minutes'], answer: 2,
    hint: 'The coefficient of t is the rate of change. Pay attention to its sign.',
    explanation: 'The coefficient is −4.5, so the amount decreases by 4.5 liters each minute. The tank drains at 4.5 liters per minute.'
  },
  {
    id: 'adv-01', domain: 'advanced', skill: 'Quadratic equations', difficulty: 'foundation', diagnostic: true,
    prompt: 'Which values of x satisfy x² − 7x + 12 = 0?',
    options: ['−3 and −4', '3 and 4', '2 and 6', '−2 and −6'], answer: 1,
    hint: 'Find two numbers whose product is 12 and whose sum is −7 in the factored expression.',
    explanation: 'x² − 7x + 12 = (x − 3)(x − 4). Each factor can equal zero, giving x = 3 or x = 4.'
  },
  {
    id: 'adv-02', domain: 'advanced', skill: 'Exponential growth', difficulty: 'medium', diagnostic: true,
    prompt: 'A bacteria culture starts with 200 cells and doubles every 3 hours. Which expression gives the number of cells after h hours?',
    options: ['200(2)³ʰ', '200(2)ʰ⁄³', '200 + 2h/3', '200(3)ʰ⁄²'], answer: 1,
    hint: 'The exponent counts the number of 3-hour doubling periods.',
    explanation: 'After h hours, h/3 doubling periods have passed. The exponential model is 200(2)^(h/3).'
  },
  {
    id: 'adv-03', domain: 'advanced', skill: 'Equivalent expressions', difficulty: 'medium',
    prompt: 'Which expression is equivalent to (x² − 9)/(x − 3) for x ≠ 3?',
    options: ['x − 3', 'x + 3', 'x² + 3', '1'], answer: 1,
    hint: 'Factor the numerator as a difference of squares.',
    explanation: 'x² − 9 = (x − 3)(x + 3). Canceling x − 3, which is allowed because x ≠ 3, leaves x + 3.'
  },
  {
    id: 'adv-04', domain: 'advanced', skill: 'Vertex form', difficulty: 'advanced',
    prompt: 'The function g(x) = −2(x − 5)² + 18 models the height of an object. What is the maximum value of g(x)?',
    options: ['2', '5', '18', '23'], answer: 2,
    hint: 'This is vertex form. Because the squared term has a negative coefficient, the vertex is a maximum.',
    explanation: 'The vertex is (5, 18). Since the parabola opens downward, its maximum value is 18.'
  },
  {
    id: 'adv-05', domain: 'advanced', skill: 'Radical equations', difficulty: 'advanced',
    prompt: 'If √(x + 5) = x − 1, which value of x is a solution?',
    options: ['−1', '1', '4', '6'], answer: 2,
    hint: 'A square root is nonnegative. Test the choices in the original equation, not only a squared version.',
    explanation: 'For x = 4, √(4 + 5) = 3 and 4 − 1 = 3. The two sides are equal, so 4 is a solution.'
  },
  {
    id: 'data-01', domain: 'data', skill: 'Percent change', difficulty: 'foundation', diagnostic: true,
    prompt: 'A jacket originally priced at $80 is discounted by 25%. What is the sale price?',
    options: ['$20', '$55', '$60', '$75'], answer: 2,
    hint: 'A 25% discount means the buyer pays 75% of the original price.',
    explanation: 'The sale price is 0.75 × $80 = $60.'
  },
  {
    id: 'data-02', domain: 'data', skill: 'Ratios and units', difficulty: 'medium', diagnostic: true,
    prompt: 'A car travels 180 miles using 6 gallons of fuel. At the same rate, how many gallons are needed to travel 255 miles?',
    options: ['7.5', '8', '8.5', '9'], answer: 2,
    hint: 'First find miles per gallon, then divide 255 by that rate.',
    explanation: 'The car travels 180/6 = 30 miles per gallon. It needs 255/30 = 8.5 gallons.'
  },
  {
    id: 'data-03', domain: 'data', skill: 'Mean and totals', difficulty: 'medium',
    prompt: 'The mean of five numbers is 18. Four of the numbers are 12, 15, 20, and 24. What is the fifth number?',
    options: ['17', '18', '19', '21'], answer: 2,
    hint: 'The five numbers must have a total of 5 × 18.',
    explanation: 'The total is 90. The four known numbers total 71, so the fifth number is 90 − 71 = 19.'
  },
  {
    id: 'data-04', domain: 'data', skill: 'Probability', difficulty: 'advanced',
    prompt: 'A bag contains 5 blue, 3 green, and 2 yellow tiles. One tile is selected at random. What is the probability that it is not green?',
    options: ['3/10', '1/2', '7/10', '4/5'], answer: 2,
    hint: 'Count all tiles that are blue or yellow, then divide by the total.',
    explanation: 'There are 7 tiles that are not green out of 10 total tiles, so the probability is 7/10.'
  },
  {
    id: 'data-05', domain: 'data', skill: 'Scatterplots and models', difficulty: 'advanced',
    prompt: 'A line of best fit predicts y = 4.2x + 11. If the observed y-value when x = 10 is 49, what is the residual?',
    options: ['−4', '−2', '2', '4'], answer: 0,
    hint: 'Residual = observed value − predicted value.',
    explanation: 'The predicted value is 4.2(10) + 11 = 53. The residual is 49 − 53 = −4.'
  },
  {
    id: 'geo-01', domain: 'geometry', skill: 'Triangle area', difficulty: 'foundation', diagnostic: true,
    prompt: 'A triangle has a base of 12 centimeters and a height of 7 centimeters. What is its area in square centimeters?',
    options: ['19', '42', '84', '168'], answer: 1,
    hint: 'The area of a triangle is one-half times base times height.',
    explanation: 'Area = (1/2)(12)(7) = 42 square centimeters.'
  },
  {
    id: 'geo-02', domain: 'geometry', skill: 'Circles', difficulty: 'medium', diagnostic: true,
    prompt: 'A circle has circumference 18π. What is its radius?',
    options: ['4.5', '9', '18', '36'], answer: 1,
    hint: 'Use C = 2πr and solve for r.',
    explanation: '18π = 2πr. Dividing by 2π gives r = 9.'
  },
  {
    id: 'geo-03', domain: 'geometry', skill: 'Right triangles', difficulty: 'medium',
    prompt: 'A right triangle has legs of length 9 and 12. What is the length of its hypotenuse?',
    options: ['13', '15', '18', '21'], answer: 1,
    hint: 'Apply a² + b² = c².',
    explanation: '9² + 12² = 81 + 144 = 225. The square root of 225 is 15.'
  },
  {
    id: 'geo-04', domain: 'geometry', skill: 'Angle relationships', difficulty: 'advanced',
    prompt: 'Two parallel lines are cut by a transversal. One acute angle measures (3x + 8)°. One obtuse angle measures (7x − 8)°. What is x?',
    options: ['12', '16', '18', '22'], answer: 2,
    hint: 'An acute angle and an obtuse angle formed by the transversal are supplementary.',
    explanation: '(3x + 8) + (7x − 8) = 180, so 10x = 180 and x = 18.'
  },
  {
    id: 'geo-05', domain: 'geometry', skill: 'Right triangle trigonometry', difficulty: 'advanced',
    prompt: 'In a right triangle, sin θ = 3/5. If the side opposite θ has length 12, what is the length of the hypotenuse?',
    options: ['15', '18', '20', '24'], answer: 2,
    hint: 'sin θ = opposite/hypotenuse. Set 3/5 = 12/h.',
    explanation: '3/5 = 12/h. Cross-multiplying gives 3h = 60, so h = 20.'
  },

  {
    id: 'alg-06', domain: 'algebra', skill: 'Systems of equations', difficulty: 'foundation', diagnostic: true,
    prompt: 'If 2x + y = 11 and x − y = 1, what is the value of x?', options: ['2', '3', '4', '5'], answer: 2,
    hint: 'Add the equations to eliminate y.', explanation: 'Adding gives 3x = 12, so x = 4.'
  },
  {
    id: 'alg-07', domain: 'algebra', skill: 'Function notation', difficulty: 'medium',
    prompt: 'If f(x) = 4x − 3 and f(k) = 21, what is k?', options: ['4', '5', '6', '7'], answer: 2,
    hint: 'Replace x with k and solve 4k − 3 = 21.', explanation: '4k − 3 = 21 gives 4k = 24, so k = 6.'
  },
  {
    id: 'alg-08', domain: 'algebra', skill: 'Linear equations in context', difficulty: 'medium',
    prompt: 'A gym charges a $25 sign-up fee plus $18 per month. If a member paid $133 total, for how many months did they belong?', options: ['5', '6', '7', '8'], answer: 1,
    hint: 'Subtract the fixed fee, then divide by the monthly fee.', explanation: '(133 − 25) / 18 = 6 months.'
  },
  {
    id: 'alg-09', domain: 'algebra', skill: 'Inequalities in context', difficulty: 'medium',
    prompt: 'A student has $90 and spends $12 on each museum ticket. What is the greatest number of tickets the student can buy while keeping at least $6?', options: ['6', '7', '8', '9'], answer: 1,
    hint: '12t + 6 ≤ 90.', explanation: '12t ≤ 84, so t ≤ 7.'
  },
  {
    id: 'alg-10', domain: 'algebra', skill: 'Linear models', difficulty: 'advanced',
    prompt: 'A line has y-intercept 14 and passes through (4, 26). What is its slope?', options: ['2', '3', '4', '6'], answer: 1,
    hint: 'Use 26 = 4m + 14.', explanation: '12 = 4m, so m = 3.'
  },
  {
    id: 'alg-11', domain: 'algebra', skill: 'Equivalent linear expressions', difficulty: 'advanced',
    prompt: 'Which expression is equivalent to 3(2x − 5) − 2(x + 4)?', options: ['4x − 7', '4x − 23', '8x − 7', '8x − 23'], answer: 1,
    hint: 'Distribute before combining like terms.', explanation: '6x − 15 − 2x − 8 = 4x − 23.'
  },
  {
    id: 'adv-06', domain: 'advanced', skill: 'Quadratic factors', difficulty: 'foundation', diagnostic: true,
    prompt: 'If x² + 2x − 15 = 0, which could be a value of x?', options: ['−6', '−5', '2', '5'], answer: 1,
    hint: 'Factor using two numbers with product −15 and sum 2.', explanation: '(x + 5)(x − 3) = 0, so x = −5 or 3.'
  },
  {
    id: 'adv-07', domain: 'advanced', skill: 'Quadratic vertex', difficulty: 'medium',
    prompt: 'What is the x-coordinate of the vertex of y = x² − 8x + 11?', options: ['−8', '−4', '4', '8'], answer: 2,
    hint: 'For ax² + bx + c, the vertex x-coordinate is −b/(2a).', explanation: '−(−8)/(2) = 4.'
  },
  {
    id: 'adv-08', domain: 'advanced', skill: 'Exponential decay', difficulty: 'medium',
    prompt: 'A $1,200 laptop loses 20% of its value each year. Which expression gives its value after t years?', options: ['1200(0.2)^t', '1200(0.8)^t', '1200 − 0.8t', '1200(1.2)^t'], answer: 1,
    hint: 'After losing 20%, 80% remains each year.', explanation: 'The value is multiplied by 0.8 each year: 1200(0.8)^t.'
  },
  {
    id: 'adv-09', domain: 'advanced', skill: 'Polynomial zeros', difficulty: 'medium',
    prompt: 'If p(x) = (x − 2)(x + 6), what is p(2)?', options: ['−12', '0', '4', '16'], answer: 1,
    hint: 'One factor becomes zero when x = 2.', explanation: 'p(2) = (2 − 2)(2 + 6) = 0.'
  },
  {
    id: 'adv-10', domain: 'advanced', skill: 'Rational equations', difficulty: 'advanced',
    prompt: 'If 1/x + 1/3 = 1/2, what is x?', options: ['2', '3', '6', '9'], answer: 2,
    hint: 'Subtract 1/3 from both sides, then take the reciprocal.', explanation: '1/x = 1/6, so x = 6.'
  },
  {
    id: 'adv-11', domain: 'advanced', skill: 'Radical expressions', difficulty: 'advanced',
    prompt: 'What is the simplified value of √50 − √8?', options: ['√42', '2√2', '3√2', '7√2'], answer: 2,
    hint: 'Rewrite √50 as 5√2 and √8 as 2√2.', explanation: '5√2 − 2√2 = 3√2.'
  },
  {
    id: 'adv-12', domain: 'advanced', skill: 'Equivalent nonlinear expressions', difficulty: 'advanced',
    prompt: 'Which expression is equivalent to (x + 4)² − 16?', options: ['x² + 4x', 'x² + 8x', 'x² + 8x + 16', 'x² + 16'], answer: 1,
    hint: 'Expand the square, then subtract 16.', explanation: 'x² + 8x + 16 − 16 = x² + 8x.'
  },
  {
    id: 'adv-13', domain: 'advanced', skill: 'Systems with nonlinear equations', difficulty: 'advanced',
    prompt: 'If y = x² and y = 9, which positive value of x satisfies both equations?', options: ['1', '3', '6', '9'], answer: 1,
    hint: 'Set x² equal to 9, then choose the positive solution.', explanation: 'x² = 9, so x = 3 or −3; the positive value is 3.'
  },
  {
    id: 'adv-14', domain: 'advanced', skill: 'Function composition', difficulty: 'advanced',
    prompt: 'If f(x) = x + 2 and g(x) = 3x, what is f(g(4))?', options: ['12', '14', '18', '20'], answer: 1,
    hint: 'Evaluate g(4) first, then put that result into f.', explanation: 'g(4) = 12 and f(12) = 14.'
  },
  {
    id: 'geo-06', domain: 'geometry', skill: 'Circle area', difficulty: 'foundation',
    prompt: 'A circle has radius 6. What is its area in terms of π?', options: ['6π', '12π', '18π', '36π'], answer: 3,
    hint: 'Use A = πr².', explanation: 'A = π(6²) = 36π.'
  },
  {
    id: 'geo-16', domain: 'geometry', skill: 'Right triangles', difficulty: 'foundation',
    prompt: 'A right triangle has legs 5 and 12. What is the hypotenuse?', options: ['11', '13', '15', '17'], answer: 1,
    hint: 'Recognize the 5-12-13 Pythagorean triple.', explanation: '5² + 12² = 169, so the hypotenuse is 13.'
  },
  {
    id: 'geo-07', domain: 'geometry', skill: 'Similar triangles', difficulty: 'medium',
    prompt: 'Two similar triangles have corresponding side lengths 8 and 12. If the shorter triangle has perimeter 30, what is the perimeter of the larger triangle?', options: ['36', '40', '45', '48'], answer: 2,
    hint: 'The scale factor is 12/8.', explanation: '30 × 12/8 = 45.'
  },
  {
    id: 'geo-08', domain: 'geometry', skill: 'Volume', difficulty: 'medium',
    prompt: 'A rectangular prism measures 3 by 5 by 8. What is its volume?', options: ['16', '40', '120', '240'], answer: 2,
    hint: 'Multiply length, width, and height.', explanation: '3 × 5 × 8 = 120.'
  },
  {
    id: 'geo-09', domain: 'geometry', skill: 'Angles', difficulty: 'medium',
    prompt: 'The angles of a triangle are x°, 2x°, and 3x°. What is the measure of the largest angle?', options: ['30°', '60°', '90°', '120°'], answer: 2,
    hint: 'The angles of a triangle sum to 180°.', explanation: '6x = 180, so x = 30 and the largest angle is 90°.'
  },
  {
    id: 'geo-10', domain: 'geometry', skill: 'Coordinate geometry', difficulty: 'advanced',
    prompt: 'What is the distance between (1, 2) and (7, 10)?', options: ['8', '10', '12', '14'], answer: 1,
    hint: 'Use the distance formula with differences 6 and 8.', explanation: '√(6² + 8²) = √100 = 10.'
  },
  {
    id: 'geo-11', domain: 'geometry', skill: 'Circle equations', difficulty: 'advanced',
    prompt: 'A circle centered at (2, −3) has radius 4. Which is its equation?', options: ['(x + 2)² + (y − 3)² = 4', '(x − 2)² + (y + 3)² = 16', '(x − 2)² + (y − 3)² = 4', '(x + 2)² + (y + 3)² = 16'], answer: 1,
    hint: 'Use (x − h)² + (y − k)² = r².', explanation: 'Substitute h = 2, k = −3, and r² = 16.'
  },
  {
    id: 'geo-12', domain: 'geometry', skill: 'Trigonometry', difficulty: 'medium',
    prompt: 'In a right triangle, cos θ = 4/5 and the hypotenuse is 25. What is the adjacent side?', options: ['15', '18', '20', '24'], answer: 2,
    hint: 'cos θ = adjacent/hypotenuse.', explanation: 'Adjacent = 25 × 4/5 = 20.'
  },
  {
    id: 'geo-13', domain: 'geometry', skill: 'Trigonometry', difficulty: 'advanced',
    prompt: 'A right triangle has opposite side 7 and adjacent side 24 relative to θ. What is tan θ?', options: ['7/24', '7/25', '24/7', '25/7'], answer: 0,
    hint: 'Tangent is opposite divided by adjacent.', explanation: 'tan θ = 7/24.'
  },
  {
    id: 'geo-14', domain: 'geometry', skill: 'Area and scale', difficulty: 'advanced',
    prompt: 'A square has area 144. What is the perimeter of the square?', options: ['12', '24', '48', '576'], answer: 2,
    hint: 'Find the side length by taking the square root of the area.', explanation: 'The side is 12, so the perimeter is 4 × 12 = 48.'
  },
  {
    id: 'geo-15', domain: 'geometry', skill: 'Arc measure', difficulty: 'advanced',
    prompt: 'A central angle measures 90° in a circle. What fraction of the circle’s circumference is its intercepted arc?', options: ['1/8', '1/4', '1/2', '3/4'], answer: 1,
    hint: 'Compare 90° with the full 360°.', explanation: '90/360 = 1/4.'
  }];

QUESTION_BANK.push(...[
  {
    "id": "expanded-1",
    "domain": "algebra",
    "skill": "Linear equations",
    "difficulty": "foundation",
    "prompt": "Solve 3x + 8 = 23. What is x?",
    "options": [
      "5",
      "3",
      "4",
      "6"
    ],
    "answer": 0,
    "hint": "Undo addition before multiplication.",
    "explanation": "Subtract 8: 3x = 15. Divide by 3: x = 5."
  },
  {
    "id": "expanded-2",
    "domain": "algebra",
    "skill": "Distributive property",
    "difficulty": "foundation",
    "prompt": "If 3(x − 1) = 12, what is x?",
    "options": [
      "3",
      "5",
      "4",
      "6"
    ],
    "answer": 1,
    "hint": "Divide both sides before isolating x.",
    "explanation": "x − 1 = 4; adding 1 gives 5."
  },
  {
    "id": "expanded-3",
    "domain": "algebra",
    "skill": "Systems of equations",
    "difficulty": "foundation",
    "prompt": "If x + y = 13 and x − y = -3, what is x?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 2,
    "hint": "Add the two equations.",
    "explanation": "Adding eliminates y: 2x = 10, so x = 5."
  },
  {
    "id": "expanded-4",
    "domain": "algebra",
    "skill": "Slope",
    "difficulty": "foundation",
    "prompt": "A line passes through (1, 11) and (4, 20). What is its slope?",
    "options": [
      "1",
      "2",
      "4",
      "3"
    ],
    "answer": 3,
    "hint": "Divide the change in y by the change in x.",
    "explanation": "Slope = (20 − 11)/(4 − 1) = 9/3 = 3."
  },
  {
    "id": "expanded-5",
    "domain": "algebra",
    "skill": "Intercepts",
    "difficulty": "foundation",
    "prompt": "The line y = 3x + b passes through (2, 14). What is b?",
    "options": [
      "8",
      "6",
      "7",
      "9"
    ],
    "answer": 0,
    "hint": "Substitute the point into the equation.",
    "explanation": "14 = 6 + b, giving b = 8."
  },
  {
    "id": "expanded-6",
    "domain": "algebra",
    "skill": "Budget inequalities",
    "difficulty": "foundation",
    "prompt": "A club has $23 for supplies. After a $8 delivery charge, each kit costs $3. What is the greatest number of kits it can buy?",
    "options": [
      "3",
      "5",
      "4",
      "6"
    ],
    "answer": 1,
    "hint": "Subtract the fixed charge first.",
    "explanation": "The kit budget is $15; 15/3 = 5 kits."
  },
  {
    "id": "expanded-7",
    "domain": "algebra",
    "skill": "Parallel lines",
    "difficulty": "foundation",
    "prompt": "A line parallel to y = 3x + 8 passes through (0, 2). What is its slope?",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": 2,
    "hint": "Parallel nonvertical lines share a slope.",
    "explanation": "The coefficient of x in the given line is 3, which is also the parallel line's slope."
  },
  {
    "id": "expanded-8",
    "domain": "algebra",
    "skill": "Linear function values",
    "difficulty": "foundation",
    "prompt": "If f(t) = 3t − 8, what is f(5)?",
    "options": [
      "5",
      "6",
      "8",
      "7"
    ],
    "answer": 3,
    "hint": "Substitute for t, then multiply and subtract.",
    "explanation": "f(5) = 3(5) − 8 = 7."
  },
  {
    "id": "expanded-9",
    "domain": "advanced",
    "skill": "Quadratic roots",
    "difficulty": "foundation",
    "prompt": "What is the larger solution of (x − 1)(x − 5) = 0?",
    "options": [
      "5",
      "3",
      "4",
      "6"
    ],
    "answer": 0,
    "hint": "Set each factor equal to zero.",
    "explanation": "The solutions are 1 and 5. The larger is 5."
  },
  {
    "id": "expanded-10",
    "domain": "advanced",
    "skill": "Vertex form",
    "difficulty": "foundation",
    "prompt": "For f(x) = (x − 3)² + 8, at what x-value does f reach its minimum?",
    "options": [
      "1",
      "3",
      "2",
      "4"
    ],
    "answer": 1,
    "hint": "A square is smallest when its value is zero.",
    "explanation": "The square is zero at x = 3, so that is the minimizing x-value."
  },
  {
    "id": "expanded-11",
    "domain": "advanced",
    "skill": "Quadratic maximum",
    "difficulty": "foundation",
    "prompt": "What is the maximum value of g(x) = −3(x − 2)² + 8?",
    "options": [
      "6",
      "7",
      "8",
      "9"
    ],
    "answer": 2,
    "hint": "The squared term cannot be negative.",
    "explanation": "The term −3(x − 2)² is at most zero. At x = 2, g(x) = 8, the maximum."
  },
  {
    "id": "expanded-12",
    "domain": "advanced",
    "skill": "Difference of squares",
    "difficulty": "foundation",
    "prompt": "For x ≠ 3, (x² − 9)/(x − 3) = x + k. What is k?",
    "options": [
      "1",
      "2",
      "4",
      "3"
    ],
    "answer": 3,
    "hint": "Factor the numerator.",
    "explanation": "The numerator is (x − 3)(x + 3); canceling leaves x + 3, so k = 3."
  },
  {
    "id": "expanded-13",
    "domain": "advanced",
    "skill": "Exponential growth",
    "difficulty": "foundation",
    "prompt": "A culture begins with 30 cells and doubles every hour. How many cells are present after 3 hours?",
    "options": [
      "240",
      "238",
      "239",
      "241"
    ],
    "answer": 0,
    "hint": "Three doubling periods give a factor of 2³.",
    "explanation": "30 × 2³ = 30 × 8 = 240."
  },
  {
    "id": "expanded-14",
    "domain": "advanced",
    "skill": "Radical equations",
    "difficulty": "foundation",
    "prompt": "If √(x + 8) = 6, what is x?",
    "options": [
      "26",
      "28",
      "27",
      "29"
    ],
    "answer": 1,
    "hint": "Square both sides and then subtract.",
    "explanation": "x + 8 = 36, so x = 28. This gives a nonnegative radicand and satisfies the original equation."
  },
  {
    "id": "expanded-15",
    "domain": "advanced",
    "skill": "Quadratic coefficients",
    "difficulty": "foundation",
    "prompt": "The expression (x + 3)(x + 8) equals x² + kx + 24. What is k?",
    "options": [
      "9",
      "10",
      "11",
      "12"
    ],
    "answer": 2,
    "hint": "The two middle terms combine.",
    "explanation": "Expanding gives x² + 3x + 8x + 24, so k = 11."
  },
  {
    "id": "expanded-16",
    "domain": "advanced",
    "skill": "Exponent rules",
    "difficulty": "foundation",
    "prompt": "For z > 0, z^7/z^3 = z^k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Subtract exponents when dividing powers with the same base.",
    "explanation": "k = 7 − 3 = 4."
  },
  {
    "id": "expanded-17",
    "domain": "geometry",
    "skill": "Triangle area",
    "difficulty": "foundation",
    "prompt": "A triangle has base 6 cm and perpendicular height 8 cm. What is its area in square centimeters?",
    "options": [
      "24",
      "22",
      "23",
      "25"
    ],
    "answer": 0,
    "hint": "Use half the base times the height.",
    "explanation": "Area = ½ × 6 × 8 = 24."
  },
  {
    "id": "expanded-18",
    "domain": "geometry",
    "skill": "Pythagorean theorem",
    "difficulty": "foundation",
    "prompt": "A right triangle has legs 3 and 4. What is the hypotenuse?",
    "options": [
      "3",
      "5",
      "4",
      "6"
    ],
    "answer": 1,
    "hint": "Use the Pythagorean theorem.",
    "explanation": "c² = 9 + 16 = 25; c = 5."
  },
  {
    "id": "expanded-19",
    "domain": "geometry",
    "skill": "Circle area",
    "difficulty": "foundation",
    "prompt": "A circle has radius 3. Its area is kπ. What is k?",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "answer": 2,
    "hint": "Use A = πr².",
    "explanation": "A = π × 3² = 9π, so k = 9."
  },
  {
    "id": "expanded-20",
    "domain": "geometry",
    "skill": "Cylinder volume",
    "difficulty": "foundation",
    "prompt": "A cylinder has radius 3 and height 8. Its volume is kπ. What is k?",
    "options": [
      "70",
      "71",
      "73",
      "72"
    ],
    "answer": 3,
    "hint": "Use V = πr²h.",
    "explanation": "V = π × 3² × 8 = 72π."
  },
  {
    "id": "expanded-21",
    "domain": "geometry",
    "skill": "Sine",
    "difficulty": "foundation",
    "prompt": "In a right triangle, sin θ = 3/5. The hypotenuse is 15. What is the side opposite θ?",
    "options": [
      "9",
      "7",
      "8",
      "10"
    ],
    "answer": 0,
    "hint": "Sine is opposite divided by hypotenuse.",
    "explanation": "Opposite = (3/5) × 15 = 9."
  },
  {
    "id": "expanded-22",
    "domain": "geometry",
    "skill": "Cosine",
    "difficulty": "foundation",
    "prompt": "In a right triangle, cos θ = 4/5. The hypotenuse is 40. What is the side adjacent to θ?",
    "options": [
      "30",
      "32",
      "31",
      "33"
    ],
    "answer": 1,
    "hint": "Cosine is adjacent divided by hypotenuse.",
    "explanation": "Adjacent = (4/5) × 40 = 32."
  },
  {
    "id": "expanded-23",
    "domain": "geometry",
    "skill": "Tangent",
    "difficulty": "foundation",
    "prompt": "In a right triangle, tan θ = 3/4. The side adjacent to θ is 12. What is the opposite side?",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "answer": 2,
    "hint": "Tangent is opposite divided by adjacent.",
    "explanation": "Opposite = (3/4) × 12 = 9."
  },
  {
    "id": "expanded-24",
    "domain": "geometry",
    "skill": "Similar triangles",
    "difficulty": "foundation",
    "prompt": "Two similar triangles have corresponding sides 3 and 9. A second side in the smaller triangle is 8. What is the corresponding side in the larger triangle?",
    "options": [
      "22",
      "23",
      "25",
      "24"
    ],
    "answer": 3,
    "hint": "Find the ratio of corresponding sides.",
    "explanation": "The scale factor is 9/3 = 3. The requested side is 3 × 8 = 24."
  },
  {
    "id": "expanded-25",
    "domain": "algebra",
    "skill": "Linear equations",
    "difficulty": "medium",
    "prompt": "Solve 4x + 9 = 33. What is x?",
    "options": [
      "6",
      "4",
      "5",
      "7"
    ],
    "answer": 0,
    "hint": "Undo addition before multiplication.",
    "explanation": "Subtract 9: 4x = 24. Divide by 4: x = 6."
  },
  {
    "id": "expanded-26",
    "domain": "algebra",
    "skill": "Distributive property",
    "difficulty": "medium",
    "prompt": "If 4(x − 2) = 16, what is x?",
    "options": [
      "4",
      "6",
      "5",
      "7"
    ],
    "answer": 1,
    "hint": "Divide both sides before isolating x.",
    "explanation": "x − 2 = 4; adding 2 gives 6."
  },
  {
    "id": "expanded-27",
    "domain": "algebra",
    "skill": "Systems of equations",
    "difficulty": "medium",
    "prompt": "If x + y = 15 and x − y = -3, what is x?",
    "options": [
      "4",
      "5",
      "6",
      "7"
    ],
    "answer": 2,
    "hint": "Add the two equations.",
    "explanation": "Adding eliminates y: 2x = 12, so x = 6."
  },
  {
    "id": "expanded-28",
    "domain": "algebra",
    "skill": "Slope",
    "difficulty": "medium",
    "prompt": "A line passes through (1, 13) and (4, 25). What is its slope?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Divide the change in y by the change in x.",
    "explanation": "Slope = (25 − 13)/(4 − 1) = 12/3 = 4."
  },
  {
    "id": "expanded-29",
    "domain": "algebra",
    "skill": "Intercepts",
    "difficulty": "medium",
    "prompt": "The line y = 4x + b passes through (2, 17). What is b?",
    "options": [
      "9",
      "7",
      "8",
      "10"
    ],
    "answer": 0,
    "hint": "Substitute the point into the equation.",
    "explanation": "17 = 8 + b, giving b = 9."
  },
  {
    "id": "expanded-30",
    "domain": "algebra",
    "skill": "Budget inequalities",
    "difficulty": "medium",
    "prompt": "A club has $33 for supplies. After a $9 delivery charge, each kit costs $4. What is the greatest number of kits it can buy?",
    "options": [
      "4",
      "6",
      "5",
      "7"
    ],
    "answer": 1,
    "hint": "Subtract the fixed charge first.",
    "explanation": "The kit budget is $24; 24/4 = 6 kits."
  },
  {
    "id": "expanded-31",
    "domain": "algebra",
    "skill": "Parallel lines",
    "difficulty": "medium",
    "prompt": "A line parallel to y = 4x + 9 passes through (0, 2). What is its slope?",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "answer": 2,
    "hint": "Parallel nonvertical lines share a slope.",
    "explanation": "The coefficient of x in the given line is 4, which is also the parallel line's slope."
  },
  {
    "id": "expanded-32",
    "domain": "algebra",
    "skill": "Linear function values",
    "difficulty": "medium",
    "prompt": "If f(t) = 4t − 9, what is f(6)?",
    "options": [
      "13",
      "14",
      "16",
      "15"
    ],
    "answer": 3,
    "hint": "Substitute for t, then multiply and subtract.",
    "explanation": "f(6) = 4(6) − 9 = 15."
  },
  {
    "id": "expanded-33",
    "domain": "advanced",
    "skill": "Quadratic roots",
    "difficulty": "medium",
    "prompt": "What is the larger solution of (x − 2)(x − 6) = 0?",
    "options": [
      "6",
      "4",
      "5",
      "7"
    ],
    "answer": 0,
    "hint": "Set each factor equal to zero.",
    "explanation": "The solutions are 2 and 6. The larger is 6."
  },
  {
    "id": "expanded-34",
    "domain": "advanced",
    "skill": "Vertex form",
    "difficulty": "medium",
    "prompt": "For f(x) = (x − 4)² + 9, at what x-value does f reach its minimum?",
    "options": [
      "2",
      "4",
      "3",
      "5"
    ],
    "answer": 1,
    "hint": "A square is smallest when its value is zero.",
    "explanation": "The square is zero at x = 4, so that is the minimizing x-value."
  },
  {
    "id": "expanded-35",
    "domain": "advanced",
    "skill": "Quadratic maximum",
    "difficulty": "medium",
    "prompt": "What is the maximum value of g(x) = −4(x − 2)² + 9?",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "answer": 2,
    "hint": "The squared term cannot be negative.",
    "explanation": "The term −4(x − 2)² is at most zero. At x = 2, g(x) = 9, the maximum."
  },
  {
    "id": "expanded-36",
    "domain": "advanced",
    "skill": "Difference of squares",
    "difficulty": "medium",
    "prompt": "For x ≠ 4, (x² − 16)/(x − 4) = x + k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Factor the numerator.",
    "explanation": "The numerator is (x − 4)(x + 4); canceling leaves x + 4, so k = 4."
  },
  {
    "id": "expanded-37",
    "domain": "advanced",
    "skill": "Exponential growth",
    "difficulty": "medium",
    "prompt": "A culture begins with 40 cells and doubles every hour. How many cells are present after 3 hours?",
    "options": [
      "320",
      "318",
      "319",
      "321"
    ],
    "answer": 0,
    "hint": "Three doubling periods give a factor of 2³.",
    "explanation": "40 × 2³ = 40 × 8 = 320."
  },
  {
    "id": "expanded-38",
    "domain": "advanced",
    "skill": "Radical equations",
    "difficulty": "medium",
    "prompt": "If √(x + 9) = 7, what is x?",
    "options": [
      "38",
      "40",
      "39",
      "41"
    ],
    "answer": 1,
    "hint": "Square both sides and then subtract.",
    "explanation": "x + 9 = 49, so x = 40. This gives a nonnegative radicand and satisfies the original equation."
  },
  {
    "id": "expanded-39",
    "domain": "advanced",
    "skill": "Quadratic coefficients",
    "difficulty": "medium",
    "prompt": "The expression (x + 4)(x + 9) equals x² + kx + 36. What is k?",
    "options": [
      "11",
      "12",
      "13",
      "14"
    ],
    "answer": 2,
    "hint": "The two middle terms combine.",
    "explanation": "Expanding gives x² + 4x + 9x + 36, so k = 13."
  },
  {
    "id": "expanded-40",
    "domain": "advanced",
    "skill": "Exponent rules",
    "difficulty": "medium",
    "prompt": "For z > 0, z^8/z^4 = z^k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Subtract exponents when dividing powers with the same base.",
    "explanation": "k = 8 − 4 = 4."
  },
  {
    "id": "expanded-41",
    "domain": "geometry",
    "skill": "Triangle area",
    "difficulty": "medium",
    "prompt": "A triangle has base 8 cm and perpendicular height 9 cm. What is its area in square centimeters?",
    "options": [
      "36",
      "34",
      "35",
      "37"
    ],
    "answer": 0,
    "hint": "Use half the base times the height.",
    "explanation": "Area = ½ × 8 × 9 = 36."
  },
  {
    "id": "expanded-42",
    "domain": "geometry",
    "skill": "Pythagorean theorem",
    "difficulty": "medium",
    "prompt": "A right triangle has legs 6 and 8. What is the hypotenuse?",
    "options": [
      "8",
      "10",
      "9",
      "11"
    ],
    "answer": 1,
    "hint": "Use the Pythagorean theorem.",
    "explanation": "c² = 36 + 64 = 100; c = 10."
  },
  {
    "id": "expanded-43",
    "domain": "geometry",
    "skill": "Circle area",
    "difficulty": "medium",
    "prompt": "A circle has radius 4. Its area is kπ. What is k?",
    "options": [
      "14",
      "15",
      "16",
      "17"
    ],
    "answer": 2,
    "hint": "Use A = πr².",
    "explanation": "A = π × 4² = 16π, so k = 16."
  },
  {
    "id": "expanded-44",
    "domain": "geometry",
    "skill": "Cylinder volume",
    "difficulty": "medium",
    "prompt": "A cylinder has radius 4 and height 9. Its volume is kπ. What is k?",
    "options": [
      "142",
      "143",
      "145",
      "144"
    ],
    "answer": 3,
    "hint": "Use V = πr²h.",
    "explanation": "V = π × 4² × 9 = 144π."
  },
  {
    "id": "expanded-45",
    "domain": "geometry",
    "skill": "Sine",
    "difficulty": "medium",
    "prompt": "In a right triangle, sin θ = 3/5. The hypotenuse is 20. What is the side opposite θ?",
    "options": [
      "12",
      "10",
      "11",
      "13"
    ],
    "answer": 0,
    "hint": "Sine is opposite divided by hypotenuse.",
    "explanation": "Opposite = (3/5) × 20 = 12."
  },
  {
    "id": "expanded-46",
    "domain": "geometry",
    "skill": "Cosine",
    "difficulty": "medium",
    "prompt": "In a right triangle, cos θ = 4/5. The hypotenuse is 45. What is the side adjacent to θ?",
    "options": [
      "34",
      "36",
      "35",
      "37"
    ],
    "answer": 1,
    "hint": "Cosine is adjacent divided by hypotenuse.",
    "explanation": "Adjacent = (4/5) × 45 = 36."
  },
  {
    "id": "expanded-47",
    "domain": "geometry",
    "skill": "Tangent",
    "difficulty": "medium",
    "prompt": "In a right triangle, tan θ = 3/4. The side adjacent to θ is 16. What is the opposite side?",
    "options": [
      "10",
      "11",
      "12",
      "13"
    ],
    "answer": 2,
    "hint": "Tangent is opposite divided by adjacent.",
    "explanation": "Opposite = (3/4) × 16 = 12."
  },
  {
    "id": "expanded-48",
    "domain": "geometry",
    "skill": "Similar triangles",
    "difficulty": "medium",
    "prompt": "Two similar triangles have corresponding sides 4 and 12. A second side in the smaller triangle is 9. What is the corresponding side in the larger triangle?",
    "options": [
      "25",
      "26",
      "28",
      "27"
    ],
    "answer": 3,
    "hint": "Find the ratio of corresponding sides.",
    "explanation": "The scale factor is 12/4 = 3. The requested side is 3 × 9 = 27."
  },
  {
    "id": "expanded-49",
    "domain": "algebra",
    "skill": "Linear equations",
    "difficulty": "medium",
    "prompt": "Solve 5x + 10 = 45. What is x?",
    "options": [
      "7",
      "5",
      "6",
      "8"
    ],
    "answer": 0,
    "hint": "Undo addition before multiplication.",
    "explanation": "Subtract 10: 5x = 35. Divide by 5: x = 7."
  },
  {
    "id": "expanded-50",
    "domain": "algebra",
    "skill": "Distributive property",
    "difficulty": "medium",
    "prompt": "If 5(x − 3) = 20, what is x?",
    "options": [
      "5",
      "7",
      "6",
      "8"
    ],
    "answer": 1,
    "hint": "Divide both sides before isolating x.",
    "explanation": "x − 3 = 4; adding 3 gives 7."
  },
  {
    "id": "expanded-51",
    "domain": "algebra",
    "skill": "Systems of equations",
    "difficulty": "medium",
    "prompt": "If x + y = 17 and x − y = -3, what is x?",
    "options": [
      "5",
      "6",
      "7",
      "8"
    ],
    "answer": 2,
    "hint": "Add the two equations.",
    "explanation": "Adding eliminates y: 2x = 14, so x = 7."
  },
  {
    "id": "expanded-52",
    "domain": "algebra",
    "skill": "Slope",
    "difficulty": "medium",
    "prompt": "A line passes through (1, 15) and (4, 30). What is its slope?",
    "options": [
      "3",
      "4",
      "6",
      "5"
    ],
    "answer": 3,
    "hint": "Divide the change in y by the change in x.",
    "explanation": "Slope = (30 − 15)/(4 − 1) = 15/3 = 5."
  },
  {
    "id": "expanded-53",
    "domain": "algebra",
    "skill": "Intercepts",
    "difficulty": "medium",
    "prompt": "The line y = 5x + b passes through (2, 20). What is b?",
    "options": [
      "10",
      "8",
      "9",
      "11"
    ],
    "answer": 0,
    "hint": "Substitute the point into the equation.",
    "explanation": "20 = 10 + b, giving b = 10."
  },
  {
    "id": "expanded-54",
    "domain": "algebra",
    "skill": "Budget inequalities",
    "difficulty": "medium",
    "prompt": "A club has $45 for supplies. After a $10 delivery charge, each kit costs $5. What is the greatest number of kits it can buy?",
    "options": [
      "5",
      "7",
      "6",
      "8"
    ],
    "answer": 1,
    "hint": "Subtract the fixed charge first.",
    "explanation": "The kit budget is $35; 35/5 = 7 kits."
  },
  {
    "id": "expanded-55",
    "domain": "algebra",
    "skill": "Parallel lines",
    "difficulty": "medium",
    "prompt": "A line parallel to y = 5x + 10 passes through (0, 2). What is its slope?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 2,
    "hint": "Parallel nonvertical lines share a slope.",
    "explanation": "The coefficient of x in the given line is 5, which is also the parallel line's slope."
  },
  {
    "id": "expanded-56",
    "domain": "algebra",
    "skill": "Linear function values",
    "difficulty": "medium",
    "prompt": "If f(t) = 5t − 10, what is f(7)?",
    "options": [
      "23",
      "24",
      "26",
      "25"
    ],
    "answer": 3,
    "hint": "Substitute for t, then multiply and subtract.",
    "explanation": "f(7) = 5(7) − 10 = 25."
  },
  {
    "id": "expanded-57",
    "domain": "advanced",
    "skill": "Quadratic roots",
    "difficulty": "medium",
    "prompt": "What is the larger solution of (x − 3)(x − 7) = 0?",
    "options": [
      "7",
      "5",
      "6",
      "8"
    ],
    "answer": 0,
    "hint": "Set each factor equal to zero.",
    "explanation": "The solutions are 3 and 7. The larger is 7."
  },
  {
    "id": "expanded-58",
    "domain": "advanced",
    "skill": "Vertex form",
    "difficulty": "medium",
    "prompt": "For f(x) = (x − 5)² + 10, at what x-value does f reach its minimum?",
    "options": [
      "3",
      "5",
      "4",
      "6"
    ],
    "answer": 1,
    "hint": "A square is smallest when its value is zero.",
    "explanation": "The square is zero at x = 5, so that is the minimizing x-value."
  },
  {
    "id": "expanded-59",
    "domain": "advanced",
    "skill": "Quadratic maximum",
    "difficulty": "medium",
    "prompt": "What is the maximum value of g(x) = −5(x − 2)² + 10?",
    "options": [
      "8",
      "9",
      "10",
      "11"
    ],
    "answer": 2,
    "hint": "The squared term cannot be negative.",
    "explanation": "The term −5(x − 2)² is at most zero. At x = 2, g(x) = 10, the maximum."
  },
  {
    "id": "expanded-60",
    "domain": "advanced",
    "skill": "Difference of squares",
    "difficulty": "medium",
    "prompt": "For x ≠ 5, (x² − 25)/(x − 5) = x + k. What is k?",
    "options": [
      "3",
      "4",
      "6",
      "5"
    ],
    "answer": 3,
    "hint": "Factor the numerator.",
    "explanation": "The numerator is (x − 5)(x + 5); canceling leaves x + 5, so k = 5."
  },
  {
    "id": "expanded-61",
    "domain": "advanced",
    "skill": "Exponential growth",
    "difficulty": "medium",
    "prompt": "A culture begins with 50 cells and doubles every hour. How many cells are present after 3 hours?",
    "options": [
      "400",
      "398",
      "399",
      "401"
    ],
    "answer": 0,
    "hint": "Three doubling periods give a factor of 2³.",
    "explanation": "50 × 2³ = 50 × 8 = 400."
  },
  {
    "id": "expanded-62",
    "domain": "advanced",
    "skill": "Radical equations",
    "difficulty": "medium",
    "prompt": "If √(x + 10) = 8, what is x?",
    "options": [
      "52",
      "54",
      "53",
      "55"
    ],
    "answer": 1,
    "hint": "Square both sides and then subtract.",
    "explanation": "x + 10 = 64, so x = 54. This gives a nonnegative radicand and satisfies the original equation."
  },
  {
    "id": "expanded-63",
    "domain": "advanced",
    "skill": "Quadratic coefficients",
    "difficulty": "medium",
    "prompt": "The expression (x + 5)(x + 10) equals x² + kx + 50. What is k?",
    "options": [
      "13",
      "14",
      "15",
      "16"
    ],
    "answer": 2,
    "hint": "The two middle terms combine.",
    "explanation": "Expanding gives x² + 5x + 10x + 50, so k = 15."
  },
  {
    "id": "expanded-64",
    "domain": "advanced",
    "skill": "Exponent rules",
    "difficulty": "medium",
    "prompt": "For z > 0, z^9/z^5 = z^k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Subtract exponents when dividing powers with the same base.",
    "explanation": "k = 9 − 5 = 4."
  },
  {
    "id": "expanded-65",
    "domain": "geometry",
    "skill": "Triangle area",
    "difficulty": "medium",
    "prompt": "A triangle has base 10 cm and perpendicular height 10 cm. What is its area in square centimeters?",
    "options": [
      "50",
      "48",
      "49",
      "51"
    ],
    "answer": 0,
    "hint": "Use half the base times the height.",
    "explanation": "Area = ½ × 10 × 10 = 50."
  },
  {
    "id": "expanded-66",
    "domain": "geometry",
    "skill": "Pythagorean theorem",
    "difficulty": "medium",
    "prompt": "A right triangle has legs 9 and 12. What is the hypotenuse?",
    "options": [
      "13",
      "15",
      "14",
      "16"
    ],
    "answer": 1,
    "hint": "Use the Pythagorean theorem.",
    "explanation": "c² = 81 + 144 = 225; c = 15."
  },
  {
    "id": "expanded-67",
    "domain": "geometry",
    "skill": "Circle area",
    "difficulty": "medium",
    "prompt": "A circle has radius 5. Its area is kπ. What is k?",
    "options": [
      "23",
      "24",
      "25",
      "26"
    ],
    "answer": 2,
    "hint": "Use A = πr².",
    "explanation": "A = π × 5² = 25π, so k = 25."
  },
  {
    "id": "expanded-68",
    "domain": "geometry",
    "skill": "Cylinder volume",
    "difficulty": "medium",
    "prompt": "A cylinder has radius 5 and height 10. Its volume is kπ. What is k?",
    "options": [
      "248",
      "249",
      "251",
      "250"
    ],
    "answer": 3,
    "hint": "Use V = πr²h.",
    "explanation": "V = π × 5² × 10 = 250π."
  },
  {
    "id": "expanded-69",
    "domain": "geometry",
    "skill": "Sine",
    "difficulty": "medium",
    "prompt": "In a right triangle, sin θ = 3/5. The hypotenuse is 25. What is the side opposite θ?",
    "options": [
      "15",
      "13",
      "14",
      "16"
    ],
    "answer": 0,
    "hint": "Sine is opposite divided by hypotenuse.",
    "explanation": "Opposite = (3/5) × 25 = 15."
  },
  {
    "id": "expanded-70",
    "domain": "geometry",
    "skill": "Cosine",
    "difficulty": "medium",
    "prompt": "In a right triangle, cos θ = 4/5. The hypotenuse is 50. What is the side adjacent to θ?",
    "options": [
      "38",
      "40",
      "39",
      "41"
    ],
    "answer": 1,
    "hint": "Cosine is adjacent divided by hypotenuse.",
    "explanation": "Adjacent = (4/5) × 50 = 40."
  },
  {
    "id": "expanded-71",
    "domain": "geometry",
    "skill": "Tangent",
    "difficulty": "medium",
    "prompt": "In a right triangle, tan θ = 3/4. The side adjacent to θ is 20. What is the opposite side?",
    "options": [
      "13",
      "14",
      "15",
      "16"
    ],
    "answer": 2,
    "hint": "Tangent is opposite divided by adjacent.",
    "explanation": "Opposite = (3/4) × 20 = 15."
  },
  {
    "id": "expanded-72",
    "domain": "geometry",
    "skill": "Similar triangles",
    "difficulty": "medium",
    "prompt": "Two similar triangles have corresponding sides 5 and 15. A second side in the smaller triangle is 10. What is the corresponding side in the larger triangle?",
    "options": [
      "28",
      "29",
      "31",
      "30"
    ],
    "answer": 3,
    "hint": "Find the ratio of corresponding sides.",
    "explanation": "The scale factor is 15/5 = 3. The requested side is 3 × 10 = 30."
  },
  {
    "id": "expanded-73",
    "domain": "algebra",
    "skill": "Linear equations",
    "difficulty": "advanced",
    "prompt": "Solve 6x + 11 = 59. What is x?",
    "options": [
      "8",
      "6",
      "7",
      "9"
    ],
    "answer": 0,
    "hint": "Undo addition before multiplication.",
    "explanation": "Subtract 11: 6x = 48. Divide by 6: x = 8."
  },
  {
    "id": "expanded-74",
    "domain": "algebra",
    "skill": "Distributive property",
    "difficulty": "advanced",
    "prompt": "If 6(x − 4) = 24, what is x?",
    "options": [
      "6",
      "8",
      "7",
      "9"
    ],
    "answer": 1,
    "hint": "Divide both sides before isolating x.",
    "explanation": "x − 4 = 4; adding 4 gives 8."
  },
  {
    "id": "expanded-75",
    "domain": "algebra",
    "skill": "Systems of equations",
    "difficulty": "advanced",
    "prompt": "If x + y = 19 and x − y = -3, what is x?",
    "options": [
      "6",
      "7",
      "8",
      "9"
    ],
    "answer": 2,
    "hint": "Add the two equations.",
    "explanation": "Adding eliminates y: 2x = 16, so x = 8."
  },
  {
    "id": "expanded-76",
    "domain": "algebra",
    "skill": "Slope",
    "difficulty": "advanced",
    "prompt": "A line passes through (1, 17) and (4, 35). What is its slope?",
    "options": [
      "4",
      "5",
      "7",
      "6"
    ],
    "answer": 3,
    "hint": "Divide the change in y by the change in x.",
    "explanation": "Slope = (35 − 17)/(4 − 1) = 18/3 = 6."
  },
  {
    "id": "expanded-77",
    "domain": "algebra",
    "skill": "Intercepts",
    "difficulty": "advanced",
    "prompt": "The line y = 6x + b passes through (2, 23). What is b?",
    "options": [
      "11",
      "9",
      "10",
      "12"
    ],
    "answer": 0,
    "hint": "Substitute the point into the equation.",
    "explanation": "23 = 12 + b, giving b = 11."
  },
  {
    "id": "expanded-78",
    "domain": "algebra",
    "skill": "Budget inequalities",
    "difficulty": "advanced",
    "prompt": "A club has $59 for supplies. After a $11 delivery charge, each kit costs $6. What is the greatest number of kits it can buy?",
    "options": [
      "6",
      "8",
      "7",
      "9"
    ],
    "answer": 1,
    "hint": "Subtract the fixed charge first.",
    "explanation": "The kit budget is $48; 48/6 = 8 kits."
  },
  {
    "id": "expanded-79",
    "domain": "algebra",
    "skill": "Parallel lines",
    "difficulty": "advanced",
    "prompt": "A line parallel to y = 6x + 11 passes through (0, 2). What is its slope?",
    "options": [
      "4",
      "5",
      "6",
      "7"
    ],
    "answer": 2,
    "hint": "Parallel nonvertical lines share a slope.",
    "explanation": "The coefficient of x in the given line is 6, which is also the parallel line's slope."
  },
  {
    "id": "expanded-80",
    "domain": "algebra",
    "skill": "Linear function values",
    "difficulty": "advanced",
    "prompt": "If f(t) = 6t − 11, what is f(8)?",
    "options": [
      "35",
      "36",
      "38",
      "37"
    ],
    "answer": 3,
    "hint": "Substitute for t, then multiply and subtract.",
    "explanation": "f(8) = 6(8) − 11 = 37."
  },
  {
    "id": "expanded-81",
    "domain": "advanced",
    "skill": "Quadratic roots",
    "difficulty": "advanced",
    "prompt": "What is the larger solution of (x − 4)(x − 8) = 0?",
    "options": [
      "8",
      "6",
      "7",
      "9"
    ],
    "answer": 0,
    "hint": "Set each factor equal to zero.",
    "explanation": "The solutions are 4 and 8. The larger is 8."
  },
  {
    "id": "expanded-82",
    "domain": "advanced",
    "skill": "Vertex form",
    "difficulty": "advanced",
    "prompt": "For f(x) = (x − 6)² + 11, at what x-value does f reach its minimum?",
    "options": [
      "4",
      "6",
      "5",
      "7"
    ],
    "answer": 1,
    "hint": "A square is smallest when its value is zero.",
    "explanation": "The square is zero at x = 6, so that is the minimizing x-value."
  },
  {
    "id": "expanded-83",
    "domain": "advanced",
    "skill": "Quadratic maximum",
    "difficulty": "advanced",
    "prompt": "What is the maximum value of g(x) = −6(x − 2)² + 11?",
    "options": [
      "9",
      "10",
      "11",
      "12"
    ],
    "answer": 2,
    "hint": "The squared term cannot be negative.",
    "explanation": "The term −6(x − 2)² is at most zero. At x = 2, g(x) = 11, the maximum."
  },
  {
    "id": "expanded-84",
    "domain": "advanced",
    "skill": "Difference of squares",
    "difficulty": "advanced",
    "prompt": "For x ≠ 6, (x² − 36)/(x − 6) = x + k. What is k?",
    "options": [
      "4",
      "5",
      "7",
      "6"
    ],
    "answer": 3,
    "hint": "Factor the numerator.",
    "explanation": "The numerator is (x − 6)(x + 6); canceling leaves x + 6, so k = 6."
  },
  {
    "id": "expanded-85",
    "domain": "advanced",
    "skill": "Exponential growth",
    "difficulty": "advanced",
    "prompt": "A culture begins with 60 cells and doubles every hour. How many cells are present after 3 hours?",
    "options": [
      "480",
      "478",
      "479",
      "481"
    ],
    "answer": 0,
    "hint": "Three doubling periods give a factor of 2³.",
    "explanation": "60 × 2³ = 60 × 8 = 480."
  },
  {
    "id": "expanded-86",
    "domain": "advanced",
    "skill": "Radical equations",
    "difficulty": "advanced",
    "prompt": "If √(x + 11) = 9, what is x?",
    "options": [
      "68",
      "70",
      "69",
      "71"
    ],
    "answer": 1,
    "hint": "Square both sides and then subtract.",
    "explanation": "x + 11 = 81, so x = 70. This gives a nonnegative radicand and satisfies the original equation."
  },
  {
    "id": "expanded-87",
    "domain": "advanced",
    "skill": "Quadratic coefficients",
    "difficulty": "advanced",
    "prompt": "The expression (x + 6)(x + 11) equals x² + kx + 66. What is k?",
    "options": [
      "15",
      "16",
      "17",
      "18"
    ],
    "answer": 2,
    "hint": "The two middle terms combine.",
    "explanation": "Expanding gives x² + 6x + 11x + 66, so k = 17."
  },
  {
    "id": "expanded-88",
    "domain": "advanced",
    "skill": "Exponent rules",
    "difficulty": "advanced",
    "prompt": "For z > 0, z^10/z^6 = z^k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Subtract exponents when dividing powers with the same base.",
    "explanation": "k = 10 − 6 = 4."
  },
  {
    "id": "expanded-89",
    "domain": "geometry",
    "skill": "Triangle area",
    "difficulty": "advanced",
    "prompt": "A triangle has base 12 cm and perpendicular height 11 cm. What is its area in square centimeters?",
    "options": [
      "66",
      "64",
      "65",
      "67"
    ],
    "answer": 0,
    "hint": "Use half the base times the height.",
    "explanation": "Area = ½ × 12 × 11 = 66."
  },
  {
    "id": "expanded-90",
    "domain": "geometry",
    "skill": "Pythagorean theorem",
    "difficulty": "advanced",
    "prompt": "A right triangle has legs 12 and 16. What is the hypotenuse?",
    "options": [
      "18",
      "20",
      "19",
      "21"
    ],
    "answer": 1,
    "hint": "Use the Pythagorean theorem.",
    "explanation": "c² = 144 + 256 = 400; c = 20."
  },
  {
    "id": "expanded-91",
    "domain": "geometry",
    "skill": "Circle area",
    "difficulty": "advanced",
    "prompt": "A circle has radius 6. Its area is kπ. What is k?",
    "options": [
      "34",
      "35",
      "36",
      "37"
    ],
    "answer": 2,
    "hint": "Use A = πr².",
    "explanation": "A = π × 6² = 36π, so k = 36."
  },
  {
    "id": "expanded-92",
    "domain": "geometry",
    "skill": "Cylinder volume",
    "difficulty": "advanced",
    "prompt": "A cylinder has radius 6 and height 11. Its volume is kπ. What is k?",
    "options": [
      "394",
      "395",
      "397",
      "396"
    ],
    "answer": 3,
    "hint": "Use V = πr²h.",
    "explanation": "V = π × 6² × 11 = 396π."
  },
  {
    "id": "expanded-93",
    "domain": "geometry",
    "skill": "Sine",
    "difficulty": "advanced",
    "prompt": "In a right triangle, sin θ = 3/5. The hypotenuse is 30. What is the side opposite θ?",
    "options": [
      "18",
      "16",
      "17",
      "19"
    ],
    "answer": 0,
    "hint": "Sine is opposite divided by hypotenuse.",
    "explanation": "Opposite = (3/5) × 30 = 18."
  },
  {
    "id": "expanded-94",
    "domain": "geometry",
    "skill": "Cosine",
    "difficulty": "advanced",
    "prompt": "In a right triangle, cos θ = 4/5. The hypotenuse is 55. What is the side adjacent to θ?",
    "options": [
      "42",
      "44",
      "43",
      "45"
    ],
    "answer": 1,
    "hint": "Cosine is adjacent divided by hypotenuse.",
    "explanation": "Adjacent = (4/5) × 55 = 44."
  },
  {
    "id": "expanded-95",
    "domain": "geometry",
    "skill": "Tangent",
    "difficulty": "advanced",
    "prompt": "In a right triangle, tan θ = 3/4. The side adjacent to θ is 24. What is the opposite side?",
    "options": [
      "16",
      "17",
      "18",
      "19"
    ],
    "answer": 2,
    "hint": "Tangent is opposite divided by adjacent.",
    "explanation": "Opposite = (3/4) × 24 = 18."
  },
  {
    "id": "expanded-96",
    "domain": "geometry",
    "skill": "Similar triangles",
    "difficulty": "advanced",
    "prompt": "Two similar triangles have corresponding sides 6 and 18. A second side in the smaller triangle is 11. What is the corresponding side in the larger triangle?",
    "options": [
      "31",
      "32",
      "34",
      "33"
    ],
    "answer": 3,
    "hint": "Find the ratio of corresponding sides.",
    "explanation": "The scale factor is 18/6 = 3. The requested side is 3 × 11 = 33."
  },
  {
    "id": "expanded-97",
    "domain": "algebra",
    "skill": "Linear equations",
    "difficulty": "advanced",
    "prompt": "Solve 7x + 12 = 75. What is x?",
    "options": [
      "9",
      "7",
      "8",
      "10"
    ],
    "answer": 0,
    "hint": "Undo addition before multiplication.",
    "explanation": "Subtract 12: 7x = 63. Divide by 7: x = 9."
  },
  {
    "id": "expanded-98",
    "domain": "algebra",
    "skill": "Distributive property",
    "difficulty": "advanced",
    "prompt": "If 7(x − 5) = 28, what is x?",
    "options": [
      "7",
      "9",
      "8",
      "10"
    ],
    "answer": 1,
    "hint": "Divide both sides before isolating x.",
    "explanation": "x − 5 = 4; adding 5 gives 9."
  },
  {
    "id": "expanded-99",
    "domain": "algebra",
    "skill": "Systems of equations",
    "difficulty": "advanced",
    "prompt": "If x + y = 21 and x − y = -3, what is x?",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "answer": 2,
    "hint": "Add the two equations.",
    "explanation": "Adding eliminates y: 2x = 18, so x = 9."
  },
  {
    "id": "expanded-100",
    "domain": "algebra",
    "skill": "Slope",
    "difficulty": "advanced",
    "prompt": "A line passes through (1, 19) and (4, 40). What is its slope?",
    "options": [
      "5",
      "6",
      "8",
      "7"
    ],
    "answer": 3,
    "hint": "Divide the change in y by the change in x.",
    "explanation": "Slope = (40 − 19)/(4 − 1) = 21/3 = 7."
  },
  {
    "id": "expanded-101",
    "domain": "algebra",
    "skill": "Intercepts",
    "difficulty": "advanced",
    "prompt": "The line y = 7x + b passes through (2, 26). What is b?",
    "options": [
      "12",
      "10",
      "11",
      "13"
    ],
    "answer": 0,
    "hint": "Substitute the point into the equation.",
    "explanation": "26 = 14 + b, giving b = 12."
  },
  {
    "id": "expanded-102",
    "domain": "algebra",
    "skill": "Budget inequalities",
    "difficulty": "advanced",
    "prompt": "A club has $75 for supplies. After a $12 delivery charge, each kit costs $7. What is the greatest number of kits it can buy?",
    "options": [
      "7",
      "9",
      "8",
      "10"
    ],
    "answer": 1,
    "hint": "Subtract the fixed charge first.",
    "explanation": "The kit budget is $63; 63/7 = 9 kits."
  },
  {
    "id": "expanded-103",
    "domain": "algebra",
    "skill": "Parallel lines",
    "difficulty": "advanced",
    "prompt": "A line parallel to y = 7x + 12 passes through (0, 2). What is its slope?",
    "options": [
      "5",
      "6",
      "7",
      "8"
    ],
    "answer": 2,
    "hint": "Parallel nonvertical lines share a slope.",
    "explanation": "The coefficient of x in the given line is 7, which is also the parallel line's slope."
  },
  {
    "id": "expanded-104",
    "domain": "algebra",
    "skill": "Linear function values",
    "difficulty": "advanced",
    "prompt": "If f(t) = 7t − 12, what is f(9)?",
    "options": [
      "49",
      "50",
      "52",
      "51"
    ],
    "answer": 3,
    "hint": "Substitute for t, then multiply and subtract.",
    "explanation": "f(9) = 7(9) − 12 = 51."
  },
  {
    "id": "expanded-105",
    "domain": "advanced",
    "skill": "Quadratic roots",
    "difficulty": "advanced",
    "prompt": "What is the larger solution of (x − 5)(x − 9) = 0?",
    "options": [
      "9",
      "7",
      "8",
      "10"
    ],
    "answer": 0,
    "hint": "Set each factor equal to zero.",
    "explanation": "The solutions are 5 and 9. The larger is 9."
  },
  {
    "id": "expanded-106",
    "domain": "advanced",
    "skill": "Vertex form",
    "difficulty": "advanced",
    "prompt": "For f(x) = (x − 7)² + 12, at what x-value does f reach its minimum?",
    "options": [
      "5",
      "7",
      "6",
      "8"
    ],
    "answer": 1,
    "hint": "A square is smallest when its value is zero.",
    "explanation": "The square is zero at x = 7, so that is the minimizing x-value."
  },
  {
    "id": "expanded-107",
    "domain": "advanced",
    "skill": "Quadratic maximum",
    "difficulty": "advanced",
    "prompt": "What is the maximum value of g(x) = −7(x − 2)² + 12?",
    "options": [
      "10",
      "11",
      "12",
      "13"
    ],
    "answer": 2,
    "hint": "The squared term cannot be negative.",
    "explanation": "The term −7(x − 2)² is at most zero. At x = 2, g(x) = 12, the maximum."
  },
  {
    "id": "expanded-108",
    "domain": "advanced",
    "skill": "Difference of squares",
    "difficulty": "advanced",
    "prompt": "For x ≠ 7, (x² − 49)/(x − 7) = x + k. What is k?",
    "options": [
      "5",
      "6",
      "8",
      "7"
    ],
    "answer": 3,
    "hint": "Factor the numerator.",
    "explanation": "The numerator is (x − 7)(x + 7); canceling leaves x + 7, so k = 7."
  },
  {
    "id": "expanded-109",
    "domain": "advanced",
    "skill": "Exponential growth",
    "difficulty": "advanced",
    "prompt": "A culture begins with 70 cells and doubles every hour. How many cells are present after 3 hours?",
    "options": [
      "560",
      "558",
      "559",
      "561"
    ],
    "answer": 0,
    "hint": "Three doubling periods give a factor of 2³.",
    "explanation": "70 × 2³ = 70 × 8 = 560."
  },
  {
    "id": "expanded-110",
    "domain": "advanced",
    "skill": "Radical equations",
    "difficulty": "advanced",
    "prompt": "If √(x + 12) = 10, what is x?",
    "options": [
      "86",
      "88",
      "87",
      "89"
    ],
    "answer": 1,
    "hint": "Square both sides and then subtract.",
    "explanation": "x + 12 = 100, so x = 88. This gives a nonnegative radicand and satisfies the original equation."
  },
  {
    "id": "expanded-111",
    "domain": "advanced",
    "skill": "Quadratic coefficients",
    "difficulty": "advanced",
    "prompt": "The expression (x + 7)(x + 12) equals x² + kx + 84. What is k?",
    "options": [
      "17",
      "18",
      "19",
      "20"
    ],
    "answer": 2,
    "hint": "The two middle terms combine.",
    "explanation": "Expanding gives x² + 7x + 12x + 84, so k = 19."
  },
  {
    "id": "expanded-112",
    "domain": "advanced",
    "skill": "Exponent rules",
    "difficulty": "advanced",
    "prompt": "For z > 0, z^11/z^7 = z^k. What is k?",
    "options": [
      "2",
      "3",
      "5",
      "4"
    ],
    "answer": 3,
    "hint": "Subtract exponents when dividing powers with the same base.",
    "explanation": "k = 11 − 7 = 4."
  },
  {
    "id": "expanded-113",
    "domain": "geometry",
    "skill": "Triangle area",
    "difficulty": "advanced",
    "prompt": "A triangle has base 14 cm and perpendicular height 12 cm. What is its area in square centimeters?",
    "options": [
      "84",
      "82",
      "83",
      "85"
    ],
    "answer": 0,
    "hint": "Use half the base times the height.",
    "explanation": "Area = ½ × 14 × 12 = 84."
  },
  {
    "id": "expanded-114",
    "domain": "geometry",
    "skill": "Pythagorean theorem",
    "difficulty": "advanced",
    "prompt": "A right triangle has legs 15 and 20. What is the hypotenuse?",
    "options": [
      "23",
      "25",
      "24",
      "26"
    ],
    "answer": 1,
    "hint": "Use the Pythagorean theorem.",
    "explanation": "c² = 225 + 400 = 625; c = 25."
  },
  {
    "id": "expanded-115",
    "domain": "geometry",
    "skill": "Circle area",
    "difficulty": "advanced",
    "prompt": "A circle has radius 7. Its area is kπ. What is k?",
    "options": [
      "47",
      "48",
      "49",
      "50"
    ],
    "answer": 2,
    "hint": "Use A = πr².",
    "explanation": "A = π × 7² = 49π, so k = 49."
  },
  {
    "id": "expanded-116",
    "domain": "geometry",
    "skill": "Cylinder volume",
    "difficulty": "advanced",
    "prompt": "A cylinder has radius 7 and height 12. Its volume is kπ. What is k?",
    "options": [
      "586",
      "587",
      "589",
      "588"
    ],
    "answer": 3,
    "hint": "Use V = πr²h.",
    "explanation": "V = π × 7² × 12 = 588π."
  },
  {
    "id": "expanded-117",
    "domain": "geometry",
    "skill": "Sine",
    "difficulty": "advanced",
    "prompt": "In a right triangle, sin θ = 3/5. The hypotenuse is 35. What is the side opposite θ?",
    "options": [
      "21",
      "19",
      "20",
      "22"
    ],
    "answer": 0,
    "hint": "Sine is opposite divided by hypotenuse.",
    "explanation": "Opposite = (3/5) × 35 = 21."
  },
  {
    "id": "expanded-118",
    "domain": "geometry",
    "skill": "Cosine",
    "difficulty": "advanced",
    "prompt": "In a right triangle, cos θ = 4/5. The hypotenuse is 60. What is the side adjacent to θ?",
    "options": [
      "46",
      "48",
      "47",
      "49"
    ],
    "answer": 1,
    "hint": "Cosine is adjacent divided by hypotenuse.",
    "explanation": "Adjacent = (4/5) × 60 = 48."
  },
  {
    "id": "expanded-119",
    "domain": "geometry",
    "skill": "Tangent",
    "difficulty": "advanced",
    "prompt": "In a right triangle, tan θ = 3/4. The side adjacent to θ is 28. What is the opposite side?",
    "options": [
      "19",
      "20",
      "21",
      "22"
    ],
    "answer": 2,
    "hint": "Tangent is opposite divided by adjacent.",
    "explanation": "Opposite = (3/4) × 28 = 21."
  },
  {
    "id": "expanded-120",
    "domain": "geometry",
    "skill": "Similar triangles",
    "difficulty": "advanced",
    "prompt": "Two similar triangles have corresponding sides 7 and 21. A second side in the smaller triangle is 12. What is the corresponding side in the larger triangle?",
    "options": [
      "34",
      "35",
      "37",
      "36"
    ],
    "answer": 3,
    "hint": "Find the ratio of corresponding sides.",
    "explanation": "The scale factor is 21/7 = 3. The requested side is 3 × 12 = 36."
  }
]);

QUESTION_BANK.push(...(window.ORBIT_EXTRA_QUESTIONS || []));

const DIAGNOSTIC_IDS = QUESTION_BANK.filter(question => question.diagnostic).map(question => question.id);
const questionById = id => QUESTION_BANK.find(question => question.id === id);

function createDefaultState() {
  return {
    profile: null,
    diagnostic: { completed: false, answers: [], completedAt: null },
    attempts: [],
    studyDays: {},
    sessionMinutes: 0,
    lastQuestionId: null,
    tests: [],
    activeTest: null
  };
}

function loadUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Orbit recovered from an invalid learner list.', error);
  }
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return [];
  let name = 'Student';
  try { name = JSON.parse(legacy)?.profile?.name || name; } catch {}
  const migrated = [{ id: crypto.randomUUID(), name, pinHash: null }];
  localStorage.setItem(stateKey(migrated[0].id), legacy);
  localStorage.setItem(USERS_KEY, JSON.stringify(migrated));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  return migrated;
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function initialUserId() {
  const remembered = sessionStorage.getItem(SESSION_KEY);
  if (users.some(user => user.id === remembered)) return remembered;
  return remembered === null && users.length === 1 && !users[0].pinHash ? users[0].id : null;
}

// ponytail: PIN is a per-device lock between learners, not account security; real accounts need a backend.
async function hashPin(id, pin) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${id}:${pin}`));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

function loadState() {
  if (!currentUserId) return createDefaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(stateKey(currentUserId)));
    if (!saved || typeof saved !== 'object') return createDefaultState();
    return {
      ...createDefaultState(),
      ...saved,
      diagnostic: { ...createDefaultState().diagnostic, ...(saved.diagnostic || {}) },
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      studyDays: saved.studyDays && typeof saved.studyDays === 'object' ? saved.studyDays : {},
      tests: Array.isArray(saved.tests) ? saved.tests : []
    };
  } catch (error) {
    console.warn('Orbit recovered from invalid saved progress.', error);
    return createDefaultState();
  }
}

let users = loadUsers();
let currentUserId = initialUserId();
let state = loadState();
let currentQuestion = null;
let selectedAnswer = null;
let questionAnswered = false;
let questionStartedAt = 0;
let timerInterval = null;
let diagnosticIndex = -1;
let diagnosticAnswers = [];
let toastTimeout = null;

function saveState() {
  if (!currentUserId) return;
  localStorage.setItem(stateKey(currentUserId), JSON.stringify(state));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function recordStudy(minutes = 2) {
  const key = todayKey();
  state.studyDays[key] = (state.studyDays[key] || 0) + minutes;
  state.sessionMinutes += minutes;
}

function domainStats(domain) {
  const attempts = state.attempts.filter(attempt => attempt.domain === domain);
  const correct = attempts.filter(attempt => attempt.correct).length;
  const diagnostic = state.diagnostic.answers.filter(answer => answer.domain === domain);
  const diagnosticCorrect = diagnostic.filter(answer => answer.correct).length;
  const total = attempts.length + diagnostic.length;
  const totalCorrect = correct + diagnosticCorrect;
  return { total, correct: totalCorrect, accuracy: total ? Math.round(totalCorrect / total * 100) : 0 };
}

function overallStats() {
  const practiceCorrect = state.attempts.filter(attempt => attempt.correct).length;
  const diagnosticCorrect = state.diagnostic.answers.filter(answer => answer.correct).length;
  const total = state.attempts.length + state.diagnostic.answers.length;
  return { total, correct: practiceCorrect + diagnosticCorrect, accuracy: total ? Math.round((practiceCorrect + diagnosticCorrect) / total * 100) : 0 };
}

function estimatedScore() {
  return state.profile?.startingScore || 540;
}

function daysUntilTest() {
  if (!state.profile?.testDate) return null;
  const target = new Date(`${state.profile.testDate}T12:00:00`);
  return Math.max(0, Math.ceil((target - new Date()) / 86400000));
}

function activeStreak() {
  let streak = 0;
  const cursor = new Date();
  if (!state.studyDays[todayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (state.studyDays[todayKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2300);
}

function routeTo(route) {
  const valid = ['home', 'practice', 'review', 'progress', 'test'];
  const next = valid.includes(route) ? route : 'home';
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${next}`));
  document.querySelectorAll('[data-route]').forEach(button => {
    const active = button.dataset.route === next;
    button.classList.toggle('active', active);
    if (button.classList.contains('nav-button')) active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current');
  });
  if (location.hash !== `#${next}`) history.replaceState(null, '', `#${next}`);
  document.querySelector('#profile-panel').hidden = true;
  document.querySelector('#profile-button').setAttribute('aria-expanded', 'false');
  if (next === 'home') renderHome();
  if (next === 'review') renderReview();
  if (next === 'progress') { renderProgress(); renderResources(); }
  if (next === 'test') renderTest();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('#main-content').focus({ preventScroll: true });
}

function renderHome() {
  const profile = state.profile || { name: 'Student', startingScore: 540, targetScore: 680 };
  const estimate = estimatedScore();
  const pointsToGo = Math.max(0, profile.targetScore - estimate);
  const progress = profile.targetScore === profile.startingScore ? 100 : clamp((estimate - profile.startingScore) / (profile.targetScore - profile.startingScore) * 100, 0, 100);
  const days = daysUntilTest();
  const weakest = Object.keys(DOMAINS).sort((a, b) => domainStats(a).accuracy - domainStats(b).accuracy)[0];
  const hasData = state.diagnostic.completed || state.attempts.length;

  document.querySelector('#profile-initial').textContent = profile.name.slice(0, 1).toUpperCase();
  document.querySelector('#home-title').textContent = `Let’s build your next ${Math.max(0, profile.targetScore - profile.startingScore)} points, ${profile.name}.`;
  document.querySelector('#home-lede').textContent = days === null ? 'Short, focused practice based on what you need most.' : days === 0 ? 'Test day is here. Keep today light and trust your preparation.' : `${days} day${days === 1 ? '' : 's'} until test day. Small focused sessions add up.`;
  document.querySelector('#goal-current').textContent = profile.startingScore;
  document.querySelector('#goal-target').textContent = profile.targetScore;
  document.querySelector('#estimated-score').textContent = estimate;
  document.querySelector('#points-to-go').textContent = pointsToGo ? `${pointsToGo} points to go` : 'Goal range reached';
  document.querySelector('#score-message').textContent = 'Your reported test score. Practice accuracy is tracked separately; use Bluebook to measure score growth.';
  document.querySelector('#trend-badge').textContent = estimate > profile.startingScore ? `+${estimate - profile.startingScore} estimated` : 'Baseline';
  document.querySelector('#score-track-fill').style.width = `${progress}%`;
  document.querySelector('#score-ring').style.setProperty('--score-angle', `${Math.max(18, progress * 3.6)}deg`);
  document.querySelector('#track-start').textContent = `${profile.startingScore} start`;
  document.querySelector('#track-goal').textContent = `${profile.targetScore} goal`;

  const missionTitle = state.diagnostic.completed ? `Strengthen ${DOMAINS[weakest].name}` : 'Find your starting point';
  const missionCopy = state.diagnostic.completed ? `Your current practice shows the biggest opportunity in ${DOMAINS[weakest].short.toLowerCase()}. Orbit will start there and adjust as you improve.` : 'Take an 10-question diagnostic so Orbit can build a study path around your strengths and gaps.';
  document.querySelector('#mission-title').textContent = missionTitle;
  document.querySelector('#mission-copy').textContent = missionCopy;
  document.querySelector('#mission-button').innerHTML = state.diagnostic.completed ? 'Start focused practice <span aria-hidden="true">→</span>' : 'Start diagnostic <span aria-hidden="true">→</span>';

  document.querySelector('#focus-grid').innerHTML = Object.entries(DOMAINS).map(([id, domain]) => {
    const stats = domainStats(id);
    const description = stats.total ? `${stats.accuracy}% accuracy · ${stats.total} answered` : domain.short;
    return `<button class="focus-card ${hasData && id === weakest ? 'recommended' : ''}" type="button" data-focus-domain="${id}">
      ${hasData && id === weakest ? '<span class="recommend-label">Best next step</span>' : ''}
      <span class="domain-symbol" aria-hidden="true">${domain.symbol}</span><strong>${domain.name}</strong><small>${description}</small>
    </button>`;
  }).join('');

  renderWeek();
}

function renderWeek() {
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  let weekMinutes = 0;
  document.querySelector('#week-dots').innerHTML = labels.map((label, index) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + index);
    const minutes = state.studyDays[todayKey(day)] || 0;
    weekMinutes += minutes;
    return `<span class="day-dot ${minutes ? 'done' : ''}"><i>${minutes ? '✓' : ''}</i>${label}</span>`;
  }).join('');
  const streak = activeStreak();
  document.querySelector('#streak-count').textContent = streak ? `${streak}-day study streak` : 'Start your streak';
  document.querySelector('#weekly-minutes').textContent = weekMinutes;
}

function practicePool() {
  const mode = document.querySelector('input[name="practice-mode"]:checked')?.value || 'adaptive';
  const domain = document.querySelector('#domain-select').value;
  let pool = QUESTION_BANK.filter(question => domain === 'all' || question.domain === domain);
  if (mode === 'mistakes') {
    const missedIds = new Set(outstandingMistakes().map(attempt => attempt.questionId));
    pool = pool.filter(question => missedIds.has(question.id));
    if (!pool.length) {
      showToast('No missed questions in that selection yet. Starting a smart mix instead.');
      pool = QUESTION_BANK.filter(question => domain === 'all' || question.domain === domain);
    }
  }
  if (mode === 'adaptive' && domain === 'all') {
    const domains = Object.keys(DOMAINS).sort((a, b) => {
      const aStats = domainStats(a);
      const bStats = domainStats(b);
      const aScore = aStats.total ? aStats.accuracy : 45;
      const bScore = bStats.total ? bStats.accuracy : 45;
      return aScore - bScore;
    });
    const priority = domains.slice(0, 2);
    pool = pool.filter(question => priority.includes(question.domain));
  }
  return pool;
}

function chooseQuestion(preferredId = null) {
  clearInterval(timerInterval);
  let pool = practicePool();
  const level = document.querySelector('#difficulty-select')?.value || 'all';
  if (level !== 'all') {
    const filtered = pool.filter(q => q.difficulty === level);
    if (filtered.length) pool = filtered;
  }
  if (!pool.length) return;
  const recentIds = new Set(state.attempts.slice(-5).map(attempt => attempt.questionId));
  const seen = new Set(state.attempts.map(a => a.questionId));
  const unseen = pool.filter(q => !seen.has(q.id) && q.id !== state.lastQuestionId);
  const fresh = unseen.length ? unseen : pool.filter(question => !recentIds.has(question.id) && question.id !== state.lastQuestionId);
  const candidates = fresh.length ? fresh : pool.filter(question => question.id !== state.lastQuestionId);
  currentQuestion = preferredId ? questionById(preferredId) : (candidates.length ? candidates : pool)[Math.floor(Math.random() * (candidates.length || pool.length))];
  selectedAnswer = null;
  questionAnswered = false;
  questionStartedAt = Date.now();
  state.lastQuestionId = currentQuestion.id;
  saveState();
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  if (!currentQuestion) return;
  const domain = DOMAINS[currentQuestion.domain];
  const letters = ['A', 'B', 'C', 'D'];
  document.querySelector('#question-card').innerHTML = `
    <div class="question-meta"><span>${domain.name} · ${escapeHtml(currentQuestion.skill)}</span><span class="difficulty">${currentQuestion.difficulty}</span><span class="question-timer" id="question-timer">0:00</span></div>
    <h2 class="question-prompt">${escapeHtml(currentQuestion.prompt)}</h2>
    ${currentQuestion.figure ? figureSvg(currentQuestion.figure) : ''}
    <div class="options" role="radiogroup" aria-label="Answer choices">
      ${currentQuestion.options.map((option, index) => `<button class="option" type="button" role="radio" aria-checked="false" data-answer="${index}"><span class="option-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></button>`).join('')}
    </div>
    <div id="question-support" aria-live="polite"></div>
    <details class="hint-box"><summary>Formula guide & study tips</summary><p>${studyGuide(currentQuestion.domain)}</p><p>Write down what the question asks. Choose a method, work it out on paper, then check your answer in the original problem.</p><p><b>Desmos strategy:</b> ${DESMOS_TIP}</p><p><b>Free resources for this topic</b></p><ul class="resource-links">${resourceLinks(currentQuestion.domain)}</ul></details>
    <div class="question-actions"><button class="hint-button" type="button" id="show-hint">Give me a hint</button><button class="primary-button" type="button" id="check-answer" disabled>Check answer</button></div>`;
}

function startTimer() {
  const timed = document.querySelector('#timer-toggle').checked;
  const timer = document.querySelector('#question-timer');
  if (!timer) return;
  timer.hidden = !timed;
  if (!timed) return;
  const update = () => {
    const seconds = Math.floor((Date.now() - questionStartedAt) / 1000);
    timer.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    timer.style.color = seconds > 95 ? 'var(--red)' : '';
  };
  update();
  timerInterval = setInterval(update, 1000);
}

function selectAnswer(index) {
  if (questionAnswered) return;
  selectedAnswer = index;
  document.querySelectorAll('.option').forEach((option, optionIndex) => {
    const active = optionIndex === index;
    option.classList.toggle('selected', active);
    option.setAttribute('aria-checked', String(active));
  });
  document.querySelector('#check-answer').disabled = false;
}

function showHint() {
  if (!currentQuestion || questionAnswered) return;
  document.querySelector('#question-support').innerHTML = `<div class="hint-box"><strong>Tutor hint</strong>${escapeHtml(currentQuestion.hint)}</div>`;
  document.querySelector('#show-hint').disabled = true;
}

function submitAnswer() {
  if (!currentQuestion || selectedAnswer === null || questionAnswered) return;
  clearInterval(timerInterval);
  questionAnswered = true;
  const correct = selectedAnswer === currentQuestion.answer;
  const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
  state.attempts.push({ questionId: currentQuestion.id, domain: currentQuestion.domain, skill: currentQuestion.skill, correct, selected: selectedAnswer, seconds, date: new Date().toISOString() });
  recordStudy(Math.round(Math.min(seconds, 1800) / 60 * 10) / 10);
  saveState();
  document.querySelectorAll('.option').forEach((option, index) => {
    option.disabled = true;
    if (index === currentQuestion.answer) option.classList.add('correct');
    if (index === selectedAnswer && !correct) option.classList.add('incorrect');
  });
  document.querySelector('#question-support').innerHTML = `<div class="feedback-box ${correct ? 'correct' : 'incorrect'}"><strong>${correct ? 'Correct — check your reasoning below.' : 'Let’s work through it.'}</strong><p>Answer: ${escapeHtml(currentQuestion.options[currentQuestion.answer])}</p>${!correct && currentQuestion.mistakes?.[selectedAnswer] ? `<p class="mistake-note"><b>About your answer, ${escapeHtml(currentQuestion.options[selectedAnswer])}:</b> ${escapeHtml(currentQuestion.mistakes[selectedAnswer])}</p>` : ''}<p>${escapeHtml(currentQuestion.explanation)}</p>${currentQuestion.rule ? `<p><b>Rule:</b> ${escapeHtml(currentQuestion.rule)}</p>` : ''}<p><b>Remember:</b> ${escapeHtml(currentQuestion.hint)}</p><label for="reflection">What will you remember next time?</label><textarea id="reflection" rows="2" maxlength="300" placeholder="Example: subtract the fixed fee before dividing."></textarea><button class="secondary-button" type="button" id="save-reflection">Save my note</button></div>`;
  const actions = document.querySelector('.question-actions');
  actions.innerHTML = `<button class="secondary-button" type="button" id="similar-question">Try a similar question</button><button class="primary-button" type="button" id="next-question">Next question →</button>`;
  const today = state.attempts.filter(a => a.date.slice(0, 10) === todayKey()).length;
  document.querySelector('#question-support').insertAdjacentHTML('beforeend', `<p class="hint-box">${today} questions practiced today · ${today >= 10 ? 'Daily goal reached. Take a break or keep learning.' : `${10 - today} more to your daily goal of 10.`}</p>`);
}

// Free resources picked from StudentSuite/awesome-study-resources (Mathematics, Statistics, STEM tools).
const RESOURCES = {
  all: [
    { name: 'Khan Academy Official Digital SAT', url: 'https://www.khanacademy.org/digital-sat', use: 'Free official lessons and practice, made with College Board.' },
    { name: 'Desmos Graphing Calculator', url: 'https://www.desmos.com/calculator', use: 'The same calculator built into the digital SAT. Practice with it here.' }
  ],
  algebra: [
    { name: 'Paul’s Online Math Notes: Algebra', url: 'https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx', use: 'Worked examples for equations, inequalities, lines, and systems.' }
  ],
  advanced: [
    { name: 'Paul’s Online Math Notes: Algebra', url: 'https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx', use: 'Quadratics, exponents, radicals, rational equations, and functions.' }
  ],
  data: [
    { name: 'Khan Academy Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', use: 'Lessons on mean, median, spread, and probability.' },
    { name: 'Seeing Theory (Brown University)', url: 'https://seeing-theory.brown.edu/', use: 'Interactive visuals of probability and distributions.' },
    { name: 'OpenIntro Statistics', url: 'https://www.openintro.org/book/os/', use: 'Free open-source statistics textbook.' }
  ],
  geometry: [
    { name: 'GeoGebra Geometry', url: 'https://www.geogebra.org/geometry', use: 'Draw triangles, circles, and angles to see why formulas work.' },
    { name: 'Mathigon', url: 'https://mathigon.org/courses', use: 'Interactive lessons on triangles, circles, and trigonometry.' }
  ]
};

const DESMOS_TIP = 'On the digital SAT, a Desmos graphing calculator is built into every Math question. To check an equation, graph each side as its own line and read where they cross. To find a quadratic’s vertex or zeros, graph it and tap the points.';

const resourceItem = item => `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} <span aria-hidden="true">↗</span></a><small>${escapeHtml(item.use)}</small></li>`;

function resourceLinks(domain) {
  return [...RESOURCES[domain], ...RESOURCES.all].map(resourceItem).join('');
}

function renderResources() {
  const groups = [...Object.entries(DOMAINS).map(([key, domain]) => [domain.name, RESOURCES[key]]), ['Every domain', RESOURCES.all]];
  document.querySelector('#resource-list').innerHTML = groups.map(([title, items]) =>
    `<div class="resource-group"><h3>${title}</h3><ul class="resource-links">${items.map(resourceItem).join('')}</ul></div>`
  ).join('');
}

function studyGuide(domain) {
  return {
    algebra: 'Linear equations: do the same operation to both sides. Slope = change in y ÷ change in x. Line: y = mx + b. Systems: substitution or elimination. Reverse an inequality only when multiplying or dividing by a negative number.',
    advanced: 'Quadratics: set each factor equal to zero. Vertex form: a(x − h)² + k. Vertex x-coordinate: −b/(2a). Exponents: multiply same bases → add powers; divide → subtract powers. Growth model: initial amount × (1 + rate)^time. Check radical solutions in the original equation.',
    geometry: 'Triangle area = bh/2. Circle area = πr²; circumference = 2πr. Cylinder volume = πr²h. Right triangles: a² + b² = c². SOH-CAH-TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent. Similar figures: lengths scale by k, areas by k².',
    data: 'Percent change = (new − old)/old × 100%. Mean = sum/count. Probability = favorable outcomes/total outcomes. Keep units consistent. Residual = observed − predicted.'
  }[domain];
}

function similarQuestion() {
  if (!currentQuestion) return;
  const sameSkill = QUESTION_BANK.filter(q => q.id !== currentQuestion.id && q.skill === currentQuestion.skill);
  const alternatives = sameSkill.length ? sameSkill : QUESTION_BANK.filter(q => q.id !== currentQuestion.id && q.domain === currentQuestion.domain && q.difficulty === currentQuestion.difficulty);
  const unseen = alternatives.filter(q => !state.attempts.some(a => a.questionId === q.id));
  const pool = unseen.length ? unseen : alternatives;
  if (!pool.length) return chooseQuestion();
  chooseQuestion(pool[Math.floor(Math.random() * pool.length)].id);
}

function outstandingMistakes() {
  const status = new Map();
  state.attempts.forEach(attempt => status.set(attempt.questionId, attempt));
  return [...status.values()].filter(attempt => !attempt.correct).reverse();
}

function renderReview() {
  const mistakes = outstandingMistakes();
  const totalMisses = state.attempts.filter(attempt => !attempt.correct).length;
  const resolved = new Set(state.attempts.filter(attempt => attempt.correct).map(attempt => attempt.questionId));
  const fastestOpportunity = Object.keys(DOMAINS).sort((a, b) => domainStats(a).accuracy - domainStats(b).accuracy)[0];
  document.querySelector('#review-summary').innerHTML = `
    <article class="summary-card"><strong>${mistakes.length}</strong><small>Ready to retry</small></article>
    <article class="summary-card"><strong>${totalMisses}</strong><small>Total misses studied</small></article>
    <article class="summary-card"><strong>${resolved.size}</strong><small>Questions recovered</small></article>
    <article class="summary-card"><strong>${DOMAINS[fastestOpportunity].name}</strong><small>Best growth area</small></article>`;
  const container = document.querySelector('#mistake-list');
  if (!mistakes.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon" aria-hidden="true">✓</span><h2>Your review queue is clear</h2><p>Missed practice questions will appear here with the concept and explanation.</p><button class="primary-button" type="button" data-route="practice">Start practice</button></div>`;
    return;
  }
  container.innerHTML = mistakes.map(attempt => {
    const question = questionById(attempt.questionId);
    if (!question) return '';
    return `<article class="mistake-item"><div><span class="mistake-domain">${DOMAINS[question.domain].name} · ${escapeHtml(question.skill)}</span><h3>${escapeHtml(question.prompt)}</h3>${attempt.selected != null && question.mistakes?.[attempt.selected] ? `<p class="mistake-note"><b>You chose ${escapeHtml(question.options[attempt.selected])}:</b> ${escapeHtml(question.mistakes[attempt.selected])}</p>` : ''}<p>${escapeHtml(question.explanation)}</p>${question.rule ? `<p><b>Rule:</b> ${escapeHtml(question.rule)}</p>` : ''}${attempt.note ? `<p><b>My takeaway:</b> ${escapeHtml(attempt.note)}</p>` : ''} </div><button class="secondary-button" type="button" data-retry="${question.id}">Retry question</button></article>`;
  }).join('');
}

function renderProgress() {
  const stats = overallStats();
  const averageSeconds = state.attempts.length ? Math.round(state.attempts.reduce((sum, attempt) => sum + (attempt.seconds || 0), 0) / state.attempts.length) : 0;
  const totalMinutes = Object.values(state.studyDays).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
  document.querySelector('#metrics-grid').innerHTML = `
    <article class="metric-card"><strong>${estimatedScore()}</strong><small>Reported score</small></article>
    <article class="metric-card"><strong>${stats.accuracy}%</strong><small>Overall accuracy</small></article>
    <article class="metric-card"><strong>${averageSeconds || '—'}${averageSeconds ? 's' : ''}</strong><small>Average pace</small></article>
    <article class="metric-card"><strong>${totalMinutes}</strong><small>Minutes practiced</small></article>`;
  document.querySelector('#domain-progress-list').innerHTML = Object.entries(DOMAINS).map(([id, domain]) => {
    const stats = domainStats(id);
    return `<div class="domain-progress-row"><strong>${domain.name}</strong><div class="progress-bar"><i style="width:${stats.accuracy}%"></i></div><span>${stats.total ? `${stats.accuracy}%` : 'Not started'}</span></div>`;
  }).join('');
  const history = [
    ...state.diagnostic.answers.length ? [{ date: state.diagnostic.completedAt, name: 'SAT Math diagnostic', result: `${state.diagnostic.answers.filter(item => item.correct).length}/${state.diagnostic.answers.length}`, good: true }] : [],
    ...state.tests.slice(-3).reverse().map(record => { const { correct, total } = testScore(record); return { date: record.date, name: 'Timed practice module', result: `${correct}/${total}`, good: correct / total >= 0.7 }; }),
    ...state.attempts.slice(-12).reverse().map(attempt => ({ date: attempt.date, name: questionById(attempt.questionId)?.skill || 'Practice question', result: attempt.correct ? 'Correct' : 'Review', good: attempt.correct }))
  ];
  document.querySelector('#history-list').innerHTML = history.length ? history.map(item => `<div class="history-row"><time>${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time><strong>${escapeHtml(item.name)}</strong><span class="history-result ${item.good ? 'good' : ''}">${item.result}</span></div>`).join('') : '<div class="empty-state">Complete the diagnostic or a practice question to start your history.</div>';
}

function openDiagnostic() {
  diagnosticIndex = -1;
  diagnosticAnswers = [];
  renderDiagnostic();
  document.querySelector('#diagnostic-dialog').showModal();
}

function renderDiagnostic() {
  const container = document.querySelector('#diagnostic-content');
  if (diagnosticIndex === -1) {
    container.innerHTML = `<div class="diagnostic-intro"><span class="empty-icon" aria-hidden="true">${DIAGNOSTIC_IDS.length}</span><span class="eyebrow">Quick calibration</span><h1 id="diagnostic-title">Find the skills behind the score.</h1><p>Answer ${DIAGNOSTIC_IDS.length} original SAT-style questions across all four math domains. Take your best shot and use scratch paper. There is no penalty for guessing.</p><button class="primary-button" type="button" id="begin-diagnostic">Begin diagnostic</button></div>`;
    return;
  }
  if (diagnosticIndex >= DIAGNOSTIC_IDS.length) {
    finishDiagnostic();
    return;
  }
  const question = questionById(DIAGNOSTIC_IDS[diagnosticIndex]);
  container.innerHTML = `<div class="diagnostic-header"><span class="diagnostic-count">Question ${diagnosticIndex + 1} of ${DIAGNOSTIC_IDS.length}</span><div class="diagnostic-progress"><i style="width:${(diagnosticIndex / DIAGNOSTIC_IDS.length) * 100}%"></i></div><button class="close-button" type="button" id="close-diagnostic" aria-label="Close diagnostic">×</button></div>
    <span class="eyebrow">${DOMAINS[question.domain].name}</span><h2 class="question-prompt" id="diagnostic-title">${escapeHtml(question.prompt)}</h2>
    <div class="options" role="radiogroup" aria-label="Diagnostic answer choices">${question.options.map((option, index) => `<button class="option" type="button" role="radio" aria-checked="false" data-diagnostic-answer="${index}"><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>
    <div class="question-actions"><span class="question-meta">Choose your best answer</span><button class="primary-button" type="button" id="diagnostic-next" disabled>${diagnosticIndex === DIAGNOSTIC_IDS.length - 1 ? 'See my plan' : 'Next question'} →</button></div>`;
}

function selectDiagnosticAnswer(index) {
  document.querySelectorAll('[data-diagnostic-answer]').forEach((option, optionIndex) => {
    option.classList.toggle('selected', optionIndex === index);
    option.setAttribute('aria-checked', String(optionIndex === index));
  });
  document.querySelector('#diagnostic-next').disabled = false;
  document.querySelector('#diagnostic-next').dataset.answer = String(index);
}

function advanceDiagnostic() {
  const nextButton = document.querySelector('#diagnostic-next');
  if (!nextButton || nextButton.disabled || nextButton.dataset.answer === undefined) return;
  const selected = Number(nextButton.dataset.answer);
  const question = questionById(DIAGNOSTIC_IDS[diagnosticIndex]);
  diagnosticAnswers.push({ questionId: question.id, domain: question.domain, correct: selected === question.answer, selected });
  diagnosticIndex += 1;
  renderDiagnostic();
}

function finishDiagnostic() {
  state.diagnostic = { completed: true, answers: diagnosticAnswers, completedAt: new Date().toISOString() };
  recordStudy(12);
  saveState();
  const correct = diagnosticAnswers.filter(answer => answer.correct).length;
  const weakest = Object.keys(DOMAINS).sort((a, b) => {
    const rate = domain => {
      const items = diagnosticAnswers.filter(answer => answer.domain === domain);
      return items.filter(answer => answer.correct).length / items.length;
    };
    return rate(a) - rate(b);
  })[0];
  document.querySelector('#diagnostic-content').innerHTML = `<div class="diagnostic-results"><span class="eyebrow">Plan calibrated</span><h1 id="diagnostic-title">Your starting path is ready.</h1><div class="diagnostic-score"><strong>${correct}/${DIAGNOSTIC_IDS.length}</strong><small>diagnostic</small></div><p>Start with <strong>${DOMAINS[weakest].name}</strong>, then build breadth across all four domains.</p><div class="result-domains">${Object.entries(DOMAINS).map(([id, domain]) => {
    const items = diagnosticAnswers.filter(answer => answer.domain === id);
    const count = items.filter(answer => answer.correct).length;
    return `<div class="result-domain"><strong>${domain.name}</strong><small>${count} of ${items.length} correct</small></div>`;
  }).join('')}</div><button class="primary-button" type="button" id="finish-diagnostic">Start my first focused drill</button></div>`;
}

async function completeOnboarding() {
  const name = document.querySelector('#learner-name').value.trim();
  const pin = document.querySelector('#learner-pin').value;
  const startingScore = Number(document.querySelector('#starting-score').value);
  const targetScore = Number(document.querySelector('#target-score').value);
  if (!name || startingScore < 200 || startingScore > 800 || targetScore < 200 || targetScore > 800) return false;
  if (!currentUserId) {
    const id = crypto.randomUUID();
    users.push({ id, name, pinHash: pin ? await hashPin(id, pin) : null });
    saveUsers();
    signIn(id);
  }
  state.profile = { name, startingScore, targetScore, testDate: document.querySelector('#test-date').value };
  saveState();
  document.querySelector('#onboarding-dialog').close();
  populateSettings();
  renderHome();
  showToast(`Welcome to Orbit, ${name}.`);
  return true;
}

function populateSettings() {
  if (!state.profile) return;
  document.querySelector('#learner-name-setting').value = state.profile.name;
  document.querySelector('#test-date-setting').value = state.profile.testDate || '';
  document.querySelector('#start-score-setting').value = state.profile.startingScore;
  document.querySelector('#goal-score-setting').value = state.profile.targetScore;
}

async function saveSettings() {
  const name = document.querySelector('#learner-name-setting').value.trim();
  const startingScore = Number(document.querySelector('#start-score-setting').value);
  const targetScore = Number(document.querySelector('#goal-score-setting').value);
  if (!name || startingScore < 200 || startingScore > 800 || targetScore < 200 || targetScore > 800) {
    showToast('Enter a name and Math scores from 200 to 800.');
    return;
  }
  state.profile = { name, startingScore, targetScore, testDate: document.querySelector('#test-date-setting').value };
  saveState();
  const user = users.find(item => item.id === currentUserId);
  const pin = document.querySelector('#pin-setting').value;
  if (pin && !/^\d{4,8}$/.test(pin)) { showToast('PIN must be 4 to 8 digits.'); return; }
  user.name = name;
  if (pin) user.pinHash = await hashPin(user.id, pin);
  saveUsers();
  document.querySelector('#pin-setting').value = '';
  document.querySelector('#profile-panel').hidden = true;
  document.querySelector('#profile-button').setAttribute('aria-expanded', 'false');
  renderHome();
  showToast('Study plan updated.');
}

function chooseTestAnswer(index) {
  state.activeTest.answers[state.activeTest.index] = index;
  saveState();
  renderTest();
  document.querySelector(`[data-test-answer="${index}"]`)?.focus();
}

function handleClick(event) {
  if (event.target.closest('#similar-question')) return similarQuestion();
  if (event.target.closest('#save-reflection')) {
    const last = state.attempts[state.attempts.length - 1];
    if (last) { last.note = document.querySelector('#reflection').value.trim(); saveState(); showToast('Note saved in your review journal.'); }
    return;
  }
  const route = event.target.closest('[data-route]');
  if (route) return routeTo(route.dataset.route);

  if (event.target.closest('[data-next-onboarding]')) {
    const name = document.querySelector('#learner-name');
    if (!name.reportValidity() || !document.querySelector('#learner-pin').reportValidity()) return;
    document.querySelector('[data-onboarding-step="1"]').classList.remove('active');
    document.querySelector('[data-onboarding-step="2"]').classList.add('active');
    return;
  }
  if (event.target.closest('[data-prev-onboarding]')) {
    document.querySelector('[data-onboarding-step="2"]').classList.remove('active');
    document.querySelector('[data-onboarding-step="1"]').classList.add('active');
    return;
  }
  if (event.target.closest('#profile-button')) {
    const panel = document.querySelector('#profile-panel');
    panel.hidden = !panel.hidden;
    event.target.closest('#profile-button').setAttribute('aria-expanded', String(!panel.hidden));
    return;
  }
  if (event.target.closest('[data-close-profile]')) {
    document.querySelector('#profile-panel').hidden = true;
    document.querySelector('#profile-button').setAttribute('aria-expanded', 'false');
    return;
  }
  if (event.target.closest('#save-settings')) return saveSettings();
  if (event.target.closest('#reset-data')) {
    if (!confirm(`Delete ${state.profile?.name || 'this learner'} and all of their study history from this device?`)) return;
    localStorage.removeItem(stateKey(currentUserId));
    users = users.filter(user => user.id !== currentUserId);
    saveUsers();
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
    return;
  }
  if (event.target.closest('#switch-learner')) {
    sessionStorage.setItem(SESSION_KEY, '');
    location.reload();
    return;
  }
  const learner = event.target.closest('[data-learner]');
  if (learner) return chooseLearner(learner.dataset.learner);
  if (event.target.closest('#add-learner')) {
    document.querySelector('#login-dialog').close();
    document.querySelector('#onboarding-dialog').showModal();
    return;
  }
  if (event.target.closest('#pin-cancel')) return renderLogin();
  if (event.target.closest('#mission-button')) return state.diagnostic.completed ? (routeTo('practice'), chooseQuestion()) : openDiagnostic();
  if (event.target.closest('#open-diagnostic')) return openDiagnostic();
  if (event.target.closest('#begin-diagnostic')) { diagnosticIndex = 0; renderDiagnostic(); return; }
  if (event.target.closest('#close-diagnostic')) { document.querySelector('#diagnostic-dialog').close(); return; }
  const diagnosticAnswer = event.target.closest('[data-diagnostic-answer]');
  if (diagnosticAnswer) return selectDiagnosticAnswer(Number(diagnosticAnswer.dataset.diagnosticAnswer));
  if (event.target.closest('#diagnostic-next')) return advanceDiagnostic();
  if (event.target.closest('#finish-diagnostic')) {
    document.querySelector('#diagnostic-dialog').close();
    const weakest = Object.keys(DOMAINS).sort((a, b) => domainStats(a).accuracy - domainStats(b).accuracy)[0];
    document.querySelector('#domain-select').value = weakest;
    routeTo('practice');
    chooseQuestion();
    return;
  }
  const focus = event.target.closest('[data-focus-domain]');
  if (focus) {
    document.querySelector('#domain-select').value = focus.dataset.focusDomain;
    routeTo('practice');
    chooseQuestion();
    return;
  }
  if (event.target.closest('#new-question') || event.target.closest('[data-start-practice]') || event.target.closest('#next-question')) return chooseQuestion();
  const answer = event.target.closest('[data-answer]');
  if (answer) return selectAnswer(Number(answer.dataset.answer));
  if (event.target.closest('#show-hint')) return showHint();
  if (event.target.closest('#check-answer')) return submitAnswer();
  const retry = event.target.closest('[data-retry]');
  if (retry) { routeTo('practice'); chooseQuestion(retry.dataset.retry); return; }
  if (event.target.closest('#print-progress')) return window.print();
  if (event.target.closest('#start-test')) return startTest();
  if (event.target.closest('#test-intro')) return renderTestIntro();
  const pastTest = event.target.closest('[data-test-result]');
  if (pastTest) return renderTestResults(state.tests[Number(pastTest.dataset.testResult)]);
  if (!state.activeTest) return;
  const testAnswer = event.target.closest('[data-test-answer]');
  if (testAnswer) return chooseTestAnswer(Number(testAnswer.dataset.testAnswer));
  const jump = event.target.closest('[data-test-goto]');
  if (jump) { state.activeTest.index = Number(jump.dataset.testGoto); saveState(); return renderTest(); }
  if (event.target.closest('#test-prev')) { state.activeTest.index -= 1; saveState(); return renderTest(); }
  if (event.target.closest('#test-next')) { state.activeTest.index += 1; saveState(); return renderTest(); }
  if (event.target.closest('#test-flag')) { const i = state.activeTest.index; state.activeTest.flagged[i] = !state.activeTest.flagged[i]; saveState(); return renderTest(); }
  if (event.target.closest('#test-finish') || event.target.closest('#test-finish-early')) return confirmFinishTest();
}

// ---------- Geometry figures ----------

function svgLabel(x, y, text, anchor = 'middle') {
  const unknown = String(text).includes('?');
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" class="fig-text${unknown ? ' fig-unknown' : ''}">${escapeHtml(text)}</text>`;
}

// Keeps extreme shapes readable; when the drawing is squashed, say so, as the SAT does.
function fitRatio(ratio) {
  const clamped = clamp(ratio, 0.3, 1.4);
  return { ratio: clamped, scaled: Math.abs(clamped - ratio) > 1e-9 };
}

function figureSvg(fig) {
  let body = '', note = false, label = '';
  const pts = list => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  if (fig.type === 'right-triangle') {
    const s = Math.min(220 / fig.b, 140 / fig.a);
    const C = [40, 170], B = [40 + fig.b * s, 170], A = [40, 170 - fig.a * s];
    const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], len = Math.hypot(mid[0] - C[0], mid[1] - C[1]);
    body = `<polygon class="fig-shape" points="${pts([A, B, C])}"/><polyline class="fig-line" points="${pts([[C[0], C[1] - 12], [C[0] + 12, C[1] - 12], [C[0] + 12, C[1]]])}"/>`
      + svgLabel(C[0] - 8, (A[1] + C[1]) / 2, fig.aLabel, 'end') + svgLabel((C[0] + B[0]) / 2, C[1] + 16, fig.bLabel)
      + svgLabel(mid[0] + (mid[0] - C[0]) / len * 16, mid[1] + (mid[1] - C[1]) / len * 16, fig.cLabel);
    if (fig.theta) {
      const u = [(C[0] - B[0]) / Math.hypot(C[0] - B[0], C[1] - B[1]), 0], v = [(A[0] - B[0]), (A[1] - B[1])], vl = Math.hypot(...v);
      const bis = [u[0] + v[0] / vl, u[1] + v[1] / vl], bl = Math.hypot(...bis);
      body += svgLabel(B[0] + bis[0] / bl * 34, B[1] + bis[1] / bl * 34, 'θ');
    }
    label = `Right triangle. Vertical leg ${fig.aLabel}, horizontal leg ${fig.bLabel}, hypotenuse ${fig.cLabel}${fig.theta ? ', angle θ at the bottom right' : ''}.`;
  } else if (fig.type === 'triangle-height') {
    const fit = fitRatio(fig.height / fig.base); note = fit.scaled;
    const w = Math.min(220, 130 / fit.ratio), h = w * fit.ratio;
    const P = [40, 170], Q = [40 + w, 170], R = [40 + w * 0.35, 170 - h];
    body = `<polygon class="fig-shape" points="${pts([P, Q, R])}"/><line class="fig-line fig-dash" x1="${R[0]}" y1="${R[1]}" x2="${R[0]}" y2="170"/><polyline class="fig-line" points="${pts([[R[0], 160], [R[0] + 10, 160], [R[0] + 10, 170]])}"/>`
      + svgLabel((P[0] + Q[0]) / 2, 186, fig.baseLabel) + svgLabel(R[0] + 16, 170 - h / 2, fig.heightLabel, 'start');
    label = `Triangle with base ${fig.baseLabel} and height ${fig.heightLabel}.`;
  } else if (fig.type === 'rectangle') {
    const fit = fitRatio(fig.width / fig.length); note = fit.scaled;
    const w = Math.min(200, 130 / fit.ratio), h = w * fit.ratio, x = 60, y = 90 - h / 2;
    body = `<rect class="fig-shape" x="${x}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`
      + svgLabel(x - 8, y + h / 2, fig.widthLabel, 'end') + svgLabel(x + w / 2, y + h + 16, fig.lengthLabel) + svgLabel(x + w / 2, y + h / 2, fig.inside);
    label = `Rectangle with width ${fig.widthLabel}, length ${fig.lengthLabel}, ${fig.inside}.`;
  } else if (fig.type === 'circle') {
    body = `<circle class="fig-shape" cx="150" cy="95" r="70"/><circle cx="150" cy="95" r="3" class="fig-dot"/><line class="fig-line" x1="150" y1="95" x2="220" y2="95"/>`
      + svgLabel(185, 83, fig.radiusLabel) + (fig.caption ? svgLabel(150, 185, fig.caption) : '');
    label = `Circle with radius ${fig.radiusLabel}${fig.caption ? `, ${fig.caption}` : ''}.`;
  } else if (fig.type === 'sector') {
    const r = 70, cx = 150, cy = 95, t = fig.angle * Math.PI / 180, large = fig.angle > 180 ? 1 : 0;
    const end = [cx + r * Math.cos(t), cy - r * Math.sin(t)], half = [Math.cos(t / 2), -Math.sin(t / 2)];
    body = `<circle class="fig-faint" cx="${cx}" cy="${cy}" r="${r}"/><line class="fig-line" x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}"/><line class="fig-line" x1="${cx}" y1="${cy}" x2="${end[0].toFixed(1)}" y2="${end[1].toFixed(1)}"/>`
      + `<path class="fig-arc" d="M ${cx + r} ${cy} A ${r} ${r} 0 ${large} 0 ${end[0].toFixed(1)} ${end[1].toFixed(1)}"/>`
      + `<path class="fig-line" d="M ${cx + 16} ${cy} A 16 16 0 ${large} 0 ${(cx + 16 * Math.cos(t)).toFixed(1)} ${(cy - 16 * Math.sin(t)).toFixed(1)}"/>`
      + svgLabel(cx + half[0] * 34, cy + half[1] * 34, `${fig.angle}°`) + svgLabel(cx + half[0] * (r + 16), cy + half[1] * (r + 16), fig.arcLabel)
      + svgLabel(cx + r / 2, cy + 13, fig.radiusLabel);
    label = `Circle sector with radius ${fig.radiusLabel} and a ${fig.angle}° central angle; the arc length is unknown.`;
  } else if (fig.type === 'triangle-angles') {
    const A = fig.A * Math.PI / 180, B = fig.B * Math.PI / 180, side = Math.sin(B) / Math.sin(Math.PI - A - B);
    const raw = [[0, 0], [1, 0], [side * Math.cos(A), side * Math.sin(A)]];
    const minX = Math.min(...raw.map(p => p[0])), maxX = Math.max(...raw.map(p => p[0])), maxY = raw[2][1];
    const s = Math.min(220 / (maxX - minX), 140 / maxY);
    const [P, Q, R] = raw.map(([x, y]) => [40 + (x - minX) * s, 170 - y * s]);
    const inside = (V, U, W, deg) => {
      const a = [U[0] - V[0], U[1] - V[1]], b = [W[0] - V[0], W[1] - V[1]], la = Math.hypot(...a), lb = Math.hypot(...b);
      const bis = [a[0] / la + b[0] / lb, a[1] / la + b[1] / lb], bl = Math.hypot(...bis), d = clamp(17 / Math.sin(deg * Math.PI / 360), 32, 70);
      return [V[0] + bis[0] / bl * d, V[1] + bis[1] / bl * d];
    };
    const la = inside(P, Q, R, fig.A), lb = inside(Q, P, R, fig.B), lc = inside(R, P, Q, 180 - fig.A - fig.B);
    body = `<polygon class="fig-shape" points="${pts([P, Q, R])}"/>` + svgLabel(...la, fig.aLabel) + svgLabel(...lb, fig.bLabel) + svgLabel(...lc, fig.cLabel);
    label = `Triangle with angles ${fig.aLabel}, ${fig.bLabel}, and ${fig.cLabel}.`;
  } else return '';
  return `<figure class="question-figure"><svg viewBox="0 0 300 200" role="img" aria-label="${escapeHtml(label)}">${body}</svg>${note ? '<figcaption>Note: figure not drawn to scale.</figcaption>' : ''}</figure>`;
}

// ---------- Timed practice module ----------

const TEST_MINUTES = 35;
// One digital SAT Math module: 22 questions, weighted like the real domain split (≈35/35/15/15%).
const TEST_BLUEPRINT = { algebra: 8, advanced: 8, data: 3, geometry: 3 };
const DIFFICULTY_RANK = { foundation: 0, medium: 1, advanced: 2 };
let testInterval = null;

const shuffled = list => list.map(item => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
const formatClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const testRemaining = () => state.activeTest.startedAt + TEST_MINUTES * 60000 - Date.now();

function pickTestQuestions() {
  const seen = new Set(state.attempts.map(attempt => attempt.questionId));
  const picked = Object.entries(TEST_BLUEPRINT).flatMap(([domain, count]) => {
    const pool = shuffled(QUESTION_BANK.filter(question => question.domain === domain));
    return [...pool.filter(q => !seen.has(q.id)), ...pool.filter(q => seen.has(q.id))].slice(0, count);
  });
  return shuffled(picked).sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]).map(question => question.id);
}

function startTest() {
  const ids = pickTestQuestions();
  state.activeTest = { ids, answers: ids.map(() => null), flagged: ids.map(() => false), index: 0, startedAt: Date.now() };
  saveState();
  renderTest();
  resumeTestTimer();
}

function resumeTestTimer() {
  clearInterval(testInterval);
  if (state.activeTest) { testInterval = setInterval(tickTest, 1000); tickTest(); }
}

function tickTest() {
  if (!state.activeTest) return clearInterval(testInterval);
  const remaining = testRemaining();
  if (remaining <= 0) return finishTest(true);
  const timer = document.querySelector('#test-timer');
  if (timer) { timer.textContent = formatClock(remaining); timer.classList.toggle('low', remaining < 5 * 60000); }
}

function testScore(record) {
  const questions = record.ids.map(questionById);
  const correct = questions.filter((q, i) => q && record.answers[i] === q.answer).length;
  return { questions, correct, total: record.ids.length };
}

function renderTest() {
  const container = document.querySelector('#test-content');
  const test = state.activeTest;
  if (!test) return renderTestIntro();
  if (testRemaining() <= 0) return finishTest(true);
  const i = test.index, q = questionById(test.ids[i]), last = i === test.ids.length - 1;
  const letters = ['A', 'B', 'C', 'D'];
  container.innerHTML = `
    <div class="test-bar">
      <strong>Question ${i + 1} of ${test.ids.length}</strong>
      <span class="test-timer" id="test-timer" role="timer" aria-label="Time remaining">${formatClock(testRemaining())}</span>
      <button class="text-button" type="button" id="test-flag" aria-pressed="${test.flagged[i]}">${test.flagged[i] ? '★ Marked for review' : '☆ Mark for review'}</button>
    </div>
    <article class="question-card test-card">
      <h2 class="question-prompt">${escapeHtml(q.prompt)}</h2>
      ${q.figure ? figureSvg(q.figure) : ''}
      <div class="options" role="radiogroup" aria-label="Answer choices">
        ${q.options.map((option, n) => `<button class="option${test.answers[i] === n ? ' selected' : ''}" type="button" role="radio" aria-checked="${test.answers[i] === n}" data-test-answer="${n}"><span class="option-letter">${letters[n]}</span><span>${escapeHtml(option)}</span></button>`).join('')}
      </div>
      <div class="question-actions"><button class="secondary-button" type="button" id="test-prev" ${i === 0 ? 'disabled' : ''}>← Back</button><button class="primary-button" type="button" id="${last ? 'test-finish' : 'test-next'}">${last ? 'Finish and score' : 'Next →'}</button></div>
    </article>
    <nav class="test-grid" aria-label="Question navigator">${test.ids.map((_, n) => `<button type="button" class="test-dot${test.answers[n] !== null ? ' answered' : ''}${test.flagged[n] ? ' flagged' : ''}${n === i ? ' current' : ''}" data-test-goto="${n}" aria-label="Question ${n + 1}${test.answers[n] !== null ? ', answered' : ''}${test.flagged[n] ? ', marked for review' : ''}"${n === i ? ' aria-current="step"' : ''}>${n + 1}</button>`).join('')}</nav>
    <button class="danger-link" type="button" id="test-finish-early">Finish module now</button>`;
}

function renderTestIntro() {
  const past = state.tests.map((record, index) => ({ record, index })).slice(-5).reverse();
  document.querySelector('#test-content').innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">Practice test mode</span><h1 id="test-title">Timed practice module</h1><p class="page-lede">22 questions in ${TEST_MINUTES} minutes, the same length as one digital SAT Math module.</p></div></div>
    <div class="test-intro-grid">
      <section class="progress-panel"><h2>How it works</h2><ul class="test-rules">
        <li>Questions from all four domains in SAT proportions: 8 Algebra, 8 Advanced Math, 3 Problem-Solving &amp; Data, 3 Geometry &amp; Trigonometry. They get harder as you go.</li>
        <li>No hints or explanations until you finish. You can skip, go back, and mark questions for review.</li>
        <li>The timer keeps running if you leave this page. At 0:00 the module is scored automatically.</li>
        <li>Have scratch paper ready. As on the real test, you can use the <a href="https://www.desmos.com/calculator" target="_blank" rel="noopener noreferrer">Desmos calculator ↗</a>.</li>
      </ul><button class="primary-button" type="button" id="start-test">Start the ${TEST_MINUTES}-minute module</button></section>
      <section class="progress-panel"><h2>Past modules</h2>${past.length ? past.map(({ record, index }) => {
        const { correct, total } = testScore(record);
        return `<div class="history-row"><time>${new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time><strong>${correct} of ${total} correct · ${formatClock(record.seconds * 1000)}</strong><button class="text-button" type="button" data-test-result="${index}">Review</button></div>`;
      }).join('') : '<p class="page-lede">No modules yet. Your results will appear here.</p>'}</section>
    </div>`;
}

function finishTest(timeUp = false) {
  const test = state.activeTest;
  if (!test) return;
  clearInterval(testInterval);
  const finishedAt = Math.min(Date.now(), test.startedAt + TEST_MINUTES * 60000);
  const seconds = Math.round((finishedAt - test.startedAt) / 1000), date = new Date(finishedAt).toISOString();
  test.ids.forEach((id, i) => {
    const q = questionById(id);
    if (q) state.attempts.push({ questionId: id, domain: q.domain, skill: q.skill, correct: test.answers[i] === q.answer, selected: test.answers[i], seconds: Math.round(seconds / test.ids.length), date, source: 'test' });
  });
  const record = { date, ids: test.ids, answers: test.answers, seconds, timeUp };
  state.tests.push(record);
  state.activeTest = null;
  recordStudy(Math.round(seconds / 6) / 10);
  saveState();
  renderTestResults(record);
  if (timeUp && !document.querySelector('#view-test').classList.contains('active')) showToast('Time’s up. Your practice module has been scored. Open it from Practice.');
}

function renderTestResults(record) {
  const { questions, correct, total } = testScore(record);
  const letters = ['A', 'B', 'C', 'D'];
  const byDomain = Object.entries(DOMAINS).map(([id, domain]) => {
    const items = questions.map((q, i) => [q, i]).filter(([q]) => q?.domain === id);
    return `<div class="result-domain"><strong>${domain.name}</strong><small>${items.filter(([q, i]) => record.answers[i] === q.answer).length} of ${items.length} correct</small></div>`;
  }).join('');
  const review = questions.map((q, i) => {
    if (!q) return '';
    const chosen = record.answers[i], ok = chosen === q.answer;
    const why = !ok && chosen !== null ? q.mistakes?.[chosen] : null;
    return `<article class="test-review-item ${ok ? 'good' : 'miss'}"><span class="mistake-domain">Question ${i + 1} · ${DOMAINS[q.domain].name} · ${escapeHtml(q.skill)}</span><h3>${escapeHtml(q.prompt)}</h3>
      <p><b>${ok ? '✓ Correct' : '✗ ' + (chosen === null ? 'No answer' : `You chose ${letters[chosen]}: ${escapeHtml(q.options[chosen])}`)}</b>${ok ? '' : ` · Correct: ${letters[q.answer]}: ${escapeHtml(q.options[q.answer])}`}</p>
      ${why ? `<p class="mistake-note">${escapeHtml(why)}</p>` : ''}<p>${escapeHtml(q.explanation)}</p>${q.rule ? `<p><b>Rule:</b> ${escapeHtml(q.rule)}</p>` : ''}</article>`;
  }).join('');
  document.querySelector('#test-content').innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">Module scored</span><h1 id="test-title">${correct} of ${total} correct</h1><p class="page-lede">${Math.round(correct / total * 100)}% in ${formatClock(record.seconds * 1000)}${record.timeUp ? ' (time ran out)' : ''}. This is practice accuracy, not an official SAT score. For a scored test, use Bluebook.</p></div></div>
    <div class="result-domains">${byDomain}</div>
    <div class="question-actions"><button class="secondary-button" type="button" data-route="review">Open mistake journal</button><button class="primary-button" type="button" id="test-intro">Back to practice modules</button></div>
    <section class="progress-panel"><div class="section-heading"><div><span class="eyebrow">Question by question</span><h2>Review your module</h2></div></div>${review}</section>`;
}

function confirmFinishTest() {
  const test = state.activeTest;
  const unanswered = test.answers.filter(answer => answer === null).length, flagged = test.flagged.filter(Boolean).length;
  const warnings = [unanswered && `${unanswered} unanswered`, flagged && `${flagged} marked for review`].filter(Boolean).join(' and ');
  if (warnings && !confirm(`You have ${warnings}. Finish and score the module anyway?`)) return;
  finishTest(false);
}

function signIn(id) {
  currentUserId = id;
  sessionStorage.setItem(SESSION_KEY, id);
  state = loadState();
}

let pendingLearnerId = null;

function renderLogin() {
  pendingLearnerId = null;
  document.querySelector('#pin-form').hidden = true;
  document.querySelector('#learner-list').hidden = false;
  document.querySelector('#add-learner').hidden = false;
  document.querySelector('#learner-list').innerHTML = users.map(user =>
    `<button class="radio-card learner-card" type="button" data-learner="${escapeHtml(user.id)}"><span><strong>${escapeHtml(user.name)}</strong><small>${user.pinHash ? 'PIN protected' : 'Tap to continue'}</small></span></button>`
  ).join('');
}

function openLogin() {
  renderLogin();
  document.querySelector('#login-dialog').showModal();
}

function enterApp() {
  document.querySelector('#login-dialog').close();
  populateSettings();
  renderHome();
  renderReview();
  renderProgress();
  routeTo(location.hash.slice(1) || 'home');
  resumeTestTimer();
  showToast(`Welcome back, ${state.profile?.name || 'learner'}.`);
}

function chooseLearner(id) {
  const user = users.find(item => item.id === id);
  if (!user) return;
  if (!user.pinHash) { signIn(id); return enterApp(); }
  pendingLearnerId = id;
  document.querySelector('#learner-list').hidden = true;
  document.querySelector('#add-learner').hidden = true;
  document.querySelector('#pin-form').hidden = false;
  document.querySelector('#pin-name').textContent = user.name;
  const input = document.querySelector('#pin-input');
  input.value = '';
  input.focus();
}

async function submitPin() {
  const user = users.find(item => item.id === pendingLearnerId);
  if (!user) return renderLogin();
  if (await hashPin(user.id, document.querySelector('#pin-input').value) !== user.pinHash) {
    showToast('That PIN doesn’t match.');
    return;
  }
  signIn(user.id);
  enterApp();
}

function init() {
  document.addEventListener('click', handleClick);
  document.querySelector('#onboarding-form').addEventListener('submit', event => {
    event.preventDefault();
    completeOnboarding();
  });
  window.addEventListener('hashchange', () => routeTo(location.hash.slice(1)));
  document.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select') || document.querySelector('dialog[open]')) return;
    const key = Number(event.key);
    if (state.activeTest && document.querySelector('#view-test').classList.contains('active') && key >= 1 && key <= 4) return chooseTestAnswer(key - 1);
    if (!currentQuestion || questionAnswered || !document.querySelector('#view-practice').classList.contains('active')) return;
    const number = Number(event.key);
    if (number >= 1 && number <= 4) selectAnswer(number - 1);
  });
  document.querySelector('#pin-form').addEventListener('submit', event => {
    event.preventDefault();
    submitPin();
  });
  document.querySelector('#login-dialog').addEventListener('cancel', event => event.preventDefault());
  document.querySelector('#onboarding-dialog').addEventListener('cancel', event => {
    if (currentUserId) return;
    event.preventDefault();
    if (users.length) { document.querySelector('#onboarding-dialog').close(); openLogin(); }
  });
  populateSettings();
  renderHome();
  renderReview();
  renderProgress();
  routeTo(location.hash.slice(1) || 'home');
  resumeTestTimer();
  if (!currentUserId && users.length) openLogin();
  else if (!state.profile) document.querySelector('#onboarding-dialog').showModal();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

init();
