import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import EditMemberForm from "./form";

export default async function EditMemberPage() {
  const auth = await getCurrentMember();
  if (!auth) redirect("/member/login");

  const member = await prisma.member.findUnique({
    where: { id: auth.memberId },
  });

  if (!member) redirect("/member/login");

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            EDIT PROFILE
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            会員情報の編集
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <EditMemberForm member={member} />
        </div>
      </section>
    </>
  );
}
