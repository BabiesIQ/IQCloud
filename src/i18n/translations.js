// Brand names and technical identifiers stay in their original language.
// All unsupported phrases are shown in the original English; no invented
// machine translation is presented as reviewed human copy.
const dictionaries={
 hi:{
  "Home":"मुख्य पृष्ठ","Dashboard":"डैशबोर्ड","Pricing":"कीमतें","Preferences":"पसंद की सेटिंग्स","Documentation":"सहायता और जानकारी",
  "Security Center":"सुरक्षा केंद्र","Domains":"डोमेन","Networking":"नेटवर्क सेटिंग्स","Log out":"लॉग आउट","Log in":"लॉग इन करें",
  "All my VPS domains":"मेरे VPS के सभी डोमेन","Sign in to manage your domains":"डोमेन प्रबंधित करने के लिए लॉग इन करें",
  "Language":"भाषा","Choose a language":"अपनी भाषा चुनें","Search languages":"भाषा खोजें","All languages (60)":"सभी भाषाएँ (60)",
  "Currency":"मुद्रा","Billing country":"भुगतान का देश","Choose your billing country":"भुगतान का देश चुनें",
  "Cancel":"रद्द करें","Close":"बंद करें","Refresh":"फिर से जाँचें","Your VPS":"आपके VPS",
  "Open website":"वेबसाइट खोलें","Connect domain":"डोमेन जोड़ें","Website port":"वेबसाइट का पोर्ट",
  "Your custom domain":"आपका डोमेन","DNS records to add":"जोड़ने के लिए DNS रिकॉर्ड",
  "Monthly compute price":"मासिक सर्वर शुल्क","Monthly":"मासिक","Total payable":"कुल देय राशि",
  "Discount":"छूट","Recommended":"सुझाया गया","Secure checkout":"सुरक्षित भुगतान",
  "Create server":"नया सर्वर बनाएँ","Review and checkout":"विवरण जाँचकर भुगतान करें",
  "Preferences":"पसंद की सेटिंग्स","Appearance":"दिखावट","System":"सिस्टम के अनुसार","Light":"हल्का","Dark":"गहरा",
  "Your instances":"आपके सर्वर","Active servers":"चालू सर्वर","Server controls":"सर्वर नियंत्रण",
  "Pause":"रोकें","Resume":"दोबारा चालू करें","Delete permanently":"हमेशा के लिए हटाएँ",
  "Apple":"सेब","Back":"वापस जाएँ","Payment gateway":"भुगतान का माध्यम",
  "Privacy":"गोपनीयता","Terms":"नियम और शर्तें","Help Center":"सहायता केंद्र"
 },
 es:{"Home":"Inicio","Dashboard":"Panel de control","Pricing":"Precios","Preferences":"Preferencias","Domains":"Dominios","Networking":"Redes","Language":"Idioma","Choose a language":"Elige tu idioma","Search languages":"Buscar idiomas","Currency":"Moneda","Billing country":"País de facturación","Log out":"Cerrar sesión","Log in":"Iniciar sesión","Refresh":"Actualizar","Cancel":"Cancelar","Close":"Cerrar","Create server":"Crear servidor","Total payable":"Total a pagar","Discount":"Descuento","Apple":"manzana"},
 fr:{"Home":"Accueil","Dashboard":"Tableau de bord","Pricing":"Tarifs","Preferences":"Préférences","Domains":"Domaines","Networking":"Réseau","Language":"Langue","Choose a language":"Choisissez votre langue","Search languages":"Rechercher une langue","Currency":"Devise","Billing country":"Pays de facturation","Log out":"Se déconnecter","Log in":"Se connecter","Refresh":"Actualiser","Cancel":"Annuler","Close":"Fermer","Create server":"Créer un serveur","Total payable":"Total à payer","Discount":"Réduction","Apple":"pomme"},
 de:{"Home":"Startseite","Dashboard":"Übersicht","Pricing":"Preise","Preferences":"Einstellungen","Domains":"Domains","Networking":"Netzwerk","Language":"Sprache","Choose a language":"Sprache auswählen","Search languages":"Sprachen suchen","Currency":"Währung","Billing country":"Rechnungsland","Log out":"Abmelden","Log in":"Anmelden","Refresh":"Aktualisieren","Cancel":"Abbrechen","Close":"Schließen","Create server":"Server erstellen","Total payable":"Gesamtbetrag","Discount":"Rabatt","Apple":"Apfel"},
 pt:{"Home":"Início","Dashboard":"Painel","Pricing":"Preços","Preferences":"Preferências","Domains":"Domínios","Networking":"Rede","Language":"Idioma","Choose a language":"Escolha seu idioma","Currency":"Moeda","Billing country":"País de cobrança","Log out":"Sair","Log in":"Entrar","Refresh":"Atualizar","Cancel":"Cancelar","Close":"Fechar","Create server":"Criar servidor","Total payable":"Total a pagar","Discount":"Desconto","Apple":"maçã"},
 ar:{"Home":"الرئيسية","Dashboard":"لوحة التحكم","Pricing":"الأسعار","Preferences":"التفضيلات","Domains":"النطاقات","Networking":"الشبكة","Language":"اللغة","Choose a language":"اختر لغتك","Currency":"العملة","Billing country":"بلد الفوترة","Log out":"تسجيل الخروج","Log in":"تسجيل الدخول","Refresh":"تحديث","Cancel":"إلغاء","Close":"إغلاق","Create server":"إنشاء خادم","Total payable":"المبلغ الإجمالي","Discount":"خصم","Apple":"تفاحة"},
 bn:{"Home":"হোম","Dashboard":"ড্যাশবোর্ড","Pricing":"মূল্যতালিকা","Preferences":"পছন্দসমূহ","Domains":"ডোমেইন","Language":"ভাষা","Choose a language":"আপনার ভাষা বেছে নিন","Currency":"মুদ্রা","Log out":"লগ আউট","Log in":"লগ ইন","Refresh":"আবার দেখুন","Cancel":"বাতিল","Close":"বন্ধ করুন","Create server":"সার্ভার তৈরি করুন","Total payable":"মোট পরিশোধের পরিমাণ","Discount":"ছাড়","Apple":"আপেল"},
 ru:{"Home":"Главная","Dashboard":"Панель управления","Pricing":"Цены","Preferences":"Настройки","Domains":"Домены","Language":"Язык","Choose a language":"Выберите язык","Currency":"Валюта","Log out":"Выйти","Log in":"Войти","Refresh":"Обновить","Cancel":"Отмена","Close":"Закрыть","Create server":"Создать сервер","Total payable":"К оплате","Discount":"Скидка","Apple":"яблоко"},
 zh:{"Home":"首页","Dashboard":"控制台","Pricing":"价格","Preferences":"偏好设置","Domains":"域名","Language":"语言","Choose a language":"选择语言","Currency":"货币","Log out":"退出登录","Log in":"登录","Refresh":"刷新","Cancel":"取消","Close":"关闭","Create server":"创建服务器","Total payable":"应付总额","Discount":"优惠","Apple":"苹果"},
 ja:{"Home":"ホーム","Dashboard":"ダッシュボード","Pricing":"料金","Preferences":"設定","Domains":"ドメイン","Language":"言語","Choose a language":"言語を選択","Currency":"通貨","Log out":"ログアウト","Log in":"ログイン","Refresh":"更新","Cancel":"キャンセル","Close":"閉じる","Create server":"サーバーを作成","Total payable":"お支払い合計","Discount":"割引","Apple":"りんご"},
 ko:{"Home":"홈","Dashboard":"대시보드","Pricing":"요금","Preferences":"환경설정","Domains":"도메인","Language":"언어","Choose a language":"언어 선택","Currency":"통화","Log out":"로그아웃","Log in":"로그인","Refresh":"새로고침","Cancel":"취소","Close":"닫기","Create server":"서버 만들기","Total payable":"결제 금액","Discount":"할인","Apple":"사과"},
 it:{"Home":"Home","Dashboard":"Pannello di controllo","Pricing":"Prezzi","Preferences":"Preferenze","Domains":"Domini","Language":"Lingua","Choose a language":"Scegli una lingua","Currency":"Valuta","Log out":"Esci","Log in":"Accedi","Refresh":"Aggiorna","Cancel":"Annulla","Close":"Chiudi","Create server":"Crea server","Total payable":"Totale da pagare","Discount":"Sconto","Apple":"mela"},
 tr:{"Home":"Ana sayfa","Dashboard":"Kontrol paneli","Pricing":"Fiyatlar","Preferences":"Tercihler","Domains":"Alan adları","Language":"Dil","Choose a language":"Dil seçin","Currency":"Para birimi","Log out":"Çıkış yap","Log in":"Giriş yap","Refresh":"Yenile","Cancel":"İptal","Close":"Kapat","Create server":"Sunucu oluştur","Total payable":"Ödenecek toplam","Discount":"İndirim","Apple":"elma"},
 id:{"Home":"Beranda","Dashboard":"Dasbor","Pricing":"Harga","Preferences":"Preferensi","Domains":"Domain","Language":"Bahasa","Choose a language":"Pilih bahasa","Currency":"Mata uang","Log out":"Keluar","Log in":"Masuk","Refresh":"Segarkan","Cancel":"Batal","Close":"Tutup","Create server":"Buat server","Total payable":"Total pembayaran","Discount":"Diskon","Apple":"apel"}
};
dictionaries["pt-BR"]=dictionaries.pt;dictionaries["fr-CA"]=dictionaries.fr;dictionaries["es-MX"]=dictionaries.es;dictionaries["zh-TW"]=dictionaries.zh;
export const UI_DICTIONARIES=dictionaries;
export function translateUI(source,language){
 if(language==="en"||typeof source!=="string")return source;
 if(/BabiesIQ|Railway|Razorpay|PayPal|Ubuntu|Debian/i.test(source))return source;
 const dictionary=dictionaries[language]||dictionaries[language.split("-")[0]];
 return dictionary?.[source]||source;
}
export function translationCompleteness(language){
 if(language==="en")return "original";
 return dictionaries[language]?"partial":"fallback";
}
