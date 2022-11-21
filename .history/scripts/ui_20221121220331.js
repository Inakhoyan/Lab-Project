'use strict';

class UI {
    getTableOfSite() {
        return document.getElementById('resultTable');
    }

    setUIForToday() {
        document.getElementById('btnToday').classList.add('active');
        document.getElementById('btnByDays').classList.remove('active');
        document.getElementById('blockForChartBtn').classList.remove('hide');
        document.getElementById('labelForTimeInterval').classList.add('hide');
        this.setUIForDonutChart();

        this.clearUI();
    }

    setUIForAll() {
        document.getElementById('btnToday').classList.remove('active');
        document.getElementById('btnByDays').classList.remove('active');
        document.getElementById('blockForChartBtn').classList.add('hide');
        document.getElementById('labelForTimeInterval').classList.add('hide');

        this.clearUI();
    }

    setUIForByDays(range) {
        document.getElementById('btnByDays').classList.add('active');
        document.getElementById('btnToday').classList.remove('active');
        document.getElementById('blockForChartBtn').classList.add('hide');
        document.getElementById('labelForTimeInterval').classList.add('hide');

        this.clearUI();
        this.addBlockForCalendar(range);
    }

    clearUI() {
        document.getElementById('resultTable').innerHTML = null;
        document.getElementById('chart').innerHTML = null;
        document.getElementById('timeChart').innerHTML = null;
        document.getElementById('total').innerHTML = null;
        document.getElementById('byDays').innerHTML = null;
    }

    setUIForDonutChart() {
        document.getElementById('donutChartBtn').classList.add('active');
        document.getElementById('heatMapChartBtn').classList.remove('active');
        document.getElementById('timeChart').innerHTML = null;
        document.getElementById('labelForTimeInterval').classList.add('hide');
    }

    setUIForTimeChart() {
        document.getElementById('donutChartBtn').classList.remove('active');
        document.getElementById('heatMapChartBtn').classList.add('active');
        document.getElementById('chart').innerHTML = null;
        document.getElementById('labelForTimeInterval').classList.remove('hide');
    }

    createTotalBlock(totalTime, currentTypeOfList, counter) {
        let totalElement = document.getElementById('total');

        let spanVisits = this.createElement('span', ['span-visits', 'tooltip', 'visits'], counter !== undefined ? counter : 0);
        let visitsTooltip = this.createElement('span', ['tooltiptext'], 'Count of visits');
        spanVisits.appendChild(visitsTooltip);

        let spanPercentage = this.createElement('span', ['span-percentage'], '100 %');

        let div = this.createElement('div', ['margin-left-5', 'total-block'], 'Total');
        let span = this.createElement('span', ['span-time']);
        this.createElementsForTotalTime(totalTime, currentTypeOfList, span);

        this.appendChild(totalElement, [div, spanVisits, spanPercentage, span]);
    }

    fillEmptyBlock(elementName) {
        document.getElementById(elementName).innerHTML = '<p class="no-data">No data</p>';
    }

    fillEmptyBlockForDaysIfInvalid() {
        document.getElementById('tableForDaysBlock').innerHTML = '<p class="no-data">Invalid date</p>';
    }

    fillEmptyBlockForDays() {
        document.getElementById('tableForDaysBlock').innerHTML = '<p class="no-data">No data</p>';
    }

    addHrAfterChart() {
        document.getElementById('chart').appendChild(document.createElement('hr'));
    }

    addHrAfterTableOfSite() {
        this.getTableOfSite().appendChild(document.createElement('hr'));
    }

    setActiveTooltip(currentTab) {
        if (!!currentTab) {
            const host = currentTab.host;
            let element = document.getElementById(host);
            if (element !== null) {
                let event = new Event("mouseenter");
                document.getElementById(host).dispatchEvent(event);
            }
        }
    }

