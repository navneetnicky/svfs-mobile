import { SuccessOverlay } from './SuccessOverlay'

type Props = { challanNo: string; onDone: () => void }

export function ChallanReceivedOverlay({ challanNo, onDone }: Props) {
  return (
    <SuccessOverlay
      referenceNumber={challanNo}
      referenceLabel="Challan No."
      headerLabel="Challan Received"
      stampText="RECEIVED"
      headerColor="#065f46"
      stampColor="#059669"
      doneLabel="Done"
      onDone={onDone}
    />
  )
}
