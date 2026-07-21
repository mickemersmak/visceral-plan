# Visceral Plan

En svensk premiuminriktad webbapp för att kombinera kost, styrka, kondition, återhämtning och mätbara riskmarkörer i ett program mot farligt bukfett och visceralt fett.

## Innehåll

- Profil med midja, längd, vikt, nivå och koststil.
- Risköversikt med midja/längd, midjegräns, BMI och avstånd till mål.
- Veckoplan för träning, kost och återhämtning.
- Kostram med protein, fiber och låg sockerlast.
- Träningsbank och intervalltimer.
- Daglig logg med vanor, rörelse, vikt och midjemått.
- Källflik med verifierade hälso- och videounderlag.
- PWA-stöd med manifest, ikoner, offline-cache, installationsknapp och mobil bottennavigering.
- Lokal profilinloggning med PIN för flera användare på samma enhet.
- Databaslogin med PostgreSQL, sessions, roller och adminpanel när `DATABASE_URL` är satt.
- Rollstyrning för `user`, `admin` och `super_admin`, med bootstrap för `micke@ccorebro.se`.
- Könsspecifika vägar för män, kvinnor och neutral profil med fokus som bukmått, cykel, perimenopaus, återstart, styrka, stress och kondition.
- Rankad livsmedelsguide med metriska portionsförslag för livsmedel, frukt och grönsaker.
- Kylskåpsbyggare som räknar ut en komplett måltid från valda råvaror hemma.
- Premium receptstudio med 100 mer professionella recept som rankas efter råvaror hemma, kamerafynd, mål, protein, fiber, tid och saknade ingredienser, inklusive Chefens val, Receptscore 2.0, matchmätare, smakprofil, mise en place, kocktips, kockläge steg-för-steg, smart substitutionsmotor och inköpslista i gram för receptets saknade varor.
- Min vecka: premium veckomeny som bygger 7 dagar med frukost, lunch, middag, akutval, träningscue, prep-plan och smart inköp i gram utifrån kylskåp, scannade varor, importerade bildrecept och valbara lägen som smart, billig, snabb, protein, låg kolhydrat och vegetarisk.
- Receptimport från riktiga externa recept via TheMealDB: automatiskt laddade bildrecept, sök på råvara eller receptstil, visa riktig matbild, källa, originalreceptlänk, metriska gramestimat och importera receptet till appens egen score-, kockläge- och inköpsmotor.
- Svensk livsmedelssökning via `/api/food-search`, byggd mot Livsmedelsverkets Livsmedelsdatabas med API-status, svenska träffar, näringsvärden per 100 g, råvarumatchning och tydlig fallback om datakällan tillfälligt svarar tomt.
- Mobilkamerascan av kylskåp med flera bilder, OpenAI/Gemini-förslag, bildkvalitet, osäkra fynd, användarfeedback och tolerant råvarumatchning när AI:n ser namn, förpackning eller kategori.
- Matfoto-AI som uppskattar näringsvärde från en fotad måltid: kcal, gram, protein, kolhydrater, fett, fiber, komponenter, portionssäkerhet och förbättringsförslag.
- Köks-AI som kan resonera med användaren om scannade råvaror, fotade måltider, valda livsmedel, måltidsmål, protein, fiber, lunchlådor, smarta kompletteringar och inköpsplan i gram.
- Utökad råvarubank med protein, mejeri, baljväxter, grönsaker, frukt, frysvaror, kolhydratbaser och fettkällor.
- Metabolt index som väger bukmått, rörelse, styrka, kostvanor, återhämtning och loggföljsamhet.
- Visceral Score 2.0 med nedbrytning av buksignal, rörelse, styrka, kost, återhämtning och loggning.
- Nästa bästa åtgärd, veckorapport, tallrik i gram, måltidskvitto och smarta matbyten.
- 14-dagars bukfettssprint som ger dagliga beslut för startfasen.
- Svenska gram-mallar för frukost, lunch, middag och akutval.
- Trendgraf för midja och dagspoäng.
- Träningsbank med visuella övningsbilder för styrka, intervall, kondition och mobilitet.
- Medlemsnav med träning, kost, AI-coach, hälsodata, bokning och medlemskommunikation i samma app.
- Lokal bokningsdemo för coachpass, gruppträning, kostlab och uppföljning.
- Medlemsflöde där coachprioritet, bokningar och egna meddelanden samlas.
- Konkurrentmatris som jämför mot MyFitnessPal, Lifesum, Cronometer och träningsappar som Nike Training Club, Sweat och BetterMe.

Alla mått i appen är metriska: cm, kg, g, minuter, sekunder och kcal.

## Det som skiljer appen

Visceral Plan jagar inte bara kalorier. Den styr på bukmått, midja/längd, könsspecifika risk- och träningsvägar, veckovolym, vaneföljsamhet, styrka, återhämtning och konkreta matbyten. Kylskåpsbyggaren gör appen mer praktisk än en vanlig matlogg: användaren kan scanna kylskåpet med mobilkameran, lägga till råvaruförslag och få gram, kcal, protein, kolhydrater, fett, fiber och coachens justeringar direkt. Visceral Score 2.0 visar både totalsignal och svagaste länk, så användaren får ett beslut i stället för ännu en översiktspanel. All data sparas lokalt i PWA:n, så användaren får en privat coach utan konto hos en extern tjänst.

