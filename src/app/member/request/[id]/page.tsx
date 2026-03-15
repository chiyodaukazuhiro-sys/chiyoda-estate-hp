import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import MemberRequestDetail from "./MemberRequestDetail";

export default async function MemberRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getCurrentMember();
  if (!auth) redirect("/member/login");

  const { id } = await params;
  const req = await prisma.propertyRequest.findUnique({
    where: { id },
  });

  if (!req || req.memberId !== auth.memberId) notFound();

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            REQUEST DETAIL
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            リクエスト詳細
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/member"
            className="text-sm text-gray-500 hover:text-navy mb-6 inline-block"
          >
            ← マイページに戻る
          </Link>

          <MemberRequestDetail req={{
            id: req.id,
            propertyType: req.propertyType,
            purpose: req.purpose,
            area: req.area,
            excludeArea: req.excludeArea,
            budgetMin: req.budgetMin,
            budgetMax: req.budgetMax,
            yieldMin: req.yieldMin,
            landAreaMin: req.landAreaMin,
            buildingAreaMin: req.buildingAreaMin,
            maxAge: req.maxAge,
            structure: req.structure,
            parking: req.parking,
            urgency: req.urgency,
            notes: req.notes,
            delegateInfo: req.delegateInfo,
            createdAt: req.createdAt.toISOString(),
          }} />
        </div>
      </section>
    </>
  );
}
