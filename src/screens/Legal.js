import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Header } from '../ui';
import { useTheme } from '../theme';

const DOCS = {
  privacy: {
    title: 'Gizlilik Politikası',
    sections: [
      ['Topladığımız veriler', 'Bu uygulama kişisel veri toplamaz. Girdiğin isim, istatistiklerin, başarımların ve kayıtlı oyunun yalnızca cihazında saklanır.'],
      ['Üçüncü taraflar', 'Verilerin hiçbir sunucuya gönderilmez ve üçüncü kişilerle paylaşılmaz. Uygulama reklam veya takip aracı içermez.'],
      ['Verilerini silme', 'Uygulamayı kaldırdığında tüm verilerin silinir. Profil sekmesinden çıkış yaparak adını sıfırlayabilirsin.'],
      ['İletişim', 'Sorular için uygulamanın mağaza sayfasındaki iletişim adresine yazabilirsin.'],
    ],
  },
  terms: {
    title: 'Kullanım Koşulları',
    sections: [
      ['Kullanım', 'Uygulama kişisel ve eğlence amaçlı sunulur. Ücretsiz olarak kullanabilirsin.'],
      ['Sorumluluk', 'Uygulama olduğu gibi sunulur. Beklenmedik hatalardan veya veri kaybından doğan zararlardan sorumluluk kabul edilmez.'],
      ['Değişiklikler', 'Uygulama ve bu koşullar zaman zaman güncellenebilir. Kullanmaya devam etmen güncel koşulları kabul ettiğin anlamına gelir.'],
    ],
  },
};

export default function Legal({ kind, onBack }) {
  const { c } = useTheme();
  const doc = DOCS[kind] || DOCS.privacy;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={doc.title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        {doc.sections.map(([h, t]) => (
          <View key={h} style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>{h}</Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: c.text, marginTop: 6 }}>{t}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
