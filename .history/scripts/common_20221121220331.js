let RangeForDays = {
    days2: 'days2',
    days3: 'days3',
    days4: 'days4',
    days5: 'days5',
    days6: 'days6',
    days7: 'days7',
    month1: 'month1',
    month2: 'month2',
    month3: 'month3'
};

let InactivityInterval = {
    second30: 30,
    second45: 45,
    min1: 60,
    min2: 120,
    min5: 300,
    min10: 600,
    min20: 1200,
    min30: 1800
};

let TypeListEnum = {
    ToDay: 1,
    All: 2,
    ByDays: 3,
};

let STORAGE_TABS = 'tabs';
let STORAGE_BLACK_LIST = 'black_list';
let STORAGE_RESTRICTION_LIST = 'restriction_list';
let STORAGE_NOTIFICATION_LIST = 'notification_list';
let STORAGE_NOTIFICATION_MESSAGE = 'notification_message';
let STORAGE_TIMEINTERVAL_LIST = 'time_interval';

let DEFERRED_TIMEOUT = 300000;

let SETTINGS_INTERVAL_INACTIVITY_DEFAULT = InactivityInterval.second30;
let SETTINGS_INTERVAL_CHECK_DEFAULT = 1000;
let SETTINGS_INTERVAL_SAVE_STORAGE_DEFAULT = 5000;
let SETTINGS_INTERVAL_RANGE_DEFAULT = RangeForDays.days7;
let SETTINGS_VIEW_TIME_IN_BADGE_DEFAULT = true;
let SETTINGS_BLOCK_DEFERRAL_DEFAULT = true;
let SETTINGS_DARK_MODE_DEFAULT = false;
let SETTINGS_SHOW_HINT_DEFAULT = true;
let STORAGE_NOTIFICATION_MESSAGE_DEFAULT = 'You have spent a lot of time on this site';

let SETTINGS_INTERVAL_INACTIVITY = 'inactivity_interval';
let SETTINGS_INTERVAL_SAVE_STORAGE = 'interval_save_in_storage';
let SETTINGS_INTERVAL_RANGE = 'range_days';
let SETTINGS_DARK_MODE = 'night_mode';
let SETTINGS_VIEW_TIME_IN_BADGE = 'view_time_in_badge';
let SETTINGS_BLOCK_DEFERRAL = 'view_block_deferral';
let SETTINGS_SHOW_HINT = 'show_hint';

function isEmpty(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function convertTimeToSummaryTime(time) {
    let resultTimeValue = Number(time);
    if (!isNaN(resultTimeValue)){
        return resultTimeValue;
    }

    let timeValue = time.split(':');
    let hour = timeValue[0];
    let min = timeValue[1];
    resultTimeValue = 0;
    if (hour > 0)
        resultTimeValue = hour * 3600;
    resultTimeValue += min * 60;

    return resultTimeValue;
}

function convertSummaryTimeToBadgeString(summaryTime) {
    let sec = (summaryTime);
    let min = (summaryTime / 60).toFixed(0);
    let hours = (summaryTime / (60 * 60)).toFixed(1);
    let days = (summaryTime / (60 * 60 * 24)).toFixed(0);

    if (sec < 60) {
        return sec + "s";
    } else if (min < 60) {
        return min + "m";
    } else if (hours < 24) {
        return hours + "h";
    } else {
        return days + "d"
    }
}

function convertShortSummaryTimeToString(summaryTime) {
    let hours = Math.floor(summaryTime / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);

    return hours + 'h : ' + mins + 'm';
}

function convertShortSummaryTimeToLongString(summaryTime) {
    let hours = Math.floor(summaryTime / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);

    return hours + ' hour ' + mins + ' minutes';
}

function getArrayTime(summaryTime) {
    let days = Math.floor(summaryTime / 3600 / 24);
    let totalHours = summaryTime % (3600 * 24);
    let hours = Math.floor(totalHours / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    days = zeroAppend(days);
    hours = zeroAppend(hours);
    mins = zeroAppend(mins);
    seconds = zeroAppend(seconds);

    return {
        'days': days,
        'hours': hours,
        'mins': mins,
        'seconds': seconds
    };
}

function convertSummaryTimeToString(summaryTime) {
    let days = Math.floor(summaryTime / 3600 / 24);
    let totalHours = summaryTime % (3600 * 24);
    let hours = Math.floor(totalHours / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);
    seconds = zeroAppend(seconds);

    if (days > 0)
        return days + 'd ' + hours + 'h ' + mins + 'm ' + seconds + 's';
    else return hours + 'h ' + mins + 'm ' + seconds + 's';
}

function zeroAppend(time) {
    if (time < 10)
        return '0' + time;
    else return time;
}

function isDateInRange(dateStr, range) {
    return new Date(dateStr) >= range.from && new Date(dateStr) <= range.to;
}

function isCorrectDate(range) {
    return range.from.getFullYear() >= 2019 && range.to.getFullYear() >= 2019;
}

function getDateFromRange(range) {
    switch (range) {
        case 'days2':
            return 2;
        case 'days3':
            return 3;
        case 'days4':
            return 4;
        case 'days5':
            return 5;
        case 'days6':
            return 6;
        case 'days7':
            return 7;
        case 'month1':
            return 30;
        case 'month2':
            return 60;
        case 'month3':
            return 90;
    }
}

function treatAsUTC(date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    let millisecondsPerDay = 24 * 60 * 60 * 1000;
    return ((treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay) + 1;
}

function todayLocalDate(){
    return new Date().toLocaleDateString('en-US');
}