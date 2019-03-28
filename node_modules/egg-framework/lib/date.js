'use strict';

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getTimeArray(date) {

    var date = new Date(date);

    var hour = date.getHours();
    var h = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    var i = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    var s = (sec < 10 ? "0" : "") + sec;

    var y = date.getFullYear();

    var month = date.getMonth() + 1;
    var m = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    var d = (day < 10 ? "0" : "") + day;

    return {'h': h, 'i': i, 's': s, 'y': y, 'm': m, 'd': d};

}

function format (format, date) {

    var date_array = getTimeArray(date || now());

    var date = "";

    for (var f = 0; f < format.length; f++) {
        var f_char = format[f];
        switch (f_char) {
            case "y":
                date += date_array.y.substr(2, 2);
                break;
            case "Y":
                date += date_array.y;
                break;
            case "m":
                date += date_array.m;
                break;
            case "M":
                date += months[date_array.m];
                break;
            case "d":
                date += date_array.d;
                break;
            case "h":
                date += date_array.h.ltrim('0');
                break;
            case "H":
                date += date_array.h;
                break;
            case "i":
                date += date_array.i;
                break;
            case "s":
                date += date_array.s;
                break;
            default :
                date += f_char;
                break;
        }
    }

    return date;

}

function now(date) {
    var date = date || new Date().getTime();
    return Math.round(new Date(date).getTime()/1000);
}

module.exports = {
    format: format,
    now: now
};