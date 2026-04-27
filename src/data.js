// SOURCE: ECG OFFICIAL LOAD MANAGEMENT SCHEDULE - APRIL 25 TO MAY 1, 2026

export const SCHEDULE_DATES = [
  { date: "2026-04-25", day: "Saturday",  slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
  { date: "2026-04-26", day: "Sunday",    slots: [{ group:"B", start:"06:00", end:"12:00" }, { group:"C", start:"12:00", end:"18:00" }, { group:"A", start:"18:00", end:"00:00" }, { group:"B", start:"00:00", end:"06:00" }] },
  { date: "2026-04-27", day: "Monday",    slots: [{ group:"C", start:"06:00", end:"12:00" }, { group:"A", start:"12:00", end:"18:00" }, { group:"B", start:"18:00", end:"00:00" }, { group:"C", start:"00:00", end:"06:00" }] },
  { date: "2026-04-28", day: "Tuesday",   slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
  { date: "2026-04-29", day: "Wednesday", slots: [{ group:"B", start:"06:00", end:"12:00" }, { group:"C", start:"12:00", end:"18:00" }, { group:"A", start:"18:00", end:"00:00" }, { group:"B", start:"00:00", end:"06:00" }] },
  { date: "2026-04-30", day: "Thursday",  slots: [{ group:"C", start:"06:00", end:"12:00" }, { group:"A", start:"12:00", end:"18:00" }, { group:"B", start:"18:00", end:"00:00" }, { group:"C", start:"00:00", end:"06:00" }] },
  { date: "2026-05-01", day: "Friday",    slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
];

export const REGIONS_DATA = [
  {
    id: "accra", name: "Accra",
    groups: {
      A: ["South Odorkor", "Odorgonno", "Awoshie Massalatsi", "Parts of Airport Residential Area", "Opeibia", "Adabraka Free Town", "Dome New Market", "Taifa", "Kaneshie Flats", "Kaneshie Sports Complex", "Mallam Atta Market", "Accra New Town", "Tudu/Aflao Station", "Makola", "James Town", "Pig Farm", "Kotobabi Police Station", "Rawlings Circle", "Madina Market", "Atomic Junction", "North Legon", "Pentecost University", "Pokuase Interchange", "East Legon", "Bawaleshie", "Madina", "PRESEC", "UPSA", "Lapaz", "Legon", "Ecobank HQ", "Ridge Tower", "Ringway Estates", "Adenta Estates", "Adeiso", "Valley View University", "Oyibi", "Amasaman"],
      B: ["Abossey Okai", "Zongo Junction", "Kaneshie Orange Market", "Mamprobi", "Oyarifa", "Akramaman", "Yahoman", "Ayikai Doblo", "Pobiman", "Greda Estates", "Atinka Media", "Aburi", "UG Business School", "Nsawam Prisons", "American Embassy", "Mamobi", "Accra Girls", "Kotobabi", "Kwashieman", "Santamaria", "Alhaji", "Haatso", "Legon Botanical Gardens", "Peduase Lodge", "Kitase", "Ashongman", "Gbawe", "Agbogbloshie", "Golf Park", "Kisseiman", "Airport Residential Area", "Roman Ridge", "Labone", "La Wireless Station", "Alisa Hotel", "Nmai Djorn", "Akweteman", "Dansoman", "SSNIT Flats", "Movenpick", "Accra City Hotel", "Supreme Court", "Opera Square", "Nkrumah Circle", "Achimota Market", "Pantang Junction", "Kottam Estates", "Alisa Village", "North Ridge Hotel", "Accra High School", "MTN HQ", "Trust Hospital", "Osu", "Cantonment", "Labone GNTC"],
      C: ["Asylum Down", "Geological Survey", "Atomic Commission", "Haatso Ecomog", "Salaga Market", "James Town", "Labone", "Achimota School", "Chorkor", "Korle Gonno", "St Mary SHS", "Mile 7", "New Achimota", "Tesano", "Charleston Hotel", "Katamanto Market", "Kotobabi Down", "Abelemkpe", "Nsawam Market", "Madina Social Welfare", "Frafraha", "Sapeiman", "Amasaman", "Nima", "Dansoman Last Stop", "Mallam Market", "Gbawe", "Weija Junction", "Dodowa Hospital", "East Legon Hills", "Katamanso", "Academic City University", "Abeka Market", "Tse Addo", "Madina Zongo Junction"],
    }
  },
  {
    id: "ashanti", name: "Ashanti",
    groups: {
      A: ["Parts of Eusu", "Kokobra", "Deduako", "Kokoben", "Donyina", "Manso-Nkwanta", "Twedie", "Amankyea", "Esaase Bontefofum", "Tetrem", "Heman", "Amosaman", "Kokote", "Namong", "Chwumasi", "Part of Pankrono", "Apromoase", "Krapa", "Part of Ejisu", "Asokore Mampong", "Parkoso", "BRRI", "CRI", "Oforikrom", "STC", "Ejisu Sec Tech", "Amakom", "Stadium", "Krofrom", "Afrancho", "Ahwiaa Town", "Komfo Anokye SHS", "GBC", "Konongo", "Asikafuoambantem", "Obogu", "Asankare", "Bompata", "Asokwa", "Juuben", "Maase", "Nfensi", "Asafo Market", "Old & New Suame", "Mamponteng", "Agona", "Mampong Effiduse", "Breman", "Kronum", "Afrancho", "Nkawie"],
      B: ["Moinssi Valley", "Akrofuom", "Jimiso", "Part of Bekwai Township", "Sasa", "Bouho", "Brofoyedru", "Ampabame", "Bomso", "Tafo Nhyiaeso", "Tafo", "Adagya", "Esereso", "Jachie", "Pramso", "Old & New Suame", "Odeneho Kwadaso", "Agric Amanfrom", "Santasi Apire", "Manhyia", "Koforidua", "Ntensere", "Mfensi", "Sokoban", "Adiebeba", "Ahodwo", "Melcom", "Fankyenebra", "Patasi", "Nkwantakese", "Mankranso", "Kunso", "Kwaso", "Essienimpong", "Kokoben", "Atimatim", "Kaasi", "Ahinsan", "Santasi", "Nsenie", "Kokofu", "Asankari", "Dichemso", "Agona", "Kumawu", "Effiduase", "Mampong", "Ahwiaa Newsite", "Ahwiaa Overseas", "Asikuma", "Esereso"],
      C: ["Abakomade", "Part of Abuakwa", "Paramount", "St. Elizabeth", "Adwumam", "Adagya", "Sesease", "KMA Residency", "Nhyayeso", "Asawase Market", "Afia Kobi Market", "Cocoa Clinic", "Part of Adum", "Bompata", "K Poly", "Asafo", "Mbrom", "Roman Hill", "Town Hall", "SIC", "Central Market", "Dakwadwum", "TUC", "Agogo", "Atonsu", "Atimatim", "Bantama", "Race Course", "Cultural Centre", "Aboabo", "Asawasi", "Gyinyase", "Kotei", "Part of Ahinsan", "Ahinsan Est.", "Kwadaso", "Asuoyeboa", "SSNIT Flat", "KNUST", "Tanoso", "Patase", "Police Depot", "Santase Roundabout", "Edwinase", "Kwadaso Estate", "Bomfa", "CAC University", "Garden City", "Buokrom", "Airport Roundabout", "Pankrono Est.", "Fumesua", "Kwamo", "Parts of Ejisu", "Bebre", "Mensakrom"],
    }
  },
  {
    id: "tema", name: "Tema",
    groups: {
      A: ["Nungua Zongo", "Kpeshie Police HQ", "Coco Beach", "Afienya", "Valco Flats", "Naval Base", "Tema New Town", "Comm 19", "Ghana Steel", "Kpone", "Ososhie", "Adom Estates", "Ashaiman Timber Market", "Comm 7", "Jericho", "State School for the Deaf", "Adjei Kodjo", "Marina Mall", "Lashibi", "Sakumono", "Celebrity Golf Club", "Comm 25", "Kent Estates", "Shell Signboard", "New Ningo", "Old Ningo", "Nungua Secondary School", "Nungua Town Park", "WAPCo", "Naval Quarters", "Tema International School", "Don Bosco", "Goshen Ghetsile"],
      B: ["TIS Basic School", "Comm 22", "European Market", "Comm 17", "HFC Estates", "Cambodia", "Katamanso", "Gbetsile", "Ashaiman Circuit Courts", "Railway Quarters", "Comm 5", "Central University", "Ghanaman Soccer Academy", "Ghana Water Prampram", "Tsopoli", "Dawa", "Sege", "Big Ada", "Ada Foah", "Palace Mall", "Kpone Barrier", "Motorway Total", "Square D", "Abbattoir", "Comm 8", "Akrade", "Senchi", "Atimpoku", "Juapong", "Frankadua", "African Fish Anum", "Comm 12", "Akuaba Estates", "Adotey Prampram Junction", "Prampram Township", "Comm 10", "Comm 25 Mall", "LEKMA Polyclinic", "Coastal Estates"],
      C: ["OLAM SHS", "Comm 4", "Lashibi Klagon", "Comm 19 Annex", "EMEF Estates", "ECG Flats", "GNPC Flats", "Comm 3", "Sites A & B", "BNI Flats", "TOR Flats", "Adom FM", "VRA/GRIDCo Flats", "Womens Hospital", "Comm 11", "Nuaso", "Agomanya", "St Martins Hospital", "Lebanon Zone 3", "Asutsuare", "Commandos Military Training Camp", "Comm 25", "Bulasu", "Casilda Estates", "Dawhenya Township", "Saglemi Housing", "Gbetsile Junction", "Ashaiman New Town", "Odumse", "Kpone Affordable Housing", "Kpone Township", "Spintex Junction", "KFC", "Akorley Township", "Regional Maritime University", "Comm 9 Market"],
    }
  },
  {
    id: "volta", name: "Volta",
    groups: {
      A: ["Adidome Township", "Akyemfo", "Mali Anfoe", "Mepe Dagorme", "Kpando Township", "Ve-Golokwati", "Fume", "Logba Towns", "Part of Jasikan Township", "Bodada Towns", "Bowiri Towns", "Anfoeta Towns", "Amedzofe", "Kpedze Towns", "Klefe Towns", "Soldiers Barracks", "Worawora", "Tapa Amanya", "Adaklu Sofa", "Adaklu Waya", "Kpoeta", "Part of Hohoe", "Hodzoga", "Tanyigbe", "Part of Mafi Towns", "Aflas Township", "Cross border Towns"],
      B: ["Oklahoma", "Lolobi Towns", "Likpe Towns", "Ayoma Towns", "Agorpenu", "Sogakope Township", "Dabala Town", "Adutor", "Tsavanya", "Tordzinu", "Klotekpo", "Akatsi Township", "Dzrakate", "Abor", "Tadzewu", "Avalavi", "Fodome Towns", "Gbledi Towns", "Wli Towns", "Part of Kpando Towns", "Alavanyo Towns", "Nkonya Towns", "Hedzranawo", "Adina", "Kedzi", "Agavedzi", "Keta", "Kadjebi", "Part of Ho Township", "Part of UHAS", "Adaklu Kodzobi", "Sokode Lokoe", "Akrofu", "Abutia", "Aflao", "Denu", "Tsito Township"],
      C: ["Tokor", "SPACO", "Kopeyia", "Dzodze", "Ave Towns", "Nogokpo", "Agbozume", "Dzaglame", "Klikor", "Weta Towns", "Afiadenyigba", "Part of Akatsi Towns", "Part of Ho Township", "Agotime Towns", "Kpetoe", "Agorhome", "Batume Junction", "Ziope Towns", "Agonu Towns", "Honugo", "Bedzame", "Part of Hohoe Township", "Anfoega Towns", "Vakpo", "Wusuta Towns", "Tsrukpe Towns", "Agordome", "Kepnu", "Angloga", "Part of Keta", "Worawora", "Kabusu", "Dambai", "Kpando Todzi", "Kpando Togorme", "Kpeve Township", "Kpalime", "Peki"],
    }
  },
  {
    id: "western-eastern-central", name: "Western / Eastern / Central",
    groups: {
      A: ["Diabene", "Nkroful", "Ntankoful", "Race Course", "Inchaban", "Nyankrom", "Shama", "Abuesi", "Cape 3 Point", "Prestea Township", "Mankesim", "Pewodie", "Diaso", "New Obuasi", "Ankwaso", "ECG District Office", "Regional Hospital", "Anlo Town", "Central Market", "Amanase", "Kyekyewere", "Kade", "Okumaning", "Obo", "Obomeng", "Osabene Township", "KTU", "Nsutam", "Abompe", "Osino", "Akim Tafo Township", "CRIG", "Awenare", "Abirem", "Boti Falls", "Huhunya", "Asesewa", "Ajumako Township", "Anomabo Township", "Saltpond Township", "Ankaful", "Mfanstiman Girl", "Mankessun Township", "Assin Fosu Township", "Abura Dunkwa", "Assin North and South"],
      B: ["Mumuni", "Atobrakrom", "Yerase", "New Atuabo", "Bogoso Township", "Oppon Valley", "Samahu", "Himan Township", "Brumasi", "Duamasi", "Ghana Gas", "Dadieso", "Asamankese Township", "Bunso Lindador", "Forest Gate", "Kibi", "Nkronso", "Bepong", "Kwahu Tafo", "Nkawkaw Novotex", "Amanfrom", "Saafi", "Awenade", "Besease", "Kwahu Praso", "Begoro", "Ofoase", "Suhum Township", "Nkawkaw", "Oframase", "Mpraeso", "Jejeti Towns", "Kwahu Nsabah", "UCC", "Industrial Estate", "Radio Central", "Adisadel Estate", "West End", "Mfanstipim Flat", "4th Ridge", "Pedu Junction", "Pedu Township", "Central Regional Hospital", "Eguase", "Moree", "Komenda", "Elmina Town", "Assin North & South", "Assin Fosu Town"],
      C: ["BU Junction", "Fijai", "Adiembra", "Kweikuma", "New Amanful", "Takoradi Beach Road", "Dupaul", "Apremdo", "Whindo", "Assakae", "Apowa", "Mpohor", "Adum Banso", "Breman", "Kwabeng", "Agona", "Dominase Nkwanta", "Nkroful", "Akontombra", "Juaboso", "Akim Swedru SHS", "Asikuma", "Nkwatia", "Abetifi", "Effiduase", "Asokore", "Suhum Township", "Akwatia", "Timber Market", "Achiase", "Part of Nkawkaw Township", "Nyankomase", "Kubriso", "Akanteng", "Residency", "Atekyem", "Nyamekrom", "Densu", "Part of Okorase", "Adawso", "Akim Oda Post Office", "Police Barracks", "Osorase", "Achiase", "Esukyir", "Senya", "Bonsuoko", "Gomoah Fetteh", "Budunburam", "Nkwantenan", "Accra Newtown", "Colombo", "Galilea Market", "TV3", "Denchira", "Domeabra"],
    }
  }
];

// Helper: Get current group(s) in outage right now
export function getCurrentOutageGroups() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const today = SCHEDULE_DATES.find(d => d.date === dateStr);
  if (!today) return [];

  return today.slots
    .filter(slot => {
      if (slot.end === "00:00") return timeStr >= slot.start;
      if (slot.start === "00:00") return timeStr < slot.end;
      return timeStr >= slot.start && timeStr < slot.end;
    })
    .map(slot => slot.group);
}

// Helper: Find which region+group an area belongs to
export function findArea(query) {
  const q = query.toLowerCase();
  for (const region of REGIONS_DATA) {
    for (const [group, areas] of Object.entries(region.groups)) {
      const match = areas.find(a => a.toLowerCase().includes(q));
      if (match) return { region, group, areaName: match };
    }
  }
  return null;
}

// Helper: Get next outage slot for a given group today
export function getNextSlot(group) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const today = SCHEDULE_DATES.find(d => d.date === dateStr);
  if (!today) return null;

  // Find next upcoming slot for this group today
  const upcoming = today.slots.find(slot => slot.group === group && slot.start > timeStr);
  if (upcoming) return { ...upcoming, date: today.date, day: today.day };

  // Check tomorrow
  const todayIndex = SCHEDULE_DATES.indexOf(today);
  if (todayIndex < SCHEDULE_DATES.length - 1) {
    const tomorrow = SCHEDULE_DATES[todayIndex + 1];
    const nextSlot = tomorrow.slots.find(s => s.group === group);
    if (nextSlot) return { ...nextSlot, date: tomorrow.date, day: tomorrow.day };
  }
  return null;
}