    drawChart(tabs) {
        let donut = donutChart()
            .width(550)
            .height(230)
            .cornerRadius(5) // sets how rounded the corners are on each slice
            .padAngle(0.020) // effectively dictates the gap between slices
            .letiable('percentage')
            .category('url');

        if (setting_dark_mode)
            donut.darkMode(true);
        else donut.darkMode(false);

        d3.select('#chart')
            .datum(tabs) // bind data to the div
            .call(donut); // draw chart in div
    }

    drawTimeChart(tabs) {
        drawIntervalChart(tabs);
    }

    drawBarChart(days) {
        d3.select('#barChart').datum(days);
        barChart(days);
    }

    addTableHeader(currentTypeOfList, counterOfSite, totalTime, totalDays) {
        function fillSummaryTime(totalTime){
            let arrayTime = getArrayTime(totalTime);
            let stringTime = '';
            if (arrayTime.days > 0) stringTime += arrayTime.days + ' days ';
            stringTime += arrayTime.hours + ' hours ';
            stringTime += arrayTime.mins + ' minutes ';
            return stringTime;
        }

        let p = document.createElement('p');
        p.classList.add('table-header');
        if (currentTypeOfList === TypeListEnum.ToDay)
            p.innerHTML = 'Today (' + counterOfSite + ' sites) <br> <strong>' + convertShortSummaryTimeToLongString(totalTime) + '</strong>';
        if (currentTypeOfList === TypeListEnum.All && totalDays !== undefined) {
            if (totalDays.countOfDays > 0) {
                p.innerHTML = 'Aggregate data since ' + new Date(totalDays.minDate).toLocaleDateString() + ' (' + totalDays.countOfDays + ' days) (' + counterOfSite + ' sites) <br> <strong>' + fillSummaryTime(totalTime)  + '</strong>';
            } else {
                p.innerHTML = 'Aggregate data since ' + new Date().toLocaleDateString() + ' (' + counterOfSite + ' sites) <br>  <strong>' + convertShortSummaryTimeToLongString(totalTime)  + '</strong>';
            }
        }

        this.getTableOfSite().appendChild(p);
    }

    addLineToTableOfSite(tab, currentTab, summaryTime, typeOfList, counter, blockName) {
        let div = document.createElement('div');
        let tabUrlString = tab.url.host;
        div.addEventListener('mouseenter', function() {
            if (document.getElementById('chart').innerHTML !== '') {
                let item = document.getElementById(tabUrlString);
                if (item !== null) {
                    item.dispatchEvent(new Event('mouseenter'));
                    item.classList.add('mouse-over');
                } else {
                    document.getElementById('Others').dispatchEvent(new Event('mouseenter'));
                    document.getElementById('Others').classList.add('mouse-over');
                }
            }
        });
        div.addEventListener('mouseout', function() {
            if (document.getElementById('chart').innerHTML !== '') {
                let item = document.getElementById(tabUrlString);
                if (item !== null) {
                    item.classList.remove('mouse-over');
                } else document.getElementById('Others').classList.remove('mouse-over');
            }
        });
        div.classList.add('inline-flex');

        let divForImg = document.createElement('div');
        let img = document.createElement('img');
        img.setAttribute('height', 17);
        if (tab.favicon !== undefined || tab.favicon == null)
            img.setAttribute('src', tab.favicon);
        else img.setAttribute('src', '/icons/empty.png');
        divForImg.classList.add('block-img');
        divForImg.appendChild(img);

        let spanUrl = this.createElement('span', ['span-url'], tabUrlString);
        spanUrl.setAttribute('href', 'https://' + tabUrlString);

        if (tab.url.isMatch(currentTab)) {
            let divForImage = document.createElement('div');
            div.classList.add('span-active-url');
            let imgCurrentDomain = document.createElement('img');
            imgCurrentDomain.setAttribute('src', '/icons/eye.png');
            imgCurrentDomain.setAttribute('height', 17);
            imgCurrentDomain.classList.add('margin-left-5');
            divForImage.appendChild(imgCurrentDomain);
            let currentDomainTooltip = this.createElement('span', ['tooltiptext'], 'Current domain');
            divForImage.classList.add('tooltip', 'current-url');
            divForImage.appendChild(currentDomainTooltip);
            spanUrl.appendChild(divForImage);
        }

        if (typeOfList !== undefined && typeOfList === TypeListEnum.ToDay) {
            if (restrictionList !== undefined && restrictionList.length > 0) {
                this.addRestrictionIcon(tab, restrictionList, spanUrl);
            } else {
                getLimitsListFromStorage(() => this.addRestrictionIcon(tab, restrictionList, spanUrl));
            }
        }

        let spanVisits = this.createElement('span', ['span-visits', 'tooltip', 'visits'], counter !== undefined ? counter : 0);
        let visitsTooltip = this.createElement('span', ['tooltiptext'], 'Count of visits');

        spanVisits.appendChild(visitsTooltip);

        let spanPercentage = this.createElement('span', ['span-percentage'], getPercentage(summaryTime));
        let spanTime = this.createElement('span', ['span-time']);
        this.createElementsForTotalTime(summaryTime, typeOfList, spanTime);

        div = this.appendChild(div, [divForImg, spanUrl, spanVisits, spanPercentage, spanTime]);
        if (blockName !== undefined)
            document.getElementById(blockName).appendChild(div);
        else
            this.getTableOfSite().appendChild(div);
    }

