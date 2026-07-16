'use strict';

/* =========================================================================
   NIKOMU NEVĚŘ — script.js
   Kompletní herní logika party hry Nikomu Nevěř (mechanika Impostora).
   Žádné závislosti, žádný backend — vše běží čistě v prohlížeči.

   Obsah souboru:
   1. DATA — předdefinovaná témata (min. 50 slov v každém)
   2. STORAGE — práce s LocalStorage (vlastní témata, poslední nastavení)
   3. STATE — globální stav hry
   4. UTILITY funkce
   5. RENDER funkce — vykreslování jednotlivých obrazovek
   6. GAME LOGIC — spuštění hry, odhalování rolí, konec hry
   7. THEME MANAGER — správa vlastních témat, import/export
   8. EVENT LISTENERS — propojení UI s logikou
   9. INIT — spuštění aplikace
   ========================================================================= */


/* =========================================================================
   1. DATA — vestavěná témata
   ========================================================================= */

// Ploché pole { category, subcategory, words[] } — snadno rozšiřitelné
// o stovky dalších záznamů, stačí přidat nový řádek.
const TOPIC_DATA = [
  { category: "Filmy a seriály", subcategory: "Horory", words: ["Vřískot", "To", "Vetřelec", "Halloween", "Osvícení", "Exorcista", "Babadook", "Saw", "Paranormal Activity", "Sinister", "Vyvolávání", "Annabelle", "Kruh", "Noční můra v Elm Street", "Chucky", "Hostel", "Čarodějnice", "Uteč", "Insidious", "Predátor", "It Follows", "Hřbitov zviřátek"] },
  { category: "Filmy a seriály", subcategory: "Komedie", words: ["Kevin sám doma", "Paní Doubtfireová", "Ace Ventura", "Austin Powers", "Borat", "Pařba", "Kruťák", "40 let panic", "Družičky", "Jumanji", "Santa Claus Junior", "Grinch", "Mr. Bean", "Shrek", "Volný den", "Blbý a blbější", "Zoolander", "Pretty Woman", "Notting Hill", "Deník Bridget Jonesové", "Já, padouch", "Sousedi"] },
  { category: "Filmy a seriály", subcategory: "Akční filmy", words: ["Rychle a zběsile", "Terminátor", "Rocky", "Rambo", "Smrtonosná past", "James Bond", "Mission: Impossible", "Matrix", "John Wick", "Gladiátor", "Mad Max", "Transformers", "Bourneova identita", "Top Gun", "Nezničitelní", "Kingsman", "Únos", "Špatní hoši", "300", "Bod zlomu", "Rychlost", "Skála"] },
  { category: "Filmy a seriály", subcategory: "Animované filmy", words: ["Shrek", "Doba ledová", "Kung Fu Panda", "Madagaskar", "Trollové", "Zpívej", "Croodsovi", "Ferdinand", "Kocour v botách", "Rio", "Lego příběh", "Hotel Transylvánie", "Mimoni", "Já, padouch", "Alvin a Chipmunkové", "Ovečka Shaun", "Wallace a Gromit", "Coraline", "Krtek", "Pat a Mat", "Angry Birds ve filmu", "Rango"] },
  { category: "Filmy a seriály", subcategory: "Disney", words: ["Sněhurka", "Popelka", "Šípková Růženka", "Malá mořská víla", "Kráska a zvíře", "Aladin", "Král lev", "Mulan", "Pocahontas", "Hrbáč z Notre Dame", "Herkules", "Tarzan", "Lilo a Stitch", "Zootropolis", "Ledové království", "Vaiana", "Bambi", "Dumbo", "Kniha džunglí", "Alenka v říši divů", "Petr Pan", "Pinocchio", "101 dalmatinů", "Na vlásku"] },
  { category: "Filmy a seriály", subcategory: "Pixar", words: ["Toy Story", "Hledá se Nemo", "Hledá se Dory", "Auta", "Auta 2", "Příšerky s.r.o.", "Univerzita pro příšerky", "Ratatouille", "Vzhůru do oblak", "Coco", "V hlavě", "Duše", "Luca", "Wall-E", "Dobrý dinosaurus", "Dál", "Živly", "Úžasňákovi", "Úžasňákovi 2", "Brave"] },
  { category: "Filmy a seriály", subcategory: "Marvel", words: ["Iron Man", "Kapitán Amerika", "Thor", "Hulk", "Spider-Man", "Avengers", "Black Panther", "Doctor Strange", "Strážci Galaxie", "Ant-Man", "Captain Marvel", "Black Widow", "Deadpool", "Wolverine", "X-Men", "Loki", "Thanos", "Nick Fury", "Scarlet Witch", "Groot", "Zimní voják", "Falcon"] },
  { category: "Filmy a seriály", subcategory: "DC", words: ["Batman", "Superman", "Wonder Woman", "Joker", "Aquaman", "Flash", "Green Lantern", "Liga spravedlnosti", "Sebevražedný oddíl", "Harley Quinn", "Catwoman", "Robin", "Lex Luthor", "Shazam", "Green Arrow", "Cyborg", "Poison Ivy", "Bane", "Tučňák", "Hádankář", "Dvojtvář", "Batgirl"] },
  { category: "Filmy a seriály", subcategory: "Harry Potter", words: ["Harry Potter", "Ron Weasley", "Hermiona Grangerová", "Brumbál", "Severus Snape", "Voldemort", "Hagrid", "Draco Malfoy", "Bradavice", "Nebelvír", "Zmijozel", "Havraspár", "Mrzimor", "Bezová hůlka", "Fénixův řád", "Tajemná komnata", "Kámen mudrců", "Famfrpál", "Neville Longbottom", "Luna Lovegoodová", "Sirius Black", "Mozkomor", "Zlatonka"] },
  { category: "Filmy a seriály", subcategory: "Star Wars", words: ["Luke Skywalker", "Darth Vader", "Princezna Leia", "Han Solo", "Yoda", "Obi-Wan Kenobi", "Chewbacca", "R2-D2", "C-3PO", "Palpatine", "Anakin Skywalker", "Padmé Amidala", "Kylo Ren", "Rey", "Finn", "Boba Fett", "Mandalorian", "Jabba the Hutt", "Sokol Millennium", "Síla", "Jedi", "Sith", "Hvězda smrti", "Grogu"] },
  { category: "Filmy a seriály", subcategory: "České filmy", words: ["Kolja", "Pelíšky", "Vesničko má středisková", "Samotáři", "Musíme si pomáhat", "Obecná škola", "Postřižiny", "Slunce, seno, jahody", "Kouř", "Knoflíkáři", "Šakalí léta", "Účastníci zájezdu", "Vratné lahve", "Tmavomodrý svět", "Báthory", "Habermannův mlýn", "Občanský průkaz", "S tebou mě baví svět", "Hoří, má panenko", "Ostře sledované vlaky", "Limonádový Joe", "Kajínek", "Anthropoid", "Bába z ledu"] },
  { category: "Filmy a seriály", subcategory: "České pohádky", words: ["Tři oříšky pro Popelku", "Mrazík", "Pyšná princezna", "Zlatovláska", "Sůl nad zlato", "Princ a Večernice", "Byl jednou jeden král", "Krakonoš", "Šíleně smutná princezna", "Anděl Páně", "S čerty nejsou žerty", "Princezna ze mlejna", "Panna a netvor", "O princezně Jasněnce a létajícím ševci", "Lotrando a Zubejda", "Čertova nevěsta", "Z pekla štěstí", "Dařbuján a Pandrhola", "Tajemství staré bambitky", "Nejkrásnější hádanka", "Tři veteráni", "Sedmero krkavců", "O perníkové chaloupce"] },
  { category: "Filmy a seriály", subcategory: "Sci-fi", words: ["Star Trek", "Blade Runner", "Interstellar", "Gravitace", "Marťan", "Duna", "Zpátky do budoucnosti", "Den nezávislosti", "Já, robot", "Minority Report", "Total Recall", "Robocop", "District 9", "Elysium", "Pátý element", "Jurský park", "E.T. - Mimozemšťan", "Vetřelec", "Predátor", "Matrix", "Terminátor", "Avatar", "Časostroj"] },
  { category: "Filmy a seriály", subcategory: "Fantasy", words: ["Pán prstenů", "Hobit", "Letopisy Narnie", "Percy Jackson", "Labyrint", "Maleficent", "Zlatý kompas", "Merlin", "Excalibur", "Willow", "Praktická magie", "Čaroděj ze země Oz", "Eragon", "Mortal Engines", "Zaklínač", "Harry Potter", "Shrek", "Alenka v říši divů", "Duna", "Warcraft", "Pipi Dlouhá punčocha", "Nekonečný příběh"] },
  { category: "Filmy a seriály", subcategory: "Kriminálky", words: ["CSI", "Sherlock Holmes", "Hercule Poirot", "Kobra 11", "Kriminálka Anděl", "Columbo", "Vraždy v Midsomeru", "Mentalista", "Dexter", "Zákon a pořádek", "True Detective", "Sedm", "Podezřelí", "Ostrov Shutter", "Mlčení jehňátek", "Zodiac", "Kmotr", "Historky z podsvětí", "Dannyho parťáci", "Kriminálka Las Vegas", "Monk", "Bones"] },
  { category: "Filmy a seriály", subcategory: "Seriály", words: ["Přátelé", "Simpsonovi", "Hra o trůny", "Breaking Bad", "Kancelář", "Ordinace v růžové zahradě", "Ulice", "Doktor House", "Teorie velkého třesku", "Ztraceni", "Zoufalé manželky", "Sherlock", "Grimm", "Vikingové", "Suits", "Prison Break", "Jak jsem poznal vaši matku", "Moderní rodina", "Peaky Blinders", "Chirurgové", "Rick a Morty", "South Park"] },
  { category: "Filmy a seriály", subcategory: "Netflix seriály", words: ["Stranger Things", "Hra na oliheň", "Dark", "Zaklínač", "Bridgertonovi", "Wednesdayová", "Papírový dům", "Sex Education", "Koruna", "Akademie Deštník", "Orange Is the New Black", "Narcos", "Ty", "Elita", "Ozark", "Třináct důvodů", "Emily v Paříži", "Cobra Kai", "Lupin", "Black Mirror", "Peaky Blinders", "Sabrina"] },
  { category: "Jídlo", subcategory: "Česká jídla", words: ["Svíčková", "Guláš", "Vepřo knedlo zelo", "Řízek", "Bramborák", "Knedlíky", "Kuře na paprice", "Segedínský guláš", "Halušky", "Škubánky", "Ovocné knedlíky", "Smažený sýr", "Tatarák", "Zelňačka", "Bramboračka", "Čočka na kyselo", "Jitrnice", "Tlačenka", "Utopenci", "Vepřová pečeně", "Kulajda", "Rajská omáčka"] },
  { category: "Jídlo", subcategory: "Fast food", words: ["Hranolky", "Hamburger", "Cheeseburger", "Hot dog", "Pizza", "Kebab", "Nugetky", "Wrap", "Sendvič", "Tortilla", "Donut", "Popcorn kuře", "Gyros", "Burrito", "Nachos", "Cibulové kroužky", "Milkshake", "Kola", "Chicken burger", "Quesadilla", "Panini", "Toast"] },
  { category: "Jídlo", subcategory: "Sladkosti", words: ["Čokoláda", "Zmrzlina", "Koláč", "Buchty", "Štrůdl", "Perník", "Bonbony", "Lízátko", "Žvýkačka", "Sušenky", "Dort", "Trdelník", "Rakvička", "Větrník", "Karlovarský dort", "Marcipán", "Nugát", "Lentilky", "Želé bonbony", "Pudink", "Palačinky", "Croissant"] },
  { category: "Jídlo", subcategory: "Ovoce", words: ["Jablko", "Hruška", "Banán", "Pomeranč", "Citron", "Jahoda", "Malina", "Borůvka", "Meruňka", "Broskev", "Švestka", "Třešeň", "Višeň", "Hroznové víno", "Meloun", "Ananas", "Kiwi", "Mango", "Grapefruit", "Rybíz", "Angrešt", "Fík"] },
  { category: "Jídlo", subcategory: "Zelenina", words: ["Rajče", "Okurka", "Mrkev", "Brambora", "Cibule", "Česnek", "Paprika", "Zelí", "Květák", "Brokolice", "Špenát", "Salát", "Ředkvička", "Cuketa", "Lilek", "Celer", "Petržel", "Kukuřice", "Hrášek", "Fazole", "Dýně", "Chřest"] },
  { category: "Jídlo", subcategory: "Nápoje", words: ["Voda", "Limonáda", "Kola", "Čaj", "Káva", "Džus", "Mléko", "Pivo", "Víno", "Kakao", "Malinovka", "Ledový čaj", "Minerálka", "Energetický nápoj", "Smoothie", "Sirup", "Grog", "Svařák", "Mošt", "Citronáda", "Perlivá voda", "Ledová káva"] },
  { category: "Jídlo", subcategory: "Snídaně", words: ["Vejce", "Míchaná vejce", "Volské oko", "Toast", "Rohlík", "Houska", "Máslo", "Džem", "Med", "Müsli", "Ovesná kaše", "Jogurt", "Slanina", "Párek", "Palačinky", "Lívance", "Chleba se sýrem", "Chleba se salámem", "Croissant", "Cereálie", "Tvarohová pomazánka", "Vajíčková pomazánka"] },
  { category: "Jídlo", subcategory: "Večeře", words: ["Řízek s bramborem", "Špagety", "Pizza", "Guláš", "Zapečené brambory", "Rizoto", "Grilované kuře", "Zeleninový salát", "Polévka", "Bramborový salát", "Losos", "Steak", "Kuřecí prsa", "Omeleta", "Sýrový talíř", "Chlebíčky", "Obložený talíř", "Pečené brambory", "Dušená zelenina", "Rybí filé", "Kuřecí špíz", "Zapékané těstoviny"] },
  { category: "Jídlo", subcategory: "Jídla z celého světa", words: ["Paella", "Curry", "Falafel", "Hummus", "Tacos", "Burrito", "Ratatouille", "Chili con carne", "Moussaka", "Ćevapčići", "Pad thai", "Sushi", "Ramen", "Tapas", "Wiener schnitzel", "Boršč", "Pierogi", "Baklava", "Empanada", "Ceviche", "Shawarma", "Gyros"] },
  { category: "Jídlo", subcategory: "Asijská kuchyně", words: ["Sushi", "Ramen", "Pad thai", "Jarní závitky", "Dim sum", "Kung pao kuře", "Samosa", "Pho", "Kimchi", "Sashimi", "Tempura", "Yakitori", "Bibimbap", "Wonton polévka", "Rýžové nudle", "Miso polévka", "Teriyaki kuře", "Gyoza", "Nigiri", "Thajské kari", "Satay", "Pekingská kachna"] },
  { category: "Jídlo", subcategory: "Italská kuchyně", words: ["Pizza", "Špagety", "Lasagne", "Rizoto", "Carbonara", "Gnocchi", "Tiramisu", "Pesto", "Caprese", "Parmazán", "Prosciutto", "Ravioli", "Focaccia", "Bruschetta", "Panna cotta", "Minestrone", "Mozzarella", "Panini", "Cannoli", "Salsiccia", "Ossobuco", "Antipasti"] },
  { category: "Jídlo", subcategory: "Táborová jídla", words: ["Buřty", "Špekáčky", "Guláš z kotlíku", "Toustový chleba", "Chleba s máslem", "Čaj z kotlíku", "Placky na ohni", "Bramboráky na ohni", "Marshmallow na klacku", "Trhanec", "Konzervy", "Instantní polévka", "Kakao z hrnku", "Chleba se sádlem", "Uzené maso", "Grilovaná kukuřice", "Brambory v popelu", "Buřtguláš", "Opékaný chleba", "Salám", "Sušenky na cestu", "Ovocný čaj"] },
  { category: "Zvířata", subcategory: "Domácí mazlíčci", words: ["Pes", "Kočka", "Křeček", "Morče", "Králík", "Papoušek", "Andulka", "Kanárek", "Zlatá rybka", "Želva", "Fretka", "Činčila", "Had", "Ještěrka", "Pískomil", "Myš", "Potkan", "Osel", "Kůň", "Poník", "Holub", "Slepice"] },
  { category: "Zvířata", subcategory: "Lesní zvířata", words: ["Liška", "Jelen", "Srnec", "Vlk", "Medvěd", "Divoké prase", "Zajíc", "Veverka", "Jezevec", "Rys", "Los", "Kuna", "Ježek", "Sova", "Datel", "Kanec", "Daněk", "Tchoř", "Vydra", "Bobr", "Krtek", "Netopýr"] },
  { category: "Zvířata", subcategory: "Mořská zvířata", words: ["Žralok", "Delfín", "Velryba", "Chobotnice", "Krab", "Humr", "Medúza", "Rejnok", "Tuleň", "Mořský koník", "Kosatka", "Sépie", "Hvězdice", "Ježovka", "Garnát", "Losos", "Tuňák", "Mrož", "Manta", "Treska", "Úhoř", "Plachetník"] },
  { category: "Zvířata", subcategory: "Nebezpečná zvířata", words: ["Krokodýl", "Lev", "Tygr", "Kobra", "Škorpion", "Černá vdova", "Aligátor", "Hyena", "Nosorožec", "Hroch", "Grizzly", "Bílý žralok", "Chřestýš", "Piraňa", "Sršeň", "Medúza", "Leopard", "Gepard", "Vlk", "Rosomák", "Medvěd", "Buvol"] },
  { category: "Zvířata", subcategory: "Hmyz", words: ["Včela", "Vosa", "Mravenec", "Moucha", "Komár", "Motýl", "Beruška", "Cvrček", "Kobylka", "Saranče", "Vážka", "Brouk", "Roháč", "Sršeň", "Mšice", "Můra", "Škvor", "Střevlík", "Světluška", "Termit", "Kudlanka", "Mandelinka"] },
  { category: "Zvířata", subcategory: "Ptáci", words: ["Vrabec", "Holub", "Kos", "Sýkora", "Vrána", "Havran", "Straka", "Orel", "Sokol", "Sova", "Datel", "Labuť", "Kachna", "Husa", "Čáp", "Volavka", "Rorýs", "Vlaštovka", "Tučňák", "Pštros", "Kolibřík", "Páv"] },
  { category: "Zvířata", subcategory: "Dinosauři", words: ["Tyranosaurus", "Triceratops", "Brontosaurus", "Diplodokus", "Stegosaurus", "Velociraptor", "Pteranodon", "Spinosaurus", "Ankylosaurus", "Brachiosaurus", "Allosaurus", "Iguanodon", "Parasaurolophus", "Compsognathus", "Archeopteryx", "Plesiosaurus", "Mosasaurus", "Dilophosaurus", "Carnotaurus", "Pachycephalosaurus", "Therizinosaurus", "Gallimimus"] },
  { category: "Zvířata", subcategory: "Fantazijní zvířata", words: ["Drak", "Jednorožec", "Fénix", "Kentaur", "Gryf", "Mořská panna", "Yeti", "Vlkodlak", "Chiméra", "Pegas", "Hydra", "Bazilišek", "Sfinga", "Minotaurus", "Kraken", "Vodník", "Rusalka", "Permoník", "Trol", "Obr", "Skřítek", "Bludička"] },
  { category: "Místa", subcategory: "Česká města", words: ["Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "České Budějovice", "Hradec Králové", "Ústí nad Labem", "Pardubice", "Zlín", "Karlovy Vary", "Jihlava", "Teplice", "Děčín", "Chomutov", "Karviná", "Most", "Opava", "Kladno", "Mladá Boleslav", "Prostějov", "Znojmo", "Trutnov"] },
  { category: "Místa", subcategory: "Evropská města", words: ["Londýn", "Paříž", "Berlín", "Řím", "Madrid", "Vídeň", "Amsterdam", "Brusel", "Lisabon", "Varšava", "Budapešť", "Bratislava", "Atény", "Dublin", "Stockholm", "Oslo", "Helsinky", "Kodaň", "Mnichov", "Barcelona", "Benátky", "Florencie", "Krakov", "Curych", "Ženeva"] },
  { category: "Místa", subcategory: "Světová města", words: ["New York", "Tokio", "Los Angeles", "Peking", "Šanghaj", "Soul", "Sydney", "Dubaj", "Singapur", "Toronto", "Rio de Janeiro", "Buenos Aires", "Mexico City", "Bangkok", "Hongkong", "Istanbul", "Moskva", "Kapské Město", "Káhira", "Bombaj", "Chicago", "San Francisco", "Miami", "Las Vegas", "Havana"] },
  { category: "Místa", subcategory: "Státy", words: ["Česko", "Slovensko", "Německo", "Rakousko", "Polsko", "Francie", "Itálie", "Španělsko", "Portugalsko", "Řecko", "Velká Británie", "Irsko", "Nizozemsko", "Belgie", "Švýcarsko", "Švédsko", "Norsko", "Finsko", "Rusko", "Ukrajina", "Turecko", "Egypt", "Brazílie", "Kanada", "Japonsko"] },
  { category: "Místa", subcategory: "Památky", words: ["Eiffelova věž", "Big Ben", "Koloseum", "Socha svobody", "Čínská zeď", "Tádž Mahal", "Pyramidy v Gíze", "Stonehenge", "Akropolis", "Sagrada Familia", "Šikmá věž v Pise", "Braniborská brána", "Karlův most", "Petřínská rozhledna", "Pražský orloj", "Chrám svatého Víta", "Vyšehrad", "Sochy Moai", "Machu Picchu", "Niagarské vodopády", "Bílý dům", "Kremlin"] },
  { category: "Místa", subcategory: "Hrady a zámky", words: ["Karlštejn", "Český Krumlov", "Konopiště", "Hluboká nad Vltavou", "Křivoklát", "Zvíkov", "Pernštejn", "Bouzov", "Lednice", "Kroměříž", "Loket", "Švihov", "Kost", "Sychrov", "Buchlov", "Rožmberk", "Orlík", "Točník", "Zbiroh", "Frýdlant", "Windsor", "Versailles", "Neuschwanstein", "Chambord"] },
  { category: "Místa", subcategory: "Hory", words: ["Sněžka", "Praděd", "Ještěd", "Lysá hora", "Radhošť", "Mont Blanc", "Matterhorn", "Everest", "K2", "Kilimandžáro", "Fudžisan", "Vesuv", "Etna", "Elbrus", "Aconcagua", "Denali", "Triglav", "Rysy", "Sněžník", "Klínovec", "Milešovka", "Blaník", "Boubín"] },
  { category: "Místa", subcategory: "Ostrovy", words: ["Kréta", "Rhodos", "Kypr", "Sicílie", "Sardinie", "Korsika", "Mallorca", "Ibiza", "Malta", "Island", "Grónsko", "Madagaskar", "Bali", "Havaj", "Kuba", "Jamajka", "Srí Lanka", "Tchaj-wan", "Seychely", "Maledivy", "Kanárské ostrovy", "Galapágy", "Zanzibar"] },
  { category: "Místa", subcategory: "Místa z filmů", words: ["Bradavice", "Mordor", "Hobitín", "Roklinka", "Narnie", "Wakanda", "Gotham City", "Metropolis", "Asgard", "Oz", "Pandora", "Zion", "Jurský park", "Zootropolis", "Atlantida", "Krypton", "Camelot", "Transylvánie", "Casablanca", "Země Nezemě", "Říše divů", "Prasinky"] },
  { category: "Lidé", subcategory: "Slavní Češi", words: ["Karel Čapek", "Jaroslav Hašek", "Božena Němcová", "Antonín Dvořák", "Bedřich Smetana", "Jan Amos Komenský", "Gregor Mendel", "Jára Cimrman", "Milan Kundera", "Václav Havel", "Jan Werich", "Miloš Forman", "Jaroslav Seifert", "Tomáš Baťa", "Alois Jirásek", "Zdeněk Miler", "Ema Destinnová", "Vlasta Burian", "Bohuslav Martinů", "Franz Kafka", "Leoš Mareš"] },
  { category: "Lidé", subcategory: "Herci", words: ["Jiří Macháček", "Ivan Trojan", "Karel Roden", "Jiřina Bohdalová", "Bolek Polívka", "Oldřich Kaiser", "Jiří Lábus", "Jan Kraus", "Anna Geislerová", "Miroslav Donutil", "Zdeněk Svěrák", "Leonardo DiCaprio", "Brad Pitt", "Tom Hanks", "Johnny Depp", "Angelina Jolie", "Will Smith", "Robert Downey Jr.", "Scarlett Johansson", "Keanu Reeves", "Morgan Freeman", "Denzel Washington"] },
  { category: "Lidé", subcategory: "Zpěváci", words: ["Karel Gott", "Helena Vondráčková", "Lucie Bílá", "Karel Kryl", "Marta Kubišová", "Václav Neckář", "Michal David", "Tomáš Klus", "Ewa Farna", "Xindl X", "Ben Cristovao", "Marek Ztracený", "Miroslav Žbirka", "Iveta Bartošová", "Petr Muk", "Dara Rolins", "Monika Bagárová", "Kali", "Celine Dion", "Michael Jackson", "Freddie Mercury", "Adele", "Elton John", "Whitney Houston"] },
  { category: "Lidé", subcategory: "Sportovci", words: ["Emil Zátopek", "Věra Čáslavská", "Jaromír Jágr", "Dominik Hašek", "Petra Kvitová", "Karolína Plíšková", "Kateřina Neumannová", "Gabriela Soukalová", "Martina Sáblíková", "Roman Šebrle", "Pavel Nedvěd", "Petr Čech", "Tomáš Berdych", "Ester Ledecká", "Ivan Lendl", "Martina Navrátilová", "Lionel Messi", "Cristiano Ronaldo", "Usain Bolt", "Jan Železný", "Adam Ondra", "Makhmud Muradov"] },
  { category: "Lidé", subcategory: "Youtubeři", words: ["Kovy", "GoGoManTV", "Viral Brothers", "Agraelus", "GEJMR", "Jirka Král", "HouseBox", "MenT", "HonestGuide", "Stejk", "FIZIstyle", "FattyPillow", "Wedry", "Jon Marianek", "SirYakari", "Hoggy", "AtiShow", "Expl0ited", "Tary", "PedrosGame"] },
  { category: "Lidé", subcategory: "Influenceři", words: ["David Dobrik", "Zuzana Light", "Lucia Javorčeková", "Rytmus", "Anna Šulcová", "Nikola Čechová", "Nikol Štíbrová", "Erik Meldik", "Andrea Fallenka", "Martina MOMA", "Dominika Mína", "Natálie Hrychová", "Tereza Hodanová", "Barbora Votíková", "Vladimír Kadlec", "Denis Kubík", "Silvie Mahdal", "Adam Kajumi"] },
  { category: "Lidé", subcategory: "Historické osobnosti", words: ["Jan Hus", "Jan Žižka", "Karel IV.", "Rudolf II.", "Přemysl Otakar II.", "Marie Terezie", "Napoleon Bonaparte", "Julius Caesar", "Kleopatra", "Alexandr Veliký", "Leonardo da Vinci", "Mikuláš Koperník", "Albert Einstein", "Isaac Newton", "Galileo Galilei", "Winston Churchill", "Johannes Gutenberg", "Marco Polo", "Kryštof Kolumbus", "Mahátma Gándhí"] },
  { category: "Lidé", subcategory: "Prezidenti", words: ["Tomáš Garrigue Masaryk", "Edvard Beneš", "Emil Hácha", "Klement Gottwald", "Antonín Zápotocký", "Antonín Novotný", "Ludvík Svoboda", "Gustáv Husák", "Václav Havel", "Václav Klaus", "Miloš Zeman", "Petr Pavel", "George Washington", "Abraham Lincoln", "Thomas Jefferson", "John F. Kennedy", "Barack Obama", "Nelson Mandela", "Franklin D. Roosevelt", "Charles de Gaulle"] },
  { category: "Lidé", subcategory: "Fiktivní postavy", words: ["Harry Potter", "Sherlock Holmes", "Frodo Pytlík", "Gandalf", "Batman", "Superman", "Spider-Man", "James Bond", "Sněhurka", "Popelka", "Shrek", "Mickey Mouse", "Darth Vader", "Yoda", "Medvídek Pú", "Pinocchio", "Rumcajs", "Krtek", "Ferda Mravenec", "Homer Simpson", "Jack Sparrow", "Indiana Jones"] },
  { category: "Hry", subcategory: "PC hry", words: ["Minecraft", "Counter-Strike", "League of Legends", "World of Warcraft", "Fortnite", "Valorant", "Dota 2", "StarCraft", "Diablo", "Skyrim", "Warcraft", "Overwatch", "GTA", "Sims", "Half-Life", "Portal", "Stardew Valley", "Among Us", "Terraria", "Cyberpunk 2077", "Zaklínač", "Rocket League"] },
  { category: "Hry", subcategory: "Konzolové hry", words: ["God of War", "Halo", "Uncharted", "The Last of Us", "Spider-Man", "Horizon Zero Dawn", "Red Dead Redemption", "FIFA", "Call of Duty", "Assassin's Creed", "Gran Turismo", "Crash Bandicoot", "Sonic", "Tekken", "Street Fighter", "Mortal Kombat", "Resident Evil", "Final Fantasy", "Kingdom Hearts", "Bloodborne", "Elden Ring", "Dark Souls"] },
  { category: "Hry", subcategory: "Mobilní hry", words: ["Candy Crush", "Clash of Clans", "Clash Royale", "Angry Birds", "Subway Surfers", "Temple Run", "PUBG Mobile", "Brawl Stars", "Genshin Impact", "Pokémon GO", "Fruit Ninja", "Flappy Bird", "Plants vs. Zombies", "2048", "Doodle Jump", "Hay Day", "Township", "Coin Master", "My Talking Tom", "Piano Tiles", "Slither.io", "Farmville"] },
  { category: "Hry", subcategory: "Minecraft", words: ["Creeper", "Ender Drak", "Steve", "Alex", "Zombie", "Kostlivec", "Diamant", "Smaragd", "Zlato", "Železo", "Redstone", "Netherit", "Enderman", "Wither", "Piglin", "Vesničan", "Kráva", "Prase", "Ovce", "TNT", "Krumpáč", "Meč", "Nether", "Pevnost"] },
  { category: "Hry", subcategory: "Fortnite", words: ["Battle Bus", "V-Bucks", "Bouře", "Truhla", "Lama", "Sniper", "Brokovnice", "Budování", "Skin", "Battle Pass", "Victory Royale", "Peely", "Jonesy", "Tilted Towers", "Kluzák", "Krumpáč", "Štít", "Emote", "Rampa", "Granát"] },
  { category: "Hry", subcategory: "Roblox", words: ["Robux", "Avatar", "Adopt Me", "Brookhaven", "Blox Fruits", "Piggy", "MeepCity", "Jailbreak", "Bloxburg", "Tower of Hell", "Murder Mystery", "Obby", "Noob", "Studio", "Doors", "Arsenal", "Royale High", "Da Hood", "Pet Simulator", "Shindo Life", "Natural Disaster Survival", "Work at a Pizza Place"] },
  { category: "Hry", subcategory: "Pokémon", words: ["Pikachu", "Charizard", "Bulbasaur", "Squirtle", "Mewtwo", "Mew", "Eevee", "Snorlax", "Jigglypuff", "Gengar", "Dragonite", "Gyarados", "Lucario", "Greninja", "Blastoise", "Venusaur", "Psyduck", "Machamp", "Alakazam", "Onix", "Magikarp", "Ditto", "Charmander", "Pidgey"] },
  { category: "Hry", subcategory: "Nintendo", words: ["Mario", "Luigi", "Zelda", "Link", "Kirby", "Donkey Kong", "Yoshi", "Peach", "Bowser", "Samus", "Fox McCloud", "Wario", "Toad", "Metroid", "Splatoon", "Animal Crossing", "Ness", "Falco", "Rosalina", "Waluigi", "Ganon", "Koopa"] },
  { category: "Hry", subcategory: "Retro hry", words: ["Pac-Man", "Tetris", "Super Mario Bros", "Space Invaders", "Asteroids", "Pong", "Frogger", "Duck Hunt", "Contra", "Mega Man", "Sonic the Hedgehog", "Street Fighter II", "Double Dragon", "Bomberman", "Galaga", "Q*bert", "Dig Dug", "Prince of Persia", "Doom", "Wolfenstein", "Commander Keen", "Snake"] },
  { category: "Tábor", subcategory: "Táborové hry", words: ["Vybíjená", "Bacil", "Kapitáni", "Ovečky a vlci", "Přehazovaná", "Schovávaná", "Slepá bába", "Molekuly", "Honička", "Lovci a kořist", "Bombardovaná", "Sardinky", "Přetahovaná lanem", "Stopovaná", "Hledání pokladu", "Šifrovačka", "Bitva o vlajku", "Uzlování", "Střelba na plechovky", "Ringo"] },
  { category: "Tábor", subcategory: "Vybavení na tábor", words: ["Baterka", "Spacák", "Karimatka", "Repelent", "Opalovací krém", "Batoh", "Ešus", "Kapesní nůž", "Buzola", "Pláštěnka", "Gumáky", "Sluneční brýle", "Láhev na vodu", "Náhradní tričko", "Ručník", "Hygienické potřeby", "Deníček", "Tužka", "Mapa", "Píšťalka"] },
  { category: "Tábor", subcategory: "Věci v kufru", words: ["Ponožky", "Zubní kartáček", "Pyžamo", "Plavky", "Ručník", "Sluneční brýle", "Deníček", "Baterka", "Náhradní tričko", "Spodní prádlo", "Pastelky", "Fotoaparát", "Oblíbený plyšák", "Šátek", "Sandály", "Mikina", "Čepice", "Zubní pasta"] },
  { category: "Tábor", subcategory: "Věci v chatce", words: ["Palanda", "Peřina", "Polštář", "Svíčka", "Pavučina", "Komár", "Baterka", "Deka", "Skříňka", "Zrcátko", "Plyšák", "Fotka z domova", "Ztracená ponožka", "Pavouk", "Deník", "Kufr", "Kapesník", "Nástěnka"] },
  { category: "Tábor", subcategory: "Táborové hlášky", words: ["Budíček, vstávat!", "Večerka, spát!", "Nástup za pět minut!", "Kdo je poslední, uklízí!", "Táborák dohořívá!", "Hymna tábora!", "Vlajka jde nahoru!", "Oběd je hotovej!", "Sraz u vlajkového stožáru!", "Ticho na pokoji!", "Neběhej v jídelně!", "Dneska je koupání!", "Bojovka dnes večer!", "Kdo má stráž?", "Hlídka nastupuje!", "Poslední várka na oběd!", "Za soumraku do chatek!", "Kartáčky připravit!"] },
  { category: "Tábor", subcategory: "Aktivity", words: ["Bojovka", "Táborák", "Ranní rozcvička", "Koupání", "Turistika", "Diskotéka", "Karneval", "Olympiáda", "Vaření v kotlíku", "Stezka odvahy", "Vodácký výlet", "Malování na obličej", "Výtvarná dílna", "Noční hra", "Sportovní den", "Talentová show", "Opékání buřtů", "Celotáborová hra", "Soutěž o nejlepší chatku", "Hasičský útok"] },
  { category: "Tábor", subcategory: "Typy vedoucích", words: ["Ten co pořád zpívá", "Ten přísný", "Ten co má vždycky nápad", "Ten co nespí celou noc", "Ten sportovní typ", "Ten co vypráví strašidelné historky", "Ten věčně unavený", "Ten co miluje bojovky", "Ten kuchařský mág", "Ten co všechno fotí", "Hlavní vedoucí", "Ten co hraje na kytaru", "Ten co má oblíbence", "Ten co pořád píská", "Ten co dělá scénky", "Ten co nesnáší pavouky", "Ten co umí všechny uzly", "Ten co má vždycky dobrou náladu"] },
  { category: "Tábor", subcategory: "Výmluvy dětí", words: ["Bolí mě břicho", "Zapomněl jsem plavky doma", "Já za to nemůžu", "Ztratil jsem baterku", "Nejsem špinavý, jen opálený", "Deka je mokrá, nemůžu si ustlat", "Nechce se mi na rozcvičku", "To on mě donutil", "Nevím, kam jsem dal ponožky", "Bolí mě noha, nemůžu na výlet", "Já jsem nic neslyšel", "Zapomněl jsem si vzít prášky", "Nechutná mi špenát", "Ještě jsem nedojedl, počkejte", "Já jsem si jen odskočil", "Nestihl jsem se učesat", "Moje boty jsou ještě mokré", "Já jsem jen spal, nic jsem neviděl"] },
  { category: "Tábor", subcategory: "Táborové situace", words: ["Vytopená chatka", "Ztracené dítě v lese", "Vybité baterky ve svítilně", "Bitva vodou", "Pavouk v posteli", "Poplach kvůli medvědovi", "Rozbité brýle", "Zapomenutý spacák doma", "Zmoklá bojovka", "Přeplněná jídelna", "Štípanec od komára", "Spadlý stan", "Ztracený klíč od skladu", "Noční poplach", "Spálená kůže od sluníčka", "Rozsypaný guláš", "Rozbitý záchod", "Diskotéka přerušená bouřkou"] },
  { category: "Hudba", subcategory: "Čeští zpěváci", words: ["Karel Gott", "Helena Vondráčková", "Lucie Bílá", "Karel Kryl", "Petr Muk", "Petra Janů", "Michal David", "Marta Kubišová", "Václav Neckář", "Jiří Korn", "Ewa Farna", "Tomáš Klus", "Xindl X", "Ben Cristovao", "Marek Ztracený", "Mirai", "Anna K.", "Iveta Bartošová", "Daniel Landa", "Voxel", "David Koller", "Leona Machálková", "Monika Absolonová", "Tereza Kerndlová"] },
  { category: "Hudba", subcategory: "Zahraniční zpěváci", words: ["Michael Jackson", "Madonna", "Elvis Presley", "Whitney Houston", "Freddie Mercury", "Adele", "Beyoncé", "Rihanna", "Ed Sheeran", "Justin Bieber", "Elton John", "Stevie Wonder", "Prince", "David Bowie", "Mariah Carey", "Celine Dion", "Robbie Williams", "Bruno Mars", "Ariana Grande", "Taylor Swift", "Lady Gaga", "Shakira", "Bob Dylan", "Amy Winehouse"] },
  { category: "Hudba", subcategory: "Kapely", words: ["Kabát", "Kryštof", "Chinaski", "Lucie", "Support Lesbiens", "Mig 21", "Tři sestry", "Wohnout", "Divokej Bill", "No Name", "Queen", "Beatles", "Rolling Stones", "ABBA", "Nirvana", "Metallica", "AC/DC", "Pink Floyd", "U2", "Coldplay", "Iron Maiden", "Green Day", "Guns N' Roses", "Depeche Mode"] },
  { category: "Hudba", subcategory: "Rap", words: ["Rytmus", "Kali", "PSH", "James Cole", "Marpo", "Viktor Sheen", "Yzomandias", "Calin", "Hasan", "Ektor", "Rest", "Eminem", "Jay-Z", "Kanye West", "Snoop Dogg", "50 Cent", "Dr. Dre", "Tupac", "Drake", "Kendrick Lamar"] },
  { category: "Hudba", subcategory: "Pop", words: ["Madonna", "Britney Spears", "Justin Timberlake", "Ariana Grande", "Katy Perry", "Miley Cyrus", "Rihanna", "Beyoncé", "Lady Gaga", "Dua Lipa", "Ed Sheeran", "Bruno Mars", "Justin Bieber", "Taylor Swift", "Shakira", "Kylie Minogue", "Robbie Williams", "Spice Girls", "Backstreet Boys", "*NSYNC", "One Direction", "Harry Styles", "Selena Gomez", "Camila Cabello"] },
  { category: "Hudba", subcategory: "Rock", words: ["Queen", "Nirvana", "AC/DC", "Metallica", "Pink Floyd", "Led Zeppelin", "Guns N' Roses", "Iron Maiden", "Rolling Stones", "Beatles", "Deep Purple", "Black Sabbath", "Kiss", "Aerosmith", "Bon Jovi", "Van Halen", "Rammstein", "Linkin Park", "Red Hot Chili Peppers", "Foo Fighters", "Kabát", "Kryštof", "Lucie", "Chinaski"] },
  { category: "Hudba", subcategory: "Hudební nástroje", words: ["Kytara", "Klavír", "Housle", "Buben", "Trumpeta", "Flétna", "Saxofon", "Basová kytara", "Violoncello", "Harmonika", "Xylofon", "Klarinet", "Trombon", "Varhany", "Ukulele", "Harfa", "Cimbál", "Bicí", "Viola", "Kontrabas", "Mandolína", "Tuba", "Foukací harmonika", "Triangl"] },
  { category: "Hudba", subcategory: "Písničky", words: ["Bohemian Rhapsody", "Yesterday", "Imagine", "Thriller", "Billie Jean", "Hotel California", "Let It Be", "Despacito", "Shape of You", "Rolling in the Deep", "Someone Like You", "Hallelujah", "Wonderwall", "Smells Like Teen Spirit", "Sweet Child O' Mine", "Milionář", "Lady Carneval", "Modlitba pro Martu", "Emoce", "Malá dáma", "Voda živá", "Kávu si osladím", "Není nutno"] },
  { category: "Hudba", subcategory: "Eurovision", words: ["ABBA", "Céline Dion", "Conchita Wurst", "Loreen", "Måns Zelmerlöw", "Alexander Rybak", "Lena Meyer-Landrut", "Duncan Laurence", "Salvador Sobral", "Netta", "Kalush Orchestra", "Käärijä", "Nemo", "Gabriela Gunčíková", "Mikolas Josef", "Benny Cristo", "Lake Malawi", "We Are Domi", "Vesna", "Aiko", "Waterloo", "Rise Like a Phoenix"] },
  { category: "Sport", subcategory: "Fotbal", words: ["Penalta", "Ofsajd", "Brankář", "Rohový kop", "Volný kop", "Žlutá karta", "Červená karta", "Gól", "Obránce", "Útočník", "Záložník", "Trenér", "Rozhodčí", "Real Madrid", "Barcelona", "Manchester United", "Liga mistrů", "Mistrovství světa", "Hattrick", "Aut", "Standardka", "Stadion", "Fanoušci", "Přestupka"] },
  { category: "Sport", subcategory: "Hokej", words: ["Puk", "Buly", "Brankář", "Přesilovka", "Oslabení", "Hattrick", "Mantinel", "Hokejka", "Krosček", "Vhazování", "Trestná lavice", "Nájezd", "Extraliga", "Stanley Cup", "Sparta Praha", "HC Kometa", "Zákaz zdvihu", "Bodyček", "Blokování", "Přihrávka", "Obránce", "Útočník", "Střída", "Helma"] },
  { category: "Sport", subcategory: "Olympijské sporty", words: ["Atletika", "Plavání", "Gymnastika", "Veslování", "Judo", "Šerm", "Box", "Vzpírání", "Střelba", "Cyklistika", "Triatlon", "Moderní pětiboj", "Badminton", "Stolní tenis", "Skoky do vody", "Sportovní lezení", "Zápas", "Lukostřelba", "Jachting", "Basketbal", "Volejbal", "Olympijský oheň", "Zlatá medaile", "Olympijská vesnice"] },
  { category: "Sport", subcategory: "Extrémní sporty", words: ["Bungee jumping", "Skateboarding", "Snowboarding", "Surfing", "Parkour", "Base jumping", "Horolezectví", "Freeride", "Motokros", "Paragliding", "Rafting", "Kitesurfing", "Skydiving", "Wakeboarding", "Downhill", "Bouldering", "Highlining", "Windsurfing", "Freeski", "Adrenalin", "Padák", "Lyžování ve volném terénu", "Cliff diving", "Ultramaraton"] },
  { category: "Sport", subcategory: "Sportovní osobnosti", words: ["Usain Bolt", "Lionel Messi", "Cristiano Ronaldo", "Michael Jordan", "Michael Phelps", "Roger Federer", "Serena Williamsová", "Jaromír Jágr", "Petr Čech", "Věra Čáslavská", "Emil Zátopek", "Tomáš Berdych", "Petra Kvitová", "Martina Navrátilová", "Dominik Hašek", "Kobe Bryant", "Diego Maradona", "Pelé", "Rafael Nadal", "Novak Djoković", "Katarina Johnson-Thompsonová", "David Pastrňák", "Ester Ledecká", "Barbora Krejčíková"] },
  { category: "Sport", subcategory: "Týmy", words: ["Real Madrid", "FC Barcelona", "Manchester United", "Bayern Mnichov", "Juventus", "Sparta Praha", "Slavia Praha", "Los Angeles Lakers", "Chicago Bulls", "Golden State Warriors", "New York Yankees", "Dallas Cowboys", "Montreal Canadiens", "HC Kometa Brno", "Liverpool FC", "Paris Saint-Germain", "AC Milan", "Boston Celtics", "New England Patriots", "Toronto Maple Leafs", "Baník Ostrava", "Viktoria Plzeň", "Arsenal", "Chelsea"] },
  { category: "Vtipné kategorie", subcategory: "Trapné situace", words: ["Zamávat, ale nebylo to na tebe", "Pozdravit cizího člověka jako známého", "Spadnout na eskalátoru", "Zakopnout na rovné zemi", "Špatně vyslovit něčí jméno", "Obléct si stejné šaty jako kamarádka", "Mít rozepnutý poklopec celý den", "Poslat zprávu špatnému člověku", "Nahlas si říhnout na schůzce", "Zapomenout jméno hned po představení", "Zasekout se ve dveřích", "Usmát se na bezpečnostní kameru", "Nechtěně vyznat lásku učiteli", "Uklouznout před celou třídou", "Mít jídlo mezi zuby na focení", "Oslovit učitelku mami", "Přijít pozdě na vlastní svatbu", "Zpívat falešně na karaoke před šéfem", "Sednout si na obsazené místo", "Objímat vzduch místo kamaráda"] },
  { category: "Vtipné kategorie", subcategory: "Výmluvy", words: ["Sežral mi to pes", "Zaspal jsem budík", "Uvízl jsem v zácpě", "Vybil se mi telefon", "Zachraňoval jsem kotě ze stromu", "Píchl jsem si kolo", "Babička měla operaci", "Nešel internet", "Spletl jsem si datum", "Zapomněl jsem doma klíče", "Byl jsem u zubaře", "Auto nenastartovalo", "Musel jsem na neplánovanou schůzku", "Dítě zvracelo celou noc", "Ztratil jsem se v novém městě", "Vlak měl zpoždění", "Zapomněl jsem nabít notebook", "Měl jsem migrénu", "Zdržela mě sousedka", "Zapomněl jsem to v tiskárně"] },
  { category: "Vtipné kategorie", subcategory: "Věci, které smrdí", words: ["Staré ponožky", "Zvětralé pivo", "Zkažené mléko", "Pot po posilovně", "Mokrý pes", "Prokouřené oblečení", "Popelnice v létě", "Použité sportovní boty", "Rybí trh", "Kanalizace", "Vejce po záruce", "Zapařené prádlo v tašce", "Česnekový dech", "Spálené jídlo na pánvi", "Chlívek", "Neumytý hrnek od kávy", "Stará houbička na nádobí", "Popelnice na bioodpad", "Zkažený sýr", "Staré fritovací oleje"] },
  { category: "Vtipné kategorie", subcategory: "Věci, které jsou otravné", words: ["Komár v ložnici v noci", "Pomalý internet", "Reklamy před videem na YouTube", "Kapající kohoutek", "Dlouhá fronta na poště", "Zamotaná sluchátka", "Opakující se hláška v autě", "Sousedova sekačka v neděli ráno", "Nenalezitelná nabíječka", "Vyzvánějící telefon v kině", "Nekonečná aktualizace systému", "Písek v botách po pláži", "Vlasy ucpávající odtok", "Planý poplach", "Ztracená ponožka po praní", "Otravná reklamní znělka", "Neustálé notifikace v mobilu", "Cizí lokty v tramvaji", "Prasklá struna na kytaře", "Pomalu se načítající stránka"] },
  { category: "Vtipné kategorie", subcategory: "Co nechceš najít pod postelí", words: ["Ztracená ponožka od loňska", "Plesnivý talíř", "Pavučina s pavoukem", "Staré čokoládové obaly", "Zapomenutý mobil", "Prach silný jako deka", "Hračka, co začne sama hrát", "Myší trus", "Sešlá kniha z dětství", "Zapadlá sluchátka", "Peníze, co jsi hledal měsíc", "Krabice od pizzy", "Rozbitá hračka", "Starý deník", "Vetchá krabice s fotkami", "Neznámý pach", "Švábi", "Zapomenutý dárek k Vánocům", "Igelitka plná nepotřebných věcí", "Batoh od základky"] },
  { category: "Vtipné kategorie", subcategory: "Co nechceš slyšet od vedoucího", words: ["Musíme si promluvit", "Máme malý problém", "Zastav se zítra v kanceláři", "To jsme od tebe nečekali", "Klienti si stěžovali", "Budeš muset zůstat přes víkend", "Potřebujeme snížit náklady", "Kdo to schválil?", "To přece není finální verze", "Musíme probrat tvůj výkon", "Zítra máme audit", "Kde je ten report?", "Musíš přijít i o víkendu", "Máme pro tebe změnu", "Zvládneš to i na dovolené", "Firma prochází restrukturalizací", "Chci to na stole hned ráno", "Zapomněl jsi na něco důležitého", "Tohle sis měl zkontrolovat", "Mám pro tebe špatnou zprávu"] },
  { category: "Vtipné kategorie", subcategory: "Typy lidí", words: ["Ten co pořád kouká do mobilu", "Věčný pozdní příchozí", "Ten, co všechno ví nejlépe", "Kdo mluví jen o sobě", "Ranní ptáče v kanceláři", "Ten, co si nikdy nepamatuje jména", "Notorický vypravěč vtipů", "Kdo se bojí konfliktu", "Ten, co zapomíná peněženku", "Přehnaně pozitivní typ", "Ten, co všechno komentuje", "Kdo nikdy neříká ne", "Věčný stěžovatel", "Ten, co si bere poslední kus", "Kdo přijde na párty jako první", "Ten, co odchází bez rozloučení", "Perfekcionista do posledního detailu", "Ten, co pořád něco vaří", "Kdo si pamatuje každé narozeniny", "Ten, co mluví za všechny"] },
  { category: "Vtipné kategorie", subcategory: "Náhodné věci", words: ["Deštník, co se obrátí naruby", "Fixka bez víčka", "Krabice plná kabelů", "Guma, co nic nesmaže", "Klíč, co nikam nesedí", "Papírový kelímek s dírou", "Baterka, co brzy dojde", "Reklamní tužka z banky", "Sponka na vlasy bez páru", "Stará účtenka z peněženky", "Šuplík plný nepotřebných věcí", "Návod v jazyce, co nikdo nezná", "Poslední kousek skládačky", "Igelitka plná igelitek", "Nabíječka, co nikam nepasuje", "Zapalovač bez plynu", "Kolo bez klíče od zámku", "Krabice od bot plná fotek", "Vyschlá guma na gumování", "Balík gumiček bez použití"] },
];

// Ikony k hlavním kategoriím (jen kosmetické, klidně lze rozšiřovat)
const CATEGORY_ICONS = {
  'Filmy a seriály': '🎬', 'Jídlo': '🍔', 'Zvířata': '🐾', 'Místa': '🌍',
  'Lidé': '👤', 'Hry': '🎮', 'Tábor': '🏕️', 'Hudba': '🎵', 'Sport': '⚽',
  'Vtipné kategorie': '😂',
};
const DEFAULT_ICON = '🗂️';

// Pořadí hlavních kategorií tak, jak se mají zobrazovat (vestavěné kategorie).
const CATEGORY_ORDER = [
  'Filmy a seriály', 'Jídlo', 'Zvířata', 'Místa', 'Lidé', 'Hry', 'Tábor',
  'Hudba', 'Sport', 'Vtipné kategorie',
];


/* =========================================================================
   1b. DATA — herní módy
   Každý mód je samostatný objekt s vlastní konfigurací. Přidání nového
   módu = přidat nový záznam sem + (pokud potřebuje speciální chování)
   ošetřit ho v příslušné části herní logiky (viz sekce 6).
   ========================================================================= */

const GAME_MODES = {
  secretAllies: {
    key: 'secretAllies',
    icon: '🤝',
    name: 'Tajní spojenci',
    description: 'Po rozdání rolí se náhodně vyberou 2 hráči, kteří jsou tajní spojenci a navzájem se znají.',
    incompatibleWith: [],
  },
  impostorsKnow: {
    key: 'impostorsKnow',
    icon: '👀',
    name: 'Impostoři se znají',
    description: 'Pokud je impostorů víc, každý z nich uvidí, kdo jsou ti ostatní.',
    incompatibleWith: ['impostorsDontKnow'],
  },
  impostorsDontKnow: {
    key: 'impostorsDontKnow',
    icon: '🙈',
    name: 'Impostoři se neznají',
    description: 'Impostoři o sobě navzájem nevědí nic (výchozí chování hry, jen jde explicitně zapnout).',
    incompatibleWith: ['impostorsKnow'],
  },
  emojiMode: {
    key: 'emojiMode',
    icon: '😀',
    name: 'Emoji mód',
    description: 'Jako nápovědu smí každý hráč použít pouze emoji.',
    incompatibleWith: [],
  },
  roleSwap: {
    key: 'roleSwap',
    icon: '🔄',
    name: 'Výměna rolí',
    description: 'Po odhalení všech rolí si dva náhodní hráči prohodí telefony — role zůstávají, hraje je ale někdo jiný.',
    incompatibleWith: [],
  },
  similarWord: {
    key: 'similarWord',
    icon: '🎯',
    name: 'Podobné slovo',
    description: 'Impostor nezůstane úplně bez informací — dostane slovo podobné tomu skutečnému.',
    incompatibleWith: [],
  },
  secretTasks: {
    key: 'secretTasks',
    icon: '🎭',
    name: 'Tajné úkoly',
    description: 'Každý hráč dostane navíc svůj vlastní tajný úkol, který uvidí jen on.',
    incompatibleWith: [],
  },
  oneWord: {
    key: 'oneWord',
    icon: '🗣️',
    name: 'Jedno slovo',
    description: 'Jako nápovědu smí každý hráč říct jen jedno jediné slovo.',
    incompatibleWith: [],
  },
  noWords: {
    key: 'noWords',
    icon: '🤐',
    name: 'Beze slov',
    description: 'První kolo se hraje pouze pomocí gest — bez jediného slova.',
    incompatibleWith: [],
  },
  timeLimit: {
    key: 'timeLimit',
    icon: '⏱️',
    name: 'Časový limit',
    description: 'Než hra začne, proběhne krátké odpočítávání. Zvol si délku.',
    incompatibleWith: [],
    hasOptions: true,
    options: [3, 5, 10],
    defaultOption: 5,
  },
  randomOrder: {
    key: 'randomOrder',
    icon: '🔀',
    name: 'Náhodné pořadí hráčů',
    description: 'Pořadí, ve kterém si hráči postupně zobrazují roli, se před rozdáním zamíchá.',
    incompatibleWith: [],
  },
};

// Pořadí, ve kterém se karty módů zobrazují
const GAME_MODE_ORDER = [
  'secretAllies', 'impostorsKnow', 'impostorsDontKnow', 'emojiMode',
  'roleSwap', 'similarWord', 'secretTasks', 'oneWord', 'noWords',
  'timeLimit', 'randomOrder',
];

// Databáze dvojic podobných slov pro mód "Podobné slovo".
// Klíč = přesné slovo z témat výše, hodnota = podobné/příbuzné slovo,
// které dostane impostor místo prázdné informace.
const SIMILAR_WORD_MAP = {
  'Pizza': 'Lasagne', 'Lasagne': 'Pizza',
  'Pes': 'Vlk', 'Vlk': 'Pes',
  'Kočka': 'Tygr', 'Tygr': 'Kočka',
  'Praha': 'Brno', 'Brno': 'Praha',
  'Auto': 'Motorka', 'Motorka': 'Auto',
  'Fotbal': 'Házená', 'Házená': 'Fotbal',
  'Hokej': 'Curling', 'Curling': 'Hokej',
  'Kytara': 'Ukulele', 'Ukulele': 'Kytara',
  'Klavír': 'Cembalo', 'Cembalo': 'Klavír',
  'Vlak': 'Tramvaj', 'Tramvaj': 'Vlak',
  'Autobus': 'Trolejbus', 'Trolejbus': 'Autobus',
  'Lev': 'Tygr',
  'Slon': 'Nosorožec', 'Nosorožec': 'Slon',
  'Delfín': 'Velryba', 'Velryba': 'Delfín',
  'Orel': 'Sokol', 'Sokol': 'Orel',
  'Whisky': 'Rum', 'Rum': 'Whisky',
  'Víno': 'Šampaňské', 'Šampaňské': 'Víno',
  'Káva': 'Espresso', 'Espresso': 'Káva',
  'Čaj': 'Matcha',
  'Lékař': 'Zdravotní sestra', 'Zdravotní sestra': 'Lékař',
  'Herec': 'Zpěvák', 'Zpěvák': 'Herec',
  'Programátor': 'Inženýr', 'Inženýr': 'Programátor',
  'Smartphone': 'Tablet', 'Tablet': 'Smartphone',
  'Notebook': 'Počítač', 'Počítač': 'Notebook',
  'Londýn': 'Paříž', 'Paříž': 'Londýn',
  'Řím': 'Benátky', 'Benátky': 'Řím',
  'Německo': 'Rakousko', 'Rakousko': 'Německo',
  'Švédsko': 'Norsko', 'Norsko': 'Švédsko',
  'Titanic': 'Gladiátor',
  'Batman': 'Joker', 'Joker': 'Batman',
  'Harry Potter': 'Pán prstenů', 'Pán prstenů': 'Harry Potter',
  'Přátelé': 'The Office', 'The Office': 'Přátelé',
  'Sushi': 'Ramen', 'Ramen': 'Sushi',
  'Hamburger': 'Hot dog', 'Hot dog': 'Hamburger',
  'Croissant': 'Bageta', 'Bageta': 'Croissant',
  'Boty': 'Ponožky',
  'Klobouk': 'Čepice', 'Čepice': 'Klobouk',
};

// Tajné úkoly pro mód "Tajné úkoly" — každý hráč dostane jeden náhodný.
const SECRET_TASKS = [
  'Během hry třikrát řekni „asi".',
  'Jednou si zakašli.',
  'Alespoň jednou se dotkni nosu.',
  'Co nejvíc se usmívej.',
  'Mluv celou dobu potichu.',
  'Mluv co nejrychleji.',
  'Jednou řekni „hmm" a dělej, že přemýšlíš.',
  'Podrbej se na hlavě, než něco řekneš.',
  'Založ si ruce a nerozkládej je.',
  'Alespoň jednou se zasměj bez důvodu.',
  'Nepoužívej ruce, když mluvíš.',
  'Jednou zopakuj to, co řekl někdo před tebou.',
  'Mluv o jednu oktávu výš, než normálně.',
  'Než promluvíš, vždycky se nadechni nahlas.',
  'Jednou schválně změň téma na chvíli mimo hru.',
  'Tvař se celou dobu podezřele.',
  'Jednou někoho pochval za jeho nápovědu.',
  'Mrkni na někoho, než řekneš svou nápovědu.',
  'Mluv velmi formálně, jako v televizi.',
  'Jednou použij slovo „vlastně".',
];


/* =========================================================================
   2. STORAGE — LocalStorage helpery
   ========================================================================= */

const STORAGE_KEYS = {
  customTopics: 'impostorGame_customTopics',       // starý (plochý) formát — jen pro migraci
  customTopicData: 'impostorGame_customTopicData',  // nový formát: [{category, subcategory, words}]
  customCategoryIcons: 'impostorGame_customCategoryIcons',
  favorites: 'impostorGame_favoriteSubcategories',
  settings: 'impostorGame_settings',
};

/** Načte vlastní podkategorie v novém formátu (pole záznamů). */
function loadCustomTopicData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customTopicData);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Nepodařilo se načíst vlastní podkategorie:', e);
    return [];
  }
}

