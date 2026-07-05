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
- Mobilkamerascan av kylskåp med AI-förslag via Vercel API och lokal fallback när AI-nyckel saknas.
- Köks-AI som kan resonera med användaren om scannade råvaror, valda livsmedel, måltidsmål, protein, fiber, lunchlådor och smarta kompletteringar.
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

Kylskåpsscannen och köks-AI:n fungerar med smart lokal fallback utan nyckel. För riktig bildanalys och friare AI-resonemang i produktion: lägg till `OPENAI_API_KEY` i Vercel. Valfritt kan `OPENAI_FRIDGE_MODEL` och `OPENAI_KITCHEN_MODEL` sättas för att byta modell.

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