    addRestrictionIcon(tab, restrictions, spanUrl) {
        let item = restrictions.find(x => x.url.isMatch(tab.url));
        if (item !== undefined) {
            let divLimit = this.createElement('div', ['tooltip', 'inline-block']);
            let limitIcon = this.createElement('img', ['margin-left-5', 'tooltip']);
            limitIcon.height = 15;
            limitIcon.src = '/icons/limit.png';
            let tooltip = this.createElement('span', ['tooltiptext'], "Daily limit is " + convertShortSummaryTimeToLongString(item.time));
            divLimit = this.appendChild(divLimit, [limitIcon, tooltip]);
            spanUrl.appendChild(divLimit);
        }
    }

    createElementsForTotalTime(summaryTime, typeOfList, parentElement) {
        let arr = getArrayTime(summaryTime);
        let isNextPartActiv = false;
        let getCssClass = function(item) {
            if (item > 0) {
                isNextPartActiv = true;
                return ['span-active-time'];
            } else {
                if (isNextPartActiv)
                    return ['span-active-time'];
                return null;
            }
        };
        if (typeOfList === TypeListEnum.All) {
            let spanForDays = this.createElement('span', getCssClass(arr.days), arr.days + 'd ');
            this.appendChild(parentElement, [spanForDays]);
        }
        let spanForHour = this.createElement('span', getCssClass(arr.hours), arr.hours + 'h ');
        let spanForMin = this.createElement('span', getCssClass(arr.mins), arr.mins + 'm ');
        let spanForSec = this.createElement('span', getCssClass(arr.seconds), arr.seconds + 's ');
        this.appendChild(parentElement, [spanForHour, spanForMin, spanForSec]);
    }

    addExpander() {
        if (document.getElementById('expander') === null) {
            let div = this.createElement('div', ['expander'], 'Show all');
            div.id = 'expander';
            div.addEventListener('click', function() {
                ui.expand();
            });
            this.getTableOfSite().appendChild(div);
        }
    }

    expand() {
        getTabsForExpander();
        this.getTableOfSite().removeChild(document.getElementById('expander'));
    }

    addBlockForCalendar(range) {
        let div = document.getElementById('byDays');
        let barChart = document.createElement('div');
        barChart.id = 'barChart';

        let from = this.createElement('span', null, 'From');
        let to = this.createElement('span', null, 'To');

        let calendarFirst = document.createElement('input');
        calendarFirst.id = 'dateFrom';
        calendarFirst.type = 'date';
        let previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - getDateFromRange(range));
        calendarFirst.valueAsDate = new Date(Date.UTC(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate()));

