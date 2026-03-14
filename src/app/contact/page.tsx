"use client";

import { useActionState } from "react";
import { sendContactEmail } from "./action";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(sendContactEmail, {
    success: false,
  });

  return (
    <>
      {/* Page Header */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">CONTACT</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            お問い合わせ
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-serif text-xl font-bold text-navy mb-6">
                お問い合わせ先
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">
                    お電話でのお問い合わせ
                  </h3>
                  <a
                    href="tel:06-6539-7611"
                    className="text-2xl font-bold text-gold hover:text-gold-dark transition-colors"
                  >
                    06-6539-7611
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    直通：090-6053-0712
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">FAX</h3>
                  <p className="text-lg text-gray-600">06-6541-7327</p>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">
                    所在地
                  </h3>
                  <p className="text-sm text-gray-600">
                    〒550-0012
                    <br />
                    大阪市西区立売堀1-6-2
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">
                    営業時間
                  </h3>
                  <p className="text-sm text-gray-600">
                    9:00 ～ 18:00（定休日：日曜・祝日）
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {state.success ? (
                <div className="bg-cream rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">✉️</div>
                  <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                    お問い合わせありがとうございます
                  </h2>
                  <p className="text-gray-600 mb-6">
                    内容を確認の上、担当者よりご連絡差し上げます。
                    <br />
                    しばらくお待ちくださいませ。
                  </p>
                </div>
              ) : (
                <form action={formAction} className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-navy mb-2">
                    お問い合わせフォーム
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    <span className="text-red-500">*</span>{" "}
                    は必須項目です
                  </p>

                  {state.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                      {state.error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="例：山田 太郎"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="例：example@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="例：090-1234-5678"
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お問い合わせ種別 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="inquiryType"
                      required
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      <option value="buy">物件の購入について</option>
                      <option value="sell">物件の売却について</option>
                      <option value="rent">賃貸物件について</option>
                      <option value="manage">不動産管理について</option>
                      <option value="consult">コンサルティングについて</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お問い合わせ内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-vertical"
                      placeholder="お問い合わせ内容をご記入ください"
                    />
                  </div>

                  {/* Submit */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? "送信中..." : "送信する"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
