import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, Type, BookOpen, Book, ArrowRight, Grid } from 'lucide-react';

// --- TYPES & DATA STRUCTURES ---

interface TafsirSource {
  maudhui: string; // Thematic commentary based on Ibn Kathir
}

interface Verse {
  surah: number;
  number: number;
  text: {
    arab: string;
  };
  translation: {
    id: string;
  };
  tafsir: TafsirSource;
}

interface ThemeItem {
  id: number;
  title: string;
  ref: string; 
  verses: { s: number, v: number[] }[]; 
}

interface ThemeCategory {
  code: string; 
  title: string;
  items: ThemeItem[];
}

// --- REAL OFFLINE DATASET (MAUDHUI - IBN KATHIR DEEP DIVE) ---
// Sumber: Tafsir Al-Qur'an Al-Azhim (Ibnu Katsir) - Shamela.ws/book/23604

const VERSE_LIBRARY: Record<string, Verse> = {
  // --- A. AKIDAH ---
  "2_21": { surah: 2, number: 21, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ وَٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ" }, translation: { id: "Wahai manusia! Sembahlah Tuhanmu yang telah menciptakan kamu dan orang-orang yang sebelum kamu, agar kamu bertakwa." }, tafsir: { maudhui: "Imam Ibnu Katsir menjelaskan bahwa ayat ini merupakan perintah pertama yang ditujukan kepada seluruh umat manusia di dalam urutan Mushaf Al-Qur'an. Allah SWT memerintahkan manusia untuk menyembah-Nya semata (Tauhid Uluhiyah) dengan mengajukan bukti rasional bahwa Dialah yang menciptakan mereka dari tiada menjadi ada (Tauhid Rububiyah). Ibadah kepada Allah adalah konsekuensi logis dari pengakuan kita akan eksistensi Sang Pencipta yang juga telah menciptakan nenek moyang sebelum kita. Ibnu Abbas menafsirkan 'U'budu' sebagai 'Wahhidu' (esakanlah Dia). Tujuannya adalah 'La'allakum tattaqun', agar manusia memelihara diri dari kemurkaan-Nya dan azab-Nya di dunia dan akhirat dengan melakukan ketaatan." } },
  "2_22": { surah: 2, number: 22, text: { arab: "ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ فِرَٰشًا وَٱلسَّمَآءَ بِنَآءً..." }, translation: { id: "Dialah yang menjadikan bumi sebagai hamparan bagimu dan langit sebagai atap..." }, tafsir: { maudhui: "Dalam ayat ini, Allah menyebutkan dalil-dalil penciptaan alam semesta sebagai bukti kekuasaan-Nya yang mutlak. Dia menjadikan bumi sebagai hamparan (firasha) yang stabil untuk didiami, tidak berguncang, dan langit sebagai atap (binaa') yang kokoh menjaga bumi. Allah juga menurunkan air hujan sebagai sebab tumbuhnya rezeki berupa buah-buahan. Ibnu Katsir menekankan larangan 'Fala taj'alu lillahi andada' (Janganlah mengadakan sekutu bagi Allah). Ibnu Abbas menjelaskan bahwa 'Andada' di sini termasuk syirik yang paling tersembunyi (Shirk Khafi), seperti ketergantungan hati kepada selain Allah atau bersumpah dengan selain nama-Nya, padahal secara logika manusia tahu bahwa berhala atau makhluk tidak mampu menciptakan air dan langit." } },
  "6_162": { surah: 6, number: 162, text: { arab: "قُلْ إِنَّ صَلَاتِى وَنُسُكِى وَمَحْيَاىَ وَمَمَاتِى لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ" }, translation: { id: "Katakanlah: Sesungguhnya salatku, ibadahku, hidupku dan matiku hanyalah untuk Allah..." }, tafsir: { maudhui: "Ayat ini adalah perintah tegas kepada Nabi Muhammad SAW untuk menyelisihi kaum musyrikin yang beribadah kepada berhala dan menyembelih dengan nama selain Allah. Kata 'Nusuk' menurut Said bin Jubair bermakna penyembelihan (Qurban), namun makna umumnya mencakup seluruh bentuk ibadah. Frasa 'Hidupku dan matiku' bermakna bahwa segala aktivitas kehidupan seorang mukmin dan keadaan matinya, semuanya diserahkan dan diikhlaskan hanya untuk Allah, Rabb semesta alam. Ini adalah proklamasi totalitas penghambaan, bahwa tidak ada satu detik pun dalam hidup seorang mukmin yang lepas dari orientasi Ilahi." } },
  "6_163": { surah: 6, number: 163, text: { arab: "لَا شَرِيكَ لَهُۥ ۖ وَبِذَٰلِكَ أُمِرْتُ وَأَنَا۠ أَوَّلُ ٱلْمُسْلِمِينَ" }, translation: { id: "Tidak ada sekutu bagi-Nya; dan demikianlah yang diperintahkan kepadaku..." }, tafsir: { maudhui: "Penegasan kembali (Taukid) dari ayat sebelumnya tentang kemurnian Tauhid. 'La syarika lahu' menafikan segala bentuk sekutu baik dalam Dzat, Sifat, maupun hak ibadah. Pernyataan 'Wa ana awwalul muslimin' (Aku adalah orang yang pertama berserah diri) menunjukkan bahwa Nabi Muhammad SAW adalah orang pertama dari umat ini yang tunduk patuh dan bersegera melaksanakan perintah Allah. Ibnu Katsir menjelaskan bahwa setiap Nabi adalah Muslim pertama di kalangan umatnya masing-masing, karena Islam (ketundukan kepada Allah) adalah agama seluruh para Nabi." } },
  "7_180": { surah: 7, number: 180, text: { arab: "وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا..." }, translation: { id: "Dan Allah memiliki Asma'ul-husna (nama-nama yang terbaik), maka bermohonlah kepada-Nya dengan menyebutnya..." }, tafsir: { maudhui: "Ibnu Katsir menafsirkan ayat ini dengan hadits masyhur bahwa Allah memiliki 99 nama, barangsiapa yang menghafal (dan memahaminya) akan masuk surga. Kita diperintahkan berdoa dengan menyebut nama yang sesuai konteks (misal: Ya Razzaq untuk rezeki). Allah juga mengancam orang-orang yang melakukan 'Ilhad' (penyimpangan) dalam nama-nama-Nya. Ilhad ini mencakup: menamai berhala dengan nama Allah (seperti Al-Uzza dari Al-Aziz), menolak nama-nama tersebut, menyerupakan sifat Allah dengan makhluk, atau memberi nama Allah dengan nama yang tidak Dia tetapkan (seperti sebutan 'Bapak' oleh Nasrani). Semua penyimpangan ini akan mendapat balasan yang pedih." } },
  "30_30": { surah: 30, number: 30, text: { arab: "فَأَقِمْ وَجْهَكَ لِلدِّينِ حَنِيفًا ۚ فِطْرَتَ ٱللَّهِ ٱلَّتِى فَطَرَ ٱلنَّاسَ عَلَيْهَا..." }, translation: { id: "Maka hadapkanlah wajahmu dengan lurus kepada agama (Allah); (tetaplah atas) fitrah Allah yang telah menciptakan manusia menurut fitrah itu..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa manusia diciptakan di atas 'Fitrah' yaitu kecenderungan alami untuk mengakui keesaan Allah (Tauhid). Jika seorang manusia dibiarkan tumbuh tanpa pengaruh eksternal yang menyimpang, ia pasti akan menjadi seorang Muslim yang mentauhidkan Allah. Perubahan terjadi karena pengaruh lingkungan dan pendidikan yang salah, sebagaimana sabda Nabi SAW: 'Setiap anak dilahirkan di atas fitrah, maka kedua orang tuanyalah yang menjadikannya Yahudi, Nasrani, atau Majusi.' Ayat ini memerintahkan kita untuk meluruskan wajah dan hati, kembali kepada settingan awal pabrik (fitrah) yang Allah ciptakan, yaitu Islam yang Hanif (lurus)." } },
  "42_11": { surah: 42, number: 11, text: { arab: "فَاطِرُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ ۚ ... لَيْسَ كَمِثْلِهِۦ شَىْءٌ ۖ وَهُوَ ٱلسَّمِيعُ ٱلْبَصِيرُ" }, translation: { id: "...Tidak ada sesuatu pun yang serupa dengan Dia, dan Dia Yang Maha Mendengar, Maha Melihat." }, tafsir: { maudhui: "Ayat ini adalah pondasi utama (Ummul Bab) dalam memahami Tauhid Asma wa Sifat menurut Ahlussunnah wal Jamaah. 'Laisa kamitslihi syai'un' adalah penolakan mutlak (Nafi) terhadap Tasybih (penyerupaan) Allah dengan makhluk-Nya dalam hal apapun. Namun, penolakan ini diikuti dengan penetapan (Itsbat) 'Wahuwas Sami'ul Bashir' (Dia Maha Mendengar, Maha Melihat). Ini mengajarkan kita untuk menetapkan sifat-sifat Allah sebagaimana Dia tetapkan untuk diri-Nya, tanpa menanyakan bagaimananya (Takyif), tanpa menyerupakan (Tamtsil), dan tanpa menolak maknanya (Ta'thil). Dia Mendengar dan Melihat dengan cara yang layak bagi keagungan-Nya, tidak sama dengan pendengaran dan penglihatan makhluk." } },
  "4_136": { surah: 4, number: 136, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ ءَامِنُوا۟ بِٱللَّهِ وَرَسُولِهِۦ..." }, translation: { id: "Wahai orang-orang yang beriman! Tetaplah beriman kepada Allah dan Rasul-Nya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa seruan 'Wahai orang-orang beriman, berimanlah...' bukanlah perintah untuk melakukan sesuatu yang belum dilakukan (tahshil al-hashil), melainkan perintah untuk **Istiqomah** (teguh), menyempurnakan iman, dan terus-menerus memperbaharui keyakinan. Iman itu bisa bertambah dan berkurang, maka Allah memerintahkan untuk menjaganya. Ayat ini juga merinci rukun iman yang wajib diyakini: Allah, Rasul, Kitab yang turun sekarang (Quran), dan Kitab masa lalu. Barangsiapa mengingkari salah satu dari rukun ini (Malaikat, Kitab, Rasul, Hari Akhir), maka menurut Ibnu Katsir, dia telah tersesat sejauh-jauhnya (Dhalalan Ba'ida) keluar dari jalan petunjuk." } },
  "2_285": { surah: 2, number: 285, text: { arab: "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ..." }, translation: { id: "Rasul telah beriman kepada Al-Qur'an... semuanya beriman kepada Allah, malaikat-Nya..." }, tafsir: { maudhui: "Dua ayat terakhir Al-Baqarah ini memiliki keutamaan besar, disebut sebagai 'Dua Cahaya'. Dalam ayat ini, Allah memuji Rasulullah SAW dan orang-orang mukmin karena mereka beriman kepada seluruh rukun iman secara utuh. Berbeda dengan Ahli Kitab yang membedakan para Rasul (beriman kepada sebagian dan kafir kepada sebagian lain), orang mukmin berkata 'Kami tidak membeda-bedakan seorang pun dari Rasul-rasul-Nya'. Sikap mereka adalah 'Sami'na wa atha'na' (Kami dengar dan kami taat), sebuah ketundukan total yang diiringi permohonan ampun (Gufranaka Rabbana), karena sadar bahwa betapapun taatnya, manusia pasti memiliki kekurangan." } },
  "66_6": { surah: 66, number: 6, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ قُوٓا۟ أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا... عَلَيْهَا مَلَـٰٓئِكَةٌ غِلَاظٌ شِدَادٌ..." }, translation: { id: "Wahai orang yang beriman! Peliharalah dirimu dan keluargamu dari api neraka... penjaganya malaikat-malaikat yang kasar, dan keras..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan tanggung jawab kepala keluarga untuk mendidik (Ta'dib) dan mengajarkan ilmu agama kepada keluarganya agar selamat dari neraka. Neraka itu dijaga oleh Malaikat Zabaniyah yang memiliki sifat 'Ghilaz' (Kasar hatinya, tidak memiliki belas kasihan sedikitpun kepada orang kafir) dan 'Shidad' (Keras fisiknya, sangat kuat dan menakutkan). Malaikat ini diciptakan untuk taat mutlak; mereka tidak pernah mendurhakai Allah dan selalu mengerjakan apa yang diperintahkan. Ini menunjukkan bahwa di akhirat nanti, tidak ada ruang negosiasi atau belas kasihan bagi penghuni neraka." } },
  "2_4": { surah: 2, number: 4, text: { arab: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ..." }, translation: { id: "Dan mereka yang beriman kepada (Al-Qur'an) yang diturunkan kepadamu dan (kitab-kitab) sebelumnya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa ini adalah sifat orang-orang bertakwa dari kalangan Ahli Kitab (seperti Abdullah bin Salam) dan mukmin secara umum. Mereka tidak hanya beriman kepada Al-Qur'an, tetapi juga meyakini kebenaran wahyu yang turun kepada Nabi-nabi terdahulu (Taurat, Injil, Zabur) tanpa fanatisme buta. Namun, keimanan kepada kitab terdahulu bersifat 'Tasdiq' (membenarkan asalnya), sedangkan pengamalan hukum mengikuti syariat yang dibawa oleh Nabi Muhammad SAW sebagai penghapus (nasikh) syariat sebelumnya. Mereka juga memiliki keyakinan yang menghunjam (Yuqinun) tentang adanya Hari Akhirat." } },
  "4_163": { surah: 4, number: 163, text: { arab: "إِنَّآ أَوْحَيْنَآ إِلَيْكَ كَمَآ أَوْحَيْنَآ إِلَىٰ نُوحٍۢ وَٱلنَّبِيِّۦنَ مِنۢ بَعْدِهِۦ..." }, translation: { id: "Sesungguhnya Kami mewahyukan kepadamu sebagaimana Kami telah mewahyukan kepada Nuh..." }, tafsir: { maudhui: "Ayat ini adalah bantahan terhadap orang-orang yang mengingkari kenabian Muhammad SAW. Allah menegaskan bahwa Muhammad bukanlah rasul yang 'baru' atau aneh (bid'ah minar rusul), melainkan mata rantai dari silsilah panjang para Nabi yang dimulai dari Nuh AS. Penyebutan Nuh sebagai patokan awal karena dia adalah Rasul pertama yang diutus dengan syariat hukum setelah terjadinya kesyirikan di bumi. Ibnu Katsir menyoroti bahwa semua Nabi ini (Ibrahim, Ismail, Isa, Ayyub, dll) membawa satu sumber wahyu yang sama, sehingga mengingkari satu berarti mengingkari semuanya." } },
  "59_7": { surah: 59, number: 7, text: { arab: "...وَمَآ ءَاتَىٰكُمُ ٱلرَّسُولُ فَخُذُوهُ وَمَا نَهَىٰكُمْ عَنْهُ فَٱنتَهُوا۟..." }, translation: { id: "...Apa yang diberikan Rasul kepadamu maka terimalah, dan apa yang dilarangnya bagimu maka tinggalkanlah..." }, tafsir: { maudhui: "Meskipun konteks ayat ini tentang pembagian harta fai' (rampasan perang), Ibnu Katsir menegaskan bahwa hukumnya berlaku umum (Al-Ibrah bi umumil lafzhi). Ayat ini adalah dalil wajibnya mengikuti Sunnah Rasulullah SAW dalam segala hal. Apa yang diperintahkan Rasul wajib dikerjakan, dan apa yang dilarang wajib ditinggalkan. Ketaatan kepada Rasul adalah bukti ketaatan kepada Allah. Ibnu Katsir menukil riwayat bahwa Ibnu Mas'ud melaknat wanita yang menyambung rambut dan mencukur alis berdasarkan ayat ini, karena Rasulullah melaknat perbuatan tersebut." } },
  "2_177": { surah: 2, number: 177, text: { arab: "لَّيْسَ ٱلْبِرَّ أَن تُوَلُّوا۟ وُجُوهَكُمْ قِبَلَ ٱلْمَشْرِقِ وَٱلْمَغْرِبِ..." }, translation: { id: "Bukanlah kebajikan itu sekadar menghadapkan wajah ke timur dan barat..." }, tafsir: { maudhui: "Dikenal sebagai 'Ayat Al-Birr' (Ayat Kebajikan). Ibnu Katsir menjelaskan sebab turunnya: Ketika kiblat dipindahkan, terjadi perdebatan sengit. Allah menegaskan bahwa inti agama bukanlah sekadar formalitas gerakan fisik menghadap timur atau barat, tetapi ketaatan hati. Kebajikan sejati mencakup: 1) Akidah (Iman kepada Allah, Hari Akhir, Malaikat, Kitab, Nabi), 2) Sosial (Infak kepada kerabat, yatim, miskin), 3) Ritual (Shalat, Zakat), dan 4) Akhlak (Menepati janji, sabar dalam kesempitan). Siapa yang memiliki sifat-sifat ini, merekalah orang yang benar (shiddiq) dan bertakwa." } },
  "36_78": { surah: 36, number: 78, text: { arab: "وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُۥ ۖ قَالَ مَن يُحْىِ ٱلْعِظَـٰمَ وَهِىَ رَمِيمٌ" }, translation: { id: "Dan dia membuat perumpamaan bagi Kami; dan dia lupa kepada kejadiannya; ia berkata: 'Siapakah yang dapat menghidupkan tulang belulang yang telah hancur luluh?'" }, tafsir: { maudhui: "Ibnu Katsir menceritakan sebab turunnya ayat ini berkaitan dengan Ubay bin Khalaf (atau Al-Ashi bin Wail) yang datang kepada Nabi membawa tulang lapuk, meremukkannya, lalu meniupnya sambil mengejek: 'Apakah Allah bisa menghidupkan ini setelah hancur?' Allah membantah logika dangkal manusia ini. Manusia lupa asal usulnya sendiri (nasiya khalqahu) yang diciptakan dari setetes air hina. Argumen Allah sangat telak: Dzat yang mampu menciptakan manusia pertama kali dari ketiadaan (which is harder), pasti jauh lebih mudah bagi-Nya untuk sekadar mengembalikan/menyusun ulang apa yang sudah pernah ada." } },
  "54_49": { surah: 54, number: 49, text: { arab: "إِنَّا كُلَّ شَىْءٍ خَلَقْنَـٰهُ بِقَدَرٍۢ" }, translation: { id: "Sungguh, Kami menciptakan segala sesuatu menurut ukuran (takdir)." }, tafsir: { maudhui: "Ayat ini adalah dalil utama tentang Qadha dan Qadar. Ibnu Katsir menjelaskan bahwa segala sesuatu di alam semesta ini, dari yang terbesar hingga yang terkecil (bahkan kelemahan dan kecerdasan), telah diketahui, dicatat, dikehendaki, dan diciptakan oleh Allah dengan ukuran yang spesifik. Takdir ini telah tertulis di Lauhul Mahfuz 50.000 tahun sebelum penciptaan langit dan bumi. Ayat ini turun untuk membantah kaum Qadariyah (pengingkar takdir) yang menganggap segala sesuatu terjadi secara kebetulan tanpa rencana Ilahi." } },
  "13_11": { surah: 13, number: 11, text: { arab: "...إِنَّ ٱللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا۟ مَا بِأَنفُسِهِمْ..." }, translation: { id: "...Sesungguhnya Allah tidak mengubah keadaan suatu kaum sehingga mereka mengubah keadaan yang ada pada diri mereka sendiri..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan hubungan antara Takdir dan Ikhtiar manusia. Konteks aslinya adalah tentang nikmat: Allah tidak akan mencabut nikmat, kesehatan, dan keamanan dari suatu kaum, kecuali jika kaum tersebut merubah ketaatan mereka menjadi kemaksiatan dan kekufuran. Jika mereka berubah (berbuat dosa), Allah akan mengubah nikmat menjadi azab. Begitu pula sebaliknya (dalam tafsir lain), jika mereka mengubah diri dari maksiat menjadi taat, Allah bisa mengubah nasib buruk menjadi baik. Ayat ini mengajarkan tanggung jawab moral manusia atas nasib mereka sendiri." } },
  "2_6": { surah: 2, number: 6, text: { arab: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ" }, translation: { id: "Sesungguhnya orang-orang kafir, sama saja bagi mereka, engkau beri peringatan atau tidak... mereka tidak akan beriman." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa ayat ini berbicara tentang orang-orang yang telah dipastikan kekafirannya dalam ilmu Allah (Syaqawah). Hati mereka telah terkunci mati (Khatam) karena kesombongan dan penolakan mereka terhadap kebenaran yang nyata. Peringatan Nabi tidak lagi bermanfaat bagi mereka bukan karena kurangnya hujjah, tetapi karena rusaknya wadah (hati) mereka. Namun, kita tidak tahu siapa orang ini secara spesifik, sehingga kewajiban dakwah tetap berlaku. Ayat ini juga sebagai tasliyah (penghibur) bagi Nabi agar tidak membinasakan dirinya karena sedih atas penolakan kaumnya." } },
  "14_34": { surah: 14, number: 34, text: { arab: "...وَإِن تَعُدُّوا۟ نِعْمَتَ ٱللَّهِ لَا تُحْصُوهَآ ۗ إِنَّ ٱلْإِنسَـٰنَ لَظَلُومٌ كَفَّارٌ" }, translation: { id: "...Dan jika kamu menghitung nikmat Allah, niscaya kamu tidak akan mampu menghitungnya. Sungguh manusia itu sangat zalim dan sangat mengingkari (nikmat)." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa nikmat Allah kepada hamba-Nya—baik yang dhahir maupun batin—sangatlah melimpah ruah hingga tak mungkin terhitung oleh matematika manusia. Mulai dari nikmat nafas, kesehatan, hingga iman. Namun, watak dasar manusia adalah 'Zalum' (sangat zalim, sering menempatkan nikmat bukan pada tempatnya/untuk maksiat) dan 'Kaffar' (sangat ingkar, sering melupakan pemberi nikmat). Hanya sedikit hamba-Nya yang bersyukur. Ayat ini menegur manusia agar sadar diri akan ketergantungan mutlak mereka kepada Allah." } },
  "4_48": { surah: 4, number: 48, text: { arab: "إِنَّ ٱللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِۦ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَآءُ..." }, translation: { id: "Sesungguhnya Allah tidak akan mengampuni dosa syirik, dan Dia mengampuni segala dosa yang selain dari (syirik) itu..." }, tafsir: { maudhui: "Ibnu Katsir menegaskan bahwa ini adalah ayat yang paling menakutkan sekaligus memberikan harapan. Menakutkan karena Allah menutup pintu ampunan bagi orang yang mati dalam keadaan membawa dosa Syirik (menyekutukan Allah) tanpa bertaubat. Syirik adalah dosa yang tidak terampuni di akhirat dan mengekalkan pelakunya di neraka. Namun, ayat ini juga memberi harapan karena dosa 'selain syirik' (Ma duna dzalik)—sebesar apapun itu (zina, membunuh, mencuri)—masih berada di bawah kehendak Allah (Tahta Masyi'ah). Jika Allah menghendaki, Dia bisa mengampuni pelakunya tanpa azab karena rahmat-Nya, atau mengazabnya sementara lalu memasukkannya ke surga." } },
  "31_13": { surah: 31, number: 13, text: { arab: "وَإِذْ قَالَ لُقْمَـٰنُ لِٱبْنِهِۦ وَهُوَ يَعِظُهُۥ يَـٰبُنَىَّ لَا تُشْرِكْ بِٱللَّهِ ۖ إِنَّ ٱلشِّرْكَ لَظُلْمٌ عَظِيمٌ" }, translation: { id: "Dan (ingatlah) ketika Luqman berkata kepada anaknya... 'Wahai anakku, janganlah kamu mempersekutukan Allah, sesungguhnya syirik itu adalah kezaliman yang besar'." }, tafsir: { maudhui: "Nasihat Luqman Al-Hakim kepada anaknya dimulai dengan prioritas tertinggi: Larangan Syirik. Ibnu Katsir menjelaskan alasan logis mengapa syirik disebut 'Zulm Azim' (Kezaliman yang Besar). Zalim artinya menempatkan sesuatu bukan pada tempatnya. Karena Allah adalah satu-satunya Pencipta dan Pemberi Rezeki, maka memberikan hak ibadah kepada selain-Nya adalah bentuk ketidakadilan dan penyelewengan yang paling fatal. Tidak ada kejahatan yang lebih besar daripada menyamakan makhluk yang lemah dengan Khaliq yang Maha Kuasa." } },
  "2_8": { surah: 2, number: 8, text: { arab: "وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ وَبِٱلْيَوْمِ ٱلْـَٔاخِرِ وَمَا هُم بِمُؤْمِنِينَ" }, translation: { id: "Di antara manusia ada yang berkata: 'Kami beriman kepada Allah dan Hari Kemudian,' padahal mereka itu sesungguhnya bukan orang-orang yang beriman." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa setelah merinci sifat Mukmin (ayat 1-5) dan Kafir (ayat 6-7), Allah menjelaskan sifat Munafik secara panjang lebar (ayat 8-20) karena bahaya mereka lebih besar. Nifaq adalah menampakkan kebaikan (Islam) di luar tetapi menyembunyikan kekafiran di dalam. Mereka mengklaim beriman dengan lisan ('Kami beriman'), namun Allah menolak klaim tersebut ('Wa ma hum bi mu'minin'). Mereka merasa pintar bisa menipu Allah dan orang beriman, padahal sejatinya mereka sedang menipu dan membinasakan diri sendiri tanpa mereka sadari." } },
  "9_67": { surah: 9, number: 67, text: { arab: "ٱلْمُنَـٰفِقُونَ وَٱلْمُنَـٰفِقَـٰتُ بَعْضُهُم مِّنۢ بَعْضٍ ۚ يَأْمُرُونَ بِٱلْمُنكَرِ وَيَنْهَوْنَ عَنِ ٱلْمَعْرُوفِ..." }, translation: { id: "Orang-orang munafik laki-laki dan perempuan... mereka menyuruh berbuat yang mungkar dan melarang berbuat yang makruf..." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan kaum munafik sebagai satu golongan yang sama tabiatnya ('sebagian dari sebagian yang lain'). Sifat dasar mereka adalah kebalikan total dari orang mukmin: Mereka aktif menyuruh kemungkaran dan menghalangi orang dari kebaikan (Amar Mungkar Nahi Ma'ruf). Ciri fisik/sosial mereka adalah 'Yaqbidhuna aidiyahum' (menggenggam tangan), yang bermakna kikir/bakhil, enggan berinfak di jalan Allah. Mereka melupakan Allah (tidak ikhlas beribadah), maka Allah pun melupakan mereka (membiarkan mereka dalam kesesatan dan azab)." } },

  // --- B. AL-QUR'AN ---
  "2_2": { surah: 2, number: 2, text: { arab: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ" }, translation: { id: "Kitab (Al-Qur'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan makna 'La Raiba Fihi': Tidak ada keraguan sedikitpun bahwa Al-Qur'an ini turun dari Allah SWT. Kalimat berita ini bermakna perintah: 'Janganlah kalian meragukannya!' Adapun 'Hudan Lil Muttaqin' (Petunjuk bagi orang bertakwa): Al-Qur'an sejatinya adalah petunjuk bagi seluruh manusia, namun yang dapat mengambil manfaat, cahaya, dan bimbingan darinya hanyalah orang-orang yang bertakwa. Bagi orang yang hatinya kotor, Al-Qur'an justru tidak menambah apa-apa selain kerugian." } },
  "5_15": { surah: 5, number: 15, text: { arab: "...قَدْ جَآءَكُم مِّنَ ٱللَّهِ نُورٌ وَكِتَـٰبٌ مُّبِينٌ" }, translation: { id: "...Sesungguhnya telah datang kepadamu cahaya dari Allah, dan Kitab yang menerangkan." }, tafsir: { maudhui: "Ibnu Katsir menafsirkan 'Nur' (Cahaya) dalam ayat ini sebagai Nabi Muhammad SAW, dan 'Kitab Mubin' sebagai Al-Qur'an. Keduanya datang untuk menyingkap kegelapan jahiliyah, keraguan, dan kesyirikan. Al-Qur'an disebut 'Mubin' (yang menerangkan) karena ia menjelaskan secara gamblang perkara yang hak dan yang batil, halal dan haram, serta kisah-kisah terdahulu yang diperselisihkan oleh Ahli Kitab. Dengan cahaya ini, Allah membimbing manusia menuju jalan keselamatan (Subul as-Salam)." } },
  "17_9": { surah: 17, number: 9, text: { arab: "إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ..." }, translation: { id: "Sesungguhnya Al-Qur'an ini memberikan petunjuk kepada (jalan) yang lebih lurus..." }, tafsir: { maudhui: "Ibnu Katsir memuji keagungan Al-Qur'an melalui ayat ini. Kata 'Aqwam' (Isim Tafdhil) bermakna jalan yang paling lurus, paling adil, paling kokoh, dan paling sempurna. Al-Qur'an membimbing manusia dalam segala aspek: akidah yang murni, ibadah yang benar, muamalah yang adil, dan akhlak yang mulia. Tidak ada kitab atau filosofi manapun yang menawarkan panduan hidup seimbang (Wasathiyah) dan lurus seperti Al-Qur'an." } },
  "25_1": { surah: 25, number: 1, text: { arab: "تَبَارَكَ ٱلَّذِى نَزَّلَ ٱلْفُرْقَانَ عَلَىٰ عَبْدِهِۦ لِيَكُونَ لِلْعَـٰلَمِينَ نَذِيرًا" }, translation: { id: "Maha Suci Allah yang telah menurunkan Al-Furqan (Al-Qur'an) kepada hamba-Nya, agar dia menjadi pemberi peringatan..." }, tafsir: { maudhui: "Allah menyebut Al-Qur'an sebagai 'Al-Furqan', yang artinya Pembeda. Ibnu Katsir menjelaskan bahwa Al-Qur'an memisahkan antara yang hak dan yang batil, antara petunjuk dan kesesatan. Ayat ini juga menyebutkan proses 'Nazzala' (menurunkan berangsur-angsur), berbeda dengan kitab terdahulu yang turun sekaligus. Hikmahnya adalah untuk meneguhkan hati Rasulullah SAW dan agar lebih mudah dihafal serta diamalkan oleh umatnya. Misi Al-Qur'an bersifat universal: 'Lil 'alamina nadzira' (pemberi peringatan bagi seluruh alam/manusia dan jin), bukan hanya untuk bangsa Arab." } },
  "2_23": { surah: 2, number: 23, text: { arab: "وَإِن كُنتُمْ فِي رَيْبٍۢ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍۢ..." }, translation: { id: "Dan jika kamu (tetap) dalam keraguan... buatlah satu surat (saja) yang semisal Al-Qur'an..." }, tafsir: { maudhui: "Ini adalah 'Ayat Tantangan' (Tahaddi) yang abadi. Ibnu Katsir menjelaskan bahwa Allah menantang orang-orang kafir Quraisy—yang merupakan ahli bahasa dan sastra Arab paling fasih—untuk membuat tandingan Al-Qur'an. Tantangan ini berlaku bertingkat: membuat semisal Quran utuh, 10 surat, hingga 1 surat saja. Allah memastikan: 'Kalian tidak akan mampu' (Lan taf'alu). Ini membuktikan bahwa Al-Qur'an adalah Mukjizat Ilahi, bukan karangan Muhammad SAW. Jika buatan manusia, pasti manusia lain bisa menirunya." } },
  "10_38": { surah: 10, number: 38, text: { arab: "أَمْ يَقُولُونَ ٱفْتَرَىٰهُ ۖ قُلْ فَأْتُوا۟ بِسُورَةٍۢ مِّثْلِهِۦ..." }, translation: { id: "Apakah mereka mengatakan: 'Dia (Muhammad) membohongkannya'. Katakanlah: 'Maka datangkanlah sebuah surat yang semisal...'" }, tafsir: { maudhui: "Ibnu Katsir menegaskan bantahan terhadap tuduhan kaum musyrikin yang berkata bahwa Al-Qur'an adalah 'Ifk' (kebohongan) yang diada-adakan oleh Nabi. Tantangan di sini diperluas: 'Ajaklah siapa saja yang kalian sanggup selain Allah'. Meskipun mereka mengumpulkan seluruh jin, manusia, dan berhala mereka untuk berkolaborasi, mereka tetap tidak akan mampu mendatangkan satu surat pun yang menandingi keindahan bahasa, ketepatan hukum, dan kebenaran berita gaib dalam Al-Qur'an." } },
  "42_51": { surah: 42, number: 51, text: { arab: "وَمَا كَانَ لِبَشَرٍ أَن يُكَلِّمَهُ ٱللَّهُ إِلَّا وَحْيًا أَوْ مِن وَرَآىِٕ حِجَابٍ..." }, translation: { id: "Dan tidak mungkin bagi manusia bahwa Allah berkata-kata dengan dia kecuali dengan perantaraan wahyu..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan adab dan metode komunikasi Allah yang Maha Tinggi dengan manusia. Tidak layak bagi manusia berbicara langsung tatap muka dengan Dzat Allah di dunia. Wahyu turun melalui 3 cara: 1) Wahyu/Ilham yang ditiupkan langsung ke dalam hati (seperti mimpi Nabi), 2) Min wara-i hijab (di balik tabir), suara terdengar tapi Dzat tidak terlihat (seperti Nabi Musa AS di Tursina), atau 3) Mengutus Rasul (Malaikat Jibril) untuk menyampaikan pesan. Ini menunjukkan transendensi Allah dan keagungan proses pewahyuan." } },
  "17_106": { surah: 17, number: 106, text: { arab: "وَقُرْءَانًا فَرَقْنَـٰهُ لِتَقْرَأَهُۥ عَلَى ٱلنَّاسِ عَلَىٰ مُكْثٍ..." }, translation: { id: "Dan Al-Qur'an itu telah Kami turunkan dengan berangsur-angsur agar kamu membacakannya perlahan-lahan..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan metode penurunan Al-Qur'an secara 'Munajjam' (bertahap/berangsur-angsur) selama sekitar 23 tahun. Tujuannya adalah 'Ala muktsin' (perlahan-lahan), agar umat Islam bisa membacanya dengan tartil, memahaminya dengan mendalam, dan menghafalnya dengan kuat. Wahyu turun merespons peristiwa (Asbabun Nuzul), menjawab pertanyaan, dan memperbaiki keadaan sosial secara bertahap, yang merupakan metode pendidikan (Tarbiyah) terbaik bagi masyarakat jahiliyah saat itu." } },
  "2_75": { surah: 2, number: 75, text: { arab: "۞ أَفَتَطْمَعُونَ أَن يُؤْمِنُوا۟ لَكُمْ وَقَدْ كَانَ فَرِيقٌ مِّنْهُمْ يَسْمَعُونَ كَلَـٰمَ ٱللَّهِ ثُمَّ يُحَرِّفُونَهُۥ..." }, translation: { id: "Apakah kamu masih mengharapkan mereka akan percaya kepadamu, padahal segolongan dari mereka mendengar firman Allah, lalu mereka mengubahnya..." }, tafsir: { maudhui: "Ibnu Katsir memaparkan keputusasaan untuk mengharapkan keimanan dari pendeta Yahudi yang bebal. Mereka memiliki sifat buruk: 'Tahrif' (mengubah/menyelewengkan) Kitabullah (Taurat). Mereka mendengar firman Allah, memahaminya, tapi kemudian mengubah lafazh atau maknanya secara sengaja demi kepentingan duniawi atau menutupi kebenaran tentang Nabi Muhammad SAW. Jika terhadap kitab mereka sendiri mereka berkhianat, apalagi terhadap Al-Qur'an." } },
  "2_159": { surah: 2, number: 159, text: { arab: "إِنَّ ٱلَّذِينَ يَكْتُمُونَ مَآ أَنزَلْنَا مِنَ ٱلْبَيِّنَـٰتِ وَٱلْهُدَىٰ..." }, translation: { id: "Sesungguhnya orang-orang yang menyembunyikan apa yang telah Kami turunkan berupa keterangan-keterangan..." }, tafsir: { maudhui: "Ayat ini berisi ancaman keras berupa laknat Allah dan laknat semua makhluk (malaikat, manusia, jin) bagi 'Kitmanul Ilmi' (Menyembunyikan Ilmu). Ibnu Katsir menjelaskan konteksnya adalah Ahli Kitab yang menyembunyikan ciri-ciri Nabi Muhammad SAW yang tertera jelas dalam kitab mereka. Namun, hukum ayat ini berlaku umum bagi siapa saja (termasuk ulama Islam) yang menyembunyikan kebenaran agama yang seharusnya disampaikan kepada umat demi tujuan duniawi." } },
  "35_29": { surah: 35, number: 29, text: { arab: "إِنَّ ٱلَّذِينَ يَتْلُونَ كِتَـٰبَ ٱللَّهِ وَأَقَامُوا۟ ٱلصَّلَوٰةَ..." }, translation: { id: "Sesungguhnya orang-orang yang selalu membaca Kitab Allah dan mendirikan salat..." }, tafsir: { maudhui: "Ibnu Katsir menyebutkan bahwa ayat ini adalah harapan bagi para Qari' (pembaca Quran) yang mengamalkan isinya. Mereka menggabungkan tiga amal utama: Tilawah (membaca/mempelajari Quran), Shalat (hubungan vertikal), dan Infak (hubungan horizontal). Allah menyebut amal ini sebagai 'Tijaratan lan tabur' (perniagaan yang tidak akan pernah rugi). Keuntungan dari perniagaan ini adalah pahala yang disempurnakan dan tambahan karunia (Fadhl) yang tak terduga." } },
  "54_17": { surah: 54, number: 17, text: { arab: "وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ" }, translation: { id: "Dan sesungguhnya telah Kami mudahkan Al-Qur'an untuk pelajaran, maka adakah orang yang mengambil pelajaran?" }, tafsir: { maudhui: "Ibnu Katsir menafsirkan 'Yassarna' sebagai kemudahan yang Allah berikan pada Al-Qur'an: lafazhnya mudah dihafal (bahkan oleh anak kecil dan non-Arab) dan maknanya mudah dipahami bagi yang merenunginya. Tidak ada kitab suci lain di dunia yang dihafal huruf demi huruf oleh jutaan manusia selain Al-Qur'an. Pertanyaan 'Fahal min muddakir' adalah undangan dan motivasi dari Allah: 'Adakah yang mau mengambil pelajaran/mengingat-Nya?' karena jalan sudah dimudahkan." } },

  // --- C. KENABIAN ---
  "21_25": { surah: 21, number: 25, text: { arab: "وَمَآ أَرْسَلْنَا مِن قَبْلِكَ مِن رَّسُولٍ إِلَّا نُوحِىٓ إِلَيْهِ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدُونِ" }, translation: { id: "Kami tidak mengutus seorang rasul pun sebelum kamu melainkan Kami wahyukan... Bahwa tidak ada Tuhan selain Aku." }, tafsir: { maudhui: "Ayat ini adalah intisari dari risalah kenabian sepanjang sejarah. Ibnu Katsir menyatakan bahwa setiap Nabi yang diutus Allah, dari Nuh hingga Muhammad SAW, membawa satu kalimat kunci: 'La ilaha illa Ana' (Tidak ada Tuhan selain Aku), maka sembahlah Aku. Walaupun syariat (cara ibadah, hukum halal haram) bisa berbeda antara Nabi Musa, Isa, dan Muhammad, namun Akidah (Tauhid) mereka adalah satu dan tidak pernah berubah. Tidak ada nabi yang mengajarkan politeisme atau trinitas." } },
  "42_13": { surah: 42, number: 13, text: { arab: "۞ شَرَعَ لَكُم مِّنَ ٱلدِّينِ مَا وَصَّىٰ بِهِۦ نُوحًا وَٱلَّذِىٓ أَوْحَيْنَآ إِلَيْكَ..." }, translation: { id: "Dia telah mensyariatkan bagi kamu tentang agama apa yang telah diwasiatkan-Nya kepada Nuh..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan kesatuan 'Millah' (agama) para Ulul Azmi (Nuh, Ibrahim, Musa, Isa, Muhammad SAW). Pesan intinya adalah 'Aqimud-din' (tegakkanlah agama) dan 'Wala tatafarraqu fih' (janganlah berpecah belah di dalamnya). Perpecahan umat terjadi bukan karena perbedaan ajaran nabi, melainkan karena kedengkian dan hawa nafsu para pengikut setelah ilmu datang. Ayat ini menyerukan persatuan di atas prinsip-prinsip fundamental agama samawi." } },
  "16_36": { surah: 16, number: 36, text: { arab: "وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍۢ رَّسُولًا أَنِ ٱعْبُدُوا۟ ٱللَّهَ وَٱجْتَنِبُوا۟ ٱلطَّـٰغُوتَ..." }, translation: { id: "Dan sungguh Kami telah mengutus rasul pada tiap-tiap umat (untuk menyerukan): 'Sembahlah Allah, dan jauhilah Thaghut'..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa Allah telah menegakkan Hujjah (argumen) kepada seluruh umat manusia dengan mengutus Rasul di setiap umat/generasi. Tidak ada satu pun umat yang dibiarkan tanpa peringatan. Misi para Rasul adalah dua sisi mata uang: 1) Itsbat: Menetapkan ibadah hanya kepada Allah, dan 2) Nafi: Menjauhi 'Thaghut' (segala sesembahan selain Allah, setan, dukun, pemimpin zalim). Siapa yang menyembah Allah tapi tidak mengingkari Thaghut, maka dia belum bertauhid dengan benar." } },
  "2_213": { surah: 2, number: 213, text: { arab: "كَانَ ٱلنَّاسُ أُمَّةًۭ وَٰحِدَةًۭ فَبَعَثَ ٱللَّهُ ٱلنَّبِيِّۦنَ مُبَشِّرِينَ وَمُنذِرِينَ..." }, translation: { id: "Manusia itu adalah umat yang satu. Maka Allah mengutus para nabi sebagai pemberi kabar gembira dan pemberi peringatan..." }, tafsir: { maudhui: "Ibnu Katsir, merujuk pada Ibnu Abbas, menjelaskan bahwa antara Adam dan Nuh terdapat 10 abad, semuanya di atas Islam (Tauhid). Setelah itu terjadi perselisihan dan kesyirikan, maka Allah mengutus Nuh dan nabi-nabi setelahnya. Fungsi Nabi adalah 'Mubasyirin' (memberi kabar gembira surga bagi yang taat) dan 'Munzirin' (memberi peringatan neraka bagi yang maksiat). Allah juga menurunkan Al-Kitab sebagai hakim pemutus (Hakam) yang adil untuk menyelesaikan perselisihan manusia dengan kebenaran, bukan dengan hawa nafsu." } },
  "7_59": { surah: 7, number: 59, text: { arab: "لَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِۦ فَقَالَ يَـٰقَوْمِ ٱعْبُدُوا۟ ٱللَّهَ مَا لَكُم مِّنْ إِلَـٰهٍ غَيْرُهُۥٓ..." }, translation: { id: "Sesungguhnya Kami telah mengutus Nuh kepada kaumnya lalu ia berkata: 'Wahai kaumku sembahlah Allah...'" }, tafsir: { maudhui: "Ini adalah awal kisah konflik iman dan kufur pasca-Adam. Nuh AS menyerukan kalimat Tauhid. Ibnu Katsir menyoroti respon kaumnya, terutama para pembesar (Al-Mala'), yang menuduh Nuh berada dalam kesesatan. Pola penolakan ini berulang pada setiap nabi: mereka dituduh gila, sesat, atau mencari kekuasaan. Nuh menjawab dengan sabar bahwa ia adalah utusan Tuhan semesta alam dan tujuannya hanyalah memberi nasihat (Nush) demi keselamatan mereka, namun mereka tetap buta." } },
  "33_62": { surah: 33, number: 62, text: { arab: "سُنَّةَ ٱللَّهِ فِي ٱلَّذِينَ خَلَوْا۟ مِن قَبْلُ ۖ وَلَن تَجِدَ لِسُنَّةِ ٱللَّهِ تَبْدِيلًا" }, translation: { id: "Sebagai sunnah Allah yang berlaku atas orang-orang yang telah terdahulu... dan kamu tidak akan mendapati perubahan pada sunnah Allah." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan konsep 'Sunnatullah' yang tidak pernah berubah atau berganti. Yaitu ketetapan Allah bahwa kaum munafik dan orang-orang yang menyakiti Allah dan Rasul-Nya pasti akan dibinasakan atau dikalahkan jika mereka terus menerus dalam kedurhakaan mereka. Sebagaimana umat terdahulu hancur karena mendustakan Rasul, hukum ini pun berlaku bagi umat ini. Kemenangan akhir selalu bagi orang bertakwa, dan kebatilan pasti akan sirna, itu adalah hukum sejarah yang ditetapkan Allah." } },
  "11_96": { surah: 11, number: 96, text: { arab: "وَلَقَدْ أَرْسَلْنَا مُوسَىٰ بِـَٔايَـٰتِنَا وَسُلْطَـٰنٍۢ مُّبِينٍ" }, translation: { id: "Dan sesungguhnya Kami telah mengutus Musa dengan tanda-tanda (kekuasaan) Kami dan mukjizat yang nyata," }, tafsir: { maudhui: "Ibnu Katsir menafsirkan 'Ayat' sebagai mukjizat-mukjizat indrawi (seperti tangan yang bersinar, topan, belalang) dan 'Sulthanin Mubin' sebagai hujjah/argumen rasional yang kuat dan nyata yang membungkam lawan. Musa AS dibekali kedua jenis kekuatan ini untuk menghadapi Firaun yang sombong. Mukjizat membuktikan dia didukung kekuatan supranatural Ilahi, dan Sulthan membuktikan kebenaran logikanya di hadapan para penyihir dan pembesar Mesir." } },
  "7_107": { surah: 7, number: 107, text: { arab: "فَأَلْقَىٰ عَصَاهُ فَإِذَا هِىَ ثُعْبَانٌ مُّبِينٌ" }, translation: { id: "Maka Musa menjatuhkan tongkatnya, lalu seketika itu juga tongkat itu menjadi ular yang nyata." }, tafsir: { maudhui: "Ibnu Katsir mendetailkan adegan ini. Ketika Musa melempar tongkatnya, ia berubah menjadi ular naga besar (tsu'ban) yang nyata, bukan ilusi mata (sihir) seperti yang dilakukan penyihir Firaun. Ular itu membuka mulutnya yang besar dan menelan tali-temali serta tongkat palsu para penyihir. Ini membuat para penyihir—yang ahli dalam bidangnya—langsung sadar bahwa apa yang dibawa Musa bukanlah sihir, melainkan kekuasaan Tuhan yang Hakiki, sehingga mereka langsung bersujud beriman." } },
  "5_110": { surah: 5, number: 110, text: { arab: "إِذْ قَالَ ٱللَّهُ يَـٰعِيسَى ٱبْنَ مَرْيَمَ ٱذْكُرْ نِعْمَتِى ... وَإِذْ تَخْلُقُ مِنَ ٱلطِّينِ كَهَيْـَٔةِ ٱلطَّيْرِ..." }, translation: { id: "...dan (ingatlah) di waktu kamu membentuk dari tanah berupa burung dengan izin-Ku..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan mukjizat Nabi Isa AS: berbicara saat bayi, membentuk burung dari tanah lalu meniupnya menjadi hidup, menyembuhkan buta sejak lahir dan kusta, serta menghidupkan orang mati. Yang krusial adalah pengulangan frasa 'Bi-idzni' (dengan izin-Ku). Ini adalah penegasan teologis bahwa Isa AS melakukan semua itu bukan karena dia Tuhan atau memiliki kekuatan otonom, tetapi semata-mata sebagai mukjizat yang Allah izinkan terjadi melalui tangannya untuk membuktikan kenabiannya kepada Bani Israil." } },
  "33_21": { surah: 33, number: 21, text: { arab: "لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ..." }, translation: { id: "Sesungguhnya telah ada pada (diri) Rasulullah itu suri teladan yang baik bagimu..." }, tafsir: { maudhui: "Ayat ini adalah dalil 'Ashl' (pokok) yang paling agung dalam meneladani Rasulullah SAW. Ibnu Katsir menjelaskan konteksnya turun saat Perang Ahzab, di mana Nabi ikut lapar, menggali parit, dan bersabar menghadapi kepungan musuh. Beliau adalah 'Uswah' (role model) dalam ibadah, akhlak, keberanian, kesabaran, dan muamalah. Peneladanan ini dijanjikan bagi orang yang 'mengharap Allah dan Hari Akhir', karena hanya orientasi akhirat yang kuat yang memampukan seseorang mengikuti jejak Nabi yang penuh pengorbanan." } },
  "33_40": { surah: 33, number: 40, text: { arab: "مَّا كَانَ مُحَمَّدٌ أَبَآ أَحَدٍۢ مِّن رِّجَالِكُمْ وَلَـٰكِن رَّسُولَ ٱللَّهِ وَخَاتَمَ ٱلنَّبِيِّۦنَ..." }, translation: { id: "...tetapi dia adalah Rasulullah dan penutup nabi-nabi..." }, tafsir: { maudhui: "Ibnu Katsir menegaskan bahwa ayat ini adalah nash mutawatir bahwa tidak ada Nabi setelah Muhammad SAW. Kata 'Khatam' berarti cincin penutup atau segel. Jika tidak ada Nabi setelah beliau, maka otomatis tidak ada Rasul (karena setiap Rasul adalah Nabi). Barangsiapa yang mengaku menjadi Nabi setelah beliau, maka dia adalah Dajjal, pendusta, dan sesat. Syariat Nabi Muhammad SAW adalah syariat final yang berlaku kekal hingga hari kiamat, menyempurnakan bangunan kenabian." } },

  // --- D. IBADAH ---
  "51_56": { surah: 51, number: 56, text: { arab: "وَمَا خَلَقْتُ ٱلْجِنَّ وَٱلْإِنسَ إِلَّا لِيَعْبُدُونِ" }, translation: { id: "Aku tidak menciptakan jin dan manusia melainkan agar mereka beribadah kepada-Ku." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan tujuan eksistensial makhluk. Allah menciptakan manusia dan jin bukan karena Dia butuh teman, bantuan, atau rezeki dari mereka. Allah Maha Kaya (Ghaniy). Dia menciptakan mereka untuk satu tujuan mulia: Agar mereka menyembah-Nya. Ibnu Abbas menafsirkan 'Li-ya'budun' sebagai 'Li-yuwahhidun' (agar mereka mentauhidkan-Ku). Konsekuensinya: Siapa yang taat beribadah, ia memenuhi tujuan penciptaannya dan akan dibalas surga. Siapa yang enggan, ia gagal dalam ujian eksistensinya." } },
  "2_43": { surah: 2, number: 43, text: { arab: "وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ..." }, translation: { id: "Dan dirikanlah salat, tunaikanlah zakat..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa ayat ini menggabungkan dua pilar utama agama: Shalat (Hablum Minallah/Ibadah Badan) dan Zakat (Hablum Minannas/Ibadah Harta). Kata 'Aqimu' (dirikanlah) bukan sekadar mengerjakan, tapi melaksanakannya dengan rukun, syarat, khusyuk, dan tepat waktu. Perintah 'Rukuklah bersama orang yang rukuk' adalah dalil (menurut banyak ulama) tentang kewajiban atau keutamaan shalat berjamaah dan menjadi bagian dari komunitas umat Islam, bukan menyendiri." } },
  "29_45": { surah: 29, number: 45, text: { arab: "ٱتْلُ مَآ أُوحِىَ إِلَيْكَ مِنَ ٱلْكِتَـٰبِ وَأَقِمِ ٱلصَّلَوٰةَ ۖ إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ..." }, translation: { id: "Bacalah apa yang telah diwahyukan kepadamu... dan dirikanlah salat. Sesungguhnya salat itu mencegah dari (perbuatan-perbuatan) keji dan mungkar..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan fungsi transformatif shalat. Shalat yang benar—yang dilakukan dengan khusyuk dan pemahaman—akan meninggalkan bekas pada jiwa pelakunya berupa rasa takut kepada Allah, yang secara otomatis mencegahnya dari perbuatan Keji (Fahsyah/Zina) dan Mungkar. Ibnu Katsir mengutip hadits: 'Barangsiapa yang shalatnya tidak mencegahnya dari keji dan mungkar, maka tidak bertambah darinya kecuali kejauhan dari Allah.' Shalat adalah pengingat (Dzikr) terbesar yang meluruskan moral manusia." } },
  "9_103": { surah: 9, number: 103, text: { arab: "خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةًۭ تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا..." }, translation: { id: "Ambillah zakat dari sebagian harta mereka..." }, tafsir: { maudhui: "Ayat ini turun berkenaan dengan taubat orang-orang yang tidak ikut perang Tabuk, namun hukumnya umum tentang kewajiban Zakat. Ibnu Katsir menjelaskan dua fungsi Zakat/Sedekah: 1) 'Tuthahhiruhum': Membersihkan jiwa dari dosa-dosa dan sifat kikir/bakhil yang kotor. 2) 'Tuzakkihim': Menumbuhkan/menyuburkan akhlak mulia dan mengembangkan harta dengan keberkahan. Nabi diperintahkan mendoakan (shalli 'alaihim) orang yang berzakat, karena doa Nabi adalah ketenangan (sakan) bagi jiwa mereka, meyakinkan mereka bahwa taubat dan amal mereka diterima." } },
  "2_183": { surah: 2, number: 183, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ..." }, translation: { id: "Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa puasa adalah menahan diri dari makan, minum, dan syahwat dengan niat yang tulus. Kalimat 'sebagaimana diwajibkan atas orang sebelum kamu' adalah Tasliyah (penghibur) agar beban syariat ini terasa lebih ringan karena umat terdahulu pun melaksanakannya. Tujuan akhirnya adalah 'La'allakum tattaqun'. Puasa melemahkan syahwat yang menjadi pintu masuk setan, membersihkan tubuh, dan menjernihkan jiwa, sehingga memudahkan seseorang mencapai derajat takwa." } },
  "2_187": { surah: 2, number: 187, text: { arab: "أُحِلَّ لَكُمْ لَيْلَةَ ٱلصِّيَامِ ٱلرَّفَثُ إِلَىٰ نِسَآئِكُمْ..." }, translation: { id: "Dihalalkan bagi kamu pada malam hari bulan puasa bercampur dengan istrimu..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa ayat ini adalah Rahmat (keringanan) dari Allah yang menghapus hukum sebelumnya (di awal Islam, jika sudah tidur malam, dilarang makan/jimak hingga besoknya). Allah mengetahui kelemahan manusia ('Allah mengetahui bahwasanya kamu tidak dapat menahan nafsumu'), maka Dia membolehkan makan, minum, dan hubungan suami istri sepanjang malam Ramadhan hingga terbit fajar (Subuh). Ini menunjukkan keseimbangan Islam antara disiplin ibadah dan pemenuhan kebutuhan fitrah biologis." } },
  "2_196": { surah: 2, number: 196, text: { arab: "وَأَتِمُّوا۟ ٱلْحَجَّ وَٱلْعُمْرَةَ لِلَّهِ..." }, translation: { id: "Dan sempurnakanlah ibadah haji dan umrah karena Allah..." }, tafsir: { maudhui: "Perintah 'Atimmu' (Sempurnakanlah) bermakna: Jika seseorang telah memulai ibadah Haji atau Umrah (telah berihram), maka haram baginya membatalkannya di tengah jalan tanpa uzur syar'i (Ihshar). Ia wajib menyelesaikannya hingga tuntas. Frasa 'Lillah' (Karena Allah) menekankan keikhlasan; jangan berhaji untuk tujuan dagang semata, gelar sosial, atau riya. Ibadah fisik dan harta yang berat ini harus murni dipersembahkan untuk Wajah Allah." } },
  "22_28": { surah: 22, number: 28, text: { arab: "لِّيَشْهَدُوا۟ مَنَـٰفِعَ لَهُمْ وَيَذْكُرُوا۟ ٱسْمَ ٱللَّهِ..." }, translation: { id: "Supaya mereka menyaksikan berbagai manfaat bagi mereka dan menyebut nama Allah..." }, tafsir: { maudhui: "Ibnu Katsir menafsirkan 'Manafi' (manfaat-manfaat) dalam haji mencakup kebaikan ukhrawi (ampunan Allah, ridha-Nya) dan duniawi (perdagangan, persatuan umat, tukar menukar ilmu). Haji adalah muktamar internasional umat Islam. Ayat ini juga memerintahkan penyebutan nama Allah (Bismillah/Takbir) saat menyembelih hewan kurban (Hadyu) pada hari-hari yang ditentukan, sebagai bentuk syukur atas rezeki hewan ternak yang Allah tundukkan untuk manusia." } },
  "40_60": { surah: 40, number: 60, text: { arab: "وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ..." }, translation: { id: "Dan Tuhanmu berfirman: 'Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu'..." }, tafsir: { maudhui: "Ibnu Katsir menekankan kemurahan Allah dalam ayat ini. Allah tidak hanya membolehkan, tapi 'Memerintahkan' hamba-Nya untuk meminta (Ud'uni), dan Dia menjamin pengabulannya (Astajib lakum). Sufyan Ats-Tsauri berkata: 'Dzat yang paling dicintai hamba-Nya adalah yang meminta kepada-Nya'. Sebaliknya, orang yang enggan berdoa disebut Allah sebagai orang yang 'Menyombongkan diri dari beribadah kepada-Ku' dan diancam neraka Jahanam. Doa adalah inti ibadah karena ia menampakkan kefakiran hamba di hadapan kekayaan Allah." } },
  "7_55": { surah: 7, number: 55, text: { arab: "ٱدْعُوا۟ رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً ۚ إِنَّهُۥ لَا يُحِبُّ ٱلْمُعْتَدِينَ" }, translation: { id: "Berdoalah kepada Tuhanmu dengan berendah diri dan suara yang lembut..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan adab berdoa agar diterima. 'Tadharru' artinya merendahkan diri, memelas, dan merasa butuh. 'Khufyah' artinya dengan suara lembut, tidak teriak-teriak, karena Dzat yang diseru Maha Mendengar lagi Maha Dekat. Allah menegaskan 'Dia tidak menyukai orang yang melampaui batas' (Al-Mu'tadin). Melampaui batas dalam doa bisa berupa: berteriak keras, meminta sesuatu yang mustahil (seperti derajat nabi), atau berdoa untuk memutus silaturahmi/berbuat dosa." } },
  "33_41": { surah: 33, number: 41, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱذْكُرُوا۟ ٱللَّهَ ذِكْرًا كَثِيرًا" }, translation: { id: "Hai orang-orang yang beriman, berzdikirlah (dengan menyebut nama) Allah, zikir yang sebanyak-banyaknya." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan keistimewaan ibadah Dzikir. Untuk ibadah lain (shalat, puasa, haji), Allah memberikan batasan waktu, jumlah, atau uzur bagi yang tidak mampu. Namun untuk Dzikir, Allah memerintahkan 'Dzikran Katsira' (sebanyak-banyaknya) tanpa batasan waktu dan tempat. Baik berdiri, duduk, berbaring, pagi, petang, di darat atau laut. Ibnu Abbas berkata: 'Tidak ada uzur bagi seseorang untuk meninggalkan dzikir kecuali jika akalnya hilang.' Dzikir adalah nutrisi hati yang menghubungkan hamba dengan Allah setiap saat." } },
  "13_28": { surah: 13, number: 28, text: { arab: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ" }, translation: { id: "(yaitu) orang-orang yang beriman dan hati mereka manjadi tenteram dengan mengingat Allah..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan psikologi spiritual mukmin. Hati manusia diciptakan dengan kegelisahan dan kekosongan yang tidak bisa diisi dengan harta, kekuasaan, atau hiburan duniawi. Ia hanya akan tenang (Tuma'ninah) ketika mengingat Allah, merasa dekat dengan-Nya, dan bersandar kepada-Nya. 'Ala bidzikrillah' (Ingatlah, hanya dengan mengingat Allah) adalah penekanan (Hasr) bahwa tidak ada jalan lain menuju ketenangan jiwa yang hakiki selain jalur ini. Dzikir menghilangkan kegundahan dan mendatangkan kedamaian Ilahi." } },

  // --- E. SYARIAT ---
  "2_168": { surah: 2, number: 168, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِي ٱلْأَرْضِ حَلَـٰلًا طَيِّبًا..." }, translation: { id: "Hai sekalian manusia, makanlah yang halal lagi baik dari apa yang terdapat di bumi..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan kaidah dasar konsumsi dalam Islam. Makanan harus memenuhi dua syarat: 1) Halal: halal secara zat (bukan babi, bangkai) dan cara perolehan (bukan curian). 2) Thayyib: baik, bersih, sehat, dan tidak menjijikkan atau membahayakan fisik. Larangan 'Jangan mengikuti langkah setan' menunjukkan strategi setan yang bertahap: ia tidak langsung menyuruh kufur, tapi mulai dengan mengharamkan yang halal (bid'ah) atau menghalalkan yang haram, yang akhirnya merusak agama dan jasad manusia." } },
  "2_185": { surah: 2, number: 185, text: { arab: "...يُرِيدُ ٱللَّهُ بِكُمُ ٱلْيُسْرَ وَلَا يُرِيدُ بِكُمُ ٱلْعُسْرَ..." }, translation: { id: "...Allah menghendaki kemudahan bagimu, dan tidak menghendaki kesukaran bagimu..." }, tafsir: { maudhui: "Potongan ayat ini menjadi kaidah fiqih besar: 'Al-Masyaqqah Tajlibut Taysir' (Kesulitan mendatangkan kemudahan). Ibnu Katsir menjelaskan konteksnya pada puasa Ramadhan: meskipun wajib, Allah memberi rukhsah (keringanan) bagi musafir dan orang sakit untuk tidak berpuasa dan menggantinya di hari lain. Ini menunjukkan watak Syariat Islam yang realistis, manusiawi, dan tidak bertujuan menyiksa hamba-Nya, melainkan untuk mensucikan mereka sesuai kemampuan." } },
  "2_282": { surah: 2, number: 282, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰٓ أَجَلٍۢ مُّسَمًّۭى فَٱكْتُبُوهُ..." }, translation: { id: "Hai orang-orang yang beriman, apabila kamu bermu'amalah tidak secara tunai... hendaklah kamu menuliskannya." }, tafsir: { maudhui: "Ini adalah ayat terpanjang dalam Al-Qur'an (Ayat Mudayanah). Ibnu Katsir menjabarkan detail luar biasa tentang administrasi hutang piutang. Allah memerintahkan pencatatan (kitabah) untuk menjaga harta dan menghindari sengketa akibat lupa atau khianat. Harus ada penulis yang adil, saksi (2 laki-laki atau 1 laki-laki 2 perempuan), dan larangan mempersulit saksi. Ini membuktikan bahwa Islam bukan hanya agama ritual masjid, tapi juga agama yang mengatur ketertiban sipil, ekonomi, dan perlindungan aset umat dengan sistem administrasi yang rapi." } },
  "23_8": { surah: 23, number: 8, text: { arab: "وَٱلَّذِينَ هُمْ لِأَمَـٰنَـٰتِهِمْ وَعَهْدِهِمْ رَٰعُونَ" }, translation: { id: "Dan orang-orang yang memelihara amanat-amanat (yang dipikulnya) dan janjinya." }, tafsir: { maudhui: "Ibnu Katsir menyebutkan sifat orang mukmin yang beruntung (Al-Muflihun). Mereka adalah orang yang jika diberi amanah (titipan harta, rahasia, tugas) tidak berkhianat, dan jika berjanji (akad, sumpah) tidak melanggar. Sifat ini adalah kebalikan dari sifat munafik (jika berjanji ingkar, jika dipercaya khianat). 'Ra'un' bermakna memelihara dengan penuh perhatian dan penjagaan. Integritas moral dalam memegang janji adalah indikator utama keimanan seseorang." } },
  "5_38": { surah: 5, number: 38, text: { arab: "وَٱلسَّارِقُ وَٱلسَّارِقَةُ فَٱقْطَعُوٓا۟ أَيْدِيَهُمَا..." }, translation: { id: "Laki-laki yang mencuri dan perempuan yang mencuri, potonglah tangan keduanya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan hukum potong tangan sebagai 'Nakal' (hukuman yang menjerakan) dari Allah demi menjaga keamanan harta masyarakat. Tangan pencuri dipotong karena ia telah berkhianat; tangan yang tadinya berharga (diyatnya mahal), menjadi tidak berharga ketika mencuri. Namun, Ibnu Katsir merinci syarat ketat pelaksanaannya: barang harus mencapai nisab (seperempat dinar), diambil dari tempat simpanan yang layak (hirz), dan bukan karena syubhat atau kelaparan darurat. Islam sangat hati-hati dalam eksekusi, tapi tegas dalam regulasi." } },
  "2_178": { surah: 2, number: 178, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلْقِصَاصُ فِي ٱلْقَتْلَى..." }, translation: { id: "Hai orang-orang yang beriman, diwajibkan atas kamu qishaash berkenaan dengan orang-orang yang dibunuh..." }, tafsir: { maudhui: "Qishash bermakna kesetaraan dan keadilan dalam pembalasan. Ibnu Katsir menjelaskan bahwa syariat ini menghapus tradisi jahiliyah yang melampaui batas (membunuh orang tak bersalah demi balas dendam suku). Islam menetapkan: Nyawa dibalas nyawa (Al-hurru bil hurri). Namun, Islam membuka pintu maaf yang lebar. Jika keluarga korban memaafkan, hukuman beralih ke Diyat (tebusan darah). Qishash disebut sebagai 'Hayat' (Sumber Kehidupan) bagi masyarakat, karena ketegasan hukum ini mencegah orang untuk membunuh sembarangan, sehingga nyawa banyak orang terselamatkan." } },
  "4_11": { surah: 4, number: 11, text: { arab: "يُوصِيكُمُ ٱللَّهُ فِيٓ أَوْلَـٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ..." }, translation: { id: "Allah mensyariatkan bagimu tentang (pembagian pusaka untuk) anak-anakmu..." }, tafsir: { maudhui: "Ibnu Katsir menekankan bahwa pembagian Waris (Faraidh) adalah ketentuan langsung dari Allah (Faridhatan minallah), bukan hasil musyawarah manusia. Allah Yang Maha Tahu kemaslahatan hamba-Nya. Laki-laki mendapat 2 bagian dibanding wanita karena laki-laki memikul beban nafkah wajib (mahar, nafkah istri/anak), sedangkan wanita menerima nafkah tanpa kewajiban finansial. Pembagian waris ini mencegah sengketa keluarga dan menjamin distribusi kekayaan secara adil kepada kerabat yang berhak, memutus tradisi jahiliyah yang hanya mewariskan harta pada lelaki dewasa yang bisa berperang." } },
  "4_3": { surah: 4, number: 3, text: { arab: "...فَٱنكِحُوا۟ مَا طَابَ لَكُم مِّنَ ٱلنِّسَآءِ مَثْنَىٰ وَثُلَـٰثَ وَرُبَـٰعَ..." }, translation: { id: "...maka kawinilah wanita-wanita (lain) yang kamu senangi: dua, tiga atau empat..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan Asbabun Nuzul (riwayat Aisyah) tentang wali yang menikahi anak yatim demi hartanya tanpa mahar yang layak. Allah melarang itu dan memerintahkan menikahi wanita lain. Ayat ini membatasi poligami maksimal 4 (membatalkan tradisi jahiliyah yang tanpa batas). Syarat mutlaknya adalah ADIL dalam nafkah dan giliran. 'Jika kamu takut tidak akan dapat berlaku adil, maka (kawinilah) seorang saja'. Ibnu Katsir menegaskan bahwa keadilan adalah hal berat, maka monogami adalah jalan keselamatan bagi mereka yang khawatir berbuat zalim." } },
  "30_21": { surah: 30, number: 21, text: { arab: "وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا..." }, translation: { id: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram..." }, tafsir: { maudhui: "Ibnu Katsir menafsirkan pernikahan sebagai salah satu Tanda Kebesaran Allah (Ayat). Allah menciptakan pasangan dari jenis manusia sendiri (bukan jin atau hewan) agar timbul kesesuaian dan kedekatan. Tujuan pernikahan adalah 'Litaskunu ilaiha' (Sakinah/Ketenangan), serta Allah menumbuhkan 'Mawaddah' (Cinta/Rasa Suka fisik) dan 'Rahmah' (Kasih Sayang/Empati, terutama saat tua). Ikatan hati antara suami istri adalah anugerah Ilahi yang tidak bisa dibeli dengan harta, melainkan fondasi bagi masyarakat yang stabil." } },
  "2_229": { surah: 2, number: 229, text: { arab: "ٱلطَّلَـٰقُ مَرَّتَانِ ۖ فَإِمْسَاكٌۢ بِمَعْرُوفٍ أَوْ تَسْرِيحٌۢ بِإِحْسَـٰنٍ..." }, translation: { id: "Talak (yang dapat dirujuki) dua kali. Setelah itu boleh rujuk lagi dengan cara yang ma'ruf atau menceraikan dengan cara yang baik..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan reformasi hukum talak. Di masa Jahiliyah, lelaki bisa mentalak istrinya ribuan kali (talak, rujuk, talak, rujuk) untuk menggantung status wanita. Allah membatasi talak Raj'i (yang bisa rujuk) hanya dua kali. Setelah talak ketiga (Ba'in Kubra), suami tidak boleh rujuk kecuali mantan istri menikah dengan orang lain dan bercerai secara alami. Pilihan bagi suami hanya dua: 'Imsak bi ma'ruf' (rujuk dan perbaiki hubungan dengan baik) atau 'Tasrih bi ihsan' (lepaskan dia dengan cara yang baik, tanpa menyakiti atau mengambil kembali maharnya)." } },
  "2_275": { surah: 2, number: 275, text: { arab: "ٱلَّذِينَ يَأْكُلُونَ ٱلرِّبَوٰا۟ لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ ٱلَّذِى يَتَخَبَّطُهُ ٱلشَّيْطَـٰنُ..." }, translation: { id: "Orang-orang yang makan (mengambil) riba tidak dapat berdiri melainkan seperti berdirinya orang yang kemasukan syaitan..." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan kengerian pemakan Riba pada hari kiamat. Mereka akan bangkit dari kubur seperti orang gila yang kesurupan setan, sempoyongan karena perut mereka yang membesar (berisi haram). Ayat ini membantah logika kapitalis jahiliyah yang berkata 'Jual beli sama saja dengan Riba' (sama-sama cari untung). Allah menegaskan perbedaannya: Jual beli itu Halal (pertukaran barang/jasa dengan risiko), sedangkan Riba itu Haram (eksploitasi hutang tanpa risiko, menzalimi yang butuh). Allah dan Rasul-Nya mengumumkan perang terhadap pelaku Riba." } },
  "4_29": { surah: 4, number: 29, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰطِلِ..." }, translation: { id: "Hai orang-orang yang beriman,janganlah kamu saling memakan harta sesamamu dengan jalan yang batil..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan larangan memakan harta secara 'Batil'. Ini mencakup segala cara yang tidak syar'i: Riba, Judi, Penipuan (Gharar), Sumpah Palsu, dan Korupsi. Harta seorang muslim haram bagi muslim lainnya kecuali dengan jalan 'Tijaratan an Taradhin' (perniagaan yang didasari kerelaan kedua belah pihak). Kerelaan ini harus valid, bukan karena paksaan atau ketidaktahuan (penipuan). Ayat ini juga melarang bunuh diri ('Wala taqtulu anfusakum'), menunjukkan bahwa menjaga nyawa dan menjaga harta adalah prinsip utama syariat." } },
  "4_58": { surah: 4, number: 58, text: { arab: "إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا۟ ٱلْأَمَـٰنَـٰتِ إِلَىٰٓ أَهْلِهَا وَإِذَا حَكَمْتُم..." }, translation: { id: "Sesungguhnya Allah menyuruh kamu menyampaikan amanat kepada yang berhak menerimanya..." }, tafsir: { maudhui: "Ayat ini adalah dasar etika pejabat dan hakim. Ibnu Katsir menjelaskan kewajiban menunaikan Amanah kepada pemiliknya (jangan khianat). Dan jika menetapkan hukum di antara manusia, wajib menetapkan dengan ADIL, tanpa pandang bulu, tanpa suap, dan tanpa keberpihakan pada kerabat atau orang kaya. Keadilan adalah perintah Allah yang paling agung untuk menjaga tatanan sosial. Nabi SAW bersabda: 'Hakim ada tiga; satu di surga (yang tahu kebenaran dan memutus dengannya), dua di neraka (yang tahu tapi curang, atau yang memutus tanpa ilmu).'" } },

  // --- F. AKHLAK ---
  "98_5": { surah: 98, number: 5, text: { arab: "وَمَآ أُمِرُوٓا۟ إِلَّا لِيَعْبُدُوا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ..." }, translation: { id: "Padahal mereka tidak disuruh kecuali supaya menyembah Allah dengan memurnikan ketaatan kepada-Nya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa inti ajaran semua kitab suci adalah Ikhlas. Ikhlas bermakna memurnikan agama dan ibadah hanya untuk Allah, bersih dari noda syirik dan riya. 'Hunafa' (jamak dari Hanif) artinya orang yang menyimpang dari segala agama sesat untuk lurus menuju Tauhid. Tanpa keikhlasan, amal sebesar apapun (seperti shalat dan zakat yang disebutkan setelahnya) akan sia-sia bagaikan debu yang berterbangan." } },
  "17_23": { surah: 17, number: 23, text: { arab: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا..." }, translation: { id: "Dan Tuhanmu telah memerintahkan supaya kamu jangan menyembah selain Dia dan hendaklah kamu berbuat baik pada ibu bapakmu..." }, tafsir: { maudhui: "Allah menyandingkan perintah Tauhid (hak Allah) langsung dengan Birrul Walidain (hak orang tua), menunjukkan betapa tingginya kedudukan orang tua. Ibnu Katsir merinci adab kepada orang tua, terutama saat mereka lanjut usia (Indal kibar): 1) Jangan berkata 'Ah' (Uffin), kata penolakan terhalus pun haram. 2) Jangan membentak (Tanharhuma). 3) Ucapkan perkataan mulia (Qaulan Karima). 4) Rendahkan sayap kehinaan (tawadhu') karena kasih sayang, mengingat jasa mereka merawat kita saat kecil dan lemah." } },
  "4_36": { surah: 4, number: 36, text: { arab: "وَٱعْبُدُوا۟ ٱللَّهَ وَلَا تُشْرِكُوا۟ بِهِۦ شَيْـًٔا ۖ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا..." }, translation: { id: "Sembahlah Allah dan janganlah kamu mempersekutukan-Nya dengan sesuatupun. Dan berbuat baiklah kepada dua orang ibu-bapa..." }, tafsir: { maudhui: "Ibnu Katsir menyebut ini sebagai 'Ayat Hak-Hak Sepuluh'. Dimulai dengan Hak Allah (Tauhid), lalu hak manusia yang diurutkan berdasarkan kedekatan: 1) Orang tua, 2) Kerabat, 3) Anak yatim, 4) Orang miskin, 5) Tetangga dekat, 6) Tetangga jauh, 7) Teman sejawat, 8) Ibnu Sabil (musafir), 9) Hamba sahaya. Ayat ini ditutup dengan larangan sombong (Mukhtalan Fakhura), karena kesombongan adalah penghalang utama dalam menunaikan hak-hak sosial ini." } },
  "9_119": { surah: 9, number: 119, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَكُونُوا۟ مَعَ ٱلصَّـٰدِقِينَ" }, translation: { id: "Hai orang-orang yang beriman bertakwalah kepada Allah, dan hendaklah kamu bersama orang-orang yang benar." }, tafsir: { maudhui: "Ayat ini turun terkait kisah taubatnya Ka'ab bin Malik dan dua sahabat lainnya yang jujur mengakui kesalahan mereka tidak ikut Perang Tabuk tanpa uzur. Kejujuran mereka (Shiddiq) menyelamatkan mereka dan mendatangkan ampunan Allah, sementara orang munafik yang berdusta (membuat alasan palsu) justru celaka. Ibnu Katsir berpesan: 'Jujurlah kalian, niscaya kalian selamat walaupun kalian melihat kebinasaan di dalamnya.' Perintah 'Bersamalah dengan orang jujur' menunjukkan pentingnya lingkungan pergaulan yang baik." } },
  "2_153": { surah: 2, number: 153, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ..." }, translation: { id: "Hai orang-orang yang beriman, jadikanlah sabar dan salat sebagai penolongmu..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa dunia adalah tempat ujian (Darul Ibtila). Dua alat utama bagi mukmin untuk menghadapinya adalah Sabar dan Shalat. Sabar itu ada tiga: Sabar dalam taat, sabar menjauhi maksiat, dan sabar menghadapi musibah. Namun sabar itu berat, maka ia butuh sandaran kekuatan, yaitu Shalat. Shalat menghubungkan hamba yang lemah dengan Allah yang Maha Kuat. 'Innallaha ma'ash shabirin' (Allah bersama orang sabar) adalah Ma'iyah Khassah (Kebersamaan Khusus) berupa pertolongan, dukungan, dan penjagaan." } },
  "14_7": { surah: 14, number: 7, text: { arab: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ..." }, translation: { id: "Dan (ingatlah juga), tatkala Tuhanmu memaklumkan; 'Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu'..." }, tafsir: { maudhui: "Ini adalah janji Allah yang pasti dan proklamasi agung (Ta'adzana). Ibnu Katsir menjelaskan: Syukur adalah pengikat nikmat yang ada (Qayid) dan pemburu nikmat yang belum ada (Shaid). 'La-azidannakum' (Pasti Aku tambah) bisa berupa tambahan harta, keberkahan, ketenangan, atau pahala akhirat. Sebaliknya, Kufur Nikmat mengundang azab yang pedih, salah satunya adalah dicabutnya nikmat tersebut atau nikmat itu berubah menjadi sumber bencana (Istidraj)." } },
  "3_159": { surah: 3, number: 159, text: { arab: "فَبِمَا رَحْمَةٍۢ مِّنَ ٱللَّهِ لِنتَ لَهُمْ ۖ ... فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى ٱللَّهِ..." }, translation: { id: "Maka disebabkan rahmat dari Allah-lah kamu berlaku lemah lembut terhadap mereka... kemudian apabila kamu telah membulatkan tekad, maka bertawakkallah..." }, tafsir: { maudhui: "Ibnu Katsir memuji akhlak Rasulullah SAW. Kelembutan hati beliau adalah rahmat Allah. Seandainya beliau bersikap kasar dan keras hati, niscaya para sahabat akan lari menjauh, terutama setelah kekalahan Uhud. Ayat ini mengajarkan leadership: 1) Maafkan kesalahan bawahan, 2) Mohonkan ampun untuk mereka, 3) Ajak musyawarah dalam urusan. Setelah musyawarah menghasilkan keputusan (Azzam), maka tidak boleh ragu lagi, harus eksekusi dengan Tawakkal kepada Allah. Tawakal adalah menyerahkan hasil kepada Allah setelah menyempurnakan ikhtiar." } },
  "25_63": { surah: 25, number: 63, text: { arab: "وَعِبَادُ ٱلرَّحْمَـٰنِ ٱلَّذِينَ يَمْشُونَ عَلَى ٱلْأَرْضِ هَوْنًا..." }, translation: { id: "Dan hamba-hamba Tuhan yang Maha Penyayang itu (ialah) orang-orang yang berjalan di atas bumi dengan rendah hati..." }, tafsir: { maudhui: "Ibnu Katsir mendeskripsikan sifat 'Ibadurrahman' (Hamba-hamba Allah Yang Maha Penyayang). Ciri pertama mereka adalah Tawadhu' (rendah hati) dalam gestur fisik; mereka berjalan dengan tenang, berwibawa, tidak sombong atau dibuat-buat. Ciri kedua adalah pengendalian emosi; 'Apabila orang-orang bodoh menyapa mereka (dengan kata-kata buruk), mereka mengucapkan salam' (kata-kata yang selamat/damai). Mereka tidak membalas kebodohan dengan kebodohan, melainkan dengan kesabaran dan disengagement yang bermartabat." } },
  "31_18": { surah: 31, number: 18, text: { arab: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي ٱلْأَرْضِ مَرَحًا..." }, translation: { id: "Dan janganlah kamu memalingkan mukamu dari manusia (karena sombong)..." }, tafsir: { maudhui: "Ini adalah nasihat Luqman tentang etika sosial. Ibnu Katsir menjelaskan makna 'Tusha''ir khaddaka': Jangan memalingkan wajah atau membuang muka saat berbicara dengan orang lain karena merasa lebih hebat/meremehkan mereka. 'Maraha' adalah berjalan dengan angkuh dan sombong. Allah tidak menyukai setiap orang yang 'Mukhtal' (sombong pada dirinya sendiri/narsis) dan 'Fakhur' (sombong kepada orang lain/membanggakan diri). Sikap tubuh dan cara bicara adalah cerminan hati; hati yang tawadhu' tidak akan menghasilkan gestur yang angkuh." } },
  "3_134": { surah: 3, number: 134, text: { arab: "...وَٱلْكَـٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ..." }, translation: { id: "...dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan sifat orang bertakwa (Muttaqin) yang disediakan surga untuk mereka. Mereka bukan hanya berinfak saat lapang, tapi juga saat sempit. Sifat batin mereka adalah 'Kazhiminal Ghaizh': mampu menelan/menahan amarah padahal mereka mampu melampiaskannya. Lebih tinggi dari itu, mereka 'Al-'Afina 'aninnas': memaafkan orang yang bersalah pada mereka, tidak menyimpan dendam. Dan puncaknya adalah Ihsan (berbuat baik pada orang yang menyakiti). Inilah akhlak tertinggi yang dicintai Allah." } },
  "42_40": { surah: 42, number: 40, text: { arab: "وَجَزَٰٓؤُا۟ سَيِّئَةٍۢ سَيِّئَةٌۭ مِّثْلُهَا ۖ فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُۥ عَلَى ٱللَّهِ..." }, translation: { id: "Dan balasan suatu kejahatan adalah kejahatan yang serupa, maka barang siapa memaafkan dan berbuat baik maka pahalanya atas (tanggungan) Allah..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan tiga tingkatan dalam merespons kejahatan orang lain: 1) Adil: Membalas kejahatan dengan yang setimpal (Qishash), ini boleh. 2) Zalim: Membalas lebih kejam dari perbuatannya, ini dosa. 3) Utama (Fadhilah): Memaafkan dan memperbaiki hubungan (Islah). Allah memotivasi opsi ketiga dengan janji 'Pahalanya atas tanggungan Allah'. Jika Allah sudah menjamin pahalanya, berarti balasannya sangat besar dan tak terbatas, karena kemurahan Allah tak terbatas." } },

  // --- G. SOSIAL ---
  "49_10": { surah: 49, number: 10, text: { arab: "إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ..." }, translation: { id: "Orang-orang beriman itu sesungguhnya bersaudara. Sebab itu damaikanlah (perbaikilah hubungan) antara kedua saudaramu itu..." }, tafsir: { maudhui: "Ibnu Katsir menegaskan bahwa persaudaraan iman (Ukhuwah Islamiyah) lebih kuat dan hakiki daripada persaudaraan nasab. Kata 'Innama' (Hanyasanya) menunjukkan pembatasan: Tidak ada persaudaraan sejati kecuali dalam iman. Konsekuensi persaudaraan ini adalah kewajiban 'Ishlah' (mendamaikan). Jika ada dua individu atau kelompok mukmin bertikai, haram bagi pihak ketiga untuk membiarkan atau memanas-manasi. Wajib turun tangan mendamaikan mereka dengan adil demi menjaga keutuhan tubuh umat." } },
  "3_103": { surah: 3, number: 103, text: { arab: "وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا۟..." }, translation: { id: "Dan berpeganglah kamu semuanya kepada tali (agama) Allah, dan janganlah kamu bercerai berai..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan perintah untuk bersatu (Jamaah) dan larangan berpecah belah (Furqah). 'Hablillah' (Tali Allah) ditafsirkan sebagai Al-Qur'an atau Islam. Persatuan bukan sekadar kumpul fisik, tapi bersatu di atas prinsip Al-Qur'an dan Sunnah. Allah mengingatkan nikmat-Nya: Dulu di masa Jahiliyah (suku Aus dan Khazraj) saling bermusuhan dan berada di tepi jurang neraka, lalu Allah persatukan hati mereka dengan Islam. Persatuan adalah Rahmat dan penjaga keselamatan, sedangkan perpecahan adalah azab dan kelemahan." } },
  "16_90": { surah: 16, number: 90, text: { arab: "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَـٰنِ وَإِيتَآءِ ذِى ٱلْقُرْبَىٰ..." }, translation: { id: "Sesungguhnya Allah menyuruh (kamu) berlaku adil dan berbuat kebajikan, memberi kepada kaum kerabat..." }, tafsir: { maudhui: "Ini adalah ayat yang paling komprehensif (Jami') dalam Al-Qur'an tentang etika sosial. Ibnu Katsir mengutip hadits bahwa ayat ini mencakup seluruh kebaikan dan melarang seluruh keburukan. Allah memerintahkan tiga hal: Adil (menunaikan hak wajib), Ihsan (berbuat lebih dari wajib/kebaikan sukarela), dan Memberi kerabat (silaturahmi). Allah melarang tiga hal: Fahsya' (dosa besar/zina), Mungkar (keburukan yang diingkari syariat/akal), dan Baghyu (kezaliman/melampaui batas terhadap orang lain). Ayat ini sering dibaca di akhir khutbah Jumat sebagai pengingat universal." } },
  "5_2": { surah: 5, number: 2, text: { arab: "...وَتَعَاوَنُوا۟ عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا۟ عَلَى ٱلْإِثْمِ وَٱلْعُدْوَٰنِ..." }, translation: { id: "...Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan prinsip 'Ta'awun' (Gotong Royong) dalam Islam. Kerjasama itu mutlak diperintahkan jika dalam konteks 'Al-Birr' (kebaikan sosial) dan 'At-Taqwa' (kepatuhan pada Allah). Namun, kerjasama mutlak dilarang jika dalam konteks 'Al-Itsm' (dosa pribadi) dan 'Al-Udwan' (permusuhan/kezaliman pada orang lain). Islam tidak membenarkan solidaritas buta (ashabiyah) seperti membela teman/suku yang salah. Menolong saudara yang zalim adalah dengan cara mencegahnya dari kezaliman tersebut." } },
  "51_19": { surah: 51, number: 19, text: { arab: "وَفِيٓ أَمْوَٰلِهِمْ حَقٌّۭ لِّلسَّآئِلِ وَٱلْمَحْرُومِ" }, translation: { id: "Dan pada harta-harta mereka ada hak untuk orang miskin yang meminta dan orang miskin yang tidak mendapat bagian." }, tafsir: { maudhui: "Ibnu Katsir menekankan kesadaran sosial orang bertakwa. Mereka menyadari bahwa dalam kekayaan mereka, ada 'Haq' (Hak) milik orang lain yang Allah titipkan. Jadi ketika mereka berinfak, mereka tidak merasa sedang memberi bantuan, melainkan sedang 'mengembalikan hak' kepada pemiliknya. Hak ini berlaku bagi 'Sa'il' (pengemis yang meminta) dan 'Mahrum' (orang miskin yang menjaga kehormatan diri tidak meminta-minta, sehingga sering dikira kaya dan tidak mendapat bantuan). Kita wajib jeli mencari si Mahrum ini." } },
  "49_12": { surah: 49, number: 12, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱجْتَنِبُوا۟ كَثِيرًا مِّنَ ٱلظَّنِّ..." }, translation: { id: "Hai orang-orang yang beriman, jauhilah kebanyakan purba-sangka..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan tiga penyakit sosial yang merusak komunitas. 1) Suudzon (Prasangka Buruk): Menuduh orang baik berbuat jahat tanpa bukti. Allah menyebut 'sebagian prasangka adalah dosa'. 2) Tajassus (Mata-mata): Mencari-cari aib/kesalahan orang lain yang tersembunyi. 3) Ghibah (Menggunjing): Membicarakan keburukan saudaramu di belakangnya. Allah menggambarkan Ghibah dengan perumpamaan yang sangat menjijikkan: 'Apakah salah seorang kalian suka memakan daging saudaranya yang sudah mati?' Tentu kalian jijik. Maka jauhilah ghibah sebagaimana kalian jijik kanibal makan bangkai." } },
  "49_11": { surah: 49, number: 11, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا يَسْخَرْ قَوْمٌۭ مِّن قَوْمٍ..." }, translation: { id: "Hai orang-orang yang beriman, janganlah sekumpulan orang laki-laki merendahkan kumpulan yang lain..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan larangan 'Sakhriyah' (mengolok-olok/menghina). Seseorang tidak boleh merendahkan orang lain karena boleh jadi orang yang dihina itu lebih baik dan lebih mulia di sisi Allah daripada yang menghina. Standar kemuliaan adalah Takwa, bukan rupa atau harta. Ayat ini juga melarang 'Lamz' (mencela dengan kata-kata atau isyarat) dan 'Tanabuz bil Alqab' (memanggil dengan gelaran yang buruk/dibenci). Semua ini dilarang untuk menjaga kehormatan dan persaudaraan sesama muslim." } },
  "49_6": { surah: 49, number: 6, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن جَآءَكُمْ فَاسِقٌۢ..." }, translation: { id: "Hai orang-orang yang beriman, jika datang kepadamu orang fasik membawa suatu berita, maka periksalah dengan teliti..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan prinsip 'Tabayyun' (verifikasi/cek fakta) dalam menerima berita. Jika pembawa berita adalah orang fasik (tidak kredibel agama/moralnya), kita wajib menelitinya dan tidak boleh langsung membenarkannya. Menerima berita bohong (Hoax) tanpa kroscek dapat menyebabkan kita menimpakan musibah/kezaliman kepada suatu kaum yang tidak bersalah, yang akhirnya menimbulkan penyesalan mendalam. Ayat ini adalah fondasi jurnalisme dan etika informasi dalam Islam." } },

  // --- H. EKONOMI ---
  "8_28": { surah: 8, number: 28, text: { arab: "وَٱعْلَمُوٓا۟ أَنَّمَآ أَمْوَٰلُكُمْ وَأَوْلَـٰدُكُمْ فِتْنَةٌ..." }, translation: { id: "Dan ketahuilah, bahwa hartamu dan anak-anakmu itu hanyalah sebagai cobaan..." }, tafsir: { maudhui: "Ibnu Katsir mengingatkan hakikat harta dan anak. Keduanya adalah 'Fitnah' (Ujian/Cobaan) dari Allah untuk melihat: Apakah kecintaan kepada keduanya membuat manusia lalai dari taat kepada Allah, ataukah manusia menjadikan keduanya sebagai sarana mendekatkan diri kepada-Nya? Jangan sampai demi menumpuk harta atau memanjakan anak, seseorang menghalalkan yang haram atau meninggalkan kewajiban. Di sisi Allah ada pahala yang besar bagi yang lulus ujian prioritas ini." } },
  "57_7": { surah: 57, number: 7, text: { arab: "ءَامِنُوا۟ بِٱللَّهِ وَرَسُولِهِۦ وَأَنفِقُوا۟ مِمَّا جَعَلَكُم مُّسْتَخْلَفِينَ فِيهِ..." }, translation: { id: "Berimanlah kamu kepada Allah dan Rasul-Nya dan nafkahkanlah sebagian dari hartamu yang Allah telah menjadikan kamu menguasainya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan konsep kepemilikan dalam Islam. Harta sejatinya milik Allah. Manusia hanyalah 'Mustakhlifin' (wakil/pengelola/penerus) yang diberi wewenang sementara untuk menggunakannya. Karena harta itu titipan dari Pemilik Asli (Allah), maka ketika Dia memerintahkan untuk menginfakkannya, tidak ada alasan bagi wakil untuk pelit. Toh itu bukan uangnya sendiri. Orang yang sadar posisinya sebagai 'Kasir Tuhan' akan mudah berinfak dan mendapat pahala besar." } },
  "2_261": { surah: 2, number: 261, text: { arab: "مَّثَلُ ٱلَّذِينَ يُنفِقُونَ أَمْوَٰلَهُمْ فِي سَبِيلِ ٱللَّهِ كَمَثَلِ حَبَّةٍ..." }, translation: { id: "Perumpamaan (nafkah yang dikeluarkan oleh) orang-orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan sebutir benih..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan pelipatgandaan pahala sedekah dengan perumpamaan visual pertanian yang indah. Satu biji tumbuh menjadi 7 tangkai, tiap tangkai 100 biji = 700 kali lipat. Bahkan Allah melipatgandakan lebih dari itu bagi siapa yang Dia kehendaki, tergantung pada keikhlasan hati, kualitas harta yang diinfakkan, dan ketepatan sasaran. Ini memotivasi orang beriman untuk tidak takut miskin karena bersedekah, karena sedekah adalah investasi dengan Return on Investment (ROI) tertinggi dan dijamin oleh Allah." } },
  "92_18": { surah: 92, number: 18, text: { arab: "ٱلَّذِى يُؤْتِى مَالَهُۥ يَتَزَكَّىٰ" }, translation: { id: "Yang menafkahkan hartanya (di jalan Allah) untuk membersihkannya." }, tafsir: { maudhui: "Ayat ini turun memuji Abu Bakar Ash-Shiddiq yang memerdekakan budak-budak lemah (seperti Bilal) karena Allah. Ibnu Katsir menjelaskan bahwa tujuan infak dalam Islam adalah 'Yatazakka' (membersihkan diri/jiwa). Bukan untuk riya, bukan untuk balas budi kepada orang lain, dan bukan untuk mencari muka. Semata-mata mencari Wajah Allah yang Maha Tinggi. Siapa yang beramal dengan niat murni seperti ini, Allah berjanji: 'Walasaufa yardha' (Kelak dia pasti akan puas/ridha dengan balasan Allah)." } },
  "17_29": { surah: 17, number: 29, text: { arab: "وَلَا تَجْعَلْ يَدَكَ مَغْلُولَةً إِلَىٰ عُنُقِكَ وَلَا تَبْسُطْهَا..." }, translation: { id: "Dan janganlah kamu jadikan tanganmu terbelenggu pada lehermu (kikir) dan janganlah kamu terlalu mengulurkannya (boros)..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan manajemen keuangan rumah tangga dalam Islam yang berbasis keseimbangan (Iqtishad). Jangan kikir menahan harta ('tangan terbelenggu di leher') sehingga tidak memberi hak diri dan keluarga. Jangan pula boros menghamburkan harta ('terlalu mengulurkan tangan') di luar kemampuan pendapatan. Kedua ekstrem ini membawa penyesalan: si kikir dicela (maluma), si boros habis hartanya dan menyesal (mahsur). Sebaik-baik perkara adalah pertengahannya (Al-Qawam)." } },
  "17_26": { surah: 17, number: 26, text: { arab: "وَءَاتِ ذَا ٱلْقُرْبَىٰ حَقَّهُۥ وَٱلْمِسْكِينَ وَٱبْنَ ٱلسَّبِيلِ وَلَا تُبَذِّرْ تَبْذِيرًا" }, translation: { id: "Dan berikanlah kepada keluarga-keluarga yang dekat akan haknya... dan janganlah kamu menghambur-hamburkan (hartamu) secara boros." }, tafsir: { maudhui: "Setelah memerintahkan berbuat baik pada orang tua, Allah memerintahkan memenuhi hak kerabat, miskin, dan musafir. Namun, Allah melarang 'Tabdzir' (pemborosan). Ibnu Katsir dan Ibnu Mas'ud menjelaskan beda Israf dan Tabdzir: Tabdzir adalah menginfakkan harta pada jalan yang tidak benar (maksiat). Orang yang boros dalam maksiat disebut 'Saudara Setan' karena kesamaan sifat ingkar nikmat. Setan tidak bersyukur atas karunia Allah, begitu juga pemboros yang menggunakan nikmat Allah untuk mendurhakai-Nya." } },
  "28_77": { surah: 28, number: 77, text: { arab: "وَٱبْتَغِ فِيَمَآ ءَاتَىٰكَ ٱللَّهُ ٱلدَّارَ ٱلْـَٔاخِرَةَ ۖ وَلَا تَنسَ نَصِيبَكَ مِنَ ٱلدُّنْيَا..." }, translation: { id: "Dan carilah pada apa yang telah dianugerahkan Allah kepadamu (kebahagiaan) negeri akhirat, dan janganlah kamu melupakan bahagianmu dari (kenikmatan) duniawi..." }, tafsir: { maudhui: "Nasihat kepada Qarun ini adalah prinsip Tawazun (keseimbangan). Ibnu Katsir menjelaskan: Gunakan kekayaan yang Allah berikan untuk mengejar akhirat (sedekah, haji, bantu orang). Tapi 'jangan lupakan nasibmu di dunia': silakan nikmati makanan, pakaian, rumah, dan pernikahan yang halal. Allah tidak menyuruh kita menjadi rahib yang meninggalkan dunia total. Prinsipnya: 'Berbuat baiklah (kepada orang lain) sebagaimana Allah telah berbuat baik kepadamu.' Kekayaan adalah sarana berbuat baik, bukan tujuan akhir." } },
  "83_1": { surah: 83, number: 1, text: { arab: "وَيْلٌۭ لِّلْمُطَفِّفِينَ" }, translation: { id: "Kecelakaan besarlah bagi orang-orang yang curang." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan ancaman 'Wail' (lembah di neraka atau kebinasaan) bagi 'Al-Mutaffifin'. Mereka adalah pedagang yang curang dalam takaran dan timbangan. Jika mereka membeli (menerima takaran), mereka minta dipenuhi. Jika mereka menjual (menakar untuk orang), mereka kurangi sedikit. Perbuatan curang dalam hal-hal 'remeh' ini dianggap dosa besar karena merusak kepercayaan dan memakan harta orang dengan batil. Ayat ini menunjukkan Islam sangat concern pada kejujuran pasar dan perlindungan konsumen." } },

  // --- I. POLITIK ---
  "2_124": { surah: 2, number: 124, text: { arab: "۞ وَإِذِ ٱبْتَلَىٰٓ إِبْرَٰهِـۧمَ رَبُّهُۥ بِكَلِمَـٰتٍۢ فَأَتَمَّهُنَّ ۖ قَالَ إِنِّى جَاعِلُكَ لِلنَّاسِ إِمَامًا..." }, translation: { id: "Dan (ingatlah), ketika Ibrahim diuji Tuhannya... Allah berfirman: 'Sesungguhnya Aku akan menjadikanmu imam bagi seluruh manusia'..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa kepemimpinan (Imamah) dalam agama adalah kedudukan tinggi yang tidak didapat dengan gratis. Ibrahim AS dijadikan Imam (Teladan/Pemimpin) karena beliau sukses 'menyempurnakan' (Atammahunna) serangkaian ujian berat dari Allah (menyembelih anak, khitan di usia tua, melawan Namrud). Ketika Ibrahim meminta agar keturunannya juga jadi pemimpin, Allah menjawab: 'Janji-Ku tidak mengenai orang zalim'. Ini adalah kaidah politik Islam: Kepemimpinan sah tidak diberikan atau tidak berlaku bagi orang yang zalim/kafir. Kesalehan dan Keadilan adalah syarat legitimasi spiritual pemimpin." } },
  "33_72": { surah: 33, number: 72, text: { arab: "إِنَّا عَرَضْنَا ٱلْأَمَانَةَ عَلَى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱلْجِبَالِ..." }, translation: { id: "Sesungguhnya Kami telah mengemukakan amanat kepada langit, bumi dan gunung-gunung, maka semuanya enggan untuk memikul amanat itu..." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan betapa beratnya 'Amanah' (tugas menjalankan syariat dan kepemimpinan). Langit, bumi, dan gunung menolak memikulnya bukan karena membangkang, tapi karena takut (Isyfaq) tidak mampu menunaikannya dan takut akan azab jika khianat. Namun manusia (Adam) menerimanya. Allah menyebut manusia 'Zaluma' (amat zalim) dan 'Jahula' (amat bodoh) karena berani memikul beban yang alam semesta pun tidak sanggup. Hanya orang beriman yang mampu menunaikan amanah ini dengan bantuan Allah, sedangkan munafik dan musyrik akan berkhianat." } },
  "4_59": { surah: 4, number: 59, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَطِيعُوا۟ ٱللَّهَ وَأَطِيعُوا۟ ٱلرَّسُولَ وَأُو۟لِى ٱلْأَمْرِ مِنكُمْ..." }, translation: { id: "Hai orang-orang yang beriman, taatilah Allah dan taatilah Rasul (Nya), dan ulil amri di antara kamu..." }, tafsir: { maudhui: "Ayat konstitusi dalam politik Islam. Ibnu Katsir menjelaskan hirarki ketaatan: Taat pada Allah dan Rasul bersifat mutlak (menggunakan kata 'Athi'u' ulang). Sedangkan taat pada Ulil Amr (pemimpin/ulama) bersifat terikat (tanpa pengulangan kata 'Athi'u'), yaitu selama mereka taat pada Allah dan Rasul. 'Tidak ada ketaatan kepada makhluk dalam bermaksiat kepada Khaliq.' Jika terjadi sengketa (Tanaza'tum) antara rakyat dan pemerintah, solusinya adalah 'Kembali kepada Allah (Quran) dan Rasul (Sunnah)', bukan hukum buatan manusia yang bertentangan dengan syariat." } },
  "42_38": { surah: 42, number: 38, text: { arab: "...وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ..." }, translation: { id: "...sedang urusan mereka (diputuskan) dengan musyawarat antara mereka..." }, tafsir: { maudhui: "Ibnu Katsir memuji sifat kaum mukminin yang tidak bertindak otoriter. Prinsip 'Syura' (Musyawarah) adalah pilar tata kelola masyarakat Islam. Rasulullah SAW sendiri, meski dibimbing wahyu, adalah orang yang paling sering bermusyawarah dengan sahabatnya (seperti dalam perang Uhud dan Khandaq) untuk menenangkan hati mereka dan mengajarkan sunnah ini. Keputusan publik harus diambil berdasarkan konsultasi dan mufakat, bukan dikte satu orang." } },
  "2_190": { surah: 2, number: 190, text: { arab: "وَقَـٰتِلُوا۟ فِي سَبِيلِ ٱللَّهِ ٱلَّذِينَ يُقَـٰتِلُونَكُمْ وَلَا تَعْتَدُوٓا۟..." }, translation: { id: "Dan perangilah di jalan Allah orang-orang yang memerangi kamu, (tetapi) janganlah kamu melampaui batas..." }, tafsir: { maudhui: "Ini adalah ayat pertama yang mengizinkan perang (menurut sebagian ulama). Ibnu Katsir menjelaskan etika Jihad: Perangilah mereka yang memerangi kalian (defensif/kombatan). Namun ada rambu tegas 'Wala ta'tadu' (Jangan melampaui batas). Melampaui batas mencakup: membunuh wanita, anak-anak, orang tua renta, pendeta di biara, membakar pohon, membunuh hewan tanpa alasan, dan mencincang mayat (Mutsla). Perang dalam Islam memiliki aturan moral yang ketat, bukan pelampiasan nafsu membunuh." } },
  "8_61": { surah: 8, number: 61, text: { arab: "۞ وَإِن جَنَحُوا۟ لِلسَّلْمِ فَٱجْنَحْ لَهَا وَتَوَكَّلْ عَلَى ٱللَّهِ..." }, translation: { id: "Dan jika mereka condong kepada perdamaian, maka condonglah kepadanya dan bertawakkallah kepada Allah..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan prioritas perdamaian. Jika musuh mengajak damai (gencatan senjata/perjanjian), maka Imam/Pemimpin wajib menerimanya dan bertawakal kepada Allah, meskipun mungkin ada tipu daya di baliknya. Allah yang akan menjamin dan melindungi kaum mukminin. Ayat ini menjadi dalil Perjanjian Hudaibiyah, di mana Rasulullah menerima tawaran damai Quraisy meski syaratnya tampak merugikan, yang ternyata menjadi kunci kemenangan (Fathu Makkah) di kemudian hari." } },
  "5_87": { surah: 5, number: 87, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُحَرِّمُوا۟ طَيِّبَـٰتِ مَآ أَحَلَّ ٱللَّهُ لَكُمْ وَلَا تَعْتَدُوٓا۟..." }, translation: { id: "Hai orang-orang yang beriman, janganlah kamu haramkan apa-apa yang baik yang telah Allah halalkan bagi kamu..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan larangan 'Ghuluw' (berlebih-lebihan/ekstrim) dalam agama. Ayat ini turun menegur sebagian sahabat yang ingin mengebiri diri, tidak tidur malam, dan tidak makan daging demi ibadah (seperti rahib). Islam melarang mengharamkan yang halal (seperti makanan enak, tidur, nikah) dengan niat mendekatkan diri pada Allah. 'Jangan melampaui batas', karena Allah tidak suka orang yang ekstrem. Islam adalah agama fitrah yang seimbang antara hak tubuh dan hak Rabb." } },

  // --- J. SEJARAH ---
  "2_30": { surah: 2, number: 30, text: { arab: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى جَاعِلٌ فِي ٱلْأَرْضِ خَلِيفَةً..." }, translation: { id: "Ingatlah ketika Tuhanmu berfirman kepada para Malaikat: 'Sesungguhnya Aku hendak menjadikan seorang khalifah di muka bumi'..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan dialog pra-penciptaan Adam AS. Allah memberitahu Malaikat tentang rencana penciptaan manusia sebagai 'Khalifah' (pemimpin/pengelola) bumi. Malaikat bertanya 'Apakah Engkau hendak menjadikan orang yang merusak...?' bukan karena protes, tapi karena pengalaman mereka melihat Jin yang menghuni bumi sebelumnya berbuat kerusakan dan tumpah darah. Allah menjawab 'Aku mengetahui apa yang tidak kalian ketahui'. Allah tahu bahwa di antara manusia akan ada para Nabi, Syuhada, dan orang Shalih yang memakmurkan bumi dengan ketaatan." } },
  "11_25": { surah: 11, number: 25, text: { arab: "وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِۦٓ إِنِّى لَكُمْ نَذِيرٌ مُّبِينٌ" }, translation: { id: "Dan sesungguhnya Kami telah mengutus Nuh kepada kaumnya..." }, tafsir: { maudhui: "Nuh AS adalah Rasul pertama yang diutus ke bumi setelah terjadinya penyembahan berhala (Wadd, Suwa, Yaghuts, dll). Ibnu Katsir menceritakan kesabaran Nuh yang luar biasa berdakwah selama 950 tahun, siang dan malam, secara rahasia dan terang-terangan. Namun, kaumnya menutup telinga dan membungkus diri dengan baju agar tidak mendengar. Inti dakwah Nuh adalah 'Nadzir Mubin' (Pemberi peringatan yang nyata) agar mereka meninggalkan syirik sebelum datangnya azab yang pedih." } },
  "11_42": { surah: 11, number: 42, text: { arab: "وَهِىَ تَجْرِى بِهِمْ فِي مَوْجٍۢ كَٱلْجِبَالِ وَنَادَىٰ نُوحٌ ٱبْنَهُۥ..." }, translation: { id: "Dan bahtera itu berlayar membawa mereka dalam gelombang laksana gunung..." }, tafsir: { maudhui: "Ibnu Katsir melukiskan adegan banjir besar yang menenggelamkan gunung. Di tengah kekacauan itu, naluri ayah Nabi Nuh memanggil anaknya (Kan'an/Yam) yang kafir: 'Naiklah bersama kami, jangan bersama orang kafir.' Namun anaknya menolak dengan logika rasionalis yang sombong: 'Aku akan mencari perlindungan ke gunung yang tinggi'. Nuh menjawab: 'Hari ini tidak ada pelindung dari azab Allah kecuali rahmat-Nya'. Akhirnya ombak memisahkan mereka. Kisah ini mengajarkan bahwa hubungan darah tidak bisa menyelamatkan seseorang dari kekafiran; keselamatan hanya dengan Iman." } },
  "28_3": { surah: 28, number: 3, text: { arab: "نَتْلُوا۟ عَلَيْكَ مِن نَّبَإِ مُوسَىٰ وَفِرْعَوْنَ..." }, translation: { id: "Kami membacakan kepadamu sebagian dari kisah Musa dan Fir'aun..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan latar belakang kisah Musa. Firaun adalah tiran yang sombong, memecah belah rakyatnya, dan membunuhi bayi laki-laki Bani Israil karena takut akan takwil mimpi bahwa kekuasaannya akan hancur di tangan pemuda Bani Israil. Namun, 'Makar Allah lebih hebat'. Justru di istana Firaun-lah, Allah membesarkan Musa, bayi yang paling ia takutkan, di bawah asuhan istri Firaun sendiri. Ini menunjukkan kekuasaan Allah yang mampu memenangkan kaum lemah (Mustad'afin) melawan tirani superpower." } },
  "28_30": { surah: 28, number: 30, text: { arab: "فَلَمَّآ أَتَىٰهَا نُودِىَ مِن شَـٰطِئِ ٱلْوَادِ ٱلْأَيْمَنِ..." }, translation: { id: "Maka tatkala Musa sampai ke (tempat) api itu, diserulah dia..." }, tafsir: { maudhui: "Momen pengangkatan kenabian Musa di Lembah Tuwa. Musa melihat api di pohon (padahal itu Cahaya Ilahi). Allah berbicara langsung kepadanya (Kalimullah): 'Wahai Musa, sesungguhnya Aku adalah Allah'. Ibnu Katsir menjelaskan bahwa di tempat yang diberkahi inilah Musa menerima mukjizat tongkat dan tangan yang bersinar, serta mandat berat untuk mendatangi Firaun. Musa diperintahkan melepaskan alas kakinya sebagai bentuk adab di lembah suci." } },
  "12_4": { surah: 12, number: 4, text: { arab: "إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَـٰٓأَبَتِ إِنِّى رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا..." }, translation: { id: "(Ingatlah), ketika Yusuf berkata kepada ayahnya: 'Wahai ayahku, sesungguhnya aku bermimpi melihat sebelas bintang...'" }, tafsir: { maudhui: "Ibnu Katsir memulai tafsir Surat Yusuf dengan mimpi kenabian ini. 11 bintang adalah saudara-saudaranya, matahari adalah ayahnya, dan bulan adalah ibunya; semuanya bersujud (hormat) kepadanya. Ya'qub AS memahami takwil mimpi ini bahwa Yusuf akan mendapat kedudukan tinggi, maka ia berpesan 'Jangan ceritakan mimpimu kepada saudaramu', karena takut setan memprovokasi kedengkian (Hasad) mereka. Kisah ini mengajarkan bahwa nikmat seringkali mengundang hasad, bahkan dari kerabat sendiri, maka perlu disembunyikan (Kitman) di awal." } },
  "2_40": { surah: 2, number: 40, text: { arab: "يَـٰبَنِيٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِيَ ٱلَّتِيٓ أَنْعَمْتُ عَلَيْكُمْ..." }, translation: { id: "Hai Bani Israil, ingatlah akan nikmat-Ku yang telah Aku anugerahkan kepadamu..." }, tafsir: { maudhui: "Allah menyeru Bani Israil (anak keturunan Ya'qub) untuk mengingat nikmat spesial: diselamatkan dari Firaun, diberi Manna wa Salwa, dan diutus banyak Nabi di kalangan mereka. Allah menagih janji: 'Penuhilah janjimu kepada-Ku (beriman pada Nabi akhir zaman yang tertulis di Taurat), niscaya Aku penuhi janji-Ku kepadamu (masuk surga)'. Ayat ini adalah peringatan agar mereka tidak menyembunyikan kebenaran tentang Muhammad SAW demi mempertahankan status sosial." } },
  "18_13": { surah: 18, number: 13, text: { arab: "نَّحْنُ نَقُصُّ عَلَيْكَ نَبَأَهُم بِٱلْحَقِّ ۚ إِنَّهُمْ فِتْيَةٌ ءَامَنُوا۟ بِرَبِّهِمْ..." }, translation: { id: "Kami kisahkan kepadamu (Muhammad) cerita ini dengan benar. Sesungguhnya mereka adalah pemuda-pemuda yang beriman..." }, tafsir: { maudhui: "Ibnu Katsir menceritakan kisah Ashabul Kahfi. Mereka adalah sekelompok pemuda bangsawan yang sadar akan kebatilan penyembahan berhala oleh raja dan kaumnya. Mereka tidak bisa melawan secara fisik, maka mereka memilih 'Uzlah' (mengasingkan diri) ke gua demi menyelamatkan akidah. Allah menambah petunjuk bagi mereka dan menjaga fisik mereka (tidur 309 tahun) sebagai tanda kekuasaan-Nya. Kisah ini adalah model bagi pemuda untuk mengutamakan Iman di atas kenyamanan hidup di lingkungan yang rusak." } },
  "15_73": { surah: 15, number: 73, text: { arab: "فَأَخَذَتْهُمُ ٱلصَّيْحَةُ مُشْرِقِينَ" }, translation: { id: "Maka mereka dibinasakan oleh suara keras yang mengguntur, ketika matahari akan terbit." }, tafsir: { maudhui: "Kisah kehancuran kaum Luth (Sodom). Setelah mereka mencoba menyerang tamu-tamu Nabi Luth (Malaikat), azab datang di waktu syuruq (terbit matahari). Ibnu Katsir menjelaskan gabungan azab yang mereka terima: 1) Ash-Shaihah (Suara menggelegar) yang memecahkan jantung, 2) Bumi dibalik (yang atas jadi bawah), 3) Hujan batu dari tanah yang terbakar (Sijjil). Ini adalah hukuman bagi fitrah yang terbalik (homoseksual) dan pembangkangan yang melampaui batas." } },

  // --- K. AKHIRAT ---
  "3_185": { surah: 3, number: 185, text: { arab: "كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ..." }, translation: { id: "Tiap-tiap yang berjiwa akan merasakan mati..." }, tafsir: { maudhui: "Ibnu Katsir menegaskan kepastian kematian. Tidak ada yang luput darinya, baik raja maupun rakyat. Ayat ini adalah Takziyah (penghibur) bagi manusia, bahwa dunia ini fana. 'Dan sesungguhnya pahalamu akan disempurnakan pada hari kiamat'. Dunia bukan tempat balasan sempurna (bisa jadi orang jahat kaya, orang baik menderita). Kemenangan sejati (Al-Fauz) hanyalah: 'Siapa yang dijauhkan dari neraka dan dimasukkan ke surga'. Selain itu, dunia hanyalah 'Mata'ul Ghurur' (kesenangan yang menipu)." } },
  "50_19": { surah: 50, number: 19, text: { arab: "وَجَآءَتْ سَكْرَةُ ٱلْمَوْتِ بِٱلْحَقِّ ۖ ذَٰلِكَ مَا كُنتَ مِنْهُ تَحِيدُ" }, translation: { id: "Dan datanglah sakaratul maut dengan sebenar-benarnya. Itulah yang kamu selalu lari daripadanya." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan dahsyatnya 'Sakaratul Maut' (mabuk/keparahan kematian). Ini adalah momen 'Haq' (kebenaran) di mana manusia melihat apa yang dulu gaib (Malaikat maut, tempat tinggal di akhirat). Kalimat 'Itulah yang kamu selalu lari daripadanya' menunjukkan tabiat manusia yang selalu berusaha menghindar dari kematian (berobat, benteng, lari), namun kematian itu justru datang menjemputnya. Bagi orang kafir, ini adalah awal penyesalan; bagi mukmin, ini adalah awal pertemuan dengan Kekasih." } },
  "23_99": { surah: 23, number: 99, text: { arab: "حَتَّىٰٓ إِذَا جَآءَ أَحَدَهُمُ ٱلْمَوْتُ قَالَ رَبِّ ٱرْجِعُونِ" }, translation: { id: "(Demikianlah keadaan orang-orang kafir itu), hingga apabila datang kematian... dia berkata: 'Ya Tuhanku kembalikanlah aku (ke dunia)'." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan penyesalan orang kafir dan pendosa saat nyawa sampai di kerongkongan atau saat melihat azab. Mereka memohon 'Rabbirji'un' (Kembalikan aku ke dunia) agar bisa beramal saleh yang dulu ditinggalkan. Namun Allah menjawab 'Kalla' (Sekali-kali tidak). Itu hanyalah kalimat kosong yang diucapkan. Di hadapan mereka kini ada 'Barzakh' (dinding pemisah) yang menghalangi mereka kembali ke dunia sampai hari Kebangkitan. Pintu taubat telah tertutup, yang ada hanyalah hisab." } },
  "22_1": { surah: 22, number: 1, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمْ ۚ إِنَّ زَلْزَلَةَ ٱلسَّاعَةِ شَىْءٌ عَظِيمٌ" }, translation: { id: "Hai manusia, bertakwalah kepada Tuhanmu; sesungguhnya kegoncangan hari kiamat itu adalah suatu kejadian yang sangat besar." }, tafsir: { maudhui: "Ayat ini menggambarkan huru-hara Kiamat (Zalzalah). Ibnu Katsir menyebutkan kegoncangan ini sangat dahsyat hingga 'Wanita yang menyusui lupa pada anaknya' dan 'Wanita hamil gugur kandungannya'. Manusia terlihat seperti mabuk padahal tidak mabuk, melainkan karena sangat kerasnya azab Allah. Ayat ini mengajak manusia untuk bertakwa sebagai satu-satunya persiapan menghadapi hari yang 'Sya'un 'Azhim' (Perkara yang sangat besar) tersebut." } },
  "47_18": { surah: 47, number: 18, text: { arab: "فَهَلْ يَنظُرُونَ إِلَّا ٱلسَّاعَةَ أَن تَأْتِيَهُم بَغْتَةًۭ ۖ فَقَدْ جَآءَ أَشْرَاطُهَا..." }, translation: { id: "Maka tidaklah yang mereka tunggu-tunggu melainkan hari kiamat... sesungguhnya telah datang tanda-tandanya." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa Kiamat akan datang secara 'Baghtah' (tiba-tiba) saat manusia lalai. Namun, 'Asyratuha' (tanda-tandanya) sudah muncul. Diutusnya Nabi Muhammad SAW sebagai Nabi terakhir adalah tanda utama dekatnya Kiamat. Jika tanda-tanda sudah lewat dan Kiamat terjadi, maka 'dzikrahum' (kesadaran/taubat) mereka saat itu tidak lagi berguna. Maka bersegeralah beramal sebelum waktu habis." } },
  "7_8": { surah: 7, number: 8, text: { arab: "وَٱلْوَزْنُ يَوْمَئِذٍ ٱلْحَقُّ ۚ فَمَن ثَقُلَتْ مَوَٰزِينُهُۥ فَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ" }, translation: { id: "Timbangan pada hari itu ialah kebenaran (keadilan)..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan tentang 'Al-Mizan' (Timbangan) di hari Kiamat yang memiliki dua piringan (kiffah) dan jarum penunjuk (lisan). Timbangan ini menimbang amal baik dan buruk dengan keadilan mutlak ('Al-Haqq'). Tidak ada yang dizalimi sedikitpun. 'Siapa yang berat timbangan kebaikannya', mereka beruntung (masuk surga). 'Siapa yang ringan timbangan kebaikannya' (karena dosanya lebih berat atau tidak punya iman), mereka merugi (masuk neraka). Amal yang paling memberatkan timbangan adalah 'La ilaha illallah' dan Akhlak Mulia." } },
  "17_13": { surah: 17, number: 13, text: { arab: "وَكُلَّ إِنسَـٰنٍ أَلْزَمْنَـٰهُ طَـٰٓئِرَهُۥ فِي عُنُقِهِۦ..." }, translation: { id: "Dan tiap-tiap manusia itu telah Kami tetapkan amal perbuatannya (sebagaimana tetapnya kalung) pada lehernya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa setiap manusia membawa catatan amalnya sendiri yang dikalungkan di lehernya (tidak bisa lepas/diwakilkan). Pada hari Kiamat, Allah mengeluarkan kitab yang terbuka ('Kitaban yalqahu mansyura'). Dikatakan kepadanya: 'Bacalah kitabmu, cukuplah dirimu sendiri pada hari ini sebagai penghitung atas dirimu'. Ini adalah puncak keadilan; manusia menjadi saksi atas perbuatannya sendiri yang tercatat detail, tidak bisa mengelak." } },
  "47_15": { surah: 47, number: 15, text: { arab: "مَّثَلُ ٱلْجَنَّةِ ٱلَّتِى وُعِدَ ٱلْمُتَّقُونَ ۖ فِيهَآ أَنْهَـٰرٌ مِّن مَّآءٍ غَيْرِ ءَاسِنٍ..." }, translation: { id: "Perumpamaan surga yang dijanjikan kepada orang-orang yang takwa..." }, tafsir: { maudhui: "Ibnu Katsir mendeskripsikan kenikmatan fisik Surga. Di sana ada 4 jenis sungai: 1) Sungai air tawar yang tidak berubah rasa/bau (ghairu asin), 2) Sungai susu yang tidak berubah rasanya, 3) Sungai khamar (arak) yang lezat dan tidak memabukkan, 4) Sungai madu yang disaring (murni). Selain itu ada buah-buahan dan ampunan dari Tuhan. Kenikmatan ini abadi, sangat kontras dengan penghuni neraka yang diberi minum air mendidih (hamim) yang memotong-motong usus mereka." } },
  "4_56": { surah: 4, number: 56, text: { arab: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ بِـَٔايَـٰتِنَا سَوْفَ نُصْلِيهِمْ نَارًا..." }, translation: { id: "Sesungguhnya orang-orang yang kafir kepada ayat-ayat Kami, kelak akan Kami masukkan mereka ke dalam neraka..." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan kedahsyatan azab fisik di neraka. 'Setiap kali kulit mereka hangus matang, Kami ganti kulit mereka dengan kulit yang lain'. Tujuannya: 'Liyazuqul 'adzab' (agar mereka terus merasakan azab). Karena saraf perasa sakit ada di kulit, maka Allah memperbaharui kulit itu terus menerus agar rasa sakitnya tidak pernah putus atau kebal. Ini adalah balasan setimpal bagi mereka yang terus menerus mengingkari ayat-ayat Allah di dunia." } },
  "2_255": { surah: 2, number: 255, text: { arab: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ..." }, translation: { id: "Allah, tidak ada Tuhan melainkan Dia..." }, tafsir: { maudhui: "Ayat Kursi, ayat paling agung dalam Al-Qur'an. Ibnu Katsir menjelaskan 10 kalimat di dalamnya yang memuat sifat-sifat Allah yang Maha Sempurna: Al-Hayyu (Maha Hidup kekal), Al-Qayyum (Berdiri sendiri dan mengurus makhluk), tidak mengantuk dan tidak tidur (kesempurnaan penjagaan). Bagian 'Siapakah yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya?' membantah kaum musyrikin yang menyembah berhala sebagai perantara. Syafaat hanya milik Allah dan hanya diberikan kepada siapa yang Dia ridhai. 'Kursi-Nya meliputi langit dan bumi', Ibnu Abbas menafsirkan Kursi sebagai tempat kedua kaki (majaz kekuasaan), yang besarnya tak terbayangkan dibandingkan langit dan bumi." } },
};

// 2. TOPIC CATEGORIES (Structure)
const TOPIC_DATA: ThemeCategory[] = [
  {
    code: "A", title: "Akidah & Keimanan",
    items: [
      { id: 1, title: "Tauhid Rububiyah", ref: "Al-Baqarah: 21-22", verses: [{s:2, v:[21, 22]}] },
      { id: 2, title: "Tauhid Uluhiyah", ref: "Al-An'am: 162-163", verses: [{s:6, v:[162, 163]}] },
      { id: 3, title: "Tauhid Asma wa Sifat", ref: "Al-A'raf: 180", verses: [{s:7, v:[180]}] },
      { id: 4, title: "Tauhid dan fitrah manusia", ref: "Ar-Rum: 30", verses: [{s:30, v:[30]}] },
      { id: 5, title: "Larangan menyamakan Allah", ref: "Asy-Syura: 11", verses: [{s:42, v:[11]}] },
      { id: 6, title: "Iman kepada Allah", ref: "An-Nisa: 136", verses: [{s:4, v:[136]}] },
      { id: 7, title: "Iman kepada Malaikat", ref: "Al-Baqarah: 285", verses: [{s:2, v:[285]}] },
      { id: 8, title: "Tugas malaikat", ref: "At-Tahrim: 6", verses: [{s:66, v:[6]}] },
      { id: 9, title: "Iman kepada Kitab-kitab", ref: "Al-Baqarah: 4", verses: [{s:2, v:[4]}] },
      { id: 10, title: "Iman kepada Rasul", ref: "An-Nisa: 163", verses: [{s:4, v:[163]}] },
      { id: 11, title: "Kewajiban mengikuti Rasul", ref: "Al-Hasyr: 7", verses: [{s:59, v:[7]}] },
      { id: 12, title: "Iman kepada Hari Akhir", ref: "Al-Baqarah: 177", verses: [{s:2, v:[177]}] },
      { id: 13, title: "Keyakinan kebangkitan", ref: "Ya-Sin: 78", verses: [{s:36, v:[78]}] },
      { id: 14, title: "Iman kepada Qadha dan Qadar", ref: "Al-Qamar: 49", verses: [{s:54, v:[49]}] },
      { id: 15, title: "Takdir dan usaha manusia", ref: "Ar-Ra'd: 11", verses: [{s:13, v:[11]}] },
      { id: 16, title: "Kufur dan bentuknya", ref: "Al-Baqarah: 6", verses: [{s:2, v:[6]}] },
      { id: 17, title: "Macam-macam kufur nikmat", ref: "Ibrahim: 34", verses: [{s:14, v:[34]}] },
      { id: 18, title: "Syirik", ref: "An-Nisa: 48", verses: [{s:4, v:[48]}] },
      { id: 19, title: "Syirik sebagai kezaliman", ref: "Luqman: 13", verses: [{s:31, v:[13]}] },
      { id: 20, title: "Nifaq", ref: "Al-Baqarah: 8", verses: [{s:2, v:[8]}] },
      { id: 21, title: "Ciri-ciri orang munafik", ref: "At-Taubah: 67", verses: [{s:9, v:[67]}] },
    ]
  },
  {
    code: "B", title: "Al-Qur'an & Wahyu",
    items: [
      { id: 1, title: "Al-Qur'an sebagai petunjuk", ref: "Al-Baqarah: 2", verses: [{s:2, v:[2]}] },
      { id: 2, title: "Al-Qur'an sebagai cahaya", ref: "Al-Ma'idah: 15", verses: [{s:5, v:[15]}] },
      { id: 3, title: "Fungsi Al-Qur'an", ref: "Al-Isra: 9", verses: [{s:17, v:[9]}] },
      { id: 4, title: "Al-Qur'an sebagai pembeda", ref: "Al-Furqan: 1", verses: [{s:25, v:[1]}] },
      { id: 5, title: "Mukjizat Al-Qur'an", ref: "Al-Baqarah: 23", verses: [{s:2, v:[23]}] },
      { id: 6, title: "Tantangan menandingi Qur'an", ref: "Yunus: 38", verses: [{s:10, v:[38]}] },
      { id: 7, title: "Turunnya wahyu", ref: "Asy-Syura: 51", verses: [{s:42, v:[51]}] },
      { id: 8, title: "Proses bertahap wahyu", ref: "Al-Isra: 106", verses: [{s:17, v:[106]}] },
      { id: 9, title: "Larangan menyelewengkan", ref: "Al-Baqarah: 75", verses: [{s:2, v:[75]}] },
      { id: 10, title: "Larangan menyembunyikan", ref: "Al-Baqarah: 159", verses: [{s:2, v:[159]}] },
      { id: 11, title: "Keutamaan membaca Qur'an", ref: "Fatir: 29", verses: [{s:35, v:[29]}] },
      { id: 12, title: "Al-Qur'an mudah dipahami", ref: "Al-Qamar: 17", verses: [{s:54, v:[17]}] },
    ]
  },
  {
    code: "C", title: "Kenabian & Rasul",
    items: [
      { id: 1, title: "Hakikat kenabian", ref: "Al-Anbiya: 25", verses: [{s:21, v:[25]}] },
      { id: 2, title: "Kesamaan ajaran para nabi", ref: "Asy-Syura: 13", verses: [{s:42, v:[13]}] },
      { id: 3, title: "Tugas para rasul", ref: "An-Nahl: 36", verses: [{s:16, v:[36]}] },
      { id: 4, title: "Rasul pembawa kabar", ref: "Al-Baqarah: 213", verses: [{s:2, v:[213]}] },
      { id: 5, title: "Penolakan kaum", ref: "Al-A'raf: 59", verses: [{s:7, v:[59]}] },
      { id: 6, title: "Sunnatullah dalam dakwah", ref: "Al-Ahzab: 62", verses: [{s:33, v:[62]}] },
      { id: 7, title: "Mukjizat para nabi", ref: "Hud: 96", verses: [{s:11, v:[96]}] },
      { id: 8, title: "Mukjizat Musa", ref: "Al-A'raf: 107", verses: [{s:7, v:[107]}] },
      { id: 9, title: "Mukjizat Isa", ref: "Al-Ma'idah: 110", verses: [{s:5, v:[110]}] },
      { id: 10, title: "Rasul sebagai teladan", ref: "Al-Ahzab: 21", verses: [{s:33, v:[21]}] },
      { id: 11, title: "Penutup kenabian", ref: "Al-Ahzab: 40", verses: [{s:33, v:[40]}] },
    ]
  },
  {
    code: "D", title: "Ibadah",
    items: [
      { id: 1, title: "Tujuan ibadah", ref: "Adz-Dzariyat: 56", verses: [{s:51, v:[56]}] },
      { id: 2, title: "Ibadah jalan takwa", ref: "Al-Baqarah: 21", verses: [{s:2, v:[21]}] },
      { id: 3, title: "Shalat", ref: "Al-Baqarah: 43", verses: [{s:2, v:[43]}] },
      { id: 4, title: "Shalat mencegah mungkar", ref: "Al-Ankabut: 45", verses: [{s:29, v:[45]}] },
      { id: 5, title: "Zakat", ref: "At-Taubah: 103", verses: [{s:9, v:[103]}] },
      { id: 6, title: "Puasa", ref: "Al-Baqarah: 183", verses: [{s:2, v:[183]}] },
      { id: 7, title: "Puasa dan pengendalian", ref: "Al-Baqarah: 187", verses: [{s:2, v:[187]}] },
      { id: 8, title: "Haji", ref: "Al-Baqarah: 196", verses: [{s:2, v:[196]}] },
      { id: 9, title: "Hikmah haji", ref: "Al-Hajj: 28", verses: [{s:22, v:[28]}] },
      { id: 10, title: "Doa", ref: "Ghafir: 60", verses: [{s:40, v:[60]}] },
      { id: 11, title: "Adab berdoa", ref: "Al-A'raf: 55", verses: [{s:7, v:[55]}] },
      { id: 12, title: "Dzikir", ref: "Al-Ahzab: 41", verses: [{s:33, v:[41]}] },
      { id: 13, title: "Ketenteraman dzikir", ref: "Ar-Ra'd: 28", verses: [{s:13, v:[28]}] },
    ]
  },
  {
    code: "E", title: "Syariat & Hukum",
    items: [
      { id: 1, title: "Hukum halal dan haram", ref: "Al-Baqarah: 168", verses: [{s:2, v:[168]}] },
      { id: 2, title: "Prinsip kemudahan syariat", ref: "Al-Baqarah: 185", verses: [{s:2, v:[185]}] },
      { id: 3, title: "Muamalah", ref: "Al-Baqarah: 282", verses: [{s:2, v:[282]}] },
      { id: 4, title: "Amanah dalam muamalah", ref: "Al-Mu'minun: 8", verses: [{s:23, v:[8]}] },
      { id: 5, title: "Hukum pidana (hudud)", ref: "Al-Ma'idah: 38", verses: [{s:5, v:[38]}] },
      { id: 6, title: "Hukum qishash", ref: "Al-Baqarah: 178", verses: [{s:2, v:[178]}] },
      { id: 7, title: "Hukum waris", ref: "An-Nisa: 11", verses: [{s:4, v:[11]}] },
      { id: 8, title: "Nikah", ref: "An-Nisa: 3", verses: [{s:4, v:[3]}] },
      { id: 9, title: "Tujuan pernikahan", ref: "Ar-Rum: 21", verses: [{s:30, v:[21]}] },
      { id: 10, title: "Talak", ref: "Al-Baqarah: 229", verses: [{s:2, v:[229]}] },
      { id: 11, title: "Riba", ref: "Al-Baqarah: 275", verses: [{s:2, v:[275]}] },
      { id: 12, title: "Larangan harta batil", ref: "An-Nisa: 29", verses: [{s:4, v:[29]}] },
      { id: 13, title: "Keadilan hukum", ref: "An-Nisa: 58", verses: [{s:4, v:[58]}] },
    ]
  },
  {
    code: "F", title: "Akhlak & Moral",
    items: [
      { id: 1, title: "Akhlak kepada Allah", ref: "Al-An'am: 162", verses: [{s:6, v:[162]}] },
      { id: 2, title: "Ikhlas", ref: "Al-Bayyinah: 5", verses: [{s:98, v:[5]}] },
      { id: 3, title: "Akhlak kepada orang tua", ref: "Al-Isra: 23", verses: [{s:17, v:[23]}] },
      { id: 4, title: "Berbuat baik sesama", ref: "An-Nisa: 36", verses: [{s:4, v:[36]}] },
      { id: 5, title: "Kejujuran", ref: "At-Taubah: 119", verses: [{s:9, v:[119]}] },
      { id: 6, title: "Kesabaran", ref: "Al-Baqarah: 153", verses: [{s:2, v:[153]}] },
      { id: 7, title: "Syukur", ref: "Ibrahim: 7", verses: [{s:14, v:[7]}] },
      { id: 8, title: "Tawakal", ref: "Ali 'Imran: 159", verses: [{s:3, v:[159]}] },
      { id: 9, title: "Rendah hati", ref: "Al-Furqan: 63", verses: [{s:25, v:[63]}] },
      { id: 10, title: "Larangan sombong", ref: "Luqman: 18", verses: [{s:31, v:[18]}] },
      { id: 11, title: "Menahan amarah", ref: "Ali 'Imran: 134", verses: [{s:3, v:[134]}] },
      { id: 12, title: "Memaafkan", ref: "Asy-Syura: 40", verses: [{s:42, v:[40]}] },
    ]
  },
  {
    code: "G", title: "Sosial & Kemasyarakatan",
    items: [
      { id: 1, title: "Ukhuwah", ref: "Al-Hujurat: 10", verses: [{s:49, v:[10]}] },
      { id: 2, title: "Persatuan umat", ref: "Ali 'Imran: 103", verses: [{s:3, v:[103]}] },
      { id: 3, title: "Keadilan sosial", ref: "An-Nahl: 90", verses: [{s:16, v:[90]}] },
      { id: 4, title: "Menolong sesama", ref: "Al-Ma'idah: 2", verses: [{s:5, v:[2]}] },
      { id: 5, title: "Hak fakir miskin", ref: "Adz-Dzariyat: 19", verses: [{s:51, v:[19]}] },
      { id: 6, title: "Larangan ghibah", ref: "Al-Hujurat: 12", verses: [{s:49, v:[12]}] },
      { id: 7, title: "Larangan merendahkan", ref: "Al-Hujurat: 11", verses: [{s:49, v:[11]}] },
      { id: 8, title: "Etika komunikasi", ref: "Al-Hujurat: 6", verses: [{s:49, v:[6]}] },
      { id: 9, title: "Adab bertetangga", ref: "An-Nisa: 36", verses: [{s:4, v:[36]}] },
    ]
  },
  {
    code: "H", title: "Ekonomi & Harta",
    items: [
      { id: 1, title: "Harta sebagai ujian", ref: "Al-Anfal: 28", verses: [{s:8, v:[28]}] },
      { id: 2, title: "Harta titipan Allah", ref: "Al-Hadid: 7", verses: [{s:57, v:[7]}] },
      { id: 3, title: "Infak dan sedekah", ref: "Al-Baqarah: 261", verses: [{s:2, v:[261]}] },
      { id: 4, title: "Keutamaan memberi", ref: "Al-Lail: 18", verses: [{s:92, v:[18]}] },
      { id: 5, title: "Larangan kikir", ref: "Al-Isra: 29", verses: [{s:17, v:[29]}] },
      { id: 6, title: "Larangan boros", ref: "Al-Isra: 26", verses: [{s:17, v:[26]}] },
      { id: 7, title: "Keseimbangan dunia-akhirat", ref: "Al-Qasas: 77", verses: [{s:28, v:[77]}] },
      { id: 8, title: "Perdagangan yang jujur", ref: "Al-Muthaffifin: 1", verses: [{s:83, v:[1]}] },
    ]
  },
  {
    code: "I", title: "Politik & Jihad",
    items: [
      { id: 1, title: "Kepemimpinan", ref: "Al-Baqarah: 124", verses: [{s:2, v:[124]}] },
      { id: 2, title: "Pemimpin sebagai amanah", ref: "Al-Ahzab: 72", verses: [{s:33, v:[72]}] },
      { id: 3, title: "Ketaatan kepada pemimpin", ref: "An-Nisa: 59", verses: [{s:4, v:[59]}] },
      { id: 4, title: "Musyawarah", ref: "Asy-Syura: 38", verses: [{s:42, v:[38]}] },
      { id: 5, title: "Jihad", ref: "Al-Baqarah: 190", verses: [{s:2, v:[190]}] },
      { id: 6, title: "Etika perang", ref: "Al-Baqarah: 190", verses: [{s:2, v:[190]}] },
      { id: 7, title: "Perdamaian", ref: "Al-Anfal: 61", verses: [{s:8, v:[61]}] },
      { id: 8, title: "Larangan melampaui batas", ref: "Al-Ma'idah: 87", verses: [{s:5, v:[87]}] },
    ]
  },
  {
    code: "J", title: "Sejarah & Kisah",
    items: [
      { id: 1, title: "Penciptaan Adam", ref: "Al-Baqarah: 30", verses: [{s:2, v:[30]}] },
      { id: 2, title: "Kisah Nuh", ref: "Hud: 25-42", verses: [{s:11, v:[25, 42]}] },
      { id: 3, title: "Kisah Ibrahim", ref: "Al-Baqarah: 124", verses: [{s:2, v:[124]}] },
      { id: 4, title: "Kisah Musa", ref: "Al-Qasas: 3, 30", verses: [{s:28, v:[3, 30]}] },
      { id: 5, title: "Kisah Yusuf", ref: "Yusuf: 4", verses: [{s:12, v:[4]}] },
      { id: 6, title: "Bani Israil", ref: "Al-Baqarah: 40", verses: [{s:2, v:[40]}] },
      { id: 7, title: "Ashabul Kahfi", ref: "Al-Kahfi: 13", verses: [{s:18, v:[13]}] },
      { id: 8, title: "Kehancuran umat durhaka", ref: "Al-Hijr: 73", verses: [{s:15, v:[73]}] },
    ]
  },
  {
    code: "K", title: "Akhirat & Gaib",
    items: [
      { id: 1, title: "Kematian", ref: "Ali 'Imran: 185", verses: [{s:3, v:[185]}] },
      { id: 2, title: "Sakaratul maut", ref: "Qaf: 19", verses: [{s:50, v:[19]}] },
      { id: 3, title: "Alam barzakh", ref: "Al-Mu'minun: 99", verses: [{s:23, v:[99]}] },
      { id: 4, title: "Hari kiamat", ref: "Al-Hajj: 1", verses: [{s:22, v:[1]}] },
      { id: 5, title: "Tanda-tanda kiamat", ref: "Muhammad: 18", verses: [{s:47, v:[18]}] },
      { id: 6, title: "Hisab dan mizan", ref: "Al-A'raf: 8", verses: [{s:7, v:[8]}] },
      { id: 7, title: "Catatan amal", ref: "Al-Isra: 13", verses: [{s:17, v:[13]}] },
      { id: 8, title: "Surga", ref: "Muhammad: 15", verses: [{s:47, v:[15]}] },
      { id: 9, title: "Neraka", ref: "An-Nisa: 56", verses: [{s:4, v:[56]}] },
      { id: 10, title: "Syafaat", ref: "Al-Baqarah: 255", verses: [{s:2, v:[255]}] },
    ]
  }
];

// --- COMPONENTS ---

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-emerald-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-[120px] pointer-events-none animate-breathing"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-breathing" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 text-center space-y-8 md:space-y-12 p-6 max-w-lg w-full animate-fade-in-up">
        <div className="relative inline-block group cursor-default">
             <div className="absolute inset-0 bg-emerald-500 blur-[60px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-700"></div>
             <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-900/50 transform group-hover:scale-105 transition-all duration-500 rotate-3 group-hover:rotate-0">
                <Book className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
             </div>
        </div>

        <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-serif text-white tracking-tight drop-shadow-lg">Tafsir Finder</h1>
        </div>
        
        <p className="text-emerald-100/70 font-sans font-light leading-relaxed text-sm md:text-base px-4">
          Tafsir Maudhu'i berdasarkan Intisari Tafsir Ibnu Katsir.
          <br/>
          <span className="text-emerald-500/50 text-xs mt-2 block">(Offline Database)</span>
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-10 py-4 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-100 font-sans text-sm tracking-wider transition-all duration-500 rounded-full overflow-hidden hover:scale-105 active:scale-95 shadow-xl shadow-emerald-950/20"
        >
           <span className="relative z-10 group-hover:text-white transition-colors font-semibold">MULAI STUDI</span>
           <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/0 via-emerald-600/10 to-emerald-800/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      </div>
    </div>
  );
};

const CategorySelection = ({ onSelectCategory, onBack }: { onSelectCategory: (cat: ThemeCategory) => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 shadow-lg shadow-black/5 flex items-center gap-4 pt-safe-top">
         <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-emerald-900/20 text-emerald-400/60 hover:text-emerald-400 transition-colors active:scale-90">
            <ChevronLeft className="w-6 h-6" />
         </button>
         <p className="text-emerald-100/80 font-serif text-lg">Jelajahi Tema</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPIC_DATA.map((cat, idx) => (
          <div 
            key={cat.code}
            onClick={() => onSelectCategory(cat)}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-emerald-900/60 transition-all group border-l-4 border-l-emerald-500/50 hover:border-l-emerald-400 flex flex-col justify-center min-h-[120px] active:scale-[0.98]"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-2">
               <div className="w-8 h-8 rounded-full bg-emerald-950/50 flex items-center justify-center text-emerald-400 mb-2">
                <Grid className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-medium text-emerald-100 mb-1 group-hover:text-white">{cat.title}</h3>
            <p className="text-xs text-emerald-500/60">{cat.items.length} Tema Bahasan</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ThemeListSelection = ({ category, onSelectTheme, onBack }: { category: ThemeCategory, onSelectTheme: (theme: ThemeItem) => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
       <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-6 shadow-lg shadow-black/5 flex items-center gap-4 pt-safe-top">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-emerald-900/20 text-emerald-400/60 hover:text-emerald-400 active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <span className="text-xs font-bold text-emerald-500/50 uppercase tracking-widest">Kategori {category.code}</span>
            <h2 className="text-xl md:text-2xl font-serif text-white">{category.title}</h2>
          </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-3">
        {category.items.map((theme, idx) => (
          <div 
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className="glass-card p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:translate-x-1 transition-all active:scale-[0.98]"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
             <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400/80 font-serif font-bold text-sm shrink-0 border border-emerald-500/10">
               {theme.id}
             </div>
             <div className="flex-1">
               <h3 className="text-emerald-100 font-medium text-sm md:text-base">{theme.title}</h3>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-500/70 border border-emerald-900">{theme.ref}</span>
               </div>
             </div>
             <ArrowRight className="w-4 h-4 text-emerald-700 opacity-50" />
          </div>
        ))}
      </div>
    </div>
  )
}

const ReadingScreen = ({ theme, onBack }: { theme: ThemeItem, onBack: () => void }) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [textSize, setTextSize] = useState(1); 
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadedVerses: Verse[] = [];
    theme.verses.forEach(ref => {
      ref.v.forEach(vNum => {
        const key = `${ref.s}_${vNum}`;
        if (VERSE_LIBRARY[key]) {
          loadedVerses.push(VERSE_LIBRARY[key]);
        } else {
          // Fallback if specific verse key missing in demo
          loadedVerses.push({
            surah: ref.s,
            number: vNum,
            text: { arab: "..." }, 
            translation: { id: "Ayat ini merupakan bagian dari rangkaian kisah yang panjang." },
            tafsir: { maudhui: "Silakan merujuk pada ayat kunci dalam tema ini." }
          });
        }
      });
    });
    setVerses(loadedVerses);
  }, [theme]);

  if (verses.length === 0) return <div className="min-h-screen bg-background flex items-center justify-center text-emerald-500">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-background text-emerald-50 pb-20 font-sans pt-safe-top">
      <div className="glass-panel sticky top-0 z-30 px-4 md:px-6 py-4 flex items-center justify-between pt-safe-top">
        <button onClick={onBack} className="text-emerald-400/60 hover:text-white transition-colors p-2 rounded-full hover:bg-emerald-900/20 active:scale-90">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center max-w-[60%]">
            <span className="text-[10px] text-emerald-500 tracking-[0.2em] uppercase font-bold truncate">Tafsir Tematik</span>
            <h2 className="font-serif text-white text-sm md:text-base mt-0.5 truncate text-center">{theme.title}</h2>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-emerald-400/60 hover:text-white p-2 rounded-full hover:bg-emerald-900/20 active:scale-90">
            <Type className="w-5 h-5" />
        </button>
      </div>

       {showSettings && (
        <div className="fixed top-24 right-4 z-40 bg-emerald-950/95 border border-emerald-500/20 p-6 rounded-2xl shadow-2xl w-72 animate-fade-in-up backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
                 <h4 className="text-xs uppercase text-emerald-500 tracking-wider font-bold">Tampilan Bacaan</h4>
                 <button onClick={() => setShowSettings(false)} className="text-emerald-700 hover:text-white text-xs">Tutup</button>
            </div>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-200/80">Ukuran Teks</span>
                    <div className="flex gap-2 bg-emerald-900/40 p-1 rounded-lg">
                        <button onClick={() => setTextSize(0.8)} className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${textSize === 0.8 ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-500/50 hover:bg-emerald-800/50'}`}>A-</button>
                        <button onClick={() => setTextSize(1)} className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${textSize === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-500/50 hover:bg-emerald-800/50'}`}>A</button>
                        <button onClick={() => setTextSize(1.2)} className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${textSize === 1.2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-500/50 hover:bg-emerald-800/50'}`}>A+</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-12">
        {verses.map((verse, idx) => (
          <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
             <div className="flex justify-center mb-6">
               <span className="text-[10px] uppercase tracking-widest bg-emerald-900/40 px-3 py-1 rounded-full text-emerald-400/70 border border-emerald-500/10">
                  QS. {verse.surah} : {verse.number}
               </span>
             </div>

             <div 
                className="text-center font-arabic leading-[2.2] text-white drop-shadow-md select-text mb-6" 
                style={{ fontSize: `${2.4 * textSize}rem` }}
                dir="rtl"
            >
                {verse.text.arab}
            </div>

            <div className="text-center relative px-4 md:px-8 mb-8">
                 <p 
                    className="text-emerald-100/80 italic font-light leading-relaxed"
                    style={{ fontSize: `${1 * textSize}rem` }}
                 >
                    "{verse.translation.id}"
                 </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 rounded-2xl border border-emerald-500/20 overflow-hidden relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
               <div className="p-6 md:p-8">
                 <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                   <BookOpen className="w-4 h-4" /> Intisari Tafsir Ibnu Katsir
                 </h4>
                 <div className="prose prose-invert prose-emerald max-w-none">
                    <p 
                        className="text-emerald-50/90 text-sm md:text-base leading-loose text-justify font-sans whitespace-pre-wrap"
                        style={{ fontSize: `${1 * textSize}rem` }}
                    >
                    {verse.tafsir.maudhui}
                    </p>
                 </div>
               </div>
            </div>

            {idx < verses.length - 1 && (
               <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto mt-12"></div>
            )}
          </div>
        ))}
        
        <div className="text-center pt-10 pb-20">
           <p className="text-emerald-600/40 text-xs italic">Akhir dari bahasan tema ini.</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [screen, setScreen] = useState<'welcome' | 'categories' | 'themelist' | 'reading'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleStart = () => setScreen('categories');

  const handleSelectCategory = (cat: ThemeCategory) => {
    setSelectedCategory(cat);
    setScreen('themelist');
  };

  const handleSelectTheme = (theme: ThemeItem) => {
    setSelectedTheme(theme);
    setScreen('reading');
  }

  const handleBackToWelcome = () => {
    setScreen('welcome');
  }

  const handleBackToCategories = () => {
    setScreen('categories');
    setSelectedCategory(null);
  }

  const handleBackToThemeList = () => {
    setScreen('themelist');
    setSelectedTheme(null);
  }

  return (
    <div className="font-sans antialiased text-slate-200 bg-background min-h-screen selection:bg-emerald-500/30 selection:text-emerald-100">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'categories' && <CategorySelection onSelectCategory={handleSelectCategory} onBack={handleBackToWelcome} />}
      {screen === 'themelist' && selectedCategory && <ThemeListSelection category={selectedCategory} onSelectTheme={handleSelectTheme} onBack={handleBackToCategories} />}
      {screen === 'reading' && selectedTheme && <ReadingScreen theme={selectedTheme} onBack={handleBackToThemeList} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);