function saveCustomTopicData() {
  try {
    localStorage.setItem(STORAGE_KEYS.customTopicData, JSON.stringify(state.customTopicData));
  } catch (e) {
    console.warn('Nepodařilo se uložit vlastní podkategorie:', e);
  }
}

/**
 * Migruje starý plochý formát vlastních témat ({"Název": ["slovo", ...]})
 * do nového formátu s kategoriemi — všechny staré položky spadnou pod
 * jednu sběrnou kategorii „Vlastní témata“, ať se uživateli nic neztratí.
 */
function migrateLegacyCustomTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customTopics);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return [];
    const migrated = Object.entries(parsed)
      .filter(([, words]) => Array.isArray(words) && words.length > 0)
      .map(([name, words]) => ({
        category: 'Vlastní témata',
        subcategory: name,
        words: words.map(String),
      }));
    if (migrated.length > 0) {
      localStorage.removeItem(STORAGE_KEYS.customTopics);
    }
    return migrated;
  } catch (e) {
    return [];
  }
}

function loadCustomCategoryIcons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customCategoryIcons);
    const parsed = raw ? JSON.parse(raw) : {};
    return (typeof parsed === 'object' && parsed !== null) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveCustomCategoryIcons() {
  try {
    localStorage.setItem(STORAGE_KEYS.customCategoryIcons, JSON.stringify(state.customCategoryIcons));
  } catch (e) {
    console.warn('Nepodařilo se uložit ikony vlastních kategorií:', e);
  }
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favoriteSubcategories));
  } catch (e) {
    console.warn('Nepodařilo se uložit oblíbené podkategorie:', e);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveSettings() {
  const data = {
    playerCount: state.playerCount,
    playerNames: state.players.map((p) => p.name),
    topicSelection: state.topicSelection,
    impostorCount: state.impostorCount,
    showTopicToImpostor: state.showTopicToImpostor,
    activeModes: state.activeModes,
    timeLimitSeconds: state.timeLimitSeconds,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
  } catch (e) {
    console.warn('Nepodařilo se uložit nastavení:', e);
  }
}


/* =========================================================================
   3. STATE — globální stav aplikace
   ========================================================================= */

const state = {
  playerCount: 4,
  players: [],              // [{ id, name }]

  // Vlastní podkategorie ve stejném tvaru jako TOPIC_DATA: {category, subcategory, words}
  customTopicData: [],
  // Ikony pro vlastní kategorie vytvořené uživatelem: { "Název kategorie": "🆕" }
  customCategoryIcons: {},
  // Oblíbené podkategorie — pole klíčů "Kategorie||Podkategorie"
  favoriteSubcategories: [],

  // Procházení témat v panelu na obrazovce nastavení:
  //   null = zobrazen grid hlavních kategorií
  //   jinak = název právě otevřené kategorie, nebo speciální '__FAVORITES__'
  topicBrowseCategory: null,

  // Aktuální výběr slovní zásoby pro hru:
  //   mode: 'subcategory' | 'allInCategory' | 'favorites'
  //   category / subcategory se použijí podle módu
  topicSelection: {
    mode: 'subcategory',
    category: 'Filmy a seriály',
    subcategory: 'Horory',
  },

  impostorCount: 1,
  showTopicToImpostor: true,

  // Herní módy — { secretAllies: false, impostorsKnow: false, ... }
  activeModes: buildDefaultActiveModes(),
  timeLimitSeconds: GAME_MODES.timeLimit.defaultOption,

  // Běhový stav hry (vygenerováno při "Začít hru")
  revealOrder: [],          // pole indexů do state.players v pořadí odhalování
  currentRevealStep: 0,
  secretWord: '',
  impostorPlayerIds: [],    // id hráčů, kteří jsou impostoři
  startingPlayerId: null,   // id hráče, který jako první popisuje slovo (klidně i impostor)
  isCurrentCardRevealed: false,

  // Běhový stav vygenerovaný herními módy (viz sekce 6)
  secretAllyIds: [],            // přesně 2 id hráčů, nebo []
  similarWordText: '',          // podobné slovo pro impostory (mód „Podobné slovo")
  secretTaskAssignments: {},    // { playerId: 'text úkolu' }
  roleSwapPair: null,           // [playerId, playerId] nebo null
  countdownIntervalId: null,    // interní handle běžícího odpočtu (mód „Časový limit")

  // Editace vlastní podkategorie v modalu — { category, subcategory } nebo null
  editingTopicKey: null,
};

/** Výchozí stav přepínačů herních módů — všechny vypnuté kromě náhodného pořadí. */
function buildDefaultActiveModes() {
  const modes = {};
  GAME_MODE_ORDER.forEach((key) => {
    modes[key] = key === 'randomOrder'; // náhodné pořadí zůstává zapnuté ve výchozím stavu
  });
  return modes;
}


/* =========================================================================
   4. UTILITY funkce
   ========================================================================= */

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}
function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/** Fisher-Yates shuffle — vrací novou zamíchanou kopii pole. */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Vrátí úplný seznam všech podkategorií (vestavěné + vlastní) jako ploché pole. */
function getAllTopicEntries() {
  return [...TOPIC_DATA, ...state.customTopicData];
}

