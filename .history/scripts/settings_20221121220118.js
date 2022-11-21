let storage = new LocalStorage();
let blackList = [];
let restrictionList = [];
let notifyList = [];
let blockBtnList = ['settingsBtn', 'restrictionsBtn'];
let blockList = ['settingsBlock', 'restrictionsBlock'];



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('settingsBtn').addEventListener('click', function () {
        setBlockEvent('settingsBtn', 'settingsBlock');
    });
    document.getElementById('restrictionsBtn').addEventListener('click', function () {
        setBlockEvent('restrictionsBtn', 'restrictionsBlock');
    });
    document.getElementById('addBlackSiteBtn').addEventListener('click', function () {
        addNewSiteClickHandler('addBlackSiteLbl', null, actionAddBlackSiteToList, 'notifyForBlackList');
    });
    document.getElementById('addRestrictionSiteBtn').addEventListener('click', function () {
        addNewSiteClickHandler('addRestrictionSiteLbl', 'addRestrictionTimeLbl', actionAddRectrictionToList, 'notifyForRestrictionList');
    });
    document.getElementById('viewTimeInBadge').addEventListener('change', function () {
        storage.saveValue(SETTINGS_VIEW_TIME_IN_BADGE, this.checked);
    });
    document.getElementById('blockDeferral').addEventListener('change', function () {
        storage.saveValue(SETTINGS_BLOCK_DEFERRAL, this.checked);
    });
    document.getElementById('darkMode').addEventListener('change', function () {
        storage.saveValue(SETTINGS_DARK_MODE, this.checked);
    });
    document.getElementById('intervalInactivity').addEventListener('change', function () {
        storage.saveValue(SETTINGS_INTERVAL_INACTIVITY, this.value);
    });
    document.getElementById('rangeToDays').addEventListener('change', function () {
        storage.saveValue(SETTINGS_INTERVAL_RANGE, this.value);
    });
    document.getElementById('grantPermissionForYT').addEventListener('click', function () {
        grantPermissionForYT();
    });
    document.getElementById('grantPermissionForNetflix').addEventListener('click', function () {
        grantPermissionForNetflix();
    });
    $('.clockpicker').clockpicker();

});

function setBlockEvent(btnName, blockName) {
    blockBtnList.forEach(element => {
        if (element === btnName) {
            document.getElementById(btnName).classList.add('active');
        }
        else document.getElementById(element).classList.remove('active');
    });

    blockList.forEach(element => {
        if (element === blockName) {
            document.getElementById(blockName).hidden = false;
        } else document.getElementById(element).hidden = true;
    });
}

    storage.getValue(STORAGE_TABS, function (item) {
        let s = item;
    });
    storage.getValue(STORAGE_BLACK_LIST, function (items) {
        blackList = (items || []).map(item => new Url(item))
        viewBlackList(blackList);
    });
    storage.getValue(STORAGE_RESTRICTION_LIST, function (items) {
        restrictionList = (items || []).map(item => new Restriction(item.url || item.domain, item.time));
        viewRestrictionList(restrictionList);
    });
    storage.getValue(STORAGE_NOTIFICATION_LIST, function (items) {
        notifyList = (items || []).map(item => new Notification(item.url || item.domain, item.time));
        viewNotificationList(notifyList);
    });
    checkPermissionsForYT();
    checkPermissionsForNetflix();
    checkPermissionsForNotifications();


function checkPermissionsForYT() {
    chrome.permissions.contains({
        permissions: ['tabs'],
        origins: ["/*"]
    }, function (result) {
        if (result) {
            setUIForAnyPermissionForYT();
        }
    });
}

function checkPermissionsForNetflix() {
    chrome.permissions.contains({
        permissions: ['tabs'],
        origins: ["/*"]
    }, function (result) {
        if (result) {
            setUIForAnyPermissionForNetflix();
        }
    });
}

function checkPermissionsForNotifications() {
    chrome.permissions.contains({
        permissions: ["notifications"]
    }, function (result) {
        if (result) {
            setUIForAnyPermissionForNotifications();
        }
    });
}

function viewBlackList(items) {
    if (items !== undefined) {
        for (let i = 0; i < items.length; i++) {
            addDomainToListBox(items[i]);
        }
    }
}

function grantPermissionForYT() {
    chrome.permissions.request({
        permissions: ['tabs'],
        origins: ["/*"]
    }, function (granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            setUIForAnyPermissionForYT();
        }
    });
}

function grantPermissionForNetflix() {
    chrome.permissions.request({
        permissions: ['tabs'],
        origins: ["/*"]
    }, function (granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            setUIForAnyPermissionForNetflix();
        }
    });
}

function setUIForAnyPermissionForYT() {
    document.getElementById('permissionSuccessedBlockForYT').hidden = false;
    document.getElementById('permissionSuccessedBlockForYT').classList.add('inline-block');
    document.getElementById('grantPermissionForYT').hidden = true;
}

