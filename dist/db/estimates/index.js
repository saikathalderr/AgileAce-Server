"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEstimates = exports.toggleEstimateVisibility = exports.getRoomEstimates = exports.addEstimate = void 0;
let estimates = [];
function addEstimate(payload) {
    const { userId, roomId } = payload;
    const estimatedIdx = estimates.findIndex((estimate) => estimate.userId === userId && estimate.roomId === roomId);
    estimatedIdx === -1
        ? estimates.push(payload)
        : estimates.splice(estimatedIdx, 1, payload);
}
exports.addEstimate = addEstimate;
function getRoomEstimates({ roomId, }) {
    return estimates.filter((estimate) => estimate.roomId === roomId);
}
exports.getRoomEstimates = getRoomEstimates;
function toggleEstimateVisibility({ roomId, }) {
    return estimates.forEach((estimate) => {
        if (estimate.roomId === roomId)
            estimate.show = true;
    });
}
exports.toggleEstimateVisibility = toggleEstimateVisibility;
function resetEstimates({ roomId }) {
    estimates = estimates.filter((estimate) => estimate.roomId !== roomId);
}
exports.resetEstimates = resetEstimates;
