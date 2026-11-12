-- guide: the usage text of the prassi corpus for agents (Italian: the corpus language). Tool names are the Gateway names with a hyphen (D116).
SELECT 'PRASSI FISCALE ITALIANA - guida all''uso

COSA CONTIENE
Circolari, risoluzioni e provvedimenti dell''Agenzia delle Entrate (portale istituzionale, pagine mensili dal giugno 2019) e le risposte agli interpelli pubblicate dal MEF su def.finanze.it (DocTrib). Ogni documento ha gli estremi (ente, tipo, numero, anno, data, oggetto), il testo (estratto dal PDF; se il PDF e'' una scansione, con OCR locale: campo estrazione = ocr) e i riferimenti normativi citati.

LA PRASSI NON E'' LEGGE
Circolari, risoluzioni, provvedimenti e interpelli esprimono l''interpretazione dell''amministrazione finanziaria: NON è una fonte del diritto e non vincola il giudice. Cita sempre ente, tipo, numero e data del documento, e controlla la norma che interpreta.

QUALE STRUMENTO USARE
- it-prassi_search: ricerca per testo e per significato (modi hybrid, lexical, semantic). Sintassi web: "frase esatta", parola OR parola, -esclusa. Filtri: tipo (circolare, risoluzione, provvedimento, interpello), ente, anno_from, anno_to. k da 1 a 50. Senza query elenca i documenti per tipo, anno, numero. Ogni risultato ha estremi, un estratto (headline evidenzia le parole trovate) e il link alla fonte.
- it-prassi_doc: legge un documento per id (restituito da search e lookup) oppure per tipo + numero + anno (la chiave puo'' corrispondere a piu'' righe, per esempio la versione inglese). Il testo e'' a fette di 20000 caratteri: se truncated e'' vero, richiama con offset = next_offset. Restituisce anche i riferimenti normativi del documento.
- it-prassi_lookup: ricerca strutturata sugli estremi (tipo, numero, anno, intervallo di date, ente, fonte), con ordinamento e paginazione; total dice quanti documenti ci sono. Non restituisce il testo.
- it-prassi_su_norma: i documenti che citano una norma, dato l''URN:NIR dell''atto o dell''articolo (urn:nir:stato:legge:2000-07-27;212 oppure ...;212~art11). Ricerca BEST-EFFORT: sono ricercabili solo i riferimenti che l''estrattore ha saputo risolvere in un URN. L''assenza di risultati NON è una prova che nessun documento citi la norma.
- it-prassi_status: copertura reale del corpus (documenti per fonte e tipo, anni, passaggi ancora senza embedding, riferimenti risolti, documenti scartati, mesi dichiarati e presi) e i limiti, calcolati dai dati.
- it-prassi_guide: questa guida.

COME LEGGERE I RISULTATI
Non c''e'' un punteggio numerico: i risultati sono in ordine di rilevanza. Un documento puo'' comparire una sola volta anche se piu'' passaggi corrispondono. I riferimenti normativi sono estratti automaticamente: la descrizione e'' sempre la citazione originale, l''URN solo quando il riferimento era inequivocabile.

LIMITI
Le pagine mensili del portale esistono dal giugno 2019: circolari e risoluzioni precedenti NON sono nel corpus; neppure la prassi anteriore al 2013 e quella di altri enti. Gli interpelli sono quelli dell''Agenzia delle Entrate negli anni raccolti (vedi it-prassi_status). Alcuni interpelli non dichiarano il proprio numero. I numeri precisi sono in it-prassi_status.

FONTI
Agenzia delle Entrate (portale) e MEF - def.finanze.it (DocTrib). Atti amministrativi pubblici; il testo della licenza non e'' pubblicato dalle fonti.' AS text
