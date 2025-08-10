import DashboardUnitClient from "./unit-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function UnitPage({ params }: Props) {
  const { id } = await params
  return <DashboardUnitClient id={id} />
}
