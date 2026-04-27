import AccountStats from "@/components/dashboard/AccountStats";

export default async function AccountOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountStats accountId={id} />;
}