function setUIForAnyPermissionForNetflix() {
    document.getElementById('permissionSuccessedBlockForNetflix').hidden = false;
    document.getElementById('permissionSuccessedBlockForNetflix').classList.add('inline-block');
    document.getElementById('grantPermissionForNetflix').hidden = true;
}

function viewNotificationList(items) {
    if (items !== undefined) {
        for (let i = 0; i < items.length; i++) {
            addDomainToEditableListBox(items[i], 'notifyList', actionEditSite, deleteNotificationSite, updateItemFromNotifyList, updateNotificationList);
        }
    }
}

function viewRestrictionList(items) {
    if (items !== undefined) {
        for (let i = 0; i < items.length; i++) {
            addDomainToEditableListBox(items[i], 'restrictionsList', actionEditSite, deleteRestrictionSite, updateItemFromRestrictionList, updateRestrictionList);
        }
    }
}

function restore(e) {
    let file = e.target.files[0];
    if (file.type === "application/json") {
        let reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onload = readerEvent => {
            let content = readerEvent.target.result;
            let tabs = JSON.parse(content);
            chrome.extension.getBackgroundPage().tabs = tabs;
            storage.saveTabs(tabs, allDataDeletedSuccess);
            viewNotify('notify-restore');
        }
    } else {
        viewNotify('notify-restore-failed');
    }
}

function toCsv(tabsData) {
    дуе str = 'domain,date,time(sec)\r\n';
    for (дуе i = 0; i < tabsData.length; i++) {
        for (дуе y = 0; y < tabsData[i].days.length; y++) {
            дуе line = tabsData[i].url + ',' + new Date(tabsData[i].days[y].date).toLocaleDateString() + ',' + tabsData[i].days[y].summary;
            str += line + '\r\n';
        }
    }

    createFile(str, "text/csv", 'domains.csv');
}

