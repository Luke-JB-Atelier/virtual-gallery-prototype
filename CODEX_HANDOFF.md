# Codex handoff - virtual gallery

Tento soubor je kratky navod pro novy Codex chat, aby mohl navazat bez stare konverzace.

## Projekt

- Lokalni slozka: `C:\Users\lukas\Documents\Codex\2026-05-27\vy-e-mi-probl-m-s`
- GitHub repo: `https://github.com/lukasjanbalek-bit/virtual-gallery-prototype`
- Verejna galerie: `https://lukasjanbalek-bit.github.io/virtual-gallery-prototype/`
- Editor: `https://lukasjanbalek-bit.github.io/virtual-gallery-prototype/?edit=1`
- Lokalni vyvoj: `http://127.0.0.1:5189/`
- Lokalni editor: `http://127.0.0.1:5189/?edit=1`

## Spusteni

```powershell
npm install
npm run dev -- --port 5189
```

Build pred commitem:

```powershell
npm run build
```

## Dulezite soubory

- `src/main.js` - cela Three.js galerie, pohyb, mistnosti, obrazy, svetla, editor.
- `src/styles.css` - panely editoru a UI.
- `index.html` - struktura ovladacich panelu.
- `public/art/olej-web/` - obrazky pouzite ve verejne galerii.
- `public/audio/jazz/` - lokalni jazzove MP3 pro prostorove reproduktory v galerii.
- `.github/workflows/deploy.yml` - GitHub Pages deploy po pushi do `main`.

## Jak to funguje pro uzivatele

- Verejna verze bez `?edit=1` je cista galerie pro divaky.
- Editor s `?edit=1` ukazuje nastavovaci panely.
- Verejna galerie ma hudbu pripravenu jako zapnutou, ale prohlizec ji spusti az po prvnim kliknuti/tapnuti do sceny nebo po stisku `W`. Tlacitko pak slouzi hlavne jako `Vypnout jazz`.
- Editor ma panel `Hudba` s hlasitosti. Export uklada `gallery.audio.volume`.
- Playlist je rozvedeny do dvou diagonalnich hornich rohovych reproduktoru v kazde mistnosti.
- Podstavce maji typ `pillar` nebo `table`. V editoru se vybrany podstavec/stolecek otaci koleckem mysi.
- Tlacitko `Ulozit galerii` uklada zmeny jen do aktualniho prohlizece (`localStorage`).
- Tlacitko `Exportovat galerii` vytvori JSON, ktery se da pozdeji vlozit do kodu jako verejna verze.
- Tlacitko `Vratit GitHub verzi` maze lokalni editorove ulozeni.

## Aktualni rozhodnuti

- Obrazy maji mit vzdy presne jedno prirazene smerove svetlo.
- Pri presunu obrazu se ma presunout jeho svetlo, nema vznikat dalsi svetlo.
- Pri smazani obrazu se ma smazat i jeho svetlo.
- Bludna svetla bez obrazu se maji pri ulozeni/nacitani uklidit.
- Ram ma byt skutecne cerny; svetlo ho nema prebarvit do sede nebo bezove.
- Slabe ramy maji byt slabe i v hloubce/profilu.
- Rozmer ve scene se pouziva pro vizualni velikost, ale rozmer na stitku je mensi o 30 cm. Priklad: 70 x 70 ve scene se zapise na stitek jako 40 x 40 cm.

## Poznamky pro dalsi praci

- Uzivatel chce vysvetleni jednoduse, bez zbytecnych technickych terminu.
- Pri ladeni je rychlejsi pracovat lokalne na `127.0.0.1:5189` a na GitHub pushovat az hotove zmeny.
- Verejna GitHub Pages verze se po pushi aktualizuje az po dobehnuti deploye.
- Untracked soubor `OBS-PS4-CU4K30-latence-oprava.md` nesouvisi s galerii, necommitovat bez vyzadani.