/** Vrátí seznam názvů hlavních kategorií — vestavěné v pevném pořadí, pak vlastní. */
function getCategoryNames() {
  const customNames = [];
  state.customTopicData.forEach((entry) => {
    if (!CATEGORY_ORDER.includes(entry.category) && !customNames.includes(entry.category)) {
      customNames.push(entry.category);
    }
  });
  return [...CATEGORY_ORDER, ...customNames];
}

function getCategoryIcon(categoryName) {
  return CATEGORY_ICONS[categoryName] || state.customCategoryIcons[categoryName] || DEFAULT_ICON;
}

/** Vrátí všechny podkategorie (záznamy) patřící pod danou hlavní kategorii. */
function getSubcategoriesForCategory(categoryName) {
  return getAllTopicEntries().filter((e) => e.category === categoryName);
}

function findTopicEntry(category, subcategory) {
  return getAllTopicEntries().find((e) => e.category === category && e.subcategory === subcategory);
}

function favoriteKey(category, subcategory) {
  return `${category}||${subcategory}`;
}

function isFavoriteSubcategory(category, subcategory) {
  return state.favoriteSubcategories.includes(favoriteKey(category, subcategory));
}

function toggleFavoriteSubcategory(category, subcategory) {
  const key = favoriteKey(category, subcategory);
  const idx = state.favoriteSubcategories.indexOf(key);
  if (idx === -1) {
    state.favoriteSubcategories.push(key);
  } else {
    state.favoriteSubcategories.splice(idx, 1);
  }
  saveFavorites();
}

