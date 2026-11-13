# SIMPRO_CALCULATOR

A scientific and graphing calculator for students, teachers and researchers. It runs in any modern web browser, installs on a phone like an app, and works with no internet once installed.

**Live calculator:** https://simprodesign4-cmyk.github.io/simpro-calculator/
*(replace YOUR-USERNAME with your GitHub username)*

![SIMPRO_CALCULATOR icon](icons/icon-192.png)

## What it can do

| Area | Highlights |
|---|---|
| **Everyday and scientific** | Brackets, powers, roots, logs, trigonometry in degrees, radians or gradians, factorials, permutations and combinations, percent, constants |
| **Exact answers** | Fractions stay exact (1/3 + 1/6 = 1/2), mixed fractions, very large whole numbers |
| **Special numbers** | Complex numbers, degrees-minutes-seconds, unit conversion, 12 physical constants (CODATA 2022) |
| **Calculus** | Numerical integral, derivative and sum |
| **Graphing** | Up to three curves, trace, zoom, window, root / maximum / minimum / y-intercept |
| **Modes** (MENU key) | Statistics and regression, Table, Equation (simultaneous and polynomial), Base-N, Matrix and vectors, Distribution (normal, binomial, Poisson), Ratio, Inequality, Spreadsheet |
| **Phone ready** | Fits any screen, installable, works offline |
| **Accessible** | Three text sizes, spoken key names for screen readers, full keyboard use, high-contrast colours |

The key layout follows the style of a Casio fx-CG50 graphing calculator, in the SIMPRO blue, white and orange colours.

## Using it

1. Open the live address in a browser.
2. Type with the on-screen keys or your keyboard, and press **EXE** (Enter).
3. **SHIFT** (Alt+S) switches on the orange functions above the keys. **ALPHA** (Alt+A) types letters.
4. **MENU** opens the modes. **EXIT** goes back. Press **?** for built-in help.

### Try these

| Problem | Keys | Answer |
|---|---|---|
| Order of operations | `2` `+` `3` `×` `4` **EXE** | 14 |
| Exact fraction | `1÷3+1÷6` **EXE**, then **S⇔D** | 0.5, then 1/2 |
| Complex number | `√(−4)` (SHIFT then x²) | 2i |
| Temperature | `100`, SHIFT **a b/c** (CONV), Temperature, °C, °F | 212 |
| Graph | `x^2` using **X,θ,T**, then **F6** | a parabola |
| Equation | MENU **5**, **4**, enter `1 −3 2`, **F1** | x = 1 and x = 2 |
| Statistics | MENU **2**, enter `1 2 3 4 5`, **F1** | mean 3 |

The full manual, with a worked example and expected answer for every mode, is in the **SIMPRO_CALCULATOR User Manual** document.

## Install on a phone

- **Android (Chrome):** open the live address and tap the orange **Install** button, or the browser menu then **Install app**.
- **iPhone (Safari):** open the address, tap **Share**, then **Add to Home Screen**.

Installing and offline use need the secure `https://` address.

## Run it on your own computer

You need [Visual Studio Code](https://code.visualstudio.com/) with the **Live Server** extension.

1. Open the project folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.

The calculator is plain HTML, CSS and JavaScript. There is nothing to build or install.

## Project structure

```
index.html            page structure
style.css             colours, 3D keys, layout
calc.js               engine: parser, exact fractions, complex numbers, display
solvers.js            equations, statistics, regression
basen.js              Base-N arithmetic (32-bit)
matrix.js             matrices and vectors
dist.js               normal, binomial and Poisson distributions
ratio.js  ineq.js     ratios and inequalities
sheet.js              spreadsheet formulas
ui.js                 keys, screen, graphing, settings, help
modes.js              the MENU modes
pwa.js  sw.js         install button and offline copy
manifest.webmanifest  app name, colours and icons
icons/                app icons
test/                 automated tests
```

## Tests

The tests need [Node.js](https://nodejs.org/). In a terminal inside the project folder run:

```
npm test
```

On Windows PowerShell, if scripts are blocked, run `npm.cmd test` or `node --test` instead. A healthy run ends with `fail 0`.

The tests cover the engine, every mode, the offline and install files, colour contrast, and an **accuracy benchmark** of over 100 expressions checked against independent references computed with mpmath, SciPy and NumPy, and against exact definitions such as SI units.

## Publishing a change

1. Edit the files.
2. In `sw.js`, raise the version in `const CACHE="simpro-calculator-v2"` (for example to `v3`) so phones refresh their saved copy.
3. In VS Code: Source Control, **+** next to Changes, write a message, **Commit**, then **Sync Changes**.
4. GitHub Pages updates the live site within a few minutes.

## Accuracy and limits

- Calculations use about 15 to 16 significant digits and show 12. Whole numbers and fractions are exact where possible.
- The results were checked against independent software and exact definitions. They were **not** compared with a physical Casio calculator.
- Not included yet: t, chi-square and F distributions, eigenvalues, exact radicals such as √2 (shown as decimals), and a program mode.
- **Exams:** exam boards approve particular devices and often do not allow phones. Check your exam rules before using this in an exam.

## Notes

- SIMPRO_CALCULATOR is an independent project. Its key layout is inspired by the Casio fx-CG50, but it is not made by, affiliated with or endorsed by Casio. "Casio" is a trademark of its owner.
- Constants use the SI definitions and the CODATA 2022 recommended values.
- Privacy: the calculator collects no personal information. See `privacy-policy.html`.
- **Licence:** no licence has been chosen yet, so all rights are reserved by the author. To let others reuse the code, add a `LICENSE` file.
