# Uitzondering: korte intro van de bron

Op verzoek van de eigenaar (5 november 2026) toont Uit in 038, net als Uit in 030, bij een activiteit een korte intro: de eerste zin(nen) van de omschrijving van de bron, letterlijk, hooguit ± 220 tekens (`shortIntro`/`introFrom` in `collector/lib/parse.ts`), altijd met de link naar de bron.

Dit geldt voor:

- **VisitZwolle**: de eerste alinea van de detailpagina (één keer per agenda-item opgehaald, daarna uit de detailcache).
- **Stadkamer**: de introtekst uit de agenda-API.

Verder geldt de huisregel: geen langere omschrijvingen overnemen en niets verzinnen. De volledige tekst van de bron dient alleen voor de indeling (leeftijd, soort) en wordt niet getoond.