function getFavoriteEntries() {
  return getAllTopicEntries().filter((e) => isFavoriteSubcategory(e.category, e.subcategory));
}

/** Vrátí pole slov, ze kterých se bude losovat, podle aktuálního state.topicSelection. */
function resolveWordPool() {
  const sel = state.topicSelection;
  if (sel.mode === 'allInCategory') {
    return getSubcategoriesForCategory(sel.category).flatMap((e) => e.words);
  }
  if (sel.mode === 'favorites') {
    return getFavoriteEntries().flatMap((e) => e.words);
  }
  // 'subcategory' (výchozí)
  const entry = findTopicEntry(sel.category, sel.subcategory);
  return entry ? entry.words : [];
}

/** Čitelný popisek aktuálního výběru tématu — zobrazuje se hráčům na kartě. */
function getSelectionLabel() {
  const sel = state.topicSelection;
  if (sel.mode === 'allInCategory') {
    return `${sel.category} (vše)`;
  }
  if (sel.mode === 'favorites') {
    return '⭐ Oblíbené podkategorie';
  }
  return `${sel.category} › ${sel.subcategory}`;
}

/** Ověří, že aktuální výběr tématu ještě dává smysl (odkazovaná data existují). */
function isTopicSelectionValid() {
  const sel = state.topicSelection;
  if (!sel) return false;
  if (sel.mode === 'allInCategory') {
    return getSubcategoriesForCategory(sel.category).length > 0;
  }
  if (sel.mode === 'favorites') {
    return getFavoriteEntries().length > 0;
  }
  return !!findTopicEntry(sel.category, sel.subcategory);
}