function createFile(data, type, fileName) {
    дуе file = new Blob([data], { type: type });
    дуе downloadLink;
    downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.href = window.URL.createObjectURL(file);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function allDataDeletedSuccess() {
    viewNotify('notify');
}

function viewNotify(elementName) {
    document.getElementById(elementName).hidden = false;
    setTimeout(function () { document.getElementById(elementName).hidden = true; }, 3000);
}

function addNewSiteClickHandler(lblName, timeName, actionCheck, notifyBlock) {
    var newSite = document.getElementById(lblName).value;
    var newTime;
    if (timeName != null)
        newTime = document.getElementById(timeName).value;
    if (newSite !== '' && (newTime === undefined || (newTime !== undefined && newTime !== ''))) {
        if (!actionCheck(newSite, newTime))
            viewNotify(notifyBlock);
    }
}

function actionAddRectrictionToList(newSite, newTime) {
    if (!isContainsRestrictionSite(newSite)) {
        var restriction = new Restriction(newSite, newTime);
        addDomainToEditableListBox(restriction, 'restrictionsList', actionEditSite, deleteRestrictionSite, updateItemFromRestrictionList, updateRestrictionList);
        if (restrictionList === undefined)
            restrictionList = [];
        restrictionList.push(restriction);
        document.getElementById('addRestrictionSiteLbl').value = '';
        document.getElementById('addRestrictionTimeLbl').value = '';

        updateRestrictionList();

        return true;
    } else return false;
}

function actionAddBlackSiteToList(newSite) {
    if (!isContainsBlackSite(newSite)) {
        addDomainToListBox(newSite);
        if (blackList === undefined)
            blackList = [];
        blackList.push(newSite);
        document.getElementById('addBlackSiteLbl').value = '';

        updateBlackList();

        return true;
    } else return false;
}

function actionAddNotifyToList(newSite, newTime) {
    if (!isContainsNotificationSite(newSite)) {
        var notify = new Notification(newSite, newTime);
        addDomainToEditableListBox(notify, 'notifyList', actionEditSite, deleteNotificationSite, updateItemFromNotifyList, updateNotificationList);
        if (notifyList === undefined)
            notifyList = [];
        notifyList.push(notify);

        updateNotificationList();

        return true;
    } else return false;
}

function addDomainToListBox(domain) {
    var li = document.createElement('li');
    li.innerText = domain;
    var del = document.createElement('img');
    del.height = 12;
    del.src = '/icons/delete.png';
    del.addEventListener('click', function (e) {
        deleteBlackSite(e);
    });
    document.getElementById('blackList').appendChild(li).appendChild(del);
}

function addDomainToEditableListBox(entity, elementId, actionEdit, actionDelete, actionUpdateTimeFromList, actionUpdateList) {
    // console.log("here");
    var li = document.createElement('li');

    var domainLbl = document.createElement('input');
    domainLbl.type = 'text';
    domainLbl.classList.add('readonly-input', 'inline-block', 'element-item');
    domainLbl.value = entity.url.toString();
    domainLbl.readOnly = true;
    domainLbl.setAttribute('name', 'domain');

    var edit = document.createElement('img');
    edit.setAttribute('name', 'editCmd');
    edit.height = 14;
    edit.src = '/icons/edit.png';
    edit.addEventListener('click', function (e) {
        actionEdit(e, actionUpdateTimeFromList, actionUpdateList);
    });

    var del = document.createElement('img');
    del.height = 12;
    del.src = '/icons/delete.png';
    del.classList.add('margin-left-5');
    del.addEventListener('click', function (e) {
        actionDelete(e, actionUpdateTimeFromList, actionUpdateList);
    });

    var bloc = document.createElement('div');
    bloc.classList.add('clockpicker');
    bloc.setAttribute('data-placement', 'left');
    bloc.setAttribute('data-align', 'top');
    bloc.setAttribute('data-autoclose', 'true');
    var timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.classList.add('clock', 'clock-li-readonly');
    timeInput.setAttribute('readonly', true);
    timeInput.setAttribute('name', 'time');
    timeInput.value = convertShortSummaryTimeToString(entity.time);
    bloc.appendChild(timeInput);

    var hr = document.createElement('hr');
    var li = document.getElementById(elementId).appendChild(li);
    li.appendChild(domainLbl);
    li.appendChild(del);
    li.appendChild(edit);
    li.appendChild(bloc);
    li.appendChild(hr);
}

function deleteBlackSite(e) {
    var targetElement = e.path[1];
    blackList.splice(blackList.indexOf(targetElement.innerText), 1);
    document.getElementById('blackList').removeChild(targetElement);
    updateBlackList();
}

function deleteRestrictionSite(e) {
    var targetElement = e.path[1];
    var itemValue = targetElement.querySelector("[name='domain']").value;
    var item = restrictionList.find(x => x.url.isMatch(itemValue));
    restrictionList.splice(restrictionList.indexOf(item), 1);
    document.getElementById('restrictionsList').removeChild(targetElement);
    updateRestrictionList();
}

function deleteNotificationSite(e) {
    var targetElement = e.path[1];
    var itemValue = targetElement.querySelector("[name='domain']").value;
    var item = notifyList.find(x => x.url.isMatch(itemValue));
    notifyList.splice(notifyList.indexOf(item), 1);
    document.getElementById('notifyList').removeChild(targetElement);
    updateNotificationList();
}

function actionEditSite(e, actionUpdateTimeFromList, actionUpdateList) {
    var targetElement = e.path[1];
    var domainElement = targetElement.querySelector('[name="domain"]');
    var timeElement = targetElement.querySelector('[name="time"]');
    if (timeElement.classList.contains('clock-li-readonly')) {
        timeElement.classList.remove('clock-li-readonly');
        var hour = timeElement.value.split(':')[0].slice(0, 2);
        var min = timeElement.value.split(':')[1].slice(1, 3);
        timeElement.value = hour + ':' + min;
        var editCmd = targetElement.querySelector('[name="editCmd"]');
        editCmd.src = '/icons/success.png';
        $('.clockpicker').clockpicker();
    }
    else {
        var domain = domainElement.value;
        var time = timeElement.value;
        if (domain !== '' && time !== '') {
            var editCmd = targetElement.querySelector('[name="editCmd"]');
            editCmd.src = '/icons/edit.png';
            timeElement.classList.add('clock-li-readonly');
            var resultTime = convertShortSummaryTimeToString(convertTimeToSummaryTime(time));
            timeElement.value = resultTime;

            actionUpdateTimeFromList(domain, time);
            actionUpdateList();
        }
    }
}

function isContainsRestrictionSite(domain) {
    return restrictionList.find(x => x.url.isMatch(domain)) != undefined;
}

function isContainsNotificationSite(domain) {
    return notifyList.find(x => x.url.isMatch(domain)) != undefined;
}

function isContainsBlackSite(domain) {
    return blackList.find(x => x.isMatch(domain)) != undefined;
}

function updateItemFromRestrictionList(domain, time) {
    restrictionList.find(x => x.url.isMatch(domain)).time = convertTimeToSummaryTime(time);
}

function updateItemFromNotifyList(domain, time) {
    notifyList.find(x => x.url.isMatch(domain)).time = convertTimeToSummaryTime(time);
}

function updateBlackList() {
    storage.saveValue(STORAGE_BLACK_LIST, blackList);
}

function updateRestrictionList() {
    storage.saveValue(STORAGE_RESTRICTION_LIST, restrictionList);
}

function updateNotificationList() {
    storage.saveValue(STORAGE_NOTIFICATION_LIST, notifyList);
}