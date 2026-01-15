import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, Type, BookOpen, Book, ArrowRight, Grid, Search, X, FileText, Sparkles, Star, Heart, Share2 } from 'lucide-react';

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
  "112_1": { surah: 112, number: 1, text: { arab: "قُلْ هُوَ ٱللَّهُ أَحَدٌ" }, translation: { id: "Katakanlah: Dialah Allah, Yang Maha Esa." }, tafsir: { maudhui: "Surah Al-Ikhlas adalah sepertiga Al-Qur'an. Ayat ini menetapkan keesaan Allah yang mutlak (Ahad). Dia tidak berbilang, tidak tersusun dari bagian-bagian, dan tidak ada yang setara dengan-Nya. Ibnu Katsir menjelaskan bahwa ini membantah semua bentuk politeisme dan trinitas." } },
  "112_2": { surah: 112, number: 2, text: { arab: "ٱللَّهُ ٱلصَّمَدُ" }, translation: { id: "Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu." }, tafsir: { maudhui: "As-Samad bermakna Dzat yang Maha Sempurna dalam kekuasaan-Nya, yang kepada-Nya seluruh makhluk bergantung untuk memenuhi kebutuhan mereka, sementara Dia tidak butuh kepada siapapun." } },
  "112_3": { surah: 112, number: 3, text: { arab: "لَمْ يَلِدْ وَلَمْ يُولَدْ" }, translation: { id: "Dia tiada beranak dan tidak pula diperanakkan," }, tafsir: { maudhui: "Menafikan konsep anak dan orang tua bagi Allah. Allah adalah Al-Awwal (Terdahulu tanpa permulaan) dan Al-Akhir (Terakhir tanpa kesudahan). Ini membantah keyakinan orang musyrik Arab (Malaikat anak Allah), Yahudi (Uzair anak Allah), dan Nasrani (Isa anak Allah)." } },
  "112_4": { surah: 112, number: 4, text: { arab: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ" }, translation: { id: "Dan tidak ada seorangpun yang setara dengan Dia." }, tafsir: { maudhui: "Tidak ada yang setara (Kufu) dengan Allah dalam Dzat, Sifat, maupun Perbuatan-Nya. Dia Maha Suci dari segala kemiripan dengan makhluk." } },
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
  "49_13": { surah: 49, number: 13, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَـٰكُم مِّن ذَكَرٍۢ وَأُنثَىٰ وَجَعَلْنَـٰكُمْ شُعُوبًا وَقَبَآئِلَ لِتَعَارَفُوٓا۟ ۚ إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ" }, translation: { id: "Hai manusia, sesungguhnya Kami menciptakan kamu dari seorang laki-laki dan seorang perempuan dan menjadikan kamu berbangsa-bangsa dan bersuku-suku supaya kamu saling kenal-mengenal. Sesungguhnya orang yang paling mulia diantara kamu disisi Allah ialah orang yang paling takwa diantara kamu." }, tafsir: { maudhui: "Ayat ini adalah prinsip dasar kesetaraan dan keragaman dalam Islam. Allah menegaskan bahwa perbedaan suku, bangsa, dan ras adalah 'Sunnatullah' yang bertujuan untuk 'Ta'aruf' (saling mengenal dan bersinergi), bukan untuk saling membanggakan diri atau bermusuhan. Ibnu Katsir menekankan bahwa standar kemuliaan di sisi Allah bukanlah keturunan (nasab) atau warna kulit, melainkan ketakwaan. Ini meruntuhkan segala bentuk rasisme dan fanatisme golongan." } },
  "65_2": { surah: 65, number: 2, text: { arab: "...وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا" }, translation: { id: "...Barangsiapa bertakwa kepada Allah niscaya Dia akan mengadakan baginya jalan keluar." }, tafsir: { maudhui: "Bagian awal dari 'Ayat Seribu Dinar'. Ibnu Katsir menjelaskan bahwa janji Allah ini pasti: siapa yang bertakwa dalam segala urusannya (menjaga perintah, menjauhi larangan), Allah akan memberikan solusi (Makhraja) dari segala kesempitan dan masalah hidup yang menghimpitnya, baik masalah duniawi maupun ukhrawi." } },
  "65_3": { surah: 65, number: 3, text: { arab: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ" }, translation: { id: "Dan memberinya rezeki dari arah yang tiada disangka-sangkanya. Dan barangsiapa yang bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya." }, tafsir: { maudhui: "Lanjutan ayat sebelumnya, menekankan dua poin: 1) Rezeki tak terduga bagi orang bertakwa, dari jalan yang tidak pernah terlintas di benaknya. 2) Jaminan kecukupan bagi orang yang tawakal. Ibnu Katsir menjelaskan tawakal bukan berarti pasrah tanpa usaha, tapi menyandarkan hati sepenuhnya kepada Allah setelah berikhtiar. 'Hasbuhu' artinya Allah sendiri yang akan menjadi penjamin dan pelindungnya." } },
  "2_155": { surah: 2, number: 155, text: { arab: "وَلَنَبْلُوَنَّكُم بِشَىْءٍۢ مِّنَ ٱلْخَوْفِ وَٱلْجُوعِ وَنَقْصٍۢ مِّنَ ٱلْأَمْوَٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَٰتِ ۗ وَبَشِّرِ ٱلصَّـٰبِرِينَ" }, translation: { id: "Dan sungguh akan Kami berikan cobaan kepadamu, dengan sedikit ketakutan, kelaparan, kekurangan harta, jiwa dan buah-buahan. Dan berikanlah berita gembira kepada orang-orang yang sabar." }, tafsir: { maudhui: "Allah bersumpah (Lam Taukid & Nun Taukid) bahwa ujian adalah kepastian bagi orang beriman. Ujian itu beragam: fisik, ekonomi, dan psikis. Ibnu Katsir menjelaskan bahwa ujian ini untuk menyaring siapa yang jujur imannya. Kuncinya adalah 'Shabar'. Kabar gembira (surga dan rahmat) hanya bagi mereka yang sabar menghadapi ketetapan Allah." } },
  "2_156": { surah: 2, number: 156, text: { arab: "ٱلَّذِينَ إِذَآ أَصَـٰبَتْهُم مُّصِيبَةٌۭ قَالُوٓا۟ إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ" }, translation: { id: "(yaitu) orang-orang yang apabila ditimpa musibah, mereka mengucapkan: 'Inna lillaahi wa innaa ilaihi raaji'uun'." }, tafsir: { maudhui: "Ini adalah kalimat 'Istirja', senjata orang mukmin saat musibah. Maknanya: Pengakuan bahwa kita milik Allah (sehingga Dia berhak mengambil apa saja milik-Nya) dan pengakuan akan kembalinya kita kepada-Nya (di akhirat nanti segala derita akan berakhir). Ibnu Katsir menyebutkan hadits bahwa siapa yang mengucapkan ini saat musibah, Allah akan memberinya pahala dan mengganti yang hilang dengan yang lebih baik." } },

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

  // --- E. SYARIAT & HUKUM ---
  "2_168": { surah: 2, number: 168, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِى ٱلْأَرْضِ حَلَـٰلًا طَيِّبًا وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَـٰنِ" }, translation: { id: "Hai sekalian manusia, makanlah yang halal lagi baik dari apa yang terdapat di bumi, dan janganlah kamu mengikuti langkah-langkah syaitan." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan bahwa Allah membolehkan hamba-Nya memakan segala rezeki di bumi asalkan memenuhi dua syarat: Halal (secara zat dan cara perolehannya) dan Thayyib (baik, sehat, dan tidak menjijikkan). Allah melarang mengikuti langkah setan yang sering mengharamkan apa yang dihalalkan Allah (seperti tradisi jahiliyah) atau menghalalkan apa yang diharamkan-Nya. Makanan haram adalah salah satu pintu masuk setan untuk merusak hati dan tubuh manusia." } },
  "2_185": { surah: 2, number: 185, text: { arab: "شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ... يُرِيدُ ٱللَّهُ بِكُمُ ٱلْيُسْرَ وَلَا يُرِيدُ بِكُمُ ٱلْعُسْرَ" }, translation: { id: "Bulan Ramadan, bulan yang di dalamnya diturunkan (permulaan) Al-Qur'an... Allah menghendaki kemudahan bagimu, dan tidak menghendaki kesukaran bagimu." }, tafsir: { maudhui: "Ayat ini mengistimewakan Ramadhan sebagai bulan turunnya Al-Qur'an. Karena kemuliaan inilah puasa diwajibkan di bulan ini. Namun, Ibnu Katsir menyoroti prinsip 'Yusr' (Kemudahan) dalam syariat Islam. Orang sakit atau musafir boleh tidak berpuasa dan menggantinya di hari lain. Islam bukan agama penyiksaan diri; setiap beban (taklif) disesuaikan dengan kemampuan hamba. Tujuannya adalah agar manusia bersyukur atas petunjuk-Nya." } },
  "2_282": { surah: 2, number: 282, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰٓ أَجَلٍۢ مُّسَمًّى فَٱكْتُبُوهُ" }, translation: { id: "Hai orang-orang yang beriman, apabila kamu bermu'amalah tidak secara tunai untuk waktu yang ditentukan, hendaklah kamu menuliskannya." }, tafsir: { maudhui: "Ini adalah ayat terpanjang dalam Al-Qur'an, dikenal sebagai 'Ayat Mudayanah' (Utang Piutang). Ibnu Katsir menjelaskan bahwa ayat ini adalah pedoman administrasi keuangan yang sangat detail. Allah memerintahkan pencatatan (pembukuan) transaksi utang piutang untuk menjaga hak (Hifz al-Mal) dan menghindari sengketa di kemudian hari. Ayat ini juga mengatur tentang saksi, keadilan penulis (notaris), dan perlindungan bagi pihak yang lemah akalnya. Ini menunjukkan bahwa Islam mengatur urusan ekonomi sedetail urusan ibadah." } },
  "23_8": { surah: 23, number: 8, text: { arab: "وَٱلَّذِينَ هُمْ لِأَمَـٰنَـٰتِهِمْ وَعَهْدِهِمْ رَٰعُونَ" }, translation: { id: "Dan orang-orang yang memelihara amanat-amanat (yang dipikulnya) dan janjinya." }, tafsir: { maudhui: "Sifat orang mukmin yang beruntung (Al-Muflihun) adalah menjaga Amanah dan Janji. Amanah mencakup hak Allah (ibadah) dan hak manusia (titipan barang, rahasia, jabatan). Ibnu Katsir mengutip hadits: 'Tidak ada iman bagi orang yang tidak memiliki amanah, dan tidak ada agama bagi orang yang tidak memegang janji.' Pengkhianatan terhadap amanah adalah ciri munafik." } },
  "5_38": { surah: 5, number: 38, text: { arab: "وَٱلسَّارِقُ وَٱلسَّارِقَةُ فَٱقْطَعُوٓا۟ أَيْدِيَهُمَا جَزَآءًۢ بِمَا كَسَبَا نَكَـٰلًا مِّنَ ٱللَّهِ" }, translation: { id: "Laki-laki yang mencuri dan perempuan yang mencuri, potonglah tangan keduanya (sebagai) pembalasan bagi apa yang mereka kerjakan..." }, tafsir: { maudhui: "Ini adalah hukum Hudud bagi pencurian. Ibnu Katsir menjelaskan bahwa hukuman potong tangan ditetapkan untuk menjaga harta masyarakat (Hifz al-Mal). Hukuman ini berlaku dengan syarat-syarat ketat (mencapai nishab, barang tersimpan rapi, tidak ada syubhat/kelaparan darurat). Tujuannya adalah 'Nakal' (hukuman yang menjerakan) agar orang lain takut berbuat serupa, sehingga tercipta keamanan sosial." } },
  "2_178": { surah: 2, number: 178, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلْقِصَاصُ فِى ٱلْقَتْلَى" }, translation: { id: "Hai orang-orang yang beriman, diwajibkan atas kamu qishaash berkenaan dengan orang-orang yang dibunuh..." }, tafsir: { maudhui: "Qishash (pembalasan setimpal) adalah keadilan tertinggi dalam kasus pembunuhan: nyawa dibayar nyawa. Namun, Ibnu Katsir menjelaskan indahnya syariat ini: Allah membuka pintu maaf. Jika keluarga korban memaafkan, maka hukuman beralih ke Diyat (tebusan darah). Ayat ini menghapus tradisi jahiliyah yang sering melampaui batas dalam balas dendam (satu orang dibunuh, satu suku dibalas). Qishash menjamin kesetaraan jiwa manusia." } },
  "4_11": { surah: 4, number: 11, text: { arab: "يُوصِيكُمُ ٱللَّهُ فِىٓ أَوْلَـٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ" }, translation: { id: "Allah mensyari'atkan bagimu tentang (pembagian pusaka untuk) anak-anakmu. Yaitu: bahagian seorang anak lelaki sama dengan bagahian dua orang anak perempuan..." }, tafsir: { maudhui: "Ayat ini adalah pondasi hukum waris Islam (Faraidh). Ibnu Katsir menjelaskan bahwa pembagian ini adalah ketetapan Allah yang Maha Mengetahui kemaslahatan hamba-Nya (Al-Alim Al-Hakim). Laki-laki mendapat dua bagian karena tanggung jawab nafkah ada di pundaknya, sedangkan wanita menerima bersih tanpa kewajiban menafkahi. Hukum waris ini menghapus tradisi jahiliyah yang tidak mewariskan harta kepada wanita dan anak-anak." } },
  "4_3": { surah: 4, number: 3, text: { arab: "وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا۟ فِى ٱلْيَتَـٰمَىٰ فَٱنكِحُوا۟ مَا طَابَ لَكُم مِّنَ ٱلنِّسَآءِ مَثْنَىٰ وَثُلَـٰثَ وَرُبَـٰعَ" }, translation: { id: "...maka kawinilah wanita-wanita (lain) yang kamu senangi: dua, tiga atau empat. Kemudian jika kamu takut tidak akan dapat berlaku adil, maka (kawinilah) seorang saja..." }, tafsir: { maudhui: "Ayat ini membatasi poligami maksimal empat, yang sebelumnya tidak terbatas di masa jahiliyah. Namun, Ibnu Katsir menekankan syarat beratnya: 'Keadilan'. Jika takut tidak bisa adil dalam nafkah dan giliran, maka 'Fawahidah' (cukup satu saja). Ini adalah jalan keselamatan (Adna alla ta'ulu) agar tidak berbuat zalim. Poligami adalah solusi sosial (untuk janda/yatim), bukan sekadar pemuas nafsu." } },
  "30_21": { surah: 30, number: 21, text: { arab: "وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً" }, translation: { id: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya..." }, tafsir: { maudhui: "Tujuan pernikahan dalam Islam adalah 'Sakinah' (ketenangan jiwa), 'Mawaddah' (cinta kasih/romantisme), dan 'Rahmah' (kasih sayang/kepedulian). Ibnu Katsir menjelaskan bahwa pasangan hidup diciptakan dari jenis manusia (bukan jin/hewan) agar terjadi kesesuaian dan keharmonisan yang sempurna. Hubungan suami istri adalah tanda (Ayat) kebesaran Allah yang menyatukan dua hati yang sebelumnya asing." } },
  "2_229": { surah: 2, number: 229, text: { arab: "ٱلطَّلَـٰقُ مَرَّتَانِ ۖ فَإِمْسَاكٌۢ بِمَعْرُوفٍ أَوْ تَسْرِيحٌۢ بِإِحْسَـٰنٍ" }, translation: { id: "Talak (yang dapat dirujuki) dua kali. Setelah itu boleh rujuk lagi dengan cara yang ma'ruf atau menceraikan dengan cara yang baik." }, tafsir: { maudhui: "Islam tidak menutup pintu perceraian jika rumah tangga sudah tidak bisa dipertahankan, namun mengaturnya dengan bijak. Talak Raj'i dibatasi dua kali, memberikan kesempatan untuk berpikir ulang dan rujuk. Jika sudah tiga kali, tidak bisa rujuk lagi (kecuali istri menikah dengan orang lain). Prinsip utamanya adalah 'Imsek bim'aruf' (pertahankan dengan baik) atau 'Tasrih bi ihsan' (lepaskan dengan baik), tanpa saling menyakiti atau mendzalimi hak masing-masing." } },
  "2_275": { surah: 2, number: 275, text: { arab: "ٱلَّذِينَ يَأْكُلُونَ ٱلرِّبَوٰا۟ لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ ٱلَّذِى يَتَخَبَّطُهُ ٱلشَّيْطَـٰنُ مِنَ ٱلْمَسِّ" }, translation: { id: "Orang-orang yang makan (mengambil) riba tidak dapat berdiri melainkan seperti berdirinya orang yang kemasukan syaitan lantaran (tekanan) penyakit gila." }, tafsir: { maudhui: "Ancaman terberat bagi pelaku Riba. Ibnu Katsir menggambarkan keadaan mereka di akhirat bangkit dari kubur seperti orang gila yang kerasukan setan, sempoyongan karena perut mereka penuh dengan harta haram. Allah menegaskan 'Allah menghalalkan jual beli dan mengharamkan riba'. Riba adalah penindasan ekonomi yang menghancurkan persaudaraan, sedangkan jual beli adalah pertukaran yang adil." } },
  "4_29": { surah: 4, number: 29, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰطِلِ" }, translation: { id: "Hai orang-orang yang beriman, janganlah kamu saling memakan harta sesamamu dengan jalan yang batil..." }, tafsir: { maudhui: "Larangan umum terhadap segala bentuk transaksi haram (Batil), seperti judi, penipuan (Gharar), sumpah palsu, dan korupsi. Harta harus berputar melalui 'Tijaratan 'an taradhin' (perniagaan yang didasari suka sama suka) yang sah menurut syariat. Memakan harta orang lain secara batil adalah sebab kehancuran tatanan sosial dan mengundang azab Allah." } },
  "4_58": { surah: 4, number: 58, text: { arab: "إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا۟ ٱلْأَمَـٰنَـٰتِ إِلَىٰٓ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ ٱلنَّاسِ أَن تَحْكُمُوا۟ بِٱلْعَدْلِ" }, translation: { id: "Sesungguhnya Allah menyuruh kamu menyampaikan amanat kepada yang berhak menerimanya, dan (menyuruh kamu) apabila menetapkan hukum di antara manusia supaya kamu menetapkan dengan adil." }, tafsir: { maudhui: "Ayat ini adalah landasan etika bagi pejabat publik dan hakim. Kewajiban utama pemimpin adalah: 1) Menunaikan amanah (jabatan/harta negara) kepada rakyat, dan 2) Menegakkan hukum dengan adil tanpa pandang bulu. Ibnu Katsir menjelaskan bahwa keadilan adalah tiang penopang langit dan bumi, dan pemimpin yang adil akan dinaungi Allah di hari kiamat." } },

  // --- F. AKHLAK & MORAL ---
  "98_5": { surah: 98, number: 5, text: { arab: "وَمَآ أُمِرُوٓا۟ إِلَّا لِيَعْبُدُوا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ" }, translation: { id: "Padahal mereka tidak disuruh kecuali supaya menyembah Allah dengan memurnikan ketaatan kepada-Nya (ikhlas) dalam (menjalankan) agama yang lurus..." }, tafsir: { maudhui: "Ikhlas adalah syarat diterimanya amal. Ibnu Katsir menjelaskan bahwa ibadah tidak akan sah tanpa Tauhid dan Niat yang murni hanya untuk Allah, bersih dari Riya (ingin dipuji) dan Syirik. Agama yang lurus (Hanif) adalah agama yang menyimpang dari segala kesesatan menuju Tauhid." } },
  "17_23": { surah: 17, number: 23, text: { arab: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا" }, translation: { id: "Dan Tuhanmu telah memerintahkan supaya kamu jangan menyembah selain Dia dan hendaklah kamu berbuat baik pada ibu bapakmu dengan sebaik-baiknya." }, tafsir: { maudhui: "Allah mensejajarkan perintah berbakti kepada orang tua (Birrul Walidain) langsung setelah perintah Tauhid. Ini menunjukkan tingginya kedudukan orang tua. Ibnu Katsir menekankan larangan berkata 'Ah' (kata penolakan paling ringan) kepada mereka, apalagi membentak. Kita wajib bertutur kata mulia (Qaulan Karima) dan merendahkan diri dengan penuh kasih sayang di hadapan mereka." } },
  "4_36": { surah: 4, number: 36, text: { arab: "وَٱعْبُدُوا۟ ٱللَّهَ وَلَا تُشْرِكُوا۟ بِهِۦ شَيْـًٔا ۖ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا..." }, translation: { id: "Sembahlah Allah dan janganlah kamu mempersekutukan-Nya dengan sesuatupun. Dan berbuat baiklah kepada dua orang ibu-bapa, karib-kerabat..." }, tafsir: { maudhui: "Ayat ini disebut 'Ayat Sepuluh Hak' (Al-Huquq Al-'Asyrah). Setelah hak Allah (Tauhid), Allah merinci hak-hak sosial: orang tua, kerabat, anak yatim, orang miskin, tetangga dekat, tetangga jauh, teman sejawat, ibnu sabil, dan hamba sahaya. Ini adalah cetak biru etika sosial Islam yang menyantuni semua lapisan masyarakat." } },
  "9_119": { surah: 9, number: 119, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَكُونُوا۟ مَعَ ٱلصَّـٰدِقِينَ" }, translation: { id: "Hai orang-orang yang beriman bertakwalah kepada Allah, dan hendaklah kamu bersama orang-orang yang benar (jujur)." }, tafsir: { maudhui: "Perintah untuk berlaku jujur (Shidq) dan bergabung bersama komunitas orang-orang jujur. Ibnu Katsir menjelaskan bahwa kejujuran menyelamatkan (Ash-Shidqu Yunji) meski tampaknya berbahaya, sedangkan dusta membinasakan. Jujur adalah sifat dasar para Nabi, dan 'Shiddiqin' adalah derajat tinggi setelah Kenabian." } },
  "2_153": { surah: 2, number: 153, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ" }, translation: { id: "Hai orang-orang yang beriman, jadikanlah sabar dan salat sebagai penolongmu..." }, tafsir: { maudhui: "Allah memberikan dua senjata utama menghadapi kerasnya hidup: Sabar (ketahanan mental menahan nafsu/musibah) dan Shalat (hubungan vertikal meminta kekuatan). 'Innallaha ma'a shabirin' bermakna Maiyatullah (kebersamaan Allah) yang khusus berupa pertolongan, dukungan, dan kemenangan bagi mereka yang sabar." } },
  "14_7": { surah: 14, number: 7, text: { arab: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌ" }, translation: { id: "Dan (ingatlah juga), tatkala Tuhanmu memaklumkan; 'Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu...'" }, tafsir: { maudhui: "Hukum kepastian matematika Ilahi: Syukur = Tambah. Ibnu Katsir menjelaskan syukur bukan hanya ucapan Alhamdulillah, tapi menggunakan nikmat untuk ketaatan. Sebaliknya, Kufur Nikmat (mengingkari/menggunakan untuk maksiat) mengundang azab yang pedih dan hilangnya nikmat tersebut." } },
  "3_159": { surah: 3, number: 159, text: { arab: "فَبِمَا رَحْمَةٍۢ مِّنَ ٱللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ ٱلْقَلْبِ ٱنفَضُّوا۟ مِنْ حَوْلِكَ" }, translation: { id: "Maka disebabkan rahmat dari Allah-lah kamu berlaku lemah lembut terhadap mereka. Sekiranya kamu bersikap keras lagi berhati kasar, tentulah mereka menjauhkan diri dari sekelilingmu..." }, tafsir: { maudhui: "Ayat ini memuji akhlak Nabi Muhammad SAW. Kelembutan (Linu) adalah kunci sukses dakwah dan kepemimpinan. Sikap kasar dan keras hati hanya akan membuat orang lari. Setelah itu Allah memerintahkan: Maafkan mereka, mohonkan ampun, dan bermusyawarah dengan mereka. Setelah sepakat, baru bertawakkal (Fa-idza 'azamta fa-tawakkal 'alallah)." } },
  "25_63": { surah: 25, number: 63, text: { arab: "وَعِبَادُ ٱلرَّحْمَـٰنِ ٱلَّذِينَ يَمْشُونَ عَلَى ٱلْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ ٱلْجَـٰهِلُونَ قَالُوا۟ سَلَـٰمًا" }, translation: { id: "Dan hamba-hamba Tuhan yang Maha Penyayang itu (ialah) orang-orang yang berjalan di atas bumi dengan rendah hati..." }, tafsir: { maudhui: "Sifat 'Ibadurrahman' (Hamba-hamba pilihan Allah). Mereka berjalan dengan 'Hauna' (tenang, berwibawa, tawadhu, tidak sombong). Jika diganggu atau diejek oleh orang-orang bodoh (jahil), mereka tidak membalas dengan keburukan, tapi mengucapkan 'Salama' (kata-kata keselamatan/perpisahan yang baik). Mereka memiliki pengendalian emosi yang tinggi." } },
  "31_18": { surah: 31, number: 18, text: { arab: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِى ٱلْأَرْضِ مَرَحًا ۖ إِنَّ ٱللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍۢ فَخُورٍ" }, translation: { id: "Dan janganlah kamu memalingkan mukamu dari manusia (karena sombong) dan janganlah kamu berjalan di muka bumi dengan angkuh..." }, tafsir: { maudhui: "Larangan tegas terhadap kesombongan (Takabur). 'Tusha'ir khaddaka' artinya membuang muka/meremehkan orang lain saat berbicara. 'Maraha' artinya berjalan dengan gaya angkuh/petantang-petenteng. Allah sangat membenci sifat Mukhtal (sombong pada diri sendiri) dan Fakhur (membanggakan diri pada orang lain)." } },
  "3_134": { surah: 3, number: 134, text: { arab: "ٱلَّذِينَ يُنفِقُونَ فِى ٱلسَّرَّآءِ وَٱلضَّرَّآءِ وَٱلْكَـٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ" }, translation: { id: "(yaitu) orang-orang yang menafkahkan (hartanya), baik di waktu lapang maupun sempit, dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang." }, tafsir: { maudhui: "Ciri-ciri orang bertakwa (Muttaqin) penghuni surga: 1) Dermawan dalam segala kondisi (kaya/miskin). 2) 'Kazhiminal Ghaizh': Mampu menelan/menahan amarah padahal mampu melampiaskannya. 3) 'Al-'Afina': Memaafkan orang yang bersalah padanya. Puncaknya adalah Ihsan (berbuat baik pada yang menyakiti), dan Allah mencintai orang-orang yang berbuat ihsan." } },
  "42_40": { surah: 42, number: 40, text: { arab: "وَجَزَٰٓؤُا۟ سَيِّئَةٍۢ سَيِّئَةٌۭ مِّثْلُهَا ۖ فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُۥ عَلَى ٱللَّهِ" }, translation: { id: "Dan balasan suatu kejahatan adalah kejahatan yang serupa, maka barangsiapa memaafkan dan berbuat baik maka pahalanya atas (tanggungan) Allah." }, tafsir: { maudhui: "Islam mengajarkan keadilan (Qishash/balasan setimpal), namun menganjurkan kemuliaan (Maaf). Membalas itu hak, tapi memaafkan (Ishlah) itu lebih utama dan pahalanya langsung dijamin Allah ('Ajruhu 'alallah'). Ibnu Katsir menyebutkan bahwa di hari kiamat akan diserukan: 'Bangkitlah orang-orang yang pahalanya ditanggung Allah', maka tidak ada yang bangkit kecuali orang yang suka memaafkan." } },

  // --- G. SOSIAL ---
  "49_10": { surah: 49, number: 10, text: { arab: "إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ" }, translation: { id: "Orang-orang beriman itu sesungguhnya bersaudara. Sebab itu damaikanlah (perbaikilah hubungan) antara kedua saudaramu itu..." }, tafsir: { maudhui: "Persaudaraan iman (Ukhuwah Islamiyah) lebih kuat dari persaudaraan darah. Seluruh mukmin ibarat satu tubuh. Jika terjadi konflik, kewajiban pihak ketiga adalah melakukan 'Ishlah' (mendamaikan) dengan adil, bukan memihak atau mengompori." } },
  "3_103": { surah: 3, number: 103, text: { arab: "وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا۟" }, translation: { id: "Dan berpeganglah kamu semuanya kepada tali (agama) Allah, dan janganlah kamu bercerai berai..." }, tafsir: { maudhui: "Perintah persatuan umat. 'Hablillah' (Tali Allah) ditafsirkan sebagai Al-Qur'an dan Al-Islam. Allah mengingatkan nikmat persatuan (dulu kaum Aus dan Khazraj saling bermusuhan, lalu Allah persatukan hati mereka dengan Islam). Perpecahan adalah tepi jurang neraka yang harus dihindari." } },
  "16_90": { surah: 16, number: 90, text: { arab: "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَـٰنِ وَإِيتَآىِٕ ذِى ٱلْقُرْبَىٰ" }, translation: { id: "Sesungguhnya Allah menyuruh (kamu) berlaku adil dan berbuat kebajikan, memberi kepada kaum kerabat..." }, tafsir: { maudhui: "Ini adalah ayat yang paling komprehensif tentang etika sosial (Jami' li makarim al-akhlaq). Tiga perintah: Adil (menempatkan sesuatu pada tempatnya/memenuhi hak), Ihsan (berbuat lebih dari kewajiban/kebaikan), dan Menyantuni kerabat. Tiga larangan: Keji (Fahsyah/zina), Mungkar (pelanggaran syariat), dan Baghyu (kezaliman/permusuhan). Ayat ini sering dibaca di akhir khutbah Jumat." } },
  "5_2": { surah: 5, number: 2, text: { arab: "وَتَعَاوَنُوا۟ عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا۟ عَلَى ٱلْإِثْمِ وَٱلْعُدْوَٰنِ" }, translation: { id: "...Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa, dan jangan tolong-menolong dalam berbuat dosa dan pelanggaran." }, tafsir: { maudhui: "Prinsip Gotong Royong (Ta'awun) dalam Islam. Kerjasama wajib dilakukan dalam hal positif (Birr & Taqwa), tapi haram dilakukan dalam hal negatif (Dosa & Permusuhan). Ini mematahkan fanatisme golongan ('Right or wrong is my country/group' tidak berlaku). Kita dilarang menolong teman yang sedang berbuat zalim kecuali dengan cara mencegahnya." } },
  "51_19": { surah: 51, number: 19, text: { arab: "وَفِىٓ أَمْوَٰلِهِمْ حَقٌّ لِّلسَّآئِلِ وَٱلْمَحْرُومِ" }, translation: { id: "Dan pada harta-harta mereka ada hak untuk orang miskin yang meminta dan orang miskin yang tidak mendapat bagian." }, tafsir: { maudhui: "Kesadaran sosial orang bertakwa: Mereka sadar bahwa di dalam harta mereka ada 'Hak' milik orang lain. Jadi saat berzakat/sedekah, mereka tidak merasa berjasa, tapi merasa sedang menunaikan kewajiban/mengembalikan hak. 'Mahrum' adalah orang miskin yang menjaga harga diri (tidak meminta-minta) sehingga orang mengira dia kaya, padahal dia butuh." } },
  "49_12": { surah: 49, number: 12, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱجْتَنِبُوا۟ كَثِيرًا مِّنَ ٱلظَّنِّ... وَلَا يَغْتَب بَّعْضُكُم بَعْضًا" }, translation: { id: "Hai orang-orang yang beriman, menjauhlah kebanyakan purba-sangka (kecurigaan)... dan janganlah menggunjingkan satu sama lain." }, tafsir: { maudhui: "Larangan penyakit sosial yang merusak ukhuwah: 1) Su'udzon (buruk sangka) tanpa bukti. 2) Tajasus (mencari-cari kesalahan orang lain). 3) Ghibah (menggunjing/membicarakan aib saudara di belakang). Allah mengumpamakan Ghibah seperti memakan daging bangkai saudara sendiri yang sudah mati, sebuah perbuatan yang sangat menjijikkan." } },
  "49_11": { surah: 49, number: 11, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰٓ أَن يَكُونُوا۟ خَيْرًا مِّنْهُمْ" }, translation: { id: "Hai orang-orang yang beriman, janganlah sekumpulan orang laki-laki merendahkan kumpulan yang lain, boleh jadi yang ditertawakan itu lebih baik dari mereka..." }, tafsir: { maudhui: "Larangan 'Sakhriyah' (mengolok-olok/merendahkan/membully). Standar kemuliaan adalah hati dan takwa, yang hanya diketahui Allah. Boleh jadi orang yang kita hina secara fisik/status sosial, justru jauh lebih mulia di sisi Allah. Juga larangan 'Lamz' (mencela) dan 'Tanabuz bil alqab' (memanggil dengan gelaran buruk)." } },
  "49_6": { surah: 49, number: 6, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن جَآءَكُمْ فَاسِقٌۢ بِنَبَإٍۢ فَتَبَيَّنُوٓا۟" }, translation: { id: "Hai orang-orang yang beriman, jika datang kepadamu orang fasik membawa suatu berita, maka periksalah dengan teliti..." }, tafsir: { maudhui: "Prinsip 'Tabayyun' (verifikasi/cek dan ricek) dalam menerima berita, terutama dari sumber yang tidak kredibel (fasik) atau media sosial (hoax). Menerima berita mentah-mentah bisa menyebabkan musibah atau fitnah bagi orang lain yang tidak bersalah, yang akhirnya akan kita sesali." } },

  // --- H. EKONOMI ---
  "8_28": { surah: 8, number: 28, text: { arab: "وَٱعْلَمُوٓا۟ أَنَّمَآ أَمْوَٰلُكُمْ وَأَوْلَـٰدُكُمْ فِتْنَةٌ" }, translation: { id: "Dan ketahuilah, bahwa hartamu dan anak-anakmu itu hanyalah sebagai cobaan..." }, tafsir: { maudhui: "Dalam Tafsir Ibnu Katsir, kata 'Fitnah' di sini bermakna ujian (Ikhtibar). Harta dan anak-anak adalah dua hal yang paling dicintai manusia, namun seringkali menjadi sebab kelalaian dari mengingat Allah. Allah menguji hamba-Nya dengan memberi kekayaan dan keturunan: apakah ia akan bersyukur dan menggunakannya dalam ketaatan, ataukah ia akan sibuk dengannya hingga melupakan kewajiban. Harta bisa menjadi musuh jika ia menghalangi dari jihad dan sedekah. Sesungguhnya di sisi Allah-lah pahala yang besar (surga), yang jauh lebih bernilai daripada kenikmatan duniawi yang menipu dan sementara." } },
  "57_7": { surah: 57, number: 7, text: { arab: "ءَامِنُوا۟ بِٱللَّهِ وَرَسُولِهِۦ وَأَنفِقُوا۟ مِمَّا جَعَلَكُم مُّسْتَخْلَفِينَ فِيهِ" }, translation: { id: "Berimanlah kamu kepada Allah dan Rasul-Nya dan nafkahkanlah sebagian dari hartamu yang Allah telah menjadikan kamu menguasainya." }, tafsir: { maudhui: "Dalam Tafsir Ibnu Katsir, ayat ini menjelaskan hakekat kepemilikan harta yang revolusioner. Allah SWT menggunakan kata 'Mustakhlifin' (yang dijadikan wakil/pengganti), yang menyiratkan bahwa manusia bukanlah pemilik mutlak dari harta yang ada di tangannya. Harta tersebut adalah milik Allah yang dititipkan sementara kepada manusia untuk dikelola. Ibnu Katsir menekankan bahwa karena posisi manusia hanya sebagai wakil, maka sudah sepatutnya ia membelanjakan harta tersebut sesuai dengan kehendak Pemilik Aslinya (Allah), yaitu untuk infak dan ketaatan. Jika seseorang kikir, ia sebenarnya menahan harta yang bukan miliknya. Ayat ini juga mengandung isyarat halus bahwa harta itu sebelumnya milik orang lain (generasi sebelum kita) dan akan berpindah ke orang lain (ahli waris), maka manfaatkanlah momentum saat harta itu ada di tanganmu untuk kebaikan abadi di akhirat sebelum ia lepas." } },
  "2_261": { surah: 2, number: 261, text: { arab: "مَّثَلُ ٱلَّذِينَ يُنفِقُونَ أَمْوَٰلَهُمْ فِى سَبِيلِ ٱللَّهِ كَمَثَلِ حَبَّةٍ أَنۢبَتَتْ سَبْعَ سَنَابِلَ فِى كُلِّ سُنۢبُلَةٍۢ مِّا۟ئَةُ حَبَّةٍ" }, translation: { id: "Perumpamaan (nafkah yang dikeluarkan oleh) orang-orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan sebutir benih yang menumbuhkan tujuh bulir, pada tiap-tiap bulir seratus biji." }, tafsir: { maudhui: "Ayat ini memberikan visualisasi matematika Ilahi yang menakjubkan tentang balasan sedekah. Ibnu Katsir menjelaskan bahwa Allah melipatgandakan satu amal kebaikan menjadi sepuluh, hingga tujuh ratus kali lipat, bahkan lebih bagi siapa yang Dia kehendaki. Perumpamaan 'sebutir benih' yang tumbuh menjadi 700 butir (7 tangkai x 100 biji) menunjukkan betapa suburnya tanah amal di sisi Allah. Namun, Ibnu Katsir memberikan syarat bahwa pelipatgandaan ini berlaku bagi infak yang 'Fi Sabilillah' (di jalan Allah), yang dilakukan dengan niat ikhlas, bukan untuk pamer, dan tidak diikuti dengan 'Mann' (mengungkit-ungkit) atau 'Adza' (menyakiti perasaan penerima). Ini adalah motivasi dahsyat bagi kaum muslimin untuk berinvestasi di bank akhirat yang tidak akan pernah mengalami inflasi atau kerugian." } },
  "92_18": { surah: 92, number: 18, text: { arab: "ٱلَّذِى يُؤْتِى مَالَهُۥ يَتَزَكَّىٰ" }, translation: { id: "Yang menafkahkan hartanya (di jalan Allah) untuk membersihkannya." }, tafsir: { maudhui: "Menurut mayoritas ahli tafsir, ayat ini turun memuji Abu Bakar Ash-Shiddiq r.a. yang sering memerdekakan budak-budak muslim yang lemah (seperti Bilal bin Rabah) dengan hartanya. Tujuan utamanya bukanlah mengharap pujian manusia atau membalas budi, melainkan semata-mata 'Yatazakka' (membersihkan diri). Ibnu Katsir menjelaskan bahwa sedekah memiliki fungsi 'Tazkiyatun Nafs' (penyucian jiwa) dari noda-noda kekikiran, dosa, dan cinta dunia yang berlebihan. Harta yang dikeluarkan di jalan Allah tidak akan berkurang, justru ia akan membersihkan sisa harta yang tinggal dan memberkahinya. Ini adalah antitesis dari karakter orang celaka yang kikir dan mendustakan pahala terbaik." } },
  "17_29": { surah: 17, number: 29, text: { arab: "وَلَا تَجْعَلْ يَدَكَ مَغْلُولَةً إِلَىٰ عُنُقِكَ وَلَا تَبْسُطْهَا كُلَّ ٱلْبَسْطِ" }, translation: { id: "Dan janganlah kamu jadikan tanganmu terbelenggu pada lehermu dan janganlah kamu terlalu mengulurkannya..." }, tafsir: { maudhui: "Ini adalah pedoman manajemen keuangan Islam yang menekankan prinsip 'Wasathiyah' (keseimbangan/moderasi). Ibnu Katsir menjelaskan metafora indah dalam ayat ini: 'Tangan terbelenggu pada leher' adalah kiasan bagi sifat Bakhil (pelit) yang ekstrem, seakan-akan tangannya terikat tidak bisa memberi. Sebaliknya, 'Terlalu mengulurkannya' adalah kiasan bagi sifat Tabdzir (boros/foya-foya) yang menghabiskan harta tanpa perhitungan. Islam melarang kedua ekstrem ini. Akibat pelit adalah tercela (Maluma) di mata manusia dan Allah, sedangkan akibat boros adalah menyesal (Mahsura) karena kehabisan bekal di kemudian hari. Orang mukmin yang cerdas adalah yang mampu menyeimbangkan pengeluaran antara kebutuhan diri, keluarga, dan hak Allah (sosial)." } },
  "17_26": { surah: 17, number: 26, text: { arab: "وَءَاتِ ذَا ٱlْقُرْبَىٰ حَقَّهُۥ وَٱلْمِسْكِينَ وَٱبْنَ ٱلسَّبِيلِ وَلَا تُبَذِّرْ تَبْذِيرًا" }, translation: { id: "Dan berikanlah kepada keluarga-keluarga yang dekat akan haknya, kepada orang miskin dan orang yang dalam perjalanan dan janganlah kamu menghambur-hamburkan (hartamu) secara boros." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan skala prioritas dalam berinfak. Yang pertama berhak menerima kebaikan finansial kita adalah 'Dzal Qurba' (kerabat dekat), karena bersedekah kepada mereka bernilai ganda: sedekah dan silaturahmi. Kemudian orang miskin dan Ibnu Sabil (musafir). Setelah memerintahkan memberi, Allah langsung melarang 'Tabdzir'. Ibnu Mas'ud dan Ibnu Abbas menafsirkan Tabdzir sebagai 'membelanjakan harta bukan pada tempat yang benar' (misalnya untuk maksiat, judi, atau hura-hura yang haram). Meskipun membelanjakan sedikit untuk maksiat itu disebut Tabdzir, sedangkan membelanjakan banyak untuk kebaikan bukanlah pemborosan. Para pemboros disebut 'Saudara Setan' karena kesamaan sifat dalam ingkar nikmat." } },
  "28_77": { surah: 28, number: 77, text: { arab: "وَٱبْتَغِ فِيمَآ ءَاتَىٰكَ ٱللَّهُ ٱلدَّارَ ٱلْـَٔاخِرَةَ ۖ وَلَا تَنسَ نَصِيبَكَ مِنَ ٱلدُّنْيَا" }, translation: { id: "Dan carilah pada apa yang telah dianugerahkan Allah kepadamu (kebahagiaan) negeri akhirat, dan janganlah kamu melupakan bahagianmu dari (kenikmatan) duniawi..." }, tafsir: { maudhui: "Nasihat bijak dari kaum yang berilmu kepada Qarun, dan berlaku universal bagi setiap pemilik harta. Ibnu Katsir menjelaskan makna 'Wabtaghi': Gunakanlah nikmat harta yang melimpah ini untuk ketaatan kepada Allah dan mendekatkan diri kepada-Nya guna meraih surga. Namun, Islam adalah agama fitrah yang realistis: 'Wala tansa nasibaka minad dunya' (Jangan lupakan bagianmu di dunia). Allah tidak melarang orang kaya menikmati hartanya: makan yang enak, minum, berpakaian indah, dan tinggal di rumah nyaman, selama itu halal dan tidak sombong. Prinsipnya adalah: 'Wa ahsin kama ahsanallahu ilaik' (Berbuat baiklah kepada sesama makhluk, sebagaimana Allah telah berbuat baik kepadamu dengan memberi rezeki ini). Kekayaan harus memiliki fungsi sosial, bukan hanya ditumpuk." } },
  "83_1": { surah: 83, number: 1, text: { arab: "وَيْلٌ لِّلْمُطَفِّفِينَ" }, translation: { id: "Kecelakaan besarlah bagi orang-orang yang curang (dalam menakar dan menimbang)." }, tafsir: { maudhui: "Surah ini turun di Madinah berkaitan dengan praktik pasar yang curang. Ibnu Katsir menjelaskan kata 'Wail' bisa bermakna kebinasaan, azab yang pedih, atau sebuah lembah di neraka Jahanam. Ancaman ini ditujukan kepada 'Al-Muthaffifin' (orang-orang yang curang). Modus operandinya dijelaskan di ayat selanjutnya: Jika mereka membeli (menerima takaran) dari orang lain, mereka minta dipenuhi atau dilebihkan. Namun jika mereka menjual (menakar untuk orang lain), mereka menguranginya secara sembunyi-sembunyi. Ini adalah bentuk korupsi 'kecil' dalam transaksi harian yang merusak kepercayaan publik dan ekonomi umat. Allah mengingatkan bahwa mereka akan dibangkitkan pada hari yang besar (Kiamat) untuk mempertanggungjawabkan kecurangan-kecurangan kecil tersebut." } },

  // --- I. POLITIK ---
  "2_124": { surah: 2, number: 124, text: { arab: "وَإِذِ ٱبْتَلَىٰٓ إِبْرَٰهِـۧمَ رَبُّهُۥ بِكَلِمَـٰتٍۢ فَأَتَمَّهُنَّ ۖ قَالَ إِنِّى جَاعِلُكَ لِلنَّاسِ إِمَامًا" }, translation: { id: "Dan (ingatlah), ketika Ibrahim diuji Tuhannya dengan beberapa kalimat, lalu Ibrahim menunaikannya. Allah berfirman: 'Sesungguhnya Aku akan menjadikanmu imam bagi seluruh manusia'..." }, tafsir: { maudhui: "Ayat ini menjelaskan kualifikasi kepemimpinan (Imamah) dalam Islam. Ibrahim a.s. tidak diangkat menjadi Imam (pemimpin/teladan) secara instan, melainkan setelah lulus dari serangkaian ujian berat ('Kalimat') yang Allah berikan, seperti perintah menyembelih anak, khitan, dan melawan berhala, yang semuanya ia tunaikan dengan sempurna ('Fa-atammahunna'). Ketika Ibrahim memohon agar kepemimpinan ini diwariskan kepada anak cucunya, Allah menjawab: 'Janji-Ku (kepemimpinan agama) ini tidak mengenai orang-orang yang zalim'. Ibnu Katsir menegaskan bahwa kepemimpinan tidak sah diberikan kepada orang zalim (fasik/pelaku maksiat), dan ketaatan kepada mereka dalam kemaksiatan tidaklah wajib. Kepemimpinan adalah amanah meritokrasi berbasis kesalehan dan kompetensi, bukan sekadar keturunan." } },
  "33_72": { surah: 33, number: 72, text: { arab: "إِنَّا عَرَضْنَا ٱلْأَمَانَةَ عَلَى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱلْجِبَالِ فَأَبَيْنَ أَن يَحْمِلْنَهَا... وَحَمَلَهَا ٱلْإِنسَـٰنُ" }, translation: { id: "Sesungguhnya Kami telah mengemukakan amanat kepada langit, bumi dan gunung-gunung, maka semuanya enggan untuk memikul amanat itu... dan dipikullah amanat itu oleh manusia." }, tafsir: { maudhui: "Ibnu Katsir menafsirkan 'Amanah' di sini sebagai beban Taklif (kewajiban syariat), ketaatan, dan konsekuensi pahala serta dosa. Allah menawarkan amanah ini kepada makhluk-makhluk raksasa (langit, bumi, gunung) dengan tawaran: 'Jika taat dapat pahala, jika durhaka disiksa'. Mereka semua menolak bukan karena membangkang, tapi karena 'Isyfaq' (takut/khawatir) tidak mampu menunaikannya dan takut akan azab Allah. Namun, manusia (diwakili Adam a.s.) bersedia memikulnya. Allah menyebut manusia itu 'Zaluman Jahula' (amat zalim dan amat bodoh) karena kebanyakan manusia meremehkan beratnya amanah ini, sehingga mereka mengkhianatinya. Hanya sedikit manusia (para Nabi dan mukmin) yang berhasil menunaikan amanah berat ini. Ayat ini mengingatkan pejabat dan pemimpin bahwa jabatan adalah amanah yang gunung pun tidak sanggup memikulnya." } },
  "4_59": { surah: 4, number: 59, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَطِيعُوا۟ ٱللَّهَ وَأَطِيعُوا۟ ٱلرَّسُولَ وَأُو۟لِى ٱلْأَمْرِ مِنكُمْ" }, translation: { id: "Hai orang-orang yang beriman, taatilah Allah dan taatilah Rasul (Nya), dan ulil amri di antara kamu." }, tafsir: { maudhui: "Ayat ini adalah konstitusi dasar politik Islam. Ibnu Katsir menjelaskan struktur hierarki ketaatan: 1) Ketaatan kepada Allah adalah mutlak (menggunakan kata perintah 'Athi'u'). 2) Ketaatan kepada Rasul adalah mutlak, karena Rasul tidak berbicara dari hawa nafsunya. 3) Ketaatan kepada 'Ulil Amri' (pemimpin/pemerintah/ulama) tidak menggunakan kata 'Athi'u' secara terpisah, melainkan diikutkan (athaf) kepada ketaatan sebelumnya. Ini bermakna ketaatan kepada pemimpin bersyarat: 'Tidak ada ketaatan kepada makhluk dalam bermaksiat kepada Khaliq'. Jika pemimpin memerintahkan dosa, wajib ditolak. Bagian akhir ayat memberikan mekanisme resolusi konflik: Jika terjadi sengketa ('Tanaza'tum') antara rakyat dan pemerintah, solusinya adalah kembali merujuk kepada teks Al-Qur'an dan Sunnah Rasulullah (At-Tahakum ilal Kitab was Sunnah), bukan kepada hukum buatan manusia atau hawa nafsu." } },
  "42_38": { surah: 42, number: 38, text: { arab: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ" }, translation: { id: "...sedang urusan mereka (diputuskan) dengan musyawarat antara mereka..." }, tafsir: { maudhui: "Ayat ini meletakkan prinsip 'Syura' (Musyawarah) sebagai salah satu pilar utama masyarakat madani dan sifat dasar orang beriman, sejajar dengan mendirikan shalat. Ibnu Katsir menjelaskan bahwa Nabi SAW sendiri, meskipun menerima wahyu, adalah orang yang paling sering bermusyawarah dengan para sahabatnya dalam urusan strategi perang (seperti Badar dan Uhud) dan urusan publik lainnya. Syura bertujuan untuk memadukan berbagai pandangan ahli, meminimalisir kesalahan keputusan tunggal (diktator), dan membesarkan hati para pengikut. Keputusan publik yang diambil melalui mekanisme syura lebih membawa berkah dan dukungan kolektif (legitimasi) daripada keputusan sepihak yang otoriter." } },
  "2_190": { surah: 2, number: 190, text: { arab: "وَقَـٰتِلُوا۟ فِى سَبِيلِ ٱللَّهِ ٱلَّذِينَ يُقَـٰتِلُونَكُمْ وَلَا تَعْتَدُوٓا۟" }, translation: { id: "Dan perangilah di jalan Allah orang-orang yang memerangi kamu, (tetapi) janganlah kamu melampaui batas..." }, tafsir: { maudhui: "Ini adalah ayat pertama yang turun mengizinkan perang (Qital) di Madinah. Ibnu Katsir menjelaskan etika perang (Jihad) yang sangat luhur dalam Islam. Perang bersifat defensif-aktif: 'Perangilah orang yang memerangi kamu'. Namun, ada batasan ketat 'Wala Ta'tadu' (Jangan melampaui batas). Ibnu Abbas dan Umar bin Abdul Aziz merinci larangan ini: Jangan membunuh wanita, anak-anak, orang tua renta, dan pendeta/biarawan yang tidak ikut berperang. Jangan mencincang mayat (Mutsla), jangan menebang pohon-pohon yang berbuah, dan jangan menyembelih hewan ternak kecuali untuk dimakan. Perang dalam Islam bertujuan untuk menghentikan kezaliman dan fitnah, bukan untuk pelampiasan nafsu membunuh atau kerusakan bumi (Genosida)." } },
  "8_61": { surah: 8, number: 61, text: { arab: "وَإِن جَنَحُوا۟ لِلسَّلْمِ فَٱجْنَحْ لَهَا وَتَوَكَّلْ عَلَى ٱللَّهِ" }, translation: { id: "Dan jika mereka condong kepada perdamaian, maka condonglah kepadanya dan bertawakkallah kepada Allah." }, tafsir: { maudhui: "Ayat ini menegaskan bahwa Islam adalah agama yang mencintai damai (Salam). Jika musuh di medan perang mengajak kepada gencatan senjata atau perdamaian (Sulh), maka umat Islam diperintahkan untuk menerima tawaran tersebut ('Fajnah laha'), selama itu bukan tipu daya yang nyata. Ibnu Katsir menjelaskan bahwa Nabi SAW selalu menerima perjanjian damai jika di dalamnya terdapat kemaslahatan, seperti dalam Perjanjian Hudaibiyah. Perintah 'Bertawakkallah kepada Allah' mengisyaratkan bahwa kita tidak perlu paranoid berlebihan terhadap kemungkinan pengkhianatan musuh; jika kita berniat baik untuk damai, Allah akan melindungi dan menolong umat Islam dari makar mereka." } },
  "5_87": { surah: 5, number: 87, text: { arab: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُحَرِّمُوا۟ طَيِّبَـٰتِ مَآ أَحَلَّ ٱللَّهُ لَكُمْ وَلَا تَعْتَدُوٓا۟" }, translation: { id: "Hai orang-orang yang beriman, janganlah kamu haramkan apa-apa yang baik yang telah Allah halalkan bagi kamu, dan janganlah kamu melampaui batas." }, tafsir: { maudhui: "Ayat ini turun menegur beberapa sahabat yang berniat untuk hidup asketis ekstrem (seperti pendeta): ingin mengebiri diri agar tidak bernafsu, puasa terus menerus, dan tidak tidur malam. Ibnu Katsir menjelaskan larangan 'Ghuluw' (berlebih-lebihan/ekstrem) dalam agama. Islam melarang mengharamkan 'Thayyibat' (hal-hal baik/enak) yang dihalalkan Allah, seperti makanan lezat, pakaian bagus, dan menikah. Zuhud bukan berarti menyiksa diri. Sikap melampaui batas fitrah manusia ini tidak disukai Allah karena menyalahi tujuan penciptaan. Nabi SAW bersabda: 'Aku shalat dan tidur, aku puasa dan berbuka, dan aku menikahi wanita. Barangsiapa membenci sunnahku, maka ia bukan dari golonganku'." } },

  // --- J. SEJARAH ---
  "2_30": { surah: 2, number: 30, text: { arab: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى جَاعِلٌ فِى ٱلْأَرْضِ خَلِيفَةً" }, translation: { id: "Ingatlah ketika Tuhanmu berfirman kepada para Malaikat: 'Sesungguhnya Aku hendak menjadikan seorang khalifah di muka bumi'..." }, tafsir: { maudhui: "Ayat ini merekam dialog pra-eksistensi manusia yang sangat monumental. Allah memproklamirkan pengangkatan Adam a.s. sebagai 'Khalifah' (pemimpin/pengelola/wakil) di bumi. Ibnu Katsir menyoroti pertanyaan kritis Malaikat: 'Mengapa Engkau hendak menjadikan (khalifah) di bumi itu orang yang akan membuat kerusakan padanya dan menumpahkan darah?'. Malaikat bertanya demikian bukan karena menentang (protes), tapi untuk mencari hikmah (Istifsar), mungkin karena mereka pernah melihat perilaku Jin penghuni bumi sebelumnya yang merusak. Allah menjawab dengan otoritas ilmu-Nya: 'Sesungguhnya Aku mengetahui apa yang tidak kamu ketahui'. Allah mengetahui bahwa dari manusia akan lahir para Nabi, Rasul, Shiddiqin, dan Syuhada yang menyembah-Nya. Keunggulan Adam dibuktikan kemudian dengan diajarkannya 'Nama-nama Segala Sesuatu' (kemampuan konseptual/bahasa/ilmu) yang tidak dimiliki Malaikat." } },
  "11_25": { surah: 11, number: 25, text: { arab: "وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِۦٓ إِنِّى لَكُمْ نَذِيرٌ مُّبِينٌ" }, translation: { id: "Dan sesungguhnya Kami telah mengutus Nuh kepada kaumnya, (dia berkata): 'Sesungguhnya aku adalah pemberi peringatan yang nyata bagi kamu'." }, tafsir: { maudhui: "Kisah Nuh a.s. adalah prototipe perjuangan dakwah para Nabi. Ibnu Katsir menjelaskan bahwa Nuh adalah Rasul pertama yang diutus ke bumi setelah terjadinya penyimpangan akidah (penyembahan berhala Wadd, Suwa, dll). Nuh berdakwah dengan sabar yang luar biasa selama 950 tahun (menurut Surah Al-Ankabut), siang dan malam, sembunyi dan terang-terangan. Namun, respon kaumnya, terutama para elit (Al-Mala'), sangat arogan. Mereka menolak Nuh dengan alasan kelas sosial: 'Kami tidak melihat orang-orang yang mengikutimu melainkan orang-orang yang hina dina (miskin/budak) di antara kami'. Ini pelajaran sejarah bahwa kebenaran seringkali pertama kali diterima oleh kaum lemah (Mustadh'afin) sebelum kaum elit yang terbutakan oleh kekayaan dan status." } },
  "11_42": { surah: 11, number: 42, text: { arab: "وَنَادَىٰ نُوحٌ ٱبْنَهُۥ وَكَانَ فِى مَعْزِلٍۢ يَـٰبُنَىَّ ٱرْكَب مَّعَنَا وَلَا تَكُن مَّعَ ٱلْكَـٰفِرِينَ" }, translation: { id: "Dan Nuh memanggil anaknya, sedang anak itu berada di tempat yang jauh terpencil: 'Hai anakku, naiklah (ke kapal) bersama kami...'" }, tafsir: { maudhui: "Ini adalah salah satu adegan paling emosional dalam Al-Qur'an yang menggambarkan tragisnya perpisahan akidah antara ayah dan anak. Di tengah gelombang banjir yang laksana gunung, naluri keayahan Nuh a.s. memanggil anaknya (Kan'an/Yam) untuk naik ke bahtera keselamatan. Namun, sang anak yang keras kepala menolak dengan logika materialis: 'Aku akan mencari perlindungan ke gunung yang dapat memeliharaku dari air bah'. Nuh mengingatkan bahwa hari itu tidak ada perlindungan dari azab Allah kecuali Rahmat-Nya. Akhirnya gelombang memisahkan keduanya. Ibnu Katsir menjelaskan hikmah besar: Bahwa hubungan nasab/darah tidak bisa menyelamatkan seseorang di hadapan Allah jika tidak ada kesamaan iman. Iman adalah pilihan individu, bukan warisan genetik." } },
  "28_3": { surah: 28, number: 3, text: { arab: "نَتْلُوا۟ عَلَيْكَ مِن نَّبَإِ مُوسَىٰ وَفِرْعَوْنَ بِٱلْحَقِّ" }, translation: { id: "Kami membacakan kepadamu sebagian dari kisah Musa dan Fir'aun dengan benar..." }, tafsir: { maudhui: "Allah membuka kisah Musa dengan penegasan 'Bil-Haq' (dengan benar/faktual), membantah dongeng-dongeng Israiliyat yang mungkin sudah terdistorsi. Kisah Musa dan Firaun adalah kisah yang paling sering diulang dalam Al-Qur'an karena melambangkan pertarungan abadi antara Kebenaran (Haq) melawan Kebatilan (Batil), antara Nabi yang membawa mukjizat melawan Raja Tirani yang mengaku Tuhan. Firaun merepresentasikan puncak kesombongan kekuasaan politik dan militer, sementara Musa merepresentasikan kekuatan iman dan tawakal. Kisah ini ditujukan khusus 'bagi kaum yang beriman' agar mereka mengambil pelajaran bahwa betapapun kuatnya kekuasaan zalim, ia pasti akan hancur di tangan kehendak Allah." } },
  "28_30": { surah: 28, number: 30, text: { arab: "فَلَمَّآ أَتَىٰهَا نُودِىَ مِن شَـٰطِىِٕ ٱلْوَادِ ٱلْأَيْمَنِ... أَن يَـٰمُوسَىٰٓ إِنِّىٓ أَنَا ٱللَّهُ" }, translation: { id: "Maka tatkala Musa sampai ke (tempat) api itu, diserulah dia... 'Wahai Musa, sesungguhnya Aku adalah Allah'..." }, tafsir: { maudhui: "Ini adalah momen sakral pelantikan Musa sebagai Kalimullah (orang yang diajak bicara langsung oleh Allah). Peristiwa ini terjadi di Lembah Suci Thuwa, di sisi kanan gunung Tursina. Ibnu Katsir menggambarkan situasi Musa yang saat itu sedang ketakutan, kedinginan, dan tersesat jalan di malam gelap bersama keluarganya. Ia melihat api dan mendekatinya untuk mencari kehangatan atau petunjuk jalan. Ternyata, ia menemukan sesuatu yang jauh lebih besar: Cahaya Hidayah dan Kenabian. Pelajaran spiritualnya adalah: Seringkali Allah memberikan anugerah terbesar-Nya justru di saat hamba berada dalam kondisi paling genting, bingung, dan butuh (fakir). Niat Musa mencari api duniawi diganti Allah dengan Cahaya Ilahi." } },
  "12_4": { surah: 12, number: 4, text: { arab: "إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَـٰٓأَبَتِ إِنِّى رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا..." }, translation: { id: "(Ingatlah), ketika Yusuf berkata kepada ayahnya: 'Wahai ayahku, sesungguhnya aku bermimpi melihat sebelas bintang, matahari dan bulan...'" }, tafsir: { maudhui: "Surah Yusuf disebut Allah sebagai 'Ahsanul Qashash' (Kisah Terbaik). Kisah ini dibuka dengan mimpi kenabian Yusuf a.s. di masa kecil. Ia melihat 11 bintang (saudaranya), matahari (ayahnya), dan bulan (ibunya) bersujud kepadanya. Ya'qub a.s., sang ayah yang juga Nabi, segera memahami takwil mimpi ini bahwa Yusuf akan diangkat derajatnya oleh Allah. Namun, Ya'qub memperingatkan Yusuf: 'Jangan ceritakan mimpimu kepada saudara-saudaramu, nanti mereka membuat makar'. Ini mengajarkan prinsip 'Kitsman' (merahasiakan) nikmat atau rencana besar dari orang yang berpotensi dengki (hasad), bahkan dari kerabat sendiri. Kisah ini mengajarkan optimisme: bahwa penderitaan (dibuang ke sumur, dijual jadi budak, dipenjara) hanyalah proses menuju terwujudnya takdir indah Allah." } },
  "2_40": { surah: 2, number: 40, text: { arab: "يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ عَلَيْكُمْ وَأَوْفُوا۟ بِعَهْدِىٓ أُوفِ بِعَهْدِكُمْ" }, translation: { id: "Hai Bani Israil, ingatlah akan nikmat-Ku yang telah Aku anugerahkan kepadamu, dan penuhilah janjimu kepada-Ku..." }, tafsir: { maudhui: "Ayat ini adalah seruan pembuka dari serangkaian peringatan panjang kepada Bani Israil (keturunan Ya'qub). Allah mengingatkan mereka akan nikmat-nikmat eksklusif yang pernah diberikan kepada nenek moyang mereka: diselamatkan dari Firaun, dibelahkan lautan, diturunkan Manna dan Salwa, dan diutus banyak Nabi dari kalangan mereka. Allah menagih janji setia (Perjanjian Lama/Taurat) bahwa mereka akan beriman kepada Nabi penutup (Muhammad SAW) yang sifat-sifatnya tertulis dalam kitab mereka. 'Penuhilah janjimu kepada-Ku (iman kepada Muhammad), niscaya Aku penuhi janji-Ku kepadamu (masuk surga)'. Ini adalah teguran sejarah bagi umat yang tahu kebenaran tapi menyembunyikannya karena arogansi rasial." } },
  "18_13": { surah: 18, number: 13, text: { arab: "نَّحْنُ نَقُصُّ عَلَيْكَ نَبَأَهُم بِٱلْحَقِّ ۚ إِنَّهُمْ فِتْيَةٌ ءَامَنُوا۟ بِرَبِّهِمْ وَزِدْنَـٰهُمْ هُدًى" }, translation: { id: "Kami kisahkan kepadamu (Muhammad) cerita ini dengan benar. Sesungguhnya mereka adalah pemuda-pemuda yang beriman kepada Tuhan mereka, dan Kami tambah pula untuk mereka petunjuk." }, tafsir: { maudhui: "Kisah Ashabul Kahfi adalah simbol perlawanan akidah kaum muda. Ibnu Katsir menjelaskan bahwa mereka adalah sekelompok pemuda (Fityah) dari kalangan elit/bangsawan Romawi yang sadar akan kebatilan penyembahan berhala yang dipaksakan oleh Raja Dikyanus. Mereka tidak memiliki nabi di tengah mereka, namun Allah memberikan hidayah langsung ke dalam hati mereka. Demi menyelamatkan iman, mereka memilih opsi radikal: 'Uzlah' (mengasingkan diri) ke gua yang sempit dan gelap, meninggalkan kenyamanan istana duniawi. Allah membalas pengorbanan mereka dengan menjaga jasad mereka tetap utuh selama 309 tahun dalam tidur panjang, sebagai tanda kekuasaan-Nya membangkitkan manusia di hari kiamat. Pelajarannya: Anak muda adalah pilar perubahan, dan menjaga iman di lingkungan yang rusak membutuhkan keberanian untuk 'berbeda' dan memisahkan diri dari kebatilan." } },
  "15_73": { surah: 15, number: 73, text: { arab: "فَأَخَذَتْهُمُ ٱلصَّيْحَةُ مُشْرِقِينَ" }, translation: { id: "Maka mereka dibinasakan oleh suara keras yang mengguntur, ketika matahari akan terbit." }, tafsir: { maudhui: "Ayat ini menceritakan detik-detik kehancuran kaum Sodom (umat Nabi Luth) atau kaum Tsamud (dalam tafsir lain). Ibnu Katsir menjelaskan kengerian azab 'Ash-Shaihah', yaitu suara teriakan/dentuman sonik yang sangat dahsyat dari langit (Malaikat Jibril) yang mengguncang jantung hingga copot dan membinasakan mereka seketika di waktu Isyraq (terbit matahari). Hukuman ini diturunkan setelah mereka melampaui batas dalam kemaksiatan seksual (homoseksual) dan menantang azab Allah dengan sombong. Kota mereka kemudian dijungkirbalikkan (bagian atas ke bawah) dan dihujani batu. Ini adalah peringatan sejarah bahwa peradaban yang merusak fitrah manusia dan moralitas pasti akan dihapuskan oleh Allah dari muka bumi." } },

  // --- K. AKHIRAT ---
  "3_185": { surah: 3, number: 185, text: { arab: "كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَـٰمَةِ" }, translation: { id: "Tiap-tiap yang berjiwa akan merasakan mati. Dan sesungguhnya pada hari kiamat sajalah disempurnakan pahalamu." }, tafsir: { maudhui: "Ayat ini adalah pengingat paling universal: Kematian adalah kepastian mutlak bagi setiap yang bernyawa (manusia, jin, hewan, malaikat), tidak ada yang kekal selain Wajah Allah. Ibnu Katsir menjelaskan bahwa dunia bukanlah tempat balasan (Darul Jaza), melainkan tempat ujian (Darul Ibtila). Keadilan sempurna dan penyempurnaan pahala hanya terjadi di Hari Kiamat. Definisi sukses yang sesungguhnya menurut Al-Qur'an ada di lanjutan ayat: 'Barangsiapa dijauhkan dari neraka dan dimasukkan ke dalam surga, maka sungguh ia telah beruntung (Al-Fauz)'. Adapun kekayaan, jabatan, dan popularitas dunia hanyalah 'Mata'ul Ghuruur' (kesenangan yang menipu/memperdaya) jika tidak mengantarkan ke surga." } },
  "50_19": { surah: 50, number: 19, text: { arab: "وَجَآءَتْ سَكْرَةُ ٱلْمَوْتِ بِٱلْحَقِّ ۖ ذَٰلِكَ مَا كُنتَ مِنْهُ تَحِيدُ" }, translation: { id: "Dan datanglah sakaratul maut dengan sebenar-benarnya. Itulah yang kamu selalu lari daripadanya." }, tafsir: { maudhui: "Ibnu Katsir menggambarkan kedahsyatan 'Sakaratul Maut' (mabuk/sekarat kematian) yang pasti mendatangi setiap orang. Frasa 'Bil-Haq' (dengan benar) bermakna kematian itu membawa kebenaran yang selama ini mungkin diragukan atau dilupakan manusia: terbukanya tabir gaib, penampakan malaikat, dan kepastian akhirat. Allah berfirman: 'Itulah yang kamu selalu lari daripadanya'. Manusia secara naluriah takut mati dan berusaha menghindarinya dengan berobat, benteng, atau melupakan diri, namun ironisnya, kematian itulah yang justru sedang memburu dan akan menjemputnya. Saat sakaratul maut tiba, lisan terkunci, anggota tubuh lemah, dan hanya iman yang tersisa." } },
  "23_99": { surah: 23, number: 99, text: { arab: "حَتَّىٰٓ إِذَا جَآءَ أَحَدَهُمُ ٱلْمَوْتُ قَالَ رَبِّ ٱرْجِعُونِ" }, translation: { id: "(Demikianlah keadaan orang-orang kafir itu), hingga apabila datang kematian kepada seseorang dari mereka, dia berkata: 'Ya Tuhanku kembalikanlah aku (ke dunia)'." }, tafsir: { maudhui: "Ayat ini merekam penyesalan abadi yang paling menyedihkan. Saat orang kafir atau pendosa melihat malaikat maut dan tempatnya di neraka, tabir gaib tersingkap. Saat itulah ia memohon dengan sangat: 'Rabbi irji'un' (Ya Tuhanku, kembalikanlah aku ke dunia). Tujuannya bukan untuk berbisnis atau bertemu keluarga, tapi 'agar aku berbuat amal saleh yang dulu aku tinggalkan'. Namun, Allah menjawab dengan tegas: 'Kalla' (Sekali-kali tidak/Mustahil). Itu hanyalah ucapan kosong yang tidak akan dikabulkan. Di hadapan mereka kini ada dinding 'Barzakh' (pemisah) yang menghalangi mereka kembali ke dunia sampai hari kebangkitan. Ini peringatan bagi yang masih hidup: Beramallah sekarang, sebelum pintu amal tertutup selamanya." } },
  "22_1": { surah: 22, number: 1, text: { arab: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمْ ۚ إِنَّ زَلْزَلَةَ ٱلسَّاعَةِ شَىْءٌ عَظِيمٌ" }, translation: { id: "Hai manusia, bertakwalah kepada Tuhanmu; sesungguhnya kegoncangan hari kiamat itu adalah suatu kejadian yang sangat besar (dahsyat)." }, tafsir: { maudhui: "Surah Al-Hajj dibuka dengan peringatan keras tentang 'Zalzalah As-Sa'ah' (Gempa Kiamat). Ibnu Katsir menjelaskan bahwa kiamat akan diawali dengan guncangan kosmik yang maha dahsyat, bukan sekadar gempa bumi lokal. Kedahsyatannya digambarkan di ayat berikutnya: Setiap ibu yang menyusui akan lupa dan melepaskan bayinya (padahal naluri ibu adalah melindungi anak), wanita hamil akan keguguran kandungannya karena terkejut, dan manusia akan terlihat sempoyongan seperti orang mabuk padahal mereka tidak mabuk, melainkan karena azab Allah yang sangat keras. Peringatan ini ditujukan agar manusia segera membangun benteng 'Taqwa' sebelum hari itu tiba." } },
  "47_18": { surah: 47, number: 18, text: { arab: "فَهَلْ يَنظُرُونَ إِلَّا ٱلسَّاعَةَ أَن تَأْتِيَهُم بَغْتَةًۭ ۖ فَقَدْ جَآءَ أَشْرَاطُهَا" }, translation: { id: "Maka tidaklah yang mereka tunggu-tunggu melainkan hari kiamat (yaitu) kedatangannya kepada mereka dengan tiba-tiba, karena sesungguhnya telah datang tanda-tandanya." }, tafsir: { maudhui: "Ayat ini menegaskan sifat kedatangan Kiamat: 'Baghtah' (Tiba-tiba/Mendadak), saat manusia sedang lalai atau sibuk dengan urusan dunia. Namun, Allah Maha Penyayang dengan mengirimkan 'Asyrathuha' (Tanda-tandanya) agar manusia bersiap. Ibnu Katsir menjelaskan bahwa diutusnya Nabi Muhammad SAW sebagai 'Nabi Akhir Zaman' adalah tanda utama bahwa kiamat sudah sangat dekat. Beliau bersabda: 'Jarak antara diutusnya aku dan hari kiamat seperti dua jari ini (telunjuk dan tengah)'. Tanda-tanda lain (terbelahnya bulan, keluarnya Dajjal, dll) adalah peringatan bertahap. Orang cerdas adalah yang membaca tanda zaman dan mempersiapkan bekal." } },
  "7_8": { surah: 7, number: 8, text: { arab: "وَٱلْوَزْنُ يَوْمَئِذٍ ٱلْحَقُّ ۚ فَمَن ثَقُلَتْ مَوَٰزِينُهُۥ فَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ" }, translation: { id: "Timbangan pada hari itu ialah kebenaran (keadilan), maka barangsiapa berat timbangan kebaikannya, maka mereka itulah orang-orang yang beruntung." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan peristiwa 'Al-Mizan' (Timbangan) di hari kiamat. Ini adalah timbangan hakiki yang memiliki dua daun timbangan dan lisan penunjuk, yang akan menimbang amal perbuatan hamba secara fisik dan presisi. Tidak ada kezaliman sedikitpun. Yang ditimbang bisa berupa: 1) Fisik amal itu sendiri yang diwujudkan (sholat menjadi cahaya, dll), 2) Lembaran catatan amal, atau 3) Fisik pelakunya (orang gemuk yang kafir tidak seberat sayap nyamuk, sedangkan betis Ibnu Mas'ud lebih berat dari Gunung Uhud karena iman). Kunci keselamatan adalah 'Tsaqulat Mawazinuhu' (berat timbangan kebaikannya). Kalimat Tauhid 'La ilaha illallah' adalah dzikir yang memiliki bobot terberat di mizan." } },
  "17_13": { surah: 17, number: 13, text: { arab: "وَكُلَّ إِنسَـٰنٍ أَلْزَمْنَـٰهُ طَـٰٓئِرَهُۥ فِى عُنُقِهِۦ ۖ وَنُخْرِجُ لَهُۥ يَوْمَ ٱلْقِيَـٰمَةِ كِتَـٰبًا يَلْقَىٰهُ مَنشُورًا" }, translation: { id: "Dan tiap-tiap manusia itu telah Kami tetapkan amal perbuatannya (sebagaimana tetapnya kalung) pada lehernya..." }, tafsir: { maudhui: "Ibnu Katsir menjelaskan metafora 'Tha'irahu fi unuqihi' (amalnya dikalungkan di lehernya). Artinya, setiap manusia membawa rekaman lengkap perbuatannya sendiri kemanapun ia pergi, tidak bisa lepas, tidak bisa ditimpakan ke orang lain, dan tidak bisa disembunyikan. Amal itu melekat erat laksana kalung. Di hari kiamat, Allah akan mengeluarkan data rekaman tersebut dalam bentuk 'Kitab Terbuka' (Mansyura). Allah akan berkata: 'Bacalah kitabmu, cukuplah dirimu sendiri pada waktu ini sebagai penghisab terhadapmu'. Ini adalah puncak keadilan transparansi, di mana terdakwa (manusia) membaca sendiri bukti-bukti kesalahannya tanpa bisa mengelak." } },
  "47_15": { surah: 47, number: 15, text: { arab: "مَّثَلُ ٱلْجَنَّةِ ٱلَّتِى وُعِدَ ٱلْمُتَّقُونَ ۖ فِيهَآ أَنْهَـٰرٌ مِّن مَّآءٍ غَيْرِ ءَاسِنٍ..." }, translation: { id: "Perumpamaan surga yang dijanjikan kepada orang-orang yang takwa, di dalamnya ada sungai-sungai dari air yang tiada berubah rasa dan baunya..." }, tafsir: { maudhui: "Allah memberikan motivasi visual yang indah tentang Surga untuk menyemangati orang bertakwa. Ibnu Katsir merinci empat jenis sungai di surga yang disebutkan ayat ini: 1) Sungai air murni yang tidak pernah payau/berubah rasa selamanya. 2) Sungai susu yang tidak pernah basi rasanya (keluar langsung dari puting surga, bukan perasan hewan). 3) Sungai khamar (arak) yang lezat bagi peminumnya (tidak memabukkan, tidak bikin pusing, dan tidak najis seperti arak dunia). 4) Sungai madu yang disaring (murni/jernih). Selain itu, penghuni surga mendapatkan segala jenis buah-buahan dan yang terpenting: 'Ampunan dari Tuhan mereka'. Kenikmatan fisik disempurnakan dengan kenikmatan batin (ridha Allah)." } },
  "4_56": { surah: 4, number: 56, text: { arab: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ بِـَٔايَـٰتِنَا سَوْفَ نُصْلِيهِمْ نَارًا كُلَّمَا نَضِجَتْ جُلُودُهُم بَدَّلْنَـٰهُمْ جُلُودًا غَيْرَهَا" }, translation: { id: "Sesungguhnya orang-orang yang kafir kepada ayat-ayat Kami, kelak akan Kami masukkan mereka ke dalam neraka. Setiap kali kulit mereka hangus, Kami ganti kulit mereka dengan kulit yang lain..." }, tafsir: { maudhui: "Ayat ini menggambarkan azab fisik neraka yang sangat mengerikan dan ilmiah. Allah berfirman bahwa setiap kali kulit penghuni neraka hangus terbakar api, Allah menggantinya dengan kulit baru yang utuh. Tujuannya: 'Liyadzuqul azab' (agar mereka merasakan azab secara terus-menerus). Ibnu Katsir mengutip pandangan medis modern bahwa pusat reseptor rasa sakit (pain receptors) manusia terletak di jaringan kulit. Jika kulit sudah hangus mati, rasa sakit berkurang. Maka di neraka, kulit itu diregenerasi secara instan agar rasa sakitnya kembali maksimal dan abadi. Ini adalah balasan setimpal bagi mereka yang menutupi (kufur) kebenaran ayat-ayat Allah yang nyata." } },
  "2_255": { surah: 2, number: 255, text: { arab: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ ... مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ" }, translation: { id: "Allah, tidak ada Tuhan melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)... Tiada yang dapat memberi syafa'at di sisi Allah tanpa izin-Nya." }, tafsir: { maudhui: "Ayat Kursi adalah ayat yang paling agung (Sayyidul Ay) dalam Al-Qur'an karena memuat nama-nama dan sifat Allah yang paling mulia, seperti Al-Hayyu (Maha Hidup) dan Al-Qayyum (Maha Berdiri Sendiri/Mengurus makhluk). Dalam konteks akhirat, penggalan ayat 'Tiada yang dapat memberi syafaat di sisi Allah tanpa izin-Nya' adalah bantahan tegas terhadap kaum musyrikin yang menyembah malaikat atau berhala dengan harapan mendapat syafaat (pertolongan) otomatis. Ibnu Katsir menjelaskan bahwa Syafaat di hari kiamat adalah milik mutlak Allah. Nabi Muhammad SAW pun, sebagai pemberi Syafaat 'Uzma (terbesar), harus bersujud dulu di bawah Arsy memohon izin kepada Allah sebelum diizinkan memberi syafaat. Ini menegaskan kekuasaan dan keagungan Allah yang tidak bisa diintervensi oleh siapapun." } },
};

// 2. TOPIC CATEGORIES (Structure)
const TOPIC_DATA: ThemeCategory[] = [
  {
    code: "A", title: "Akidah & Keimanan",
    items: [
      { id: 101, title: "Kemurnian Tauhid", ref: "Al-Ikhlas: 1-4", verses: [{s:112, v:[1,2,3,4]}] },
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
      { id: 601, title: "Ujian Kesabaran", ref: "Al-Baqarah: 155-156", verses: [{s:2, v:[155, 156]}] },
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
      { id: 701, title: "Keragaman & Kemuliaan", ref: "Al-Hujurat: 13", verses: [{s:49, v:[13]}] },
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
      { id: 801, title: "Rezeki & Tawakal", ref: "At-Talaq: 2-3", verses: [{s:65, v:[2, 3]}] },
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
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-700/30 rounded-full blur-[120px] pointer-events-none animate-breathing"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sand-400/10 rounded-full blur-[120px] pointer-events-none animate-breathing" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 text-center space-y-8 md:space-y-12 p-6 max-w-lg w-full animate-fade-in-up">
        <div className="relative inline-block group cursor-pointer" onClick={onStart}>
             <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-30 rounded-full group-hover:opacity-50 transition-opacity duration-700"></div>
             <div className="relative z-10 w-28 h-28 mx-auto mb-6 rounded-[2rem] bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-900/50 transform group-hover:scale-105 transition-all duration-500 animate-float">
                <Book className="w-12 h-12 text-sand-400 drop-shadow-md" strokeWidth={1.5} />
             </div>
        </div>

        <div className="space-y-2">
            <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight drop-shadow-2xl">Finding Tafsir</h1>
        </div>
        
        <div className="glass-card px-8 py-6 rounded-3xl mx-4">
          <p className="text-emerald-50/90 font-serif text-lg leading-relaxed">
            Menyelami makna Al-Qur'an melalui intisari Tafsir Ibnu Katsir secara tematik.
          </p>
        </div>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 border-t border-emerald-400/30 text-white font-serif text-lg tracking-wide transition-all duration-500 rounded-full overflow-hidden hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95"
        >
           <span className="relative z-10 font-medium">Mulai Membaca</span>
           <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

const CategorySelection = ({ onSelectCategory, onSelectTheme, onBack }: { onSelectCategory: (cat: ThemeCategory) => void, onSelectTheme: (theme: ThemeItem) => void, onBack: () => void }) => {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    let results: { item: ThemeItem, catTitle: string, matchType: string }[] = [];

    TOPIC_DATA.forEach(cat => {
      const isCatMatch = cat.title.toLowerCase().includes(lowerQuery);
      
      cat.items.forEach(item => {
        let matchType = '';
        if (isCatMatch) matchType = 'Kategori';
        else if (item.title.toLowerCase().includes(lowerQuery)) matchType = 'Judul Tema';
        else if (item.ref.toLowerCase().includes(lowerQuery)) matchType = 'Referensi Ayat';
        
        if (!matchType) {
           for (const ref of item.verses) {
             for (const vNum of ref.v) {
               const verseKey = `${ref.s}_${vNum}`;
               const verse = VERSE_LIBRARY[verseKey];
               if (verse) {
                 if (verse.translation.id.toLowerCase().includes(lowerQuery) || 
                     verse.tafsir.maudhui.toLowerCase().includes(lowerQuery) ||
                     verse.text.arab.includes(query)) {
                    matchType = 'Isi Konten';
                    break;
                 }
               }
             }
             if (matchType) break;
           }
        }
        if (matchType) results.push({ item, catTitle: cat.title, matchType });
      });
    });
    return results;
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-12 pt-safe-top">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-4 shadow-2xl flex items-center justify-between pt-safe-top transition-all">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 -ml-2 rounded-full hover:bg-emerald-800/30 text-emerald-400 hover:text-white transition-all active:scale-90">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-serif text-white drop-shadow-md">Tema Tafsir</h1>
         </div>
      </div>

      <div className="px-6 py-4 sticky top-[72px] z-20 bg-gradient-to-b from-background via-background/95 to-transparent -mt-1 pb-6">
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-emerald-400/70 group-focus-within:text-sand-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-12 py-4 bg-emerald-900/30 border border-emerald-500/20 rounded-full leading-5 text-emerald-50 placeholder-emerald-500/50 focus:outline-none focus:bg-emerald-900/50 focus:border-sand-400/50 focus:ring-1 focus:ring-sand-400/50 transition-all shadow-inner"
            placeholder="Cari topik atau ayat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-5xl mx-auto">
        {query ? (
          <div className="space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-medium px-2 text-sand-400/80 mb-2">
              {filteredItems.length > 0 ? `Ditemukan ${filteredItems.length} Hasil` : 'Tidak ditemukan hasil'}
            </h3>
            {filteredItems.map((result, idx) => (
              <div 
                key={`${result.item.id}-${idx}`}
                onClick={() => onSelectTheme(result.item)}
                className="glass-card p-5 rounded-3xl flex items-center gap-5 cursor-pointer hover:bg-emerald-800/40 transition-all group"
              >
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-sand-400 shrink-0 border border-emerald-500/20 group-hover:rotate-6 transition-transform shadow-lg">
                   <FileText className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] bg-emerald-950/80 px-2.5 py-0.5 rounded-full text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                        {result.catTitle}
                      </span>
                   </div>
                   <h3 className="text-white font-serif text-lg leading-tight group-hover:text-sand-200 transition-colors">{result.item.title}</h3>
                   <p className="text-xs text-emerald-400/70 mt-1 font-mono truncate">{result.item.ref}</p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-sand-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
            {TOPIC_DATA.map((cat, idx) => (
              <div 
                key={cat.code}
                onClick={() => onSelectCategory(cat)}
                className="glass-card p-6 rounded-[2rem] cursor-pointer group relative overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Decorative Background Blob */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-sand-400/10 transition-colors duration-500"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800/50 to-emerald-950/50 flex items-center justify-center text-emerald-300 group-hover:text-sand-300 transition-colors border border-white/5 shadow-inner">
                    <span className="font-serif font-bold text-lg">{cat.code}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/10 text-[10px] text-emerald-400/80">
                    {cat.items.length} Topik
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 relative z-10 group-hover:translate-x-1 transition-transform">{cat.title}</h3>
                <div className="h-1 w-12 bg-emerald-600/50 rounded-full group-hover:w-full group-hover:bg-sand-400/50 transition-all duration-700"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ThemeListSelection = ({ category, onSelectTheme, onBack }: { category: ThemeCategory, onSelectTheme: (theme: ThemeItem) => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-12 pt-safe-top">
       <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-6 shadow-2xl flex items-center gap-4 pt-safe-top">
          <button onClick={onBack} className="p-3 -ml-2 rounded-full hover:bg-emerald-800/30 text-emerald-400 hover:text-white transition-all active:scale-90">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <span className="text-xs font-bold text-sand-400 uppercase tracking-widest block mb-1">Kategori {category.code}</span>
            <h2 className="text-2xl font-serif text-white">{category.title}</h2>
          </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-3">
        {category.items.map((theme, idx) => (
          <div 
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className="glass-card p-5 rounded-3xl flex items-center gap-5 cursor-pointer hover:bg-emerald-800/40 transition-all group active:scale-[0.99]"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
             <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center text-sand-200 font-serif font-bold text-lg shrink-0 border border-white/5 shadow-md group-hover:scale-110 transition-transform">
               {idx + 1}
             </div>
             <div className="flex-1">
               <h3 className="text-white font-serif text-lg leading-snug group-hover:text-sand-100 transition-colors">{theme.title}</h3>
               <div className="flex items-center gap-2 mt-1.5">
                 <span className="text-[11px] text-emerald-400/60 font-mono tracking-tight flex items-center gap-1">
                   <BookOpen className="w-3 h-3" /> {theme.ref}
                 </span>
               </div>
             </div>
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-sand-400/20 transition-colors">
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-sand-300 transition-colors" />
             </div>
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
            translation: { id: "Ayat ini sedang dimuat atau belum tersedia dalam database offline." },
            tafsir: { maudhui: "Silakan hubungi pengembang untuk pembaruan data." }
          });
        }
      });
    });
    setVerses(loadedVerses);
  }, [theme]);

  if (verses.length === 0) return <div className="min-h-screen bg-background flex items-center justify-center text-sand-400 animate-pulse font-serif text-xl">Memuat Halaman...</div>;

  return (
    <div className="min-h-screen bg-background text-emerald-50 pb-6 font-sans pt-safe-top flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-2xl border-b border-white/5 px-4 py-4 flex items-center justify-between pt-safe-top shadow-2xl">
        <button onClick={onBack} className="text-emerald-300 hover:text-white transition-colors p-2 rounded-full hover:bg-emerald-800/30 active:scale-90">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center max-w-[65%]">
            <h2 className="font-serif text-sand-100 text-lg md:text-xl truncate text-center leading-tight">{theme.title}</h2>
            <span className="text-[10px] text-emerald-500 uppercase tracking-widest mt-0.5">{theme.ref}</span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-emerald-300 hover:text-white p-2 rounded-full hover:bg-emerald-800/30 active:scale-90">
            <Type className="w-6 h-6" />
        </button>
      </div>

       {showSettings && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-950/95 border border-sand-400/20 p-6 rounded-3xl shadow-2xl w-72 animate-fade-in-up backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                 <h4 className="text-sm font-serif text-sand-400">Pengaturan Teks</h4>
                 <button onClick={() => setShowSettings(false)} className="text-emerald-500 hover:text-white text-xs uppercase font-bold tracking-wider">Tutup</button>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-900/30 p-3 rounded-xl">
                    <span className="text-sm text-emerald-200">Ukuran</span>
                    <div className="flex gap-2">
                        <button onClick={() => setTextSize(0.85)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-serif transition-all ${textSize === 0.85 ? 'bg-sand-500 text-white shadow-lg' : 'bg-emerald-800/50 text-emerald-400'}`}>A</button>
                        <button onClick={() => setTextSize(1)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-serif transition-all ${textSize === 1 ? 'bg-sand-500 text-white shadow-lg' : 'bg-emerald-800/50 text-emerald-400'}`}>A</button>
                        <button onClick={() => setTextSize(1.25)} className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-serif transition-all ${textSize === 1.25 ? 'bg-sand-500 text-white shadow-lg' : 'bg-emerald-800/50 text-emerald-400'}`}>A</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-6 flex-grow flex flex-col justify-start">
        {verses.map((verse, idx) => (
          <div key={idx} className="animate-fade-in-up mb-2" style={{ animationDelay: `${idx * 150}ms` }}>
            
             {/* Ornament Divider for subsequent verses */}
             {idx > 0 && (
                <div className="flex items-center justify-center gap-4 py-8 opacity-50">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-sand-400"></div>
                    <div className="rotate-45 w-2 h-2 bg-sand-400"></div>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-sand-400"></div>
                </div>
             )}

             {/* Verse Container */}
             <div className="relative">
                {/* Verse Header */}
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-3 bg-emerald-900/40 px-5 py-2 rounded-full border border-sand-400/20 shadow-lg backdrop-blur-sm">
                      <Star className="w-3 h-3 text-sand-400 fill-sand-400" />
                      <span className="text-xs font-bold text-sand-100 uppercase tracking-widest font-sans">
                          QS. {verse.surah} : {verse.number}
                      </span>
                      <Star className="w-3 h-3 text-sand-400 fill-sand-400" />
                  </div>
                </div>

                {/* Arabic Text - The Art Piece */}
                <div 
                    className="text-center font-arabic leading-[2.4] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-8 px-2" 
                    style={{ fontSize: `${2.6 * textSize}rem` }}
                    dir="rtl"
                >
                    {verse.text.arab}
                </div>

                {/* Translation - The Caption */}
                <div className="text-center relative px-2 md:px-12 mb-10">
                    <p 
                        className="text-emerald-100/90 font-serif italic leading-relaxed"
                        style={{ fontSize: `${1.1 * textSize}rem` }}
                    >
                        "{verse.translation.id}"
                    </p>
                </div>

                {/* Tafsir - The Commentary Box */}
                <div className="bg-emerald-900/20 rounded-[2rem] border-l-4 border-l-sand-400 overflow-hidden relative backdrop-blur-sm hover:bg-emerald-900/30 transition-colors duration-500">
                  <div className="p-6 md:p-8">
                    <h4 className="text-sm font-bold text-sand-300 uppercase tracking-widest mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
                      <Sparkles className="w-4 h-4 text-sand-400" /> 
                      Intisari Tafsir
                    </h4>
                    <div className="prose prose-invert prose-p:text-emerald-50/90 max-w-none">
                        <p 
                            className="text-justify font-sans whitespace-pre-wrap leading-loose"
                            style={{ fontSize: `${1 * textSize}rem` }}
                        >
                        {verse.tafsir.maudhui}
                        </p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ))}
        
        {/* End of content marker - minimal visual cue, no text */}
        <div className="h-px w-full my-6 bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent"></div>
      </div>
    </div>
  );
};

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

  const handleBackToWelcome = () => setScreen('welcome');
  const handleBackToCategories = () => {
    setScreen('categories');
    setSelectedCategory(null);
  }
  const handleBackFromReading = () => {
    if (selectedCategory) {
      setScreen('themelist');
      setSelectedTheme(null);
    } else {
      setScreen('categories');
      setSelectedTheme(null);
    }
  }

  return (
    <div className="font-sans antialiased text-slate-200 bg-background min-h-screen selection:bg-sand-400/30 selection:text-white">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'categories' && <CategorySelection onSelectCategory={handleSelectCategory} onSelectTheme={handleSelectTheme} onBack={handleBackToWelcome} />}
      {screen === 'themelist' && selectedCategory && <ThemeListSelection category={selectedCategory} onSelectTheme={handleSelectTheme} onBack={handleBackToCategories} />}
      {screen === 'reading' && selectedTheme && <ReadingScreen theme={selectedTheme} onBack={handleBackFromReading} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);