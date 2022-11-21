'use strict';

class TimeInterval {
    constructor(day, url, intervals) {
        this.url = new Url(url);
        if (intervals != undefined)
            this.intervals = intervals;
        else this.intervals = [];
        this.day = day;
    }

    addInterval() {
        let date = new Date();
        let stringDate = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        this.intervals.push(stringDate + '-' + stringDate);
    }

    closeInterval() {
        let today = new Date();
        let stringDate = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        let currentInterval = this.intervals[this.intervals.length - 1];
        if (currentInterval != undefined) {
            if (currentInterval.split('-')[0] == currentInterval.split('-')[1]) {
                this.intervals.pop();
                this.intervals.push(currentInterval.split('-')[0] + '-' + stringDate);
            }
        }
    }
};