/** Nastaví výběr tématu na první dostupnou podkategorii (fallback). */
function selectFirstAvailableTopic() {
  const first = getAllTopicEntries()[0];
  if (first) {
    state.topicSelection = { mode: 'subcategory', category: first.category, subcategory: first.subcategory };
  }
}

let toastTimeout = null;
function showToast(message) {
  const toast = qs('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

/** Přepnutí aktivní obrazovky s jemnou fade animací. */
function switchScreen(screenId) {
  const screens = qsa('.screen');
  const current = qs('.screen.active');
  const next = qs(`#${screenId}`);
  if (current === next) return;

  if (current) {
    current.classList.remove('active');
  }
  next.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* =========================================================================
   5. RENDER funkce
   ========================================================================= */

/** Vykreslí pole pro editaci jmen hráčů podle aktuálního state.playerCount. */
function renderPlayerNameInputs() {
  const container = qs('#player-name-list');

  // Zachovej existující jména, pokud počet hráčů roste/klesá
  const existingNames = state.players.map((p) => p.name);
  const newPlayers = [];
  for (let i = 0; i < state.playerCount; i++) {
    newPlayers.push({
      id: i,
      name: existingNames[i] || `Hráč ${i + 1}`,
    });
  }
  state.players = newPlayers;

  container.innerHTML = '';
  state.players.forEach((player, idx) => {
    const item = document.createElement('div');
    item.className = 'player-name-item';
    item.dataset.playerId = String(player.id);
    item.style.animationDelay = `${idx * 0.03}s`;
    item.innerHTML = `
      <button type="button" class="player-drag-handle" aria-label="Přesunout hráče ${idx + 1} (podrž a táhni pro změnu pořadí)" title="Podrž a táhni pro změnu pořadí">⠿</button>
      <span class="player-name-item__number">${idx + 1}</span>
      <input type="text" maxlength="20" value="${escapeHtml(player.name)}" data-player-id="${player.id}" aria-label="Jméno hráče ${idx + 1}" />
    `;
    container.appendChild(item);

    const handle = qs('.player-drag-handle', item);
    enablePlayerDrag(handle, item);
  });

  // Naslouchání změnám jmen
  qsa('input', container).forEach((input) => {
    input.addEventListener('input', (e) => {
      const id = Number(e.target.dataset.playerId);
      const player = state.players.find((p) => p.id === id);
      if (player) player.name = e.target.value.trim() || `Hráč ${id + 1}`;
    });
  });
}

/**
 * Umožní přetažením (myš i dotyk přes Pointer Events) přeskupit pořadí
 * hráčů — užitečné, když nový hráč sedí jinde než na konci řady a
 * nechceš kvůli tomu přepisovat všechna jména.
 */
function enablePlayerDrag(handle, item) {
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const list = qs('#player-name-list');
    const rect = item.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    // Placeholder drží místo v layoutu, dokud se prvek táhne
    const placeholder = document.createElement('div');
    placeholder.className = 'player-name-item__placeholder';
    placeholder.style.height = `${rect.height}px`;
    item.insertAdjacentElement('afterend', placeholder);

    list.classList.add('is-reordering');
    item.classList.add('is-dragging');
    item.style.position = 'fixed';
    item.style.top = `${rect.top}px`;
    item.style.left = `${rect.left}px`;
    item.style.width = `${rect.width}px`;

    handle.setPointerCapture(e.pointerId);

    function getElementAfterPointer(y) {
      const siblings = qsa('.player-name-item:not(.is-dragging)', list);
      let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
      siblings.forEach((el) => {
        const box = el.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          closest = { offset, element: el };
        }
      });
      return closest.element;
    }

    function onMove(ev) {
      item.style.top = `${ev.clientY - offsetY}px`;
      const afterEl = getElementAfterPointer(ev.clientY);
      if (afterEl == null) {
        list.appendChild(placeholder);
      } else if (afterEl !== placeholder) {
        list.insertBefore(placeholder, afterEl);
      }
    }

    function onUp() {
      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);

      list.insertBefore(item, placeholder);
      placeholder.remove();

      item.style.position = '';
      item.style.top = '';
      item.style.left = '';
      item.style.width = '';
      item.classList.remove('is-dragging');
      list.classList.remove('is-reordering');

      syncPlayerOrderFromDom();
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  });
}

