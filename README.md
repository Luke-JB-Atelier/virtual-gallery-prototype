# Virtual Gallery Prototype

Interaktivni webova galerie postavena v Three.js. Verejna verze se otevira bez editoru, editor je dostupny jen pres query parametr.

## Spusteni lokalne

```powershell
npm install
npm run dev -- --port 5189
```

Verejny nahled:

```text
http://127.0.0.1:5189/
```

Editor:

```text
http://127.0.0.1:5189/?edit=1
```

## Build

```powershell
npm run build
```

Vystup pro staticky web je ve slozce `dist`.

## Ukladani galerie

Tlacitko `Ulozit galerii` uklada rozmisteni do `localStorage` v aktualnim prohlizeci. Tlacitko `Exportovat galerii` stahne JSON se stavem galerie a svetel, ktery se pak muze vlozit do kodu pro verejnou verzi.

## GitHub Pages

Repozitar obsahuje workflow `.github/workflows/deploy.yml`, ktere po pushi do vetve `main` sestavi projekt a publikuje `dist` na GitHub Pages.

Verejna beta:

```text
https://lukasjanbalek-bit.github.io/virtual-gallery-prototype/
```
