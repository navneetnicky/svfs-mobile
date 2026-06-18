import { SuccessOverlay } from './SuccessOverlay'

type Props = { challanNo: string; onDone: () => void }

export function ChallanSuccessOverlay({ challanNo, onDone }: Props) {
  return (
    <SuccessOverlay
      referenceNumber={challanNo}
      referenceLabel="Challan No."
      headerLabel="Challan Created"
      stampText="DISPATCHED"
      headerColor="#0f4c81"
      stampColor="#0369a1"
      onDone={onDone}
    />
  )
}
