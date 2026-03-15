import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import MemberInfo from "./member-info";
import DeleteRequestButton from "./DeleteRequestButton";

export default async function MemberDashboard() {
  const auth = await getCurrentMember();
  if (!auth) redirect("/member/login");

  const member = await prisma.member.findUnique({
    where: { id: auth.memberId },
    include: {
      requests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!member) redirect("/member/login");

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            MY PAGE
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            マイページ
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Member Info */}
          <MemberInfo member={member} />

          {/* New Request CTA */}
          <div className="text-center mb-10">
            <Link
              href="/member/request"
              className="inline-block px-8 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg"
            >
              新しい物件リクエストを送る
            </Link>
          </div>

          {/* Request History */}
          <h2 className="font-serif text-xl font-bold text-navy mb-4">
            リクエスト履歴
          </h2>

          {member.requests.length === 0 ? (
            <p className="text-gray-500 text-sm">
              まだリクエストはありません。
            </p>
          ) : (
            <div className="space-y-4">
              {member.requests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-navy">
                      {req.propertyType.replace(/,/g, " / ")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>
                      <span className="text-gray-400">目的:</span>{" "}
                      {req.purpose}
                    </p>
                    <p>
                      <span className="text-gray-400">エリア:</span>{" "}
                      {req.area}
                    </p>
                    {(req.budgetMin || req.budgetMax) && (
                      <p>
                        <span className="text-gray-400">予算:</span>{" "}
                        {req.budgetMin?.toLocaleString() ?? "―"}万円 ～{" "}
                        {req.budgetMax?.toLocaleString() ?? "―"}万円
                      </p>
                    )}
                    <p>
                      <span className="text-gray-400">緊急度:</span>{" "}
                      {req.urgency}
                    </p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <DeleteRequestButton
                      requestId={req.id}
                      propertyType={req.propertyType}
                      area={req.area}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
