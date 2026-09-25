import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Sozlamalar</h1>
      <Card>
        <CardHeader><CardTitle>Magazin sozlamalari</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Rohat Tech MVP sozlamalari keyingi bosqichda S3 storage, online to‘lov va push notification konfiguratsiyasi bilan kengaytiriladi.</p>
          <p>Hozirgi versiya katalog, savat, buyurtma va admin boshqaruv oqimini ishga tushirishga tayyor.</p>
        </CardContent>
      </Card>
    </div>
  );
}
