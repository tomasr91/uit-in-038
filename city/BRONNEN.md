# Databronnen en beperkingen — Uit in 038 (Zwolle)

Stand van 5 november 2026. Alle bronnen worden beleefd benaderd: herkenbare User-Agent met contactadres, `robots.txt` wordt gerespecteerd, minimaal 1,5 seconde tussen verzoeken per website. Omschrijvingen van bronnen worden niet overgenomen; de app toont een eigen, korte samenvatting en verwijst naar de bron. Websites zijn onderzocht met de workflow *Bronnen diagnose* (branch `diagnose`).

## Geïmplementeerd

| Bron | Adapter | Methode | Dekking | Beperkingen |
|---|---|---|---|---|
| **Hedon** (hedon-zwolle.nl) | `hedon` | Programmadata (`ng-state`) van de homepage, één verzoek | Alle concerten, clubavonden (Hedon Nights) en shows die Hedon elders organiseert (bv. De Spiegel); ± 80 per drie maanden | Geen omschrijving; soort uit de genres. "Alle leeftijden" betekent geen leeftijdsgrens en zet een concert dus níet bij Kinderen. Status 1/2/3/5 = laatste kaarten/uitverkocht/afgelast/verplaatst. |
| **Pathé Zwolle** (pathe.nl) | `pathe` (motor) | Paginadata van de bioscooppagina | Kinderfilms (keuring t/m 12) en Kleuterbios | Alleen speeldagen, geen aanvangstijden. |
| **VisitZwolle** (visitzwolle.com/agenda) | `visitzwolle` | HTML-stukje per dag: `/agenda/DD-MM-JJJJ/?ajx=1`, plus `/agenda/kinderen/DD-MM-JJJJ/?ajx=1` voor de hint Kinderen | De stadsagenda: exposities, rondleidingen, films van Fraterhuis, voorstellingen in Odeon en De Spiegel, Hedon, markten; ± 30 per dag | ± 2 verzoeken per dag in het venster (± 4 minuten per run). Geen prijs of leeftijd in de lijst. Vaste dagelijkse activiteiten (speurtochten, escape room) staan elke dag in de lijst; de app voegt ze samen. Kaarten met een andere datum dan de opgevraagde dag worden overgeslagen. |
| **Stadkamer** (stadkamer.nl/agenda) | `stadkamer` | JSON-API van de site: `/api/v1/events?siteId=1&departments=90` | Activiteiten in de vier Zwolse vestigingen, waaronder Zwolle-Zuid; ± 50 | Doelgroep en leeftijd komen uit extra verzoeken per doelgroepcategorie/-tag. Spreekuren (Taalpunt, DigiHulp, Informatiepunt) worden overgeslagen. "Meerdere data" = alleen de eerstvolgende keer. |
| Handmatig | `handmatig` | JSON in `data/curated/` | Wat de nachtelijke update niet zelf kan ophalen | Wekelijks bijgehouden door de skill `bronnen-verversen` |
| Vaste plekken | `vaste-plekken` | `data/places.json` | Plekken waar je altijd heen kunt | Nog leeg |

## Onderzocht, nog niet gekoppeld

| Bron | Bevinding (5-11-2026) |
|---|---|
| **Zwolse Theaters** (Odeon en De Spiegel) | Umbraco/Vue-site; `/programma` toont maar 10 voorstellingen, de rest laadt met JavaScript (`/assets/js/main.js`). De voorstellingen staan ook in VisitZwolle; een eigen adapter zou prijs, leeftijd ("3plus") en status toevoegen. |
| Filmtheater Fraterhuis | JavaScript-app; de films staan in VisitZwolle. |
| Museum de Fundatie | `/nl/tentoonstellingen` (kandidaat voor Lopend); exposities staan deels in VisitZwolle. |
| IJsselhallen | Doorverwijslus (ook zonder www); nog niet bereikbaar voor de verzamellaag. |
| Go-Kids Zwolle | Secundaire bron (verwijst naar organisatoren); alleen als aanvulling via de skill `bronnen-verversen`. |
