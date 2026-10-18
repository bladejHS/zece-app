# Vocea pe faze

Banca are 509 înregistrări: 254 fraze întregi și 255 cuvinte și numere (pentru „runda 3 din 5", vitezele, minutele).
Frazele care lipsesc se spun cu vocea telefonului (mai lent, ton mai jos), deci sesiunea merge oricum.

| Fază | Fraze | Lipsesc (cerute de sesiunea în 4 faze) |
|---|---|---|
| Activare | 17 | „shadow cu reacție", „sus", „jos" |
| Tehnică | 59 | „tehnică", „combinația strigată, apoi alegi ieșirea", „pas lateral", „eschivă" |
| Condiționare | 47 | — |
| Revenire | 36 | „respirație 4-4", „întinderi", „memorare", „spune din memorie ultimele trei combinații" |

## Concluzii

- Activarea și condiționarea sunt bine acoperite (încălzire, coardă, rotații, runde, ultimele 10 secunde, încurajări).
- Tehnica are toate combinațiile de pumni și picioare, dar nu și indicațiile noi de decizie („alegi ieșirea", „pas lateral").
- Revenirea are respirația și întinderile din cronometrele calme, dar nu și sarcina de memorare.
- Semnalele de reacție („sus", „jos") nu sunt înregistrate; „stânga" și „dreapta" sunt.
- Pentru a le înregistra: edge-tts `ro-RO-EmilNeural`, −12 % viteză, −8 Hz ton (ca restul băncii), apoi `node scripts/split-monolith.mjs` sau adăugate direct în `public/vox` + `src/data/vox-index.json`.

## Frazele pe faze

### Activare

„cardio ușor" · „coardă sau sărituri pe loc" · „gardă sus, respiră" · „lejer, înalțimea crește treptat" · „lovituri de picior, lejer" · „mobilizează coloana înainte de greutăți" · „pregătește-te" · „ritm ușor, pe vârfuri" · „rotații toracice în patru labe" · „rotații: gât, umeri, șolduri, glezne" · „shadow ușor" · „vocea e pornită. hai să ne antrenăm" · „warm up" · „începem! dă tot ce ai" · „încălzire" · „încălzire generală înainte de greutăți" · „încălzire pentru kickboxing"

### Tehnică

„apărare: blochezi sau eschivezi, apoi răspunzi" · „apărare: eschivă și răspuns" · „apărare: partenerul atacă, tu răspunzi" · „blochează, trei, doi, middle kick" · „blochează, unu, doi" · „cinci, doi, trei, doi" · „combinații terminate cu lovitură de picior" · „contre: răspunzi după fiecare lovitură primită" · „doar jab și mișcare" · „doi, trei" · „doi, trei, doi" · „doi, trei, doi, cinci, doi" · „doi, trei, middle kick" · „eschivă, doi, trei" · „eschivă, doi, trei, low kick" · „eschivă, trei, doi" · „garda sus: mâna din spate la bărbie" · „jab-ul primul: deschizi fiecare atac cu el" · „lovituri de picior: low și middle kick" · „low kick" · „low kick după combinație" · „low kick, doi, trei" · „low kick, doi, trei, high kick" · „lucru la corp și la cap, schimbă nivelul" · „lucru la corp: coboară nivelul" · „mișcare: lucrezi din unghiuri, nu pe loc" · „mișcare: unghiuri, nu sta în linie" · „o rundă cu jab-ul primul" · „revenire în gardă după fiecare combinație" · „teep" · „teep pentru distanță" · „teep, unu, doi" · „teep, unu, doi, trei, middle kick" · „trei, doi" · „trei, doi, trei" · „unu" · „unu, doi" · „unu, doi, cinci, doi" · „unu, doi, cinci, șase, trei, doi" · „unu, doi, high kick" · „unu, doi, low kick" · „unu, doi, trei" · „unu, doi, trei, doi" · „unu, doi, trei, doi, low kick" · „unu, doi, trei, doi, trei" · „unu, doi, trei, low kick" · „unu, doi, trei, patru" · „unu, doi, trei, patru, cinci, șase" · „unu, doi, unu" · „unu, doi, unu, doi, trei, doi" · „unu, middle kick" · „unu, unu" · „unu, unu, doi" · „unu, unu, doi, trei" · „unu, unu, doi, trei, șase" · „unu, șase" · „unu, șase, trei, doi" · „unu, șase, trei, doi, unu" · „unu, șase, trei, high kick"

### Condiționare

„ai trecut de jumătate! continuă" · „concentrare, hai" · „dă-i tare" · „fiecare secundă contează" · „gardă sus și dă-i" · „gata pauza" · „gata pauza! hai, următoarea serie" · „hai! arată ce poți" · „hai, arată ce poți" · „hai, la treabă" · „hai, poți" · „hai, ține ritmul" · „jumătate gata! hai, poți" · „jumătate! ține ritmul" · „mâinile sus, hai" · „numără rundele cu butonul mare" · „o rundă cu jab-ul primul" · „o rundă fără să rămâi la corzi" · „pauză" · „putere: fiecare lovitură cu intenție" · „respiră adânc, ai avut o rundă bună" · „ritm: schimbi viteza, nu doar puterea" · „runda unu din trei. gardă sus și dă-i" · „rundă bună! relaxează umerii" · „start la semnal" · „start! concentrare și dă-i" · „start! hai, poți" · „ultima rundă! dă tot ce ai" · „ultima rundă! termină puternic" · „ultima rundă, hai, totul acum" · „ultimele zece secunde! lovituri fără oprire" · „ultimul minut! hai, termină frumos" · „ultimul minut! ține-te tare" · „ultimul! dă tot ce ai" · „ultimul! termină puternic" · „ultimul! totul acum" · „ultimul, hai, încă puțin" · „viteză maximă, tehnică curată" · „viteză: lovituri scurte și rapide" · „viteză: lovituri scurte, revenire rapidă" · „vocea e pornită. hai să ne antrenăm" · „zece secunde! accelerează" · „zece secunde! dă tot" · „zece secunde! rezistă" · „începem! dă tot ce ai" · „încă zece secunde! hai" · „ține ritmul până la capăt"

### Revenire

„abdomen și fesieri strânși, respiră normal" · „ai terminat! bravo, asta a fost muncă serioasă" · „antebrațele pe tocul ușii, la nivelul umerilor; pas înainte până simți întinderea" · „antrenament terminat" · „antrenament terminat! ai muncit din greu azi. bravo" · „antrenament terminat! disciplina ta face diferența. bravo" · „bine, respiră" · „bravo! bea apă și respiră" · „bravo! respiră adânc" · „bravo! revino în gardă" · „bravo, aer" · „cool down" · „excelent! respiră pe nas, recuperează-te" · „expiră" · „foarte bine! respiră" · „foarte bine! respiră și recuperează-te" · „gardă sus, respiră" · „gata! ai fost excelent. bravo" · „gata! încă un antrenament bifat. felicitări" · „inspiră" · „jumătate gata! hai, poți" · „pisică–cămilă" · „porumbelul" · „poziția copilului" · „prima: pisică–cămilă" · „record nou! bravo, asta e progres" · „respirație pe burtă" · „respiră" · „respiră adânc, ai avut o rundă bună" · „rundă bună! relaxează umerii" · „răcire" · „super treabă! relaxează umerii" · „ușor, cât să-ți revină respirația" · „în genunchi, brațele întinse mult înainte, șoldurile spre călcâie: se întinde dorsalul" · „în patru labe: rotunjește și arcuiește spatele, lent, după respirație" · „țintă atinsă! bravo, ai reușit"