/** Po přetažení přepíše state.players podle nového pořadí v DOMu a přečísluje odznaky. */
function syncPlayerOrderFromDom() {
  const list = qs('#player-name-list');
  const items = qsa('.player-name-item', list);

  const reordered = items
    .map((el) => state.players.find((p) => p.id === Number(el.dataset.playerId)))
    .filter(Boolean);
  state.players = reordered;

  items.forEach((el, idx) => {
    const badge = qs('.player-name-item__number', el);
    if (badge) badge.textContent = idx + 1;
    const input = qs('input', el);
    if (input) input.setAttribute('aria-label', `Jméno hráče ${idx + 1}`);
    const handle = qs('.player-drag-handle', el);
    if (handle) handle.setAttribute('aria-label', `Přesunout hráče ${idx + 1} (podrž a táhni pro změnu pořadí)`);
  });
}

/**
 * Vykreslí celý panel výběru tématu — buď grid hlavních kategorií,
 * nebo (po kliknutí na kategorii) grid jejích podkategorií. Ovládá se
 * přes state.topicBrowseCategory (null = kategorie, jinak konkrétní
 * kategorie nebo speciální '__FAVORITES__').
 */
function renderTopicPanel() {
  if (!isTopicSelectionValid()) {
    selectFirstAvailableTopic();
  }
  renderTopicBreadcrumb();
  if (state.topicBrowseCategory === null) {
    renderCategoryGrid();
  } else if (state.topicBrowseCategory === '__FAVORITES__') {
    renderFavoritesGrid();
  } else {
    renderSubcategoryGrid(state.topicBrowseCategory);
  }
  renderTopicSelectionSummary();
}

function renderTopicBreadcrumb() {
  const bar = qs('#topic-breadcrumb');
  if (state.topicBrowseCategory === null) {
    bar.innerHTML = '';
    bar.classList.add('is-hidden');
    return;
  }
  bar.classList.remove('is-hidden');
  const label = state.topicBrowseCategory === '__FAVORITES__'
    ? '⭐ Oblíbené podkategorie'
    : `${getCategoryIcon(state.topicBrowseCategory)} ${escapeHtml(state.topicBrowseCategory)}`;
  bar.innerHTML = `
    <button type="button" class="topic-breadcrumb__back" id="btn-topic-back">‹ Zpět na kategorie</button>
    <span class="topic-breadcrumb__current">${label}</span>
  `;
  qs('#btn-topic-back', bar).addEventListener('click', () => {
    state.topicBrowseCategory = null;
    renderTopicPanel();
  });
}

/** Grid hlavních kategorií (nejvyšší úroveň výběru tématu). */
function renderCategoryGrid() {
  const grid = qs('#topic-grid');
  grid.innerHTML = '';
  grid.classList.remove('topic-grid--subcategories');

  const favoriteCount = getFavoriteEntries().length;
  if (favoriteCount > 0) {
    const favCard = document.createElement('button');
    favCard.type = 'button';
    favCard.className = 'topic-card topic-card--favorites';
    favCard.innerHTML = `
      <span class="topic-card__icon">⭐</span>
      <span class="topic-card__name">Oblíbené</span>
      <span class="topic-card__count">${favoriteCount} podkategorií</span>
    `;
    favCard.addEventListener('click', () => {
      state.topicBrowseCategory = '__FAVORITES__';
      renderTopicPanel();
    });
    grid.appendChild(favCard);
  }

  getCategoryNames().forEach((name, idx) => {
    const subcats = getSubcategoriesForCategory(name);
    const wordCount = subcats.reduce((sum, e) => sum + e.words.length, 0);
    const isCustomCategory = !CATEGORY_ORDER.includes(name);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'topic-card';
    card.style.animationDelay = `${idx * 0.02}s`;
    card.innerHTML = `
      ${isCustomCategory ? '<span class="topic-card__custom-badge">Vlastní</span>' : ''}
      <span class="topic-card__icon">${getCategoryIcon(name)}</span>
      <span class="topic-card__name">${escapeHtml(name)}</span>
      <span class="topic-card__count">${subcats.length} podkategorií · ${wordCount} slov</span>
    `;
    card.addEventListener('click', () => {
      state.topicBrowseCategory = name;
      renderTopicPanel();
    });
    grid.appendChild(card);
  });
}

/** Grid podkategorií uvnitř jedné hlavní kategorie, včetně akčních karet Vše/Náhodná. */
function renderSubcategoryGrid(categoryName) {
  const grid = qs('#topic-grid');
  grid.innerHTML = '';
  grid.classList.add('topic-grid--subcategories');

  const entries = getSubcategoriesForCategory(categoryName);

  const allCard = document.createElement('button');
  allCard.type = 'button';
  const allIsActive = state.topicSelection.mode === 'allInCategory' && state.topicSelection.category === categoryName;
  allCard.className = 'topic-card topic-card--action' + (allIsActive ? ' is-selected' : '');
  allCard.innerHTML = `
    <span class="topic-card__icon">🔀</span>
    <span class="topic-card__name">Všechny podkategorie</span>
    <span class="topic-card__count">Spojí slova ze všech ${entries.length} podkategorií</span>
  `;
  allCard.addEventListener('click', () => {
    state.topicSelection = { mode: 'allInCategory', category: categoryName, subcategory: null };
    renderTopicPanel();
  });
  grid.appendChild(allCard);

  const randomCard = document.createElement('button');
  randomCard.type = 'button';
  randomCard.className = 'topic-card topic-card--action';
  randomCard.innerHTML = `
    <span class="topic-card__icon">🎲</span>
    <span class="topic-card__name">Náhodná podkategorie</span>
    <span class="topic-card__count">Vylosuje jednu z ${entries.length}</span>
  `;
  randomCard.addEventListener('click', () => {
    const pick = randomItem(entries);
    if (!pick) return;
    state.topicSelection = { mode: 'subcategory', category: pick.category, subcategory: pick.subcategory };
    showToast(`Vybrána náhodná podkategorie: ${pick.subcategory} 🎲`);
    renderTopicPanel();
  });
  grid.appendChild(randomCard);

  entries.forEach((entry, idx) => {
    grid.appendChild(buildSubcategoryCard(entry, idx));
  });
}

/** Speciální „virtuální kategorie“ se seznamem všech oblíbených podkategorií. */
function renderFavoritesGrid() {
  const grid = qs('#topic-grid');
  grid.innerHTML = '';
  grid.classList.add('topic-grid--subcategories');

  const entries = getFavoriteEntries();

  if (entries.length === 0) {
    grid.innerHTML = '<p class="empty-hint">Zatím nemáš žádné oblíbené podkategorie. Označ si je hvězdičkou ⭐ přímo u podkategorie.</p>';
    return;
  }

  const allCard = document.createElement('button');
  allCard.type = 'button';
  const allIsActive = state.topicSelection.mode === 'favorites';
  allCard.className = 'topic-card topic-card--action' + (allIsActive ? ' is-selected' : '');
  allCard.innerHTML = `
    <span class="topic-card__icon">🔀</span>
    <span class="topic-card__name">Všechny oblíbené</span>
    <span class="topic-card__count">Spojí slova ze všech ${entries.length} oblíbených</span>
  `;
  allCard.addEventListener('click', () => {
    state.topicSelection = { mode: 'favorites', category: null, subcategory: null };
    renderTopicPanel();
  });
  grid.appendChild(allCard);

  entries.forEach((entry, idx) => {
    grid.appendChild(buildSubcategoryCard(entry, idx, true));
  });
}

/** Vytvoří jednu kartu podkategorie včetně hvězdičky oblíbených. */
function buildSubcategoryCard(entry, idx, showCategoryPrefix) {
  const isSelected = state.topicSelection.mode === 'subcategory'
    && state.topicSelection.category === entry.category
    && state.topicSelection.subcategory === entry.subcategory;
  const isFav = isFavoriteSubcategory(entry.category, entry.subcategory);

  const card = document.createElement('div');
  card.className = 'topic-card topic-card--sub' + (isSelected ? ' is-selected' : '');
  card.style.animationDelay = `${idx * 0.02}s`;
  card.innerHTML = `
    <button type="button" class="topic-card__favorite${isFav ? ' is-active' : ''}" aria-label="${isFav ? 'Odebrat z oblíbených' : 'Přidat mezi oblíbené'}" title="${isFav ? 'Odebrat z oblíbených' : 'Přidat mezi oblíbené'}">${isFav ? '★' : '☆'}</button>
    <button type="button" class="topic-card__main">
      <span class="topic-card__name">${showCategoryPrefix ? `${getCategoryIcon(entry.category)} ${escapeHtml(entry.category)} › ` : ''}${escapeHtml(entry.subcategory)}</span>
      <span class="topic-card__count">${entry.words.length} slov</span>
    </button>
  `;
  qs('.topic-card__favorite', card).addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavoriteSubcategory(entry.category, entry.subcategory);
    renderTopicPanel();
  });
  qs('.topic-card__main', card).addEventListener('click', () => {
    state.topicSelection = { mode: 'subcategory', category: entry.category, subcategory: entry.subcategory };
    renderTopicPanel();
  });
  return card;
}

/** Shrnutí aktuálního výběru pod gridem (co přesně se bude losovat a kolik slov). */
function renderTopicSelectionSummary() {
  const el = qs('#topic-selection-summary');
  const count = resolveWordPool().length;
  el.innerHTML = `
    <span class="topic-selection-summary__label">Vybráno:</span>
    <strong>${escapeHtml(getSelectionLabel())}</strong>
    <span class="topic-selection-summary__count">${count} slov</span>
  `;
}

