var zoneNumber = 222
console.log(zoneNumber.toString().length);
var return_json = (zoneNumber.toString().length == 1) ? '00'+zoneNumber.toString() : (zoneNumber.toString().length == 2)? '0'+zoneNumber.toString(): zoneNumber.toString();
console.log(return_json);