# Uit in 038 — gezinsagenda voor Zwolle-Zuid en Zwolle

Wat er de komende maanden te doen is in Zwolle, voor de kinderen (gefilterd op hun leeftijd op de dag zelf) en voor volwassenen, met Zwolle-Zuid als thuiswijk. Installeerbaar als app op je telefoon, zonder account.

- **App:** https://tomasr91.github.io/uit-in-038/ (op je telefoon: *Zet op beginscherm*)
- **Motor:** [uit-core](https://github.com/tomasr91/uit-core), dezelfde als [Uit in 030](https://github.com/tomasr91/wattedoeninutrecht). Alles van Zwolle staat in `city/`; de rest (zie `core.json`) wordt bijgewerkt via de workflow *Motor bijwerken*.
- **Bronnen:** zie [city/BRONNEN.md](city/BRONNEN.md).
- **Onderhoud door Claude:** zie [docs/GEPLANDE-TAKEN.md](docs/GEPLANDE-TAKEN.md).

Lokaal: `npm install`, `npm run dev` (app), `npm run collect` (bronnen ophalen), `npm test`.

## Privacy

De app slaat niets op een server op. Het gezinsprofiel (namen, geboortedata, thuisadres) en bewaarde activiteiten staan alleen in de browser op je telefoon.

---

# uit-core — maak een uitagenda voor je eigen stad

Een persoonlijke, mobiele gezinsagenda: wat er de komende maanden te doen is in jouw stad, voor de kinderen (gefilterd op hun leeftijd op de dag zelf) en voor volwassenen. Installeerbaar als app op je telefoon, zonder account, zonder server, gratis te hosten op GitHub Pages.

Dit is de **motor**. Hij draait onder meer [Uit in 030](https://tomasr91.github.io/wattedoeninutrecht/) (Utrecht). Een stad is een eigen repository: een kopie van deze motor plus een **stadsprofiel** in de map `city/`.

## Je eigen stad in vijf stappen

1. **Maak je repository:** klik bovenaan op **Use this template** → *Create a new repository*. Kies **Public** (GitHub Pages is alleen gratis bij openbare repositories).
2. **Vul het stadsprofiel in:** `city/config.ts` (naam, kleuren, centrum, thuiswijk, wijken), en zo nodig `city/Landmark.tsx` (eigen tekening in de kop) en `public/icons/`.
3. **Kies je bronnen** in `city/sources.config.json`. Veel agenda's werken zonder code:
   - een iCal-feed → `"type": "ical"`
   - pagina's met schema.org-evenementen → `"type": "jsonld"`
   - WordPress met The Events Calendar → `"type": "tribe"`
   - Pathé-bioscopen → bron `pathe`, met de slug van jouw bioscoop

   Voor andere sites schrijf je een eigen adapter in `city/adapters/` (voorbeelden: `city/adapters/` in [wattedoeninutrecht](https://github.com/tomasr91/wattedoeninutrecht)). Wat GitHub niet zelf kan ophalen, kan Claude wekelijks bijhouden (zie stap 5).
4. **Zet het online:**
   - *Settings → Actions → General*: *Workflow permissions* op **Read and write**, en **Allow GitHub Actions to create and approve pull requests** aan.
   - *Settings → Pages*: *Source* op **GitHub Actions**.
   - *Settings → Secrets and variables → Actions → Variables*: `COLLECTOR_CONTACT` = je e-mailadres (komt in de User-Agent, zodat websites je kunnen bereiken).
   - *Actions → Dagelijkse update → Run workflow*. De app staat daarna op `https://<gebruikersnaam>.github.io/<repository>/`.
5. **Optioneel: onderhoud door Claude** met je eigen Claude-account. Zie [docs/GEPLANDE-TAKEN.md](docs/GEPLANDE-TAKEN.md).

Lokaal werken: `npm install`, `npm run dev` (app), `npm run collect` (bronnen ophalen), `npm test`.

## Motor en stad

| Van de motor (wordt bijgewerkt) | Van de stad (blijft van jou) |
|---|---|
| `src/`, `collector/`, `scripts/`, `tests/`, `.claude/skills/`, `.github/workflows/`, `docs/`, configuratiebestanden — zie `core.json` | `city/`, `data/`, `public/icons/`, `public/data/`, `README.md`, `.github/run-request` |

Pas de motorbestanden in je stadsrepo niet aan: ze worden bij een update vervangen. Mis je iets in de motor, open dan een issue of pull request in [tomasr91/uit-core](https://github.com/tomasr91/uit-core).

**Updates:** elke maandag kijkt de workflow *Motor bijwerken* of er een nieuwe versie is. Zo ja, dan test en bouwt hij die met jouw stad en zet hij een pull request klaar. Jij kiest *Merge*, of laat het staan. Handmatig kan ook: `node scripts/update-core.mjs`.

## Privacy

De app slaat niets op een server op. Het gezinsprofiel (namen, geboortedata, thuisadres) en bewaarde activiteiten staan alleen in de browser op je telefoon. Zet geen persoonsgegevens in de repository: die is openbaar.

## Verder lezen

- [docs/ARCHITECTUUR.md](docs/ARCHITECTUUR.md): opbouw van de code en de belangrijkste keuzes
- [docs/GEPLANDE-TAKEN.md](docs/GEPLANDE-TAKEN.md): onderhoud door Claude als geplande taak
- `src/domain/city-types.ts`: alle velden van het stadsprofiel

## Licentie

MIT — zie [LICENSE](LICENSE). Je mag de motor gebruiken en aanpassen in je eigen kopie, mits de licentie- en auteursvermelding blijft staan.