/** Vykreslí grid karet herních módů podle GAME_MODE_ORDER a aktuálního state.activeModes. */
function renderGameModesGrid() {
  const grid = qs('#game-modes-grid');
  grid.innerHTML = '';

  GAME_MODE_ORDER.forEach((key, idx) => {
    const mode = GAME_MODES[key];
    const isActive = !!state.activeModes[key];

    const card = document.createElement('div');
    card.className = 'game-mode-card' + (isActive ? ' is-active' : '');
    card.dataset.mode = key;
    card.style.animationDelay = `${idx * 0.02}s`;

    let optionsHtml = '';
    if (mode.hasOptions && isActive) {
      optionsHtml = `
        <div class="game-mode-card__options">
          ${mode.options.map((sec) => `
            <button type="button" class="game-mode-card__option-btn${state.timeLimitSeconds === sec ? ' is-selected' : ''}" data-seconds="${sec}">${sec}s</button>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="game-mode-card__header">
        <span class="game-mode-card__title"><span class="game-mode-card__icon">${mode.icon}</span>${escapeHtml(mode.name)}</span>
        <label class="switch game-mode-card__switch">
          <input type="checkbox" data-mode-toggle="${key}" ${isActive ? 'checked' : ''} aria-label="Zapnout mód ${escapeHtml(mode.name)}" />
          <span class="switch__slider"></span>
        </label>
      </div>
      <p class="game-mode-card__desc">${escapeHtml(mode.description)}</p>
      ${optionsHtml}
    `;

    grid.appendChild(card);

    qs('input[data-mode-toggle]', card).addEventListener('change', () => toggleGameMode(key));

    if (mode.hasOptions && isActive) {
      qsa('.game-mode-card__option-btn', card).forEach((btn) => {
        btn.addEventListener('click', () => {
          state.timeLimitSeconds = Number(btn.dataset.seconds);
          renderGameModesGrid();
        });
      });
    }
  });
}

/** Zapne/vypne herní mód a automaticky vyřeší neslučitelnost s jinými módy. */
function toggleGameMode(key) {
  const mode = GAME_MODES[key];
  const turningOn = !state.activeModes[key];
  state.activeModes[key] = turningOn;

  if (turningOn && mode.incompatibleWith && mode.incompatibleWith.length > 0) {
    mode.incompatibleWith.forEach((otherKey) => {
      if (state.activeModes[otherKey]) {
        state.activeModes[otherKey] = false;
        showToast(`Mód „${GAME_MODES[otherKey].name}“ byl vypnut — nejde kombinovat s „${mode.name}“.`);
      }
    });
  }

  renderGameModesGrid();
}

/** Vykreslí seznam vlastních podkategorií v modalu správy témat, seskupený podle kategorie. */
function renderCustomTopicManagerList() {
  const list = qs('#custom-topic-list');
  const emptyHint = qs('#custom-topic-empty');

  qsa('.custom-topic-group', list).forEach((el) => el.remove());
  emptyHint.style.display = state.customTopicData.length === 0 ? 'block' : 'none';

  const byCategory = {};
  state.customTopicData.forEach((entry) => {
    if (!byCategory[entry.category]) byCategory[entry.category] = [];
    byCategory[entry.category].push(entry);
  });

  Object.keys(byCategory).forEach((category) => {
    const group = document.createElement('div');
    group.className = 'custom-topic-group';
    group.innerHTML = `<h4 class="custom-topic-group__title">${getCategoryIcon(category)} ${escapeHtml(category)}</h4>`;

    byCategory[category].forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'custom-topic-item';
      item.innerHTML = `
        <span class="custom-topic-item__name">${escapeHtml(entry.subcategory)}</span>
        <span class="custom-topic-item__count">${entry.words.length} slov</span>
        <div class="custom-topic-item__actions">
          <button type="button" class="icon-btn" data-action="copy" title="Kopírovat slova">📋</button>
          <button type="button" class="icon-btn" data-action="edit" title="Upravit">✏️</button>
          <button type="button" class="icon-btn icon-btn--danger" data-action="delete" title="Smazat">🗑️</button>
        </div>
      `;
      item.querySelector('[data-action="copy"]').addEventListener('click', () => {
        copyTextToClipboard(`${entry.category} › ${entry.subcategory}: ${entry.words.join(', ')}`);
      });
      item.querySelector('[data-action="edit"]').addEventListener('click', () => {
        startEditingTopic(entry.category, entry.subcategory);
      });
      item.querySelector('[data-action="delete"]').addEventListener('click', () => {
        deleteCustomTopic(entry.category, entry.subcategory);
      });
      group.appendChild(item);
    });

    list.appendChild(group);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


/* =========================================================================
   6. GAME LOGIC
   ========================================================================= */

function changePlayerCount(delta) {
  const next = state.playerCount + delta;
  if (next < 3 || next > 20) return;
  state.playerCount = next;
  qs('#player-count-value').textContent = state.playerCount;
  renderPlayerNameInputs();
  clampImpostorCount();
}

// Nejvyšší povolený počet impostorů. Skutečný strop se navíc vždy
// odvíjí od počtu hráčů — musí zbýt alespoň 2 hráči, kteří impostory nejsou.
const MAX_IMPOSTOR_COUNT = 10;

function changeImpostorCount(delta) {
  const next = state.impostorCount + delta;
  if (next < 1 || next > MAX_IMPOSTOR_COUNT) return;
  state.impostorCount = next;
  clampImpostorCount(true);
}

/** Impostorů musí být vždy alespoň o 2 méně než hráčů. */
function clampImpostorCount(forceUpdateDisplay) {
  const maxAllowed = Math.max(1, Math.min(MAX_IMPOSTOR_COUNT, state.playerCount - 2));
  if (state.impostorCount > maxAllowed) {
    state.impostorCount = maxAllowed;
  }
  if (forceUpdateDisplay || true) {
    qs('#impostor-count-value').textContent = state.impostorCount;
  }
}

function shufflePlayersManually() {
  state.players = shuffleArray(state.players);
  renderPlayerNameInputs();
  showToast('Hráči byli zamícháni 🔀');
}

/** Validace a spuštění hry. */
function startGame() {
  const errorEl = qs('#setup-error');
  errorEl.textContent = '';

  // Validace: jména nesmí být prázdná (fallback už zajišťuje input listener)
  if (state.players.length < 3) {
    errorEl.textContent = 'Hra vyžaduje alespoň 3 hráče.';
    return;
  }
  if (resolveWordPool().length === 0) {
    errorEl.textContent = 'Vyber prosím podkategorii s alespoň jedním slovem.';
    return;
  }
  clampImpostorCount();
  if (state.impostorCount >= state.players.length) {
    errorEl.textContent = 'Příliš mnoho impostorů na tento počet hráčů.';
    return;
  }

  // Ulož nastavení pro příště
  saveSettings();

  // Vyber náhodné slovo z aktuálního výběru tématu
  const words = resolveWordPool();
  state.secretWord = randomItem(words);

  // Vyber náhodné impostory
  const shuffledIds = shuffleArray(state.players.map((p) => p.id));
  state.impostorPlayerIds = shuffledIds.slice(0, state.impostorCount);

  // --- Herní módy: vypočti běhová přiřazení podle toho, co je zapnuté ---
  state.secretAllyIds = state.activeModes.secretAllies ? pickTwoDistinctPlayerIds() : [];
  state.secretTaskAssignments = state.activeModes.secretTasks ? assignSecretTasksToPlayers() : {};
  state.similarWordText = state.activeModes.similarWord ? computeSimilarWord(words) : '';
  state.roleSwapPair = state.activeModes.roleSwap ? pickTwoDistinctPlayerIds() : null;

  // Pořadí odhalování
  let order = state.players.map((p) => p.id);
  if (state.activeModes.randomOrder) {
    order = shuffleArray(order);
  }
  state.revealOrder = order;
  state.currentRevealStep = 0;
  state.isCurrentCardRevealed = false;

  // Vyber náhodně hráče, který bude popisovat slovo jako první —
  // úplně nezávisle na tom, jestli je to Impostor, nebo ne.
  state.startingPlayerId = randomItem(state.players.map((p) => p.id));

  switchScreen('screen-reveal');
  renderRevealStep();
}

function getPlayerById(id) {
  return state.players.find((p) => p.id === id);
}

/** Vybere 2 různé náhodné hráče (pro Tajné spojence a Výměnu rolí). */
function pickTwoDistinctPlayerIds() {
  const shuffled = shuffleArray(state.players.map((p) => p.id));
  return [shuffled[0], shuffled[1]];
}

/** Rozdá každému hráči jeden náhodný tajný úkol (mód „Tajné úkoly“). */
function assignSecretTasksToPlayers() {
  const assignments = {};
  const shuffledTasks = shuffleArray(SECRET_TASKS);
  state.players.forEach((player, idx) => {
    assignments[player.id] = shuffledTasks[idx % shuffledTasks.length];
  });
  return assignments;
}

/**
 * Vrátí podobné slovo pro impostory (mód „Podobné slovo“) — nejdřív zkusí
 * kurátorovanou databázi dvojic, jinak spadne zpět na jiné náhodné slovo
 * ze stejného tématu, aby mód fungoval vždy, i mimo databázi.
 */
function computeSimilarWord(topicWords) {
  if (SIMILAR_WORD_MAP[state.secretWord]) {
    return SIMILAR_WORD_MAP[state.secretWord];
  }
  const alternatives = topicWords.filter((w) => w !== state.secretWord);
  return alternatives.length > 0 ? randomItem(alternatives) : state.secretWord;
}

/** Vykreslí aktuální krok odhalování (jméno hráče na řadě + reset karty). */
function renderRevealStep() {
  const total = state.revealOrder.length;
  const step = state.currentRevealStep;
  const playerId = state.revealOrder[step];
  const player = getPlayerById(playerId);

  qs('#reveal-progress-text').textContent = `Hráč ${step + 1} / ${total}`;
  qs('#reveal-progress-fill').style.width = `${((step) / total) * 100}%`;
  qs('#reveal-player-name').textContent = player.name;

  // Obrazovka MUSÍ být prázdná — skryjeme kartu, ukážeme jen čekací stav
  qs('#reveal-card-wrap').classList.add('is-hidden');
  qs('#reveal-waiting').classList.remove('is-hidden');

  // Vyčistíme obsah karty, aby v DOMu nezůstalo předchozí slovo
  qs('#role-word').textContent = '—';
  qs('#role-topic-normal').textContent = '—';
  qs('#role-topic-impostor').textContent = '—';
  qs('#role-extra-normal').innerHTML = '';
  qs('#role-extra-impostor').innerHTML = '';
  state.isCurrentCardRevealed = false;
}

/**
 * Sestaví HTML extra informačních bloků na kartě podle aktivních módů
 * (tajný spojenec, seznam ostatních impostorů, tajný úkol). Používá se
 * pro obě strany karty — běžného hráče i impostora.
 */
function buildExtraInfoHtml(playerId, isImpostor) {
  const blocks = [];

  // Tajní spojenci — může se zobrazit komukoliv, impostora nevyjímaje
  if (state.activeModes.secretAllies && state.secretAllyIds.includes(playerId)) {
    const allyId = state.secretAllyIds.find((id) => id !== playerId);
    const ally = getPlayerById(allyId);
    if (ally) {
      blocks.push(`
        <div class="role-card__extra-block role-card__extra-block--ally">
          <p class="role-card__extra-block__label">🤝 Tvůj tajný spojenec</p>
          <p class="role-card__extra-block__value">${escapeHtml(ally.name)}</p>
        </div>
      `);
    }
  }

  // Impostoři se znají — jen na kartě impostora a jen když jich je víc
  if (isImpostor && state.activeModes.impostorsKnow && state.impostorPlayerIds.length > 1) {
    const others = state.impostorPlayerIds
      .filter((id) => id !== playerId)
      .map((id) => getPlayerById(id))
      .filter(Boolean);
    if (others.length > 0) {
      blocks.push(`
        <div class="role-card__extra-block role-card__extra-block--impostors">
          <p class="role-card__extra-block__label">👀 Ostatní impostoři</p>
          <ul class="role-card__extra-block__list">
            ${others.map((p) => `<li>${escapeHtml(p.name)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
  }

  // Tajný úkol — dostane ho každý hráč
  if (state.activeModes.secretTasks && state.secretTaskAssignments[playerId]) {
    blocks.push(`
      <div class="role-card__extra-block role-card__extra-block--task">
        <p class="role-card__extra-block__label">🎭 Tvůj tajný úkol</p>
        <p class="role-card__extra-block__value">${escapeHtml(state.secretTaskAssignments[playerId])}</p>
      </div>
    `);
  }

  return blocks.join('');
}

/** Zobrazí kartu s rolí aktuálního hráče. */
function showCurrentPlayerRole() {
  const playerId = state.revealOrder[state.currentRevealStep];
  const isImpostor = state.impostorPlayerIds.includes(playerId);

  const normalFace = qs('#role-card-normal');
  const impostorFace = qs('#role-card-impostor');

  if (isImpostor) {
    normalFace.classList.add('is-hidden');
    impostorFace.classList.remove('is-hidden');

    const topicLabel = qs('#role-topic-impostor-label');
    const topicValue = qs('#role-topic-impostor');
    if (state.showTopicToImpostor) {
      topicLabel.classList.remove('is-hidden');
      topicValue.classList.remove('is-hidden');
      topicValue.textContent = getSelectionLabel();
    } else {
      topicLabel.classList.add('is-hidden');
      topicValue.classList.add('is-hidden');
    }

    // Mód „Podobné slovo“ — impostor dostane podobné slovo místo prázdné informace
    const impostorTextEl = qs('#role-impostor-text');
    if (state.activeModes.similarWord && state.similarWordText) {
      impostorTextEl.innerHTML = `Jsi IMPOSTOR!<br />Nemáš to pravé slovo, ale dostáváš podobné: <strong class="role-card__similar-word">${escapeHtml(state.similarWordText)}</strong>. Snaž se to neprozradit.`;
    } else {
      impostorTextEl.innerHTML = 'Jsi IMPOSTOR!<br />Neznáš tajné slovo. Snaž se odhalit, o co jde, a nenech se prozradit.';
    }

    qs('#role-extra-impostor').innerHTML = buildExtraInfoHtml(playerId, true);
  } else {
    impostorFace.classList.add('is-hidden');
    normalFace.classList.remove('is-hidden');
    qs('#role-topic-normal').textContent = getSelectionLabel();
    qs('#role-word').textContent = state.secretWord;

    qs('#role-extra-normal').innerHTML = buildExtraInfoHtml(playerId, false);
  }

  qs('#reveal-waiting').classList.add('is-hidden');
  qs('#reveal-card-wrap').classList.remove('is-hidden');
  state.isCurrentCardRevealed = true;

  // Restart CSS animace karty
  const card = qs('#role-card');
  card.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  card.offsetHeight; // force reflow
  card.style.animation = '';
}

/** Skryje kartu a přejde na dalšího hráče, nebo na finální obrazovku (případně přes výměnu rolí). */
function hideCardAndAdvance() {
  state.currentRevealStep += 1;

  if (state.currentRevealStep >= state.revealOrder.length) {
    qs('#reveal-progress-fill').style.width = '100%';
    if (state.activeModes.roleSwap && state.roleSwapPair) {
      showRoleSwapScreen();
    } else {
      showFinalScreen();
    }
    return;
  }

  renderRevealStep();
}

/** Obrazovka pro mód „Výměna rolí“ — zobrazí, kteří dva hráči si mají prohodit telefony. */
function showRoleSwapScreen() {
  const [idA, idB] = state.roleSwapPair;
  const playerA = getPlayerById(idA);
  const playerB = getPlayerById(idB);
  qs('#roleswap-name-a').textContent = playerA ? playerA.name : '—';
  qs('#roleswap-name-b').textContent = playerB ? playerB.name : '—';
  switchScreen('screen-roleswap');
}

function showFinalScreen() {
  // Kdo popisuje slovo jako první (může to být klidně i Impostor)
  const startingPlayer = getPlayerById(state.startingPlayerId);
  qs('#final-starter-name').textContent = startingPlayer ? startingPlayer.name : '—';

  // Připrav data pro volitelné "Zobrazit odpověď"
  qs('#answer-topic').textContent = getSelectionLabel();
  qs('#answer-word').textContent = state.secretWord;
  const impostorNames = state.impostorPlayerIds
    .map((id) => getPlayerById(id).name)
    .join(', ');
  qs('#answer-impostors').textContent = impostorNames;
  qs('#answer-reveal').classList.add('is-hidden');

  renderFinalRules();
  setupCountdownIfNeeded();

  switchScreen('screen-final');
}

// Texty "oznamovacích" pravidel, které se jen vypíšou na finální obrazovce
const FINAL_RULE_TEXTS = {
  emojiMode: { icon: '😀', text: 'Jako nápovědu smíte použít pouze emoji.' },
  oneWord: { icon: '🗣️', text: 'Každý smí jako nápovědu říct jen jedno slovo.' },
  noWords: { icon: '🤐', text: 'První kolo se hraje pouze pomocí gest — beze slov.' },
};

/** Vypíše na finální obrazovce pravidla aktivních "oznamovacích" módů. */
function renderFinalRules() {
  const container = qs('#final-rules');
  const activeRuleKeys = Object.keys(FINAL_RULE_TEXTS).filter((key) => state.activeModes[key]);

  if (activeRuleKeys.length === 0) {
    container.classList.add('is-hidden');
    container.innerHTML = '';
    return;
  }

  container.innerHTML = activeRuleKeys.map((key) => `
    <div class="final-rule">
      <span class="final-rule__icon">${FINAL_RULE_TEXTS[key].icon}</span>
      <span>${escapeHtml(FINAL_RULE_TEXTS[key].text)}</span>
    </div>
  `).join('');
  container.classList.remove('is-hidden');
}

/** Zobrazí/skryje a případně spustí odpočet pro mód „Časový limit“. */
function setupCountdownIfNeeded() {
  const wrap = qs('#final-timelimit');
  stopCountdown();

  if (!state.activeModes.timeLimit) {
    wrap.classList.add('is-hidden');
    return;
  }

  wrap.classList.remove('is-hidden');
  startCountdown();
}

function startCountdown() {
  stopCountdown();
  let remaining = state.timeLimitSeconds;
  const valueEl = qs('#final-timelimit-value');
  valueEl.classList.remove('is-done');
  valueEl.textContent = remaining;

  state.countdownIntervalId = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      stopCountdown();
      valueEl.textContent = '🎬';
      valueEl.classList.add('is-done');
      return;
    }
    valueEl.textContent = remaining;
    valueEl.style.animation = 'none';
    // eslint-disable-next-line no-unused-expressions
    valueEl.offsetHeight; // force reflow, ať se pulzující animace přehraje znovu
    valueEl.style.animation = '';
  }, 1000);
}

function stopCountdown() {
  if (state.countdownIntervalId) {
    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = null;
  }
}

/** Reset zpět na obrazovku nastavení (zachová poslední nastavení hráčů/tématu). */
function resetToSetup() {
  stopCountdown();
  state.currentRevealStep = 0;
  state.secretWord = '';
  state.impostorPlayerIds = [];
  state.revealOrder = [];
  state.startingPlayerId = null;
  state.secretAllyIds = [];
  state.similarWordText = '';
  state.secretTaskAssignments = {};
  state.roleSwapPair = null;
  switchScreen('screen-setup');
}


/* =========================================================================
   7. THEME MANAGER — vlastní témata, import/export
   ========================================================================= */

function openThemeManager() {
  resetThemeForm();
  renderCustomTopicManagerList();
  qs('#theme-modal').classList.remove('is-hidden');
}

function closeThemeManager() {
  qs('#theme-modal').classList.add('is-hidden');
  resetThemeForm();
}

/** Naplní <select> kategorií aktuálním seznamem kategorií + volbou "nová kategorie". */
function renderThemeCategoryOptions(selectedValue) {
  const select = qs('#theme-category-select');
  select.innerHTML = getCategoryNames()
    .map((name) => `<option value="${escapeHtml(name)}">${getCategoryIcon(name)} ${escapeHtml(name)}</option>`)
    .join('') + '<option value="__new__">➕ Nová kategorie…</option>';
  select.value = selectedValue || getCategoryNames()[0] || '__new__';
  handleThemeCategoryChange();
}

function handleThemeCategoryChange() {
  const isNew = qs('#theme-category-select').value === '__new__';
  qs('#theme-new-category-fields').classList.toggle('is-hidden', !isNew);
}

function resetThemeForm() {
  state.editingTopicKey = null;
  qs('#theme-form-title').textContent = 'Přidat novou podkategorii';
  renderThemeCategoryOptions();
  qs('#theme-category-select').disabled = false;
  qs('#theme-new-category-name').value = '';
  qs('#theme-new-category-icon').value = '';
  qs('#theme-subcategory-input').value = '';
  qs('#theme-subcategory-input').disabled = false;
  qs('#theme-words-input').value = '';
  qs('#btn-save-theme').textContent = 'Uložit podkategorii';
  qs('#btn-cancel-edit-theme').classList.add('is-hidden');
}

function startEditingTopic(category, subcategory) {
  const entry = findTopicEntry(category, subcategory);
  if (!entry) return;
  state.editingTopicKey = { category, subcategory };
  qs('#theme-form-title').textContent = `Upravit: ${category} › ${subcategory}`;
  renderThemeCategoryOptions(category);
  qs('#theme-category-select').disabled = true; // kategorie ani podkategorie se při editaci nemění
  qs('#theme-subcategory-input').value = subcategory;
  qs('#theme-subcategory-input').disabled = true;
  qs('#theme-words-input').value = entry.words.join(', ');
  qs('#btn-save-theme').textContent = 'Uložit změny';
  qs('#btn-cancel-edit-theme').classList.remove('is-hidden');
  qs('#theme-words-input').focus();
}

function parseWordsInput(raw) {
  return raw
    .split(/[,\n]/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    // odstranění duplicit
    .filter((w, idx, arr) => arr.indexOf(w) === idx);
}

function handleThemeFormSubmit(e) {
  e.preventDefault();
  const wordsInput = qs('#theme-words-input');
  const words = parseWordsInput(wordsInput.value);

  if (words.length < 4) {
    showToast('Přidej alespoň 4 slova.');
    return;
  }

  // --- Editace existující vlastní podkategorie: mění se jen slova ---
  if (state.editingTopicKey) {
    const { category, subcategory } = state.editingTopicKey;
    const idx = state.customTopicData.findIndex(
      (e) => e.category === category && e.subcategory === subcategory
    );
    if (idx === -1) {
      showToast('Podkategorii se nepodařilo najít.');
      return;
    }
    state.customTopicData[idx].words = words;
    saveCustomTopicData();
    showToast('Podkategorie byla upravena ✅');
    resetThemeForm();
    renderCustomTopicManagerList();
    renderTopicPanel();
    return;
  }

  // --- Nová vlastní podkategorie ---
  const categorySelect = qs('#theme-category-select');
  let category = categorySelect.value;
  let newCategoryIcon = '';

  if (category === '__new__') {
    category = qs('#theme-new-category-name').value.trim();
    newCategoryIcon = qs('#theme-new-category-icon').value.trim();
    if (!category) {
      showToast('Zadej název nové kategorie.');
      return;
    }
    if (getCategoryNames().some((n) => n.toLowerCase() === category.toLowerCase())) {
      showToast('Kategorie s tímto názvem už existuje — vyber ji ze seznamu.');
      return;
    }
  }

  const subcategory = qs('#theme-subcategory-input').value.trim();
  if (!subcategory) {
    showToast('Zadej název podkategorie.');
    return;
  }
  if (findTopicEntry(category, subcategory)) {
    showToast('Tato podkategorie v dané kategorii už existuje.');
    return;
  }

  state.customTopicData.push({ category, subcategory, words });
  saveCustomTopicData();

  if (newCategoryIcon) {
    state.customCategoryIcons[category] = newCategoryIcon;
    saveCustomCategoryIcons();
  }

  showToast('Podkategorie byla přidána ✅');
  resetThemeForm();
  renderCustomTopicManagerList();
  renderTopicPanel();
}

function deleteCustomTopic(category, subcategory) {
  state.customTopicData = state.customTopicData.filter(
    (e) => !(e.category === category && e.subcategory === subcategory)
  );
  saveCustomTopicData();

  // Pokud po smazání v (vlastní) kategorii nezbyla žádná podkategorie, ukliď i její ikonu
  if (!CATEGORY_ORDER.includes(category) && getSubcategoriesForCategory(category).length === 0) {
    delete state.customCategoryIcons[category];
    saveCustomCategoryIcons();
    if (state.topicBrowseCategory === category) {
      state.topicBrowseCategory = null;
    }
  }

  // Odeber i případný záznam z oblíbených
  const favIdx = state.favoriteSubcategories.indexOf(favoriteKey(category, subcategory));
  if (favIdx !== -1) {
    state.favoriteSubcategories.splice(favIdx, 1);
    saveFavorites();
  }

  if (!isTopicSelectionValid()) {
    selectFirstAvailableTopic();
  }

  renderCustomTopicManagerList();
  renderTopicPanel();
  showToast('Podkategorie byla smazána 🗑️');
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast('Zkopírováno do schránky 📋'),
      () => fallbackCopy(text)
    );
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Zkopírováno do schránky 📋');
  } catch (e) {
    showToast('Kopírování se nezdařilo.');
  }
  document.body.removeChild(textarea);
}

function copySelectedTopic() {
  const words = resolveWordPool();
  if (!words.length) return;
  copyTextToClipboard(`${getSelectionLabel()}: ${words.join(', ')}`);
}

function exportTopicsToJson() {
  if (state.customTopicData.length === 0) {
    showToast('Nemáš žádné vlastní podkategorie k exportu.');
    return;
  }
  const dataStr = JSON.stringify(
    { version: 2, topics: state.customTopicData, categoryIcons: state.customCategoryIcons },
    null,
    2
  );
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nikomu-never-temata.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Podkategorie byly exportovány ⬇️');
}

function triggerImportDialog() {
  qs('#import-file-input').click();
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      let importedCount = 0;

      const importEntry = (category, subcategory, words) => {
        if (!category || !subcategory || !Array.isArray(words)) return;
        const cleanWords = words.map(String).map((w) => w.trim()).filter(Boolean);
        if (cleanWords.length < 2) return;
        const existingIdx = state.customTopicData.findIndex(
          (e) => e.category === category && e.subcategory === subcategory
        );
        if (existingIdx !== -1) {
          state.customTopicData[existingIdx].words = cleanWords;
        } else {
          state.customTopicData.push({ category, subcategory, words: cleanWords });
        }
        importedCount += 1;
      };

      if (Array.isArray(parsed)) {
        // Formát: [{ category, subcategory, words }, ...]
        parsed.forEach((entry) => {
          if (entry && typeof entry === 'object') {
            importEntry(String(entry.category || ''), String(entry.subcategory || ''), entry.words);
          }
        });
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.topics)) {
        // Formát: { version, topics: [...], categoryIcons: {...} } — vlastní export téhle hry
        parsed.topics.forEach((entry) => {
          if (entry && typeof entry === 'object') {
            importEntry(String(entry.category || ''), String(entry.subcategory || ''), entry.words);
          }
        });
        if (parsed.categoryIcons && typeof parsed.categoryIcons === 'object') {
          Object.entries(parsed.categoryIcons).forEach(([cat, icon]) => {
            if (typeof icon === 'string' && icon) state.customCategoryIcons[cat] = icon;
          });
          saveCustomCategoryIcons();
        }
      } else if (parsed && typeof parsed === 'object') {
        // Starý plochý formát: { "Název tématu": ["slovo", ...] }
        Object.entries(parsed).forEach(([name, words]) => {
          importEntry('Importovaná témata', name, words);
        });
      } else {
        throw new Error('Neplatný formát JSON.');
      }

      if (importedCount === 0) {
        showToast('V souboru nebyla nalezena žádná platná data.');
        return;
      }

      saveCustomTopicData();
      renderCustomTopicManagerList();
      renderTopicPanel();
      showToast(`Importováno podkategorií: ${importedCount} ✅`);
    } catch (err) {
      showToast('Nepodařilo se načíst soubor JSON.');
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}


/* =========================================================================
   8. EVENT LISTENERS
   ========================================================================= */

function bindEvents() {
  // --- Setup: počet hráčů ---
  qs('#btn-players-minus').addEventListener('click', () => changePlayerCount(-1));
  qs('#btn-players-plus').addEventListener('click', () => changePlayerCount(1));

  // --- Setup: zamíchat hráče ---
  qs('#btn-shuffle-players').addEventListener('click', shufflePlayersManually);

  // --- Setup: téma ---
  qs('#btn-copy-topic').addEventListener('click', copySelectedTopic);
  qs('#btn-open-theme-manager').addEventListener('click', openThemeManager);

  // --- Setup: nastavení hry ---
  qs('#btn-impostors-minus').addEventListener('click', () => changeImpostorCount(-1));
  qs('#btn-impostors-plus').addEventListener('click', () => changeImpostorCount(1));
  qs('#toggle-show-topic').addEventListener('change', (e) => {
    state.showTopicToImpostor = e.target.checked;
  });

  // --- Setup: start hry ---
  qs('#btn-start-game').addEventListener('click', startGame);

  // --- Reveal screen ---
  qs('#btn-show-role').addEventListener('click', showCurrentPlayerRole);
  qs('#btn-hide-role').addEventListener('click', hideCardAndAdvance);

  // --- Role swap screen (mód „Výměna rolí“) ---
  qs('#btn-roleswap-continue').addEventListener('click', showFinalScreen);

  // --- Final screen ---
  qs('#btn-new-game').addEventListener('click', resetToSetup);
  qs('#btn-reveal-answer').addEventListener('click', () => {
    qs('#answer-reveal').classList.toggle('is-hidden');
  });
  qs('#btn-restart-countdown').addEventListener('click', startCountdown);

  // --- Theme manager modal ---
  qs('#btn-close-theme-manager').addEventListener('click', closeThemeManager);
  qs('#theme-modal').addEventListener('click', (e) => {
    if (e.target.id === 'theme-modal') closeThemeManager();
  });
  qs('#theme-form').addEventListener('submit', handleThemeFormSubmit);
  qs('#btn-cancel-edit-theme').addEventListener('click', resetThemeForm);
  qs('#theme-category-select').addEventListener('change', handleThemeCategoryChange);
  qs('#btn-export-topics').addEventListener('click', exportTopicsToJson);
  qs('#btn-import-topics').addEventListener('click', triggerImportDialog);
  qs('#import-file-input').addEventListener('change', handleImportFile);

  // Zavření modalu klávesou Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !qs('#theme-modal').classList.contains('is-hidden')) {
      closeThemeManager();
    }
  });
}


/* =========================================================================
   9. INIT
   ========================================================================= */

function applyStoredSettings() {
  const saved = loadSettings();
  if (!saved) return;

  if (saved.playerCount >= 3 && saved.playerCount <= 20) {
    state.playerCount = saved.playerCount;
  }
  if (Array.isArray(saved.playerNames)) {
    state.players = saved.playerNames.map((name, idx) => ({ id: idx, name }));
  }
  if (
    saved.topicSelection && typeof saved.topicSelection === 'object'
    && typeof saved.topicSelection.mode === 'string'
  ) {
    state.topicSelection = saved.topicSelection;
  }
  if (typeof saved.impostorCount === 'number') {
    state.impostorCount = saved.impostorCount;
  }
  if (typeof saved.showTopicToImpostor === 'boolean') {
    state.showTopicToImpostor = saved.showTopicToImpostor;
  }

  if (saved.activeModes && typeof saved.activeModes === 'object') {
    // Načti jen známé módy, ať případná stará/poškozená data nerozbijí rozhraní
    GAME_MODE_ORDER.forEach((key) => {
      if (typeof saved.activeModes[key] === 'boolean') {
        state.activeModes[key] = saved.activeModes[key];
      }
    });
  } else if (typeof saved.randomOrder === 'boolean') {
    // Zpětná kompatibilita se starším uloženým nastavením (před herními módy)
    state.activeModes.randomOrder = saved.randomOrder;
  }

  if (
    typeof saved.timeLimitSeconds === 'number' &&
    GAME_MODES.timeLimit.options.includes(saved.timeLimitSeconds)
  ) {
    state.timeLimitSeconds = saved.timeLimitSeconds;
  }
}

function initApp() {
  // Nejdřív zkus migrovat starý plochý formát vlastních témat (před herními módy/podkategoriemi)
  const migrated = migrateLegacyCustomTopics();
  state.customTopicData = migrated.length > 0 ? migrated : loadCustomTopicData();
  if (migrated.length > 0) {
    saveCustomTopicData();
  }
  state.customCategoryIcons = loadCustomCategoryIcons();
  state.favoriteSubcategories = loadFavorites();

  applyStoredSettings();
  if (!isTopicSelectionValid()) {
    selectFirstAvailableTopic();
  }

  // Promítnutí načteného stavu do UI ovládacích prvků
  qs('#player-count-value').textContent = state.playerCount;
  qs('#impostor-count-value').textContent = state.impostorCount;
  qs('#toggle-show-topic').checked = state.showTopicToImpostor;

  clampImpostorCount();
  renderPlayerNameInputs();
  renderTopicPanel();
  renderGameModesGrid();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', initApp);
