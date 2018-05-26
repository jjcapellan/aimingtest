:: Delete old file
del app.packed.js
echo Old packed file deleted
:: Concatenates all minified files in one file
:: The order is important
type globals.min.js >> app.packed.js
type boot.min.js >> app.packed.js
type menu.min.js >> app.packed.js
type basicmode.min.js >> app.packed.js
type evasionmode.min.js >> app.packed.js
type initstates.min.js >> app.packed.js
echo All files packed
