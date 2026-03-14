"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitPropertyRequest } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";
const checkboxClass =
  "w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold";

const PROPERTY_TYPES = ["土地", "マンション", "一戸建", "収益物件", "事業用"];
const PURPOSES = ["自己居住", "投資", "事業用", "社宅", "開業", "その他"];
const STRUCTURES = ["指定なし", "RC", "SRC", "S造", "木造"];
const PARKING_OPTIONS = ["あれば可", "必要", "不要"];
const URGENCY_OPTIONS = ["情報収集中", "半年以内", "3ヶ月以内", "急ぎ"];

export default function PropertyRequestPage() {
  const [state, formAction, isPending] = useActionState(
    submitPropertyRequest,
    { success: false }
  );

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            PROPERTY REQUEST
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            物件リクエスト
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {state.success ? (
            <div className="bg-cream rounded-lg p-12 text-center">
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                リクエストを受け付けました
              </h2>
              <p className="text-gray-600 mb-6">
                ご希望の条件をもとに、物件情報をお探しいたします。
                <br />
                該当物件が見つかり次第、ご連絡差し上げます。
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/member/request"
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors"
                >
                  別のリクエストを送る
                </Link>
                <Link
                  href="/member"
                  className="px-6 py-2 border border-navy text-navy font-bold rounded hover:bg-gray-50 transition-colors"
                >
                  マイページへ
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-8 text-center">
                ご希望の物件条件をご入力ください。独自のネットワークで条件に合う物件をお探しいたします。
                <br />
                <span className="text-red-500">*</span> は必須項目です
              </p>

              <form action={formAction} className="space-y-8">
                {state.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                    {state.error}
                  </div>
                )}

                {/* Property Type - Checkboxes */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    物件種別 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {PROPERTY_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          name="propertyType"
                          value={type}
                          className={checkboxClass}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    利用目的 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {PURPOSES.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="purpose"
                          value={p}
                          className="w-4 h-4 text-gold border-gray-300 focus:ring-gold"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-1">
                    希望エリア <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    市区町村名や沿線名をご入力ください（複数可）
                  </p>
                  <input
                    type="text"
                    name="area"
                    required
                    className={inputClass}
                    placeholder="例：大阪市中央区、西区 / 御堂筋線沿線"
                  />
                </div>

                {/* Exclude Area */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-1">
                    除外エリア
                  </label>
                  <input
                    type="text"
                    name="excludeArea"
                    className={inputClass}
                    placeholder="例：○○町は除く"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    予算（万円）
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      name="budgetMin"
                      className={inputClass}
                      placeholder="下限"
                      min={0}
                    />
                    <span className="text-gray-500 shrink-0">～</span>
                    <input
                      type="number"
                      name="budgetMax"
                      className={inputClass}
                      placeholder="上限"
                      min={0}
                    />
                  </div>
                </div>

                {/* Yield */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-1">
                    希望利回り（収益物件の場合）
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="yieldMin"
                      className={inputClass + " max-w-32"}
                      placeholder="例：6"
                      min={0}
                      step={0.1}
                    />
                    <span className="text-gray-500">% 以上</span>
                  </div>
                </div>

                {/* Area Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-navy mb-1">
                      土地面積
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="landAreaMin"
                        className={inputClass}
                        placeholder="例：100"
                        min={0}
                      />
                      <span className="text-gray-500 shrink-0">㎡以上</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy mb-1">
                      建物面積
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="buildingAreaMin"
                        className={inputClass}
                        placeholder="例：80"
                        min={0}
                      />
                      <span className="text-gray-500 shrink-0">㎡以上</span>
                    </div>
                  </div>
                </div>

                {/* Max Age */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-1">
                    築年数
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="maxAge"
                      className={inputClass + " max-w-32"}
                      placeholder="例：20"
                      min={0}
                    />
                    <span className="text-gray-500">年以内</span>
                  </div>
                </div>

                {/* Structure */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    構造
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {STRUCTURES.map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="structure"
                          value={s}
                          defaultChecked={s === "指定なし"}
                          className="w-4 h-4 text-gold border-gray-300 focus:ring-gold"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Parking */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    駐車場
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {PARKING_OPTIONS.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="parking"
                          value={p}
                          defaultChecked={p === "あれば可"}
                          className="w-4 h-4 text-gold border-gray-300 focus:ring-gold"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-3">
                    緊急度 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {URGENCY_OPTIONS.map((u) => (
                      <label key={u} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="urgency"
                          value={u}
                          required
                          className="w-4 h-4 text-gold border-gray-300 focus:ring-gold"
                        />
                        {u}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-navy mb-1">
                    その他ご要望
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    className={inputClass + " resize-vertical"}
                    placeholder="ご希望の条件やご質問がありましたらご記入ください"
                  />
                </div>

                {/* Submit */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "送信中..." : "リクエストを送信する"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
