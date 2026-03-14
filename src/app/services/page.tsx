import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "事業内容 | チヨダエステート株式会社",
  description: "チヨダエステートの事業内容。金融機関・士業・医療関係の皆さまとの連携を強みに、専門性の高い不動産ニーズに応える売買仲介・賃貸仲介・コンサルティング。",
};

const services = [
  {
    image: "/images/services/sales.jpg",
    title: "不動産売買仲介",
    subtitle: "Real Estate Sales",
    description:
      "金融機関・士業の皆さまからご紹介いただいた案件を中心に、開業医の土地探し、法人の社宅用物件、相続対策の資産購入など、専門性の高い不動産ニーズにきめ細かく対応いたします。",
    points: [
      "金融機関・士業からの紹介案件に強み",
      "開業医向け土地・事業用不動産",
      "相続対策・資産組み替えのご提案",
      "法人向け物件（社宅・投資用）",
    ],
  },
  {
    image: "/images/services/rental.jpg",
    title: "不動産賃貸仲介",
    subtitle: "Rental Brokerage",
    description:
      "住居・事務所・店舗・駐車場など、多種多様な賃貸物件をご紹介しております。大阪市内を中心に豊富な物件情報を取り揃え、お客様のご要望に最適な物件をお探しいたします。",
    points: [
      "住居用賃貸（アパート・マンション）",
      "事務所・オフィス",
      "店舗・商業施設",
      "駐車場・倉庫",
    ],
  },
  {
    image: "/images/services/management.jpg",
    title: "不動産管理",
    subtitle: "Property Management",
    description:
      "賃貸物件のオーナー様に代わり、入居者の募集から建物の維持管理まで、賃貸経営に関するあらゆる業務を代行いたします。オーナー様の負担を軽減し、安定した賃貸経営をサポートします。",
    points: [
      "入居者募集・審査",
      "賃料管理・集金代行",
      "建物の維持管理・修繕手配",
      "退去時の立会い・原状回復",
    ],
  },
  {
    image: "/images/services/consulting.jpg",
    title: "不動産コンサルティング",
    subtitle: "Real Estate Consulting",
    description:
      "金融機関・税理士・弁護士との連携により、不動産の有効活用、相続対策、投資戦略など専門性の高いご相談を承ります。各業界の専門家と協力し、お客様に最適なプランをご提案いたします。",
    points: [
      "金融機関と連携した資産活用提案",
      "士業ネットワークを活かした相続相談",
      "投資用不動産の情報提供・アドバイス",
      "各種手続き・関係機関との調整サポート",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">SERVICES</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">事業内容</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-700 leading-relaxed">
            当社は、金融機関・士業・医療関係の皆さまとの連携を強みに、
            <strong className="text-navy">各業界の業務で生まれる不動産ニーズ</strong>に
            専門パートナーとしてお応えする不動産会社です。
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`flex flex-col ${
                  index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } gap-8 items-center`}
              >
                {/* Image side */}
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-navy/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy/80 to-transparent">
                      <p className="font-display text-gold text-xs tracking-[0.2em] text-center">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div className="md:w-2/3">
                  <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center text-sm text-gray-700"
                      >
                        <span className="text-gold mr-3">●</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">
            まずはお気軽にご相談ください
          </h2>
          <p className="text-gray-600 mb-8">
            不動産に関するご質問・ご相談を承ります。お電話またはお問い合わせフォームよりお気軽にご連絡ください。
          </p>
          <div className="flex justify-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors"
            >
              お問い合わせフォーム
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
