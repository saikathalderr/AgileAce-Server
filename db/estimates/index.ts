import { IEstimate } from '../../interfaces';

let estimates: IEstimate[] = [];

export function addEstimate(payload: IEstimate) {
  const { userId, roomId } = payload;
  const estimatedIdx = estimates.findIndex(
    (estimate: IEstimate) =>
      estimate.userId === userId && estimate.roomId === roomId
  );
  estimatedIdx === -1
    ? estimates.push(payload)
    : estimates.splice(estimatedIdx, 1, payload);
}

export function getRoomEstimates({
  roomId,
}: {
  roomId: string;
}): IEstimate[] {
  return estimates.filter(
    (estimate: IEstimate) => estimate.roomId === roomId
  );
}

export function toggleEstimateVisibility({
  roomId,
}: {
  roomId: string;
}) {
  return estimates.forEach((estimate: IEstimate) => {
    if (estimate.roomId === roomId) estimate.show = true;
  });
}

export function resetEstimates({ roomId }: { roomId: string }) {
  estimates = estimates.filter(
    (estimate: IEstimate) => estimate.roomId !== roomId
  );
}
