import { SuccessOverlay } from './SuccessOverlay'

type Props = { lrNumber: string; onDone: () => void }

export function BookingSuccessOverlay({ lrNumber, onDone }: Props) {
  return (
    <SuccessOverlay
      referenceNumber={lrNumber}
      referenceLabel="LR Number"
      headerLabel="Booking Confirmed"
      stampText="BOOKED"
      headerColor="#075985"
      stampColor="#059669"
      onDone={onDone}
    />
  )
}
