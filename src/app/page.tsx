import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-navy text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <p className="font-display text-gold text-sm tracking-[0.3em] mb-4">
              CHIYODA ESTATE
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              各業界の
              <span className="text-gold">不動産パートナー</span>
              <br />
              として、お力になります
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              金融機関・士業・医療関係の皆さまへ――
              <br className="hidden sm:inline" />
              本業の中で生まれる不動産のご相談、専門家としてお引き受けします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors duration-200"
              >
                ご紹介・ご相談はこちら
              </Link>
              <Link
                href="/services"
                className="inline-block px-8 py-3 border-2 border-gold text-gold font-bold rounded hover:bg-gold hover:text-navy transition-colors duration-200"
              >
                事業内容を見る
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto fill-cream">
            <path d="M0,40 C360,80 720,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Partner Appeal Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">FOR PARTNERS</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              こんなお困りごとはありませんか？
            </h2>
          </div>

          {/* ターゲット別の課題提示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-navy rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-navy text-center mb-4">
                金融機関の方へ
              </h3>
              <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                <li>「融資先のお客様から不動産の相談を受けたが、紹介先がない」</li>
                <li>「相続案件で不動産の処分・購入が絡むが、信頼できる業者を探している」</li>
                <li>「取引先企業の社宅探しを手伝いたい」</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-navy rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-navy text-center mb-4">
                士業の方へ
              </h3>
              <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                <li>「顧問先の相続対策で不動産の組み替えを提案したい」</li>
                <li>「離婚案件・破産案件で不動産の売却が必要になった」</li>
                <li>「クライアントの資産活用について不動産の専門家に相談したい」</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-navy rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-navy text-center mb-4">
                医療関係の方へ
              </h3>
              <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                <li>「開業を検討中のドクターに土地・物件情報を紹介したい」</li>
                <li>「医療法人の移転・拡張に伴う物件を探している」</li>
                <li>「ドクターの資産運用として不動産投資の相談がある」</li>
              </ul>
            </div>
          </div>

          {/* 連携フロー */}
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12">
            <h3 className="font-serif text-xl font-bold text-navy text-center mb-8">
              ご紹介からご成約までの流れ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {[
                { step: "01", title: "ご紹介", desc: "お客様の不動産ニーズをお知らせください", icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" },
                { step: "02", title: "ヒアリング", desc: "ご紹介先のお客様と直接面談し、詳細を確認", icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
                { step: "03", title: "物件提案", desc: "条件に合う物件を調査・ご提案", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
                { step: "04", title: "ご成約", desc: "契約・引渡しまで一貫サポート。ご紹介元にもご報告", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-navy rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <div className="text-gold font-display text-xs tracking-widest mb-1">STEP {item.step}</div>
                  <h4 className="font-serif font-bold text-navy mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Chiyoda Estate */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">WHY US</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              選ばれる理由
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-lg p-6 border-t-4 border-gold">
              <div className="text-gold text-3xl font-display font-bold mb-3">01</div>
              <h3 className="font-serif text-lg font-bold text-navy mb-3">
                専門ニーズへの対応力
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                開業医の土地探し、法人社宅、相続対策の資産購入など、
                専門性の高い不動産ニーズに豊富な実績があります。
                一般的な物件検索では見つからない案件もお任せください。
              </p>
            </div>
            <div className="rounded-lg p-6 border-t-4 border-gold">
              <div className="text-gold text-3xl font-display font-bold mb-3">02</div>
              <h3 className="font-serif text-lg font-bold text-navy mb-3">
                ご紹介元への丁寧な報告
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                進捗状況を随時ご報告し、ご紹介元の信頼を損なわない対応を徹底。
                お客様との関係を大切にされる皆さまに安心してご紹介いただけます。
              </p>
            </div>
            <div className="rounded-lg p-6 border-t-4 border-gold">
              <div className="text-gold text-3xl font-display font-bold mb-3">03</div>
              <h3 className="font-serif text-lg font-bold text-navy mb-3">
                30年超の信頼と実績
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                1992年の創業以来、大阪を拠点に不動産業務に携わってまいりました。
                免許更新8回の実績が、長年の信頼の証です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proposal Sample Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">PROPOSAL SAMPLE</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy mb-4">
              提案資料のご紹介
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              ご紹介パートナー様にお渡ししている提案資料の一部をご覧いただけます。
              <br className="hidden sm:inline" />
              無料の物件探し代行サービスから、ご成約までの流れをまとめています。
            </p>
          </div>

          {/* Proposal Pages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {[
              { src: "/images/proposal/proposal-1.jpg", label: "サービスのご紹介", desc: "物件探し代行・無料サービス・対応エリアのご案内" },
              { src: "/images/proposal/proposal-2.jpg", label: "ご紹介の流れ・メリット", desc: "4ステップの紹介フローと御社にとってのメリット" },
              { src: "/images/proposal/proposal-3.jpg", label: "会社概要・お問い合わせ", desc: "当社の強みと連絡先のご案内" },
            ].map((page, i) => (
              <div key={i} className="group">
                <div className="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 group-hover:shadow-xl group-hover:border-gold/30 transition-all duration-300">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={page.src}
                      alt={page.label}
                      fill
                      className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-gold font-display text-xs tracking-widest mb-1">PAGE {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-serif text-base font-bold text-navy mb-1">{page.label}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{page.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white font-bold rounded hover:bg-navy-light transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              資料請求・お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Member CTA Banner */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-r from-navy-dark via-navy to-navy-dark overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 border border-gold rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 border border-gold rotate-45" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block border border-gold/30 rounded-full px-4 py-1 mb-6">
            <span className="font-display text-gold text-xs tracking-[0.3em]">MEMBER</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            会員登録で、<span className="text-gold">物件リクエスト</span>が可能に
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            ご希望の条件をフォームから送信いただくだけで、
            <br className="hidden sm:inline" />
            当社の独自ネットワークから条件に合う物件情報をお届けします。
            <br className="hidden sm:inline" />
            登録は無料・最短30秒で完了します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/member/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light transition-colors text-lg shadow-lg shadow-gold/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              無料会員登録
            </Link>
            <Link
              href="/member/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-gold/60 text-gold font-bold rounded-lg hover:bg-gold/10 transition-colors"
            >
              会員の方はログイン
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-display text-gold text-sm tracking-[0.2em] mb-2">SERVICES</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              事業内容
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: "/images/services/sales.jpg",
                title: "不動産売買仲介",
                desc: "ご紹介いただいたお客様の購入・売却ニーズに、物件調査から契約・引渡しまで一貫対応いたします。",
              },
              {
                image: "/images/services/rental.jpg",
                title: "不動産賃貸仲介",
                desc: "法人の社宅・事務所探しから個人の住居まで、多様な賃貸ニーズにお応えします。",
              },
              {
                image: "/images/services/consulting.jpg",
                title: "不動産コンサルティング",
                desc: "相続対策・資産活用・投資戦略など、士業・金融機関との連携案件を得意としております。",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="group rounded-lg border border-gray-100 bg-white hover:border-gold hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-navy/20" />
                </div>
                <div className="text-center p-6">
                  <h3 className="font-serif text-xl font-bold text-navy mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="text-gold hover:text-gold-dark font-medium transition-colors"
            >
              事業内容をもっと見る →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6">
            不動産のご相談は
            <span className="text-gold">チヨダエステート</span>へ
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            「お客様から不動産の相談を受けたけれど、どこに紹介すればいいか分からない」
            <br />
            そんなときは、まずお気軽にご連絡ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:06-6539-7611"
              className="flex items-center gap-2 text-xl font-bold text-gold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              06-6539-7611
            </a>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors"
            >
              ご紹介・お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
