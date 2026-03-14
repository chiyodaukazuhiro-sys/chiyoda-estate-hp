import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "会社概要 | チヨダエステート株式会社",
  description: "チヨダエステート株式会社の会社概要。大阪市西区立売堀を拠点に不動産売買・賃貸仲介を行っております。",
};

export default function CompanyPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">COMPANY</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">会社概要</h1>
        </div>
      </section>

      {/* Company Info Table */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <tbody>
                {[
                  ["商号", "チヨダエステート株式会社"],
                  ["英語表記", "CHIYODA ESTATE Co., Ltd."],
                  ["代表者", "上田 正子"],
                  ["免許番号", "大阪府知事（8）第041469号"],
                  ["初回免許年月日", "1992年（平成4年）6月10日"],
                  ["免許有効期間", "2023年6月11日 ～ 2028年6月10日"],
                  ["所在地", "〒550-0012\n大阪市西区立売堀1-6-2"],
                  ["TEL", "06-6539-7611"],
                  ["FAX", "06-6541-7327"],
                  ["Mobile", "090-6053-0712（直通）"],
                  [
                    "事業内容",
                    "不動産売買仲介\n不動産賃貸仲介（住居・事務所・店舗・駐車場）\n不動産管理\n不動産コンサルティング",
                  ],
                  [
                    "所属団体",
                    "（一社）大阪府宅地建物取引業協会\n（公社）全国宅地建物取引業保証協会 大阪本部\n（公社）近畿地区不動産公正取引協議会",
                  ],
                  ["所属支部", "西支部"],
                  ["最寄り駅", "Osaka Metro 四つ橋線「本町」駅"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 last:border-b-0">
                    <th className="bg-navy text-white text-left px-6 py-4 w-40 sm:w-52 font-medium text-sm align-top whitespace-nowrap">
                      {label}
                    </th>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-pre-line">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Message from Representative */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">MESSAGE</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              ごあいさつ
            </h2>
          </div>
          <div className="bg-white p-8 sm:p-12 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-loose text-sm sm:text-base">
              チヨダエステート株式会社は、1992年の創業以来、大阪市西区を拠点に
              不動産業務に携わってまいりました。
            </p>
            <p className="text-gray-700 leading-loose text-sm sm:text-base mt-4">
              当社の特色は、金融機関・士業・医療関係の皆さまと連携し、
              <strong>各業界の業務で生まれる不動産のご相談</strong>に
              専門パートナーとしてお応えすることです。
              「お客様から不動産の相談を受けたが、信頼できる紹介先がない」――
              そんなお声にお応えできる存在でありたいと考えております。
            </p>
            <p className="text-gray-700 leading-loose text-sm sm:text-base mt-4">
              開業医の土地探し、法人の社宅用物件、相続対策の資産購入など、
              専門性の高い不動産ニーズに数多くお応えしてまいりました。
              30年超の実績と丁寧な対応が、各業界の皆さまからの信頼につながっております。
            </p>
            <p className="text-right mt-8 text-navy font-serif font-bold">
              代表取締役　上田 正子
            </p>
          </div>
        </div>
      </section>

      {/* Access Map */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">ACCESS</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              アクセス
            </h2>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.4938!3d34.6823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e71c8e1f7fff%3A0x0!2z5aSn6Ziq5biC6KW_5Yy656uL5aOy5aCA77yR5LiB55uu77yW!5e0!3m2!1sja!2sjp!4v1710000000000"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="チヨダエステート所在地"
            />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Osaka Metro 四つ橋線「本町」駅 23番出口より徒歩約3分
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
