import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="absolute inset-0 border border-gold/50 rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-gold text-base font-medium tracking-wider">CE</span>
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg text-gold tracking-[0.2em] leading-tight">CHIYODA ESTATE</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="block w-4 h-px bg-gold/40" />
                  <span className="text-[10px] text-gray-400 tracking-[0.1em]">Est. 1992</span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              チヨダエステート株式会社
              <br />
              大阪府知事（8）第041469号
              <br />
              〒550-0012
              <br />
              大阪市西区立売堀1-6-2
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-4">お問い合わせ</h4>
            <p className="text-sm leading-relaxed">
              TEL：06-6539-7611
              <br />
              FAX：06-6541-7327
              <br />
              Mobile：090-6053-0712（直通）
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-4">サイトマップ</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/" className="hover:text-gold transition-colors">ホーム</Link>
              <Link href="/company" className="hover:text-gold transition-colors">会社概要</Link>
              <Link href="/services" className="hover:text-gold transition-colors">事業内容</Link>

              <Link href="/contact" className="hover:text-gold transition-colors">お問い合わせ</Link>
              <Link href="/member/login" className="hover:text-gold transition-colors">会員ログイン</Link>
            </nav>
          </div>
        </div>

        {/* Affiliations */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-400">
          <p className="mb-2">
            所属団体：（一社）大阪府宅地建物取引業協会 ／ （公社）全国宅地建物取引業保証協会大阪本部 ／ （公社）近畿地区不動産公正取引協議会
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} チヨダエステート株式会社 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
