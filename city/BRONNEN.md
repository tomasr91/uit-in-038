# Databronnen en beperkingen — Uit in 038 (Zwolle)

Stand van 5 november 2026. Alle bronnen worden beleefd benaderd: herkenbare User-Agent met contactadres, `robots.txt` wordt gerespecteerd, minimaal 1,5 seconde tussen verzoeken per website. Omschrijvingen van bronnen worden niet overgenomen; de app toont een eigen, korte samenvatting en verwijst naar de bron. Websites zijn onderzocht met de workflow *Bronnen diagnose* (branch `diagnose`).

## Geïmplementeerd

| Bron | Adapter | Methode | Dekking | Beperkingen |
|---|---|---|---|---|
| **Hedon** (hedon-zwolle.nl) | `hedon` | Programmadata (`ng-state`) van de homepage, één verzoek | Alle concerten, clubavonden (Hedon Nights) en shows die Hedon elders organiseert (bv. De Spiegel); ± 80 per drie maanden | Geen omschrijving; soort uit de genres. "Alle leeftijden" betekent geen leeftijdsgrens en zet een concert dus níet bij Kinderen. Status 1/2/3/5 = laatste kaarten/uitverkocht/afgelast/verplaatst. |
| **Pathé Zwolle** (pathe.nl) | `pathe` (motor) | Paginadata van de bioscooppagina | Kinderfilms (keuring t/m 12) en Kleuterbios | Alleen speeldagen, geen aanvangstijden. |
| Handmatig | `handmatig` | JSON in `data/curated/` | Wat de nachtelijke update niet zelf kan ophalen | Wekelijks bijgehouden door de skill `bronnen-verversen` |
| Vaste plekken | `vaste-plekken` | `data/places.json` | Plekken waar je altijd heen kunt | Nog leeg |

## Onderzocht, nog niet gekoppeld

| Bron | Bevinding (5-11-2026) |
|---|---|
| **VisitZwolle** (visitzwolle.com/agenda) | De grote stadsagenda. De lijst laadt met JavaScript van het platform touristserver.nl; losse evenementpagina's (`/agenda-item/<id>/<slug>/`) zijn gewone HTML met datum, plek en adres. robots.txt staat `/agenda/` en evenementpagina's toe (wel: geen agenda's van voor 2026). Volgende stap: het lijst-endpoint vinden. |
| **Stadkamer** (stadkamer.nl/agenda) | Bibliotheek met veel kinderactiviteiten, vijf vestigingen (waaronder Zwolle-Zuid). Agenda laadt met JavaScript; endpoint nog zoeken. |
| **Zwolse Theaters** (Odeon en De Spiegel) | `/agenda` bestaat niet; het programma staat onder `/programma`. Nog bekijken. |
| Filmtheater Fraterhuis | Site is een JavaScript-app; nog bekijken. |
| Museum de Fundatie | Geen agenda; wel `/nl/tentoonstellingen` (kandidaat voor Lopend). |
| IJsselhallen | Doorverwijslus bij `/agenda`; nog bekijken. |
| Go-Kids Zwolle | Secundaire bron (verwijst naar organisatoren); alleen als aanvulling via de skill `bronnen-verversen`. |
