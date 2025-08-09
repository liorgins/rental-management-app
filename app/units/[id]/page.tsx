import DashboardUnitClient from "./unit-client"

export default function UnitPage({ params }: { params: { id: string } }) {
  return <DashboardUnitClient id={params.id} />
}
