# Databronnen en beperkingen

Per bron: wat er wordt opgehaald, hoe, en wat de beperkingen zijn. Alle bronnen worden beleefd benaderd: herkenbare User-Agent met contactadres, `robots.txt` wordt gerespecteerd, minimaal 1,5 seconde tussen verzoeken per website. Omschrijvingen van bronnen worden niet overgenomen; de app toont een eigen, korte samenvatting en verwijst naar de bron.

| Bron | Adapter | Methode | Dekking | Beperkingen |
|---|---|---|---|---|
| Handmatig | `handmatig` | JSON in `data/curated/` | Wat de nachtelijke update niet zelf kan ophalen | Wekelijks bijgehouden door de skill `bronnen-verversen` |
| Vaste plekken | `vaste-plekken` | `data/places.json` | Plekken waar je altijd heen kunt | Maandelijks gecontroleerd |