        let calendarTwo = document.createElement('input');
        calendarTwo.id = 'dateTo';
        calendarTwo.type = 'date';
        calendarTwo.valueAsDate = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

        let tableForDaysBlock = document.createElement('div');
        tableForDaysBlock.id = 'tableForDaysBlock';

        div = this.appendChild(div, [barChart, from, calendarFirst, to, calendarTwo]);

        div.append(tableForDaysBlock);

        document.getElementById('dateFrom').addEventListener('change', function() {
            getTabsByDays(tabsFromStorage);
        });

        document.getElementById('dateTo').addEventListener('change', function() {
            getTabsByDays(tabsFromStorage);
        });
    }

    getDateRange() {
        return {
            'from': new Date(document.getElementById('dateFrom').value  + ' '),
            'to': new Date(document.getElementById('dateTo').value  + ' ')
        };
    }

    fillListOfDays(days, allDays) {
        let parent = document.getElementById('tableForDaysBlock');
        parent.innerHTML = null;
        document.getElementById('barChart').innerHTML = null;
        if (days.length > 0) {
            let daysForBarChart = this.fillDaysForBarChart(days, allDays);
            this.drawBarChart(daysForBarChart);

            let header = this.createElement('div', ['table-header']);

            let headerTitleDate = this.createElement('span', ['header-title-day'], 'Day');
            let headerTitleTime = this.createElement('span', ['header-title-time'], 'Summary time');

            header = this.appendChild(header, [headerTitleDate, headerTitleTime]);
            parent.appendChild(header);

            for (let i = 0; i < days.length; i++) {
                let check = this.createElement('input', ['toggle']);
                check.type = 'checkbox';
                check.id = days[i].date;

                let label = this.createElement('label', ['day-block', 'lbl-toggle']);
                label.setAttribute('for', days[i].date);
                let span = this.createElement('span', ['day'], new Date(days[i].date).toLocaleDateString());
                let spanTime = this.createElement('span', ['span-time']);
                this.createElementsForTotalTime(days[i].total, TypeListEnum.ByDays, spanTime);

                label = this.appendChild(label, [span, spanTime]);
                parent = this.appendChild(parent, [check, label]);

                let div = this.createElement('div', ['collapsible-content'], convertSummaryTimeToString(days[i].total));
                div.id = days[i].date + '_block';
                parent.appendChild(div);

                document.getElementById(days[i].date).addEventListener('click', function() {
                    let element = document.getElementById(this.id + '_block');
                    element.innerHTML = null;
                    getTabsFromStorageByDay(this.id, this.id + '_block')
                });
            }

        } else {
            this.fillEmptyBlock('tableForDaysBlock');
        }
    }

    fillDaysForBarChart(days, allDays) {
        let resultList = [];
        allDays.forEach(element => {
            let day = days.find(x => x.date == element);
            if (day !== undefined) {
                resultList.push({
                    'date': day.date,
                    'total': day.total
                });
            } else resultList.push({
                'date': element,
                'total': 0
            });
        });

        return resultList;
    }

    createElement(type, css, innerText) {
        let element = document.createElement(type);
        if (css !== undefined && css !== null) {
            for (let i = 0; i < css.length; i++)
                element.classList.add(css[i]);
        }
        if (innerText !== undefined)
            element.innerHTML = innerText;

        return element;
    }

    appendChild(element, children) {
        for (let i = 0; i < children.length; i++)
            element.appendChild(children[i]);

        return element;
    }

    setPreloader() {
        document.getElementById('preloader').classList.add('preloader');
    }

    setMode(){
        if (setting_dark_mode)
            document.body.classList.add('night-mode');
    }

    removePreloader() {
        document.getElementById('preloader').classList.remove('preloader');
        document.getElementById('preloader').classList.add('hide');
    }
}