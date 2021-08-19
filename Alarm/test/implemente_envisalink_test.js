var ev = require('./envisalink_test').envisalink;
var envisalink = new ev();
envisalink.on('read',function (data) {
    console.log(data);
});
//envisalink.test('123');
setTimeout(envisalink.testfun('123'), 4000);

