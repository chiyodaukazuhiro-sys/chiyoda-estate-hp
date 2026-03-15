import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import RequestForm from "./RequestForm";

export default async function PropertyRequestPage() {
  const auth = await getCurrentMember();
  if (!auth) redirect("/member/login");

  const member = await prisma.member.findUnique({
    where: { id: auth.memberId },
    select: { searchType: true },
  });

  return <RequestForm searchType={member?.searchType} />;
}