Konkurrentanalysen visar att stora appar ofta är starka på loggning, matdatabaser, AI-inmatning eller stora träningsbibliotek. Vår kant är ett smalare och skarpare system för bukfett: midja/längd, gram-baserad kost, kylskåpsmåltider, 14-dagars sprint, lokalt dataskydd, könsprotokoll och träningsbeslut som följer midjetrenden. För gymkedjor blir appen en komplett medlemsyta där bokning och kommunikation styrs av faktisk hälsodata, inte bara av ett passchema.

## Kör lokalt

Öppna `index.html` direkt i webbläsaren.

PWA-funktioner som service worker och installation testas bäst via den deployade HTTPS-versionen.

## AI-vision och köks-AI

Kylskåpsscannen, Matfoto-AI och köks-AI:n fungerar med smart lokal fallback utan nyckel. Med `OPENAI_API_KEY` aktivt i Vercel får scannen AI Quality v2 via OpenAI. Med `GEMINI_API_KEY` aktivt får samma flöden Gemini som fallback eller testmotor: flera kylskåpsbilder, bildkvalitet, säkra/osäkra fynd, matfoto med kcal/makro och friare Köks-AI-resonemang. Matfoto-AI kan uppskatta näringsvärde från en tallriksbild och skicka kcal/makro-underlaget vidare till Köks-AI. Köks-AI kan därefter skapa måltidsförslag, resonera om vad som saknas och bygga en inköpsplan i gram. Receptstudion arbetar ovanpå samma råvarubank och visar Chefens val först, inklusive matchprocent, Receptscore 2.0, gram, kcal, protein, kolhydrater, fett, fiber, saknade ingredienser, smarta byten, smakprofil, mise en place, kocktips, kockläge steg-för-steg, inköpslista för saknade receptvaror och knapp för att fråga kocken i Köks-AI. Min vecka använder samma motor för att göra 7-dagars meny, prep-plan och aggregerad inköpslista i gram för 1-4 portioner. Receptimporten använder `/api/recipe-search` för att hämta riktiga recept via TheMealDB, visa bild och källänk, mappa engelska råvaror till svenska gramvaror och skapa en egen Visceral Plan-version utan att hårdkoda skyddad recepttext i appen. Livsmedelsverket-lagret använder `/api/food-search` för API-info, svensk livsmedelssökning och näringsvärden per 100 g ätbar del när datakällan returnerar poster.

Kylskåpsscannen mappar även vanliga svenska kylskåpsord och förpackningstext till appens råvaru-id, till exempel mjölk, ost, skinka, kalkonpålägg, skyr, proteinpudding, sallad, lök, citron, blåbär och jordgubbar. Osäkra kategoriträffar läggs hellre som kontrollerbara förslag än att försvinna helt.

För riktig bildanalys och friare AI-resonemang i produktion: lägg till en giltig `OPENAI_API_KEY` eller `GEMINI_API_KEY` i Vercel. OpenAI används först när den fungerar, därefter Gemini. Valfritt kan `OPENAI_FRIDGE_MODEL`, `OPENAI_MEAL_MODEL`, `OPENAI_KITCHEN_MODEL`, `GEMINI_MODEL`, `GEMINI_FRIDGE_MODEL`, `GEMINI_MEAL_MODEL` och `GEMINI_KITCHEN_MODEL` sättas för att byta modell. Standard för Gemini är `gemini-3.1-flash-lite` för att hålla gratis-/testläget lättare och mindre känsligt för hög belastning.

Valfritt för receptimport: sätt `THEMEALDB_API_KEY` i Vercel om appen ska använda en egen supporter-nyckel. Utan variabel används TheMealDB:s publika testnyckel för enkel sökning.

## Databas och admin

Appen har server-API för PostgreSQL via `DATABASE_URL`. Sätt dessa miljövariabler i Vercel:

- `DATABASE_URL`: Postgres/Neon/Vercel Postgres connection string.
- `ADMIN_BOOTSTRAP_SECRET`: hemlighet som krävs för första super admin.
- `SUPER_ADMIN_EMAIL`: valfri, annars används `micke@ccorebro.se`.

Skapa databastabeller och super admin genom att posta till:

```bash
curl -X POST https://visceral-plan.vercel.app/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: DIN_HEMLIGHET" \
  -d '{"email":"micke@ccorebro.se","name":"Micke","pin":"VALFRI_PIN_MINST_6_TECKEN"}'
```

Efter bootstrap kan super admin logga in med e-post + PIN i appen. Adminfliken visas då automatiskt och kan skapa användare eller admins.

Vanliga medlemmar kan själva skapa konto i appens profilkort. Registrering går via `POST /api/auth/register`, skapar rollen `user` och loggar in användaren direkt med en serverbaserad kontoprofil.
