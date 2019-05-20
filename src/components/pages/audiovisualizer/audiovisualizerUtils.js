export const randomNum = (min, max) => Math.random() * (max - min) + min;

export const convertRange = (OldValue, OldMax, OldMin, NewMax, NewMin) => {
  return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
}

export function overallLoudess(array) {
  var sum = 0;
  var start = array.length * 0;
  var stop = array.length * 1;
  for (var i = start; i < stop; i++) {
    sum += parseInt(array[i]);
  }
  return { low: lowFreq(array), mid: midFreq(array), high: highFreq(array), cursor: cursorFreq(array), overall: sum / array.length }
}


function cursorFreq(array) {
  var sum = 0;
  var start = array.length * 0;
  var stop = array.length * 0.390625;
  for (var i = start; i < stop; i++) {
    sum += parseInt(array[i]);
  }
  return sum / (stop - start);
}

function highFreq(array) {
  var sum = 0;
  var start = array.length * 0.5419921875;
  var stop = array.length * 0.9326171875;
  for (var i = start; i < stop; i++) {
    sum += parseInt(array[i]);
  }
  return sum / (stop - start);
}

function midFreq(array) {
  var sum = 0;
  var start = array.length * 0.140625;
  var stop = array.length * 0.3466796875;
  for (var i = start; i < stop; i++) {
    sum += parseInt(array[i]);
  }
  return sum / (stop - start);
}

function lowFreq(array) {
  var sum = 0;
  var start = array.length * 0;
  var stop = array.length * 0.107421875;
  for (var i = start; i < stop; i++) {
    sum += parseInt(array[i]);
  }
  return sum / (stop - start);
}
