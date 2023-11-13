import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import data from './data.js';

import '../scss/styles.scss';

dayjs.extend(dayOfYear);

function zeroOut(date) {
    return date.hour(0).minute(0);
}

function makeBibleGatewayLink(entry) {
    return `<a href="https://www.biblegateway.com/passage/?search=${encodeURI(entry)}&version=KJV" target="_blank" rel="noreferrer noopener">${entry}</a>`;
}

function refreshTable(startDate) {
    const daysSince = dayjs().diff(startDate, 'day');
    const {gospel, epistle} = data[daysSince % data.length];
    const kathisma = (daysSince % 20) + 1;
    const kathismaLink = `https://www.liturgy.io/orthodox-psalter?kathisma=${kathisma}&style=LINED&trans=KJV&psalt=DEF`;

    document.getElementById('gospel').innerHTML = makeBibleGatewayLink(gospel);
    document.getElementById('epistle').innerHTML = makeBibleGatewayLink(epistle);
    document.getElementById('kathisma').innerHTML = `<a href="${kathismaLink}" target="_blank" rel="noreferrer noopener">${kathisma}</a>`;
}

function reset(type) {
    const today = dayjs();
    let newStartDate = today;

    switch (type) {
        case 'resetJan1':
            newStartDate = today.dayOfYear(1);
            break;
        case 'resetNC':
            const sept1ThisYear = today.month(8).date(1);
            newStartDate = today.isBefore(sept1ThisYear) ? sept1ThisYear.subtract(1, 'year') : sept1ThisYear;
            break;
        case 'resetOC':
            const sept14ThisYear = today.month(8).date(14); // unless year >= 2100 :P
            newStartDate = today.isBefore(sept14ThisYear) ? sept14ThisYear.subtract(1, 'year') : sept14ThisYear;
            break;
        case 'resetWR':
            const adventIThisYear = today.month(11).date(25).day(0).subtract(3, 'weeks');
            newStartDate = today.isBefore(adventIThisYear) ? today.subtract(1, 'year').month(11).date(25).day(0).subtract(3, 'weeks') : adventIThisYear;
            break;
    }

    localStorage.setItem('startDate', zeroOut(newStartDate).format());
    refreshTable(newStartDate);
}

function resetHandler(e) {
    reset(e.target.id);
}

document.addEventListener('DOMContentLoaded', () => {
    for (const id of ['resetJan1', 'resetNC', 'resetOC', 'resetWR', 'resetToday']) {
        document.getElementById(id).addEventListener('click', resetHandler);
    }

    let date = localStorage.getItem('startDate');
    if (date) {
        refreshTable(zeroOut(dayjs(date)));
    } else {
        reset('resetNC');
    }
});
