const $ = (query) => document.getElementById(query);

const app = {
    pages: [],
    previousPage: null,
    flip: new Event('flip'),
    init: () => {
        app.bind();
        app.pages = document.querySelectorAll('.page');
        app.pages.forEach((pg) => {
            pg.addEventListener('flip', app.resolve);
            pg.addEventListener('flip', app.display);
            pg.addEventListener('flip', app.run);
        });

        document.querySelectorAll('.spa-link').forEach((link) => {
            link.addEventListener('click', app.nav);
            link.addEventListener('keypress', (e) => { if (e.key === 'Enter') app.nav(e) });
            const currentPage = link.getAttribute('data-target');
            if (currentPage === 'landing') {
                link.addEventListener('click', app.clear);
            }
        });

        document.querySelectorAll('.spa-enter').forEach((link) => {
            link.addEventListener('keypress', (e) => { if (e.key === 'Enter') app.nav(e) });
        });
    
        initStart();
        initLanding()
        initPace();
        initPaceInput();
        initSpeedInput();
        initNegativeSplit();
    },
    resolve: (e) => {
        e.target.querySelectorAll('[data-resolve]').forEach((element) => {
            const id = element.getAttribute('data-resolve');
            if (id.includes(':')) {
                const ids = id.split(':');
                const result = [];
                ids.forEach((id) => {
                    const value = document.getElementById(id).value;
                    result.push(padLeft(value, 2));
                });

                element.innerHTML = result.join(':');
            } else {
                const value = document.getElementById(id).value;
                if (element.tagName === "INPUT") {
                    element.value = value;
                }
                else {
                    element.innerHTML = value;
                }
            }
        })
    },
    display: (e) => {
        let dataToResolve = e.target.querySelectorAll('[data-display]');
        if (dataToResolve.length > 0) {
            dataToResolve.forEach((element) => {
                let id = element.getAttribute('data-display');
                if (id.includes('&')) {
                    const ids = id.split('&');
                    const displayElement = shouldDisplayElement(ids);
                    element.style.display = displayElement ? "" : "none";

                    setDisplaySiblingElement(element, displayElement);
                } else if (id.includes('|')) {
                    const ids = id.split('|');
                    const displayElement = shouldDisplayElement(ids, false);
                    element.style.display = displayElement ? "" : "none";

                    setDisplaySiblingElement(element, displayElement);
                } else {
                    const displayElement = shouldDisplayElement([id]);
                    element.style.display = displayElement ? "" : "none";

                    setDisplaySiblingElement(element, displayElement);
                }
            })
        }
    },
    nav: (e) => {
        e.preventDefault();

        let currentPage = e.currentTarget.getAttribute('data-target');
        const previousPageElement = document.querySelector('.active');

        if (currentPage === 'previous') {
            currentPage = app.previousPage;
        }

        if (previousPageElement.classList.contains('active')) {
            previousPageElement.classList.remove('active')
        }
        
        document.getElementById(currentPage).classList.add('active');
        document.getElementById(currentPage).dispatchEvent(app.flip);

        app.previousPage = previousPageElement.id;
    },
    clear: (e) => {
        $('negative-split-input').value = '';
    },
    bind: () => {
        document.querySelectorAll('[data-bind]').forEach((element) => {
            element.addEventListener('input', (e) => {  
                const bindId = e.target.getAttribute('data-bind');
                const elements = document.querySelectorAll(`[data-bind=${bindId}]`);
                elements.forEach((el) => {
                    if (!e.target.isEqualNode(el)) {
                        el.value = e.target.value;
                    }

                    if (isValueEmpty(el.value)) {
                        el.classList.remove('input-valid');
                    } else {
                        el.classList.add('input-valid');
                    }
                });
            });
        })
    },
    run: (e) => {
        e.target.querySelectorAll('[data-run]').forEach((element) => {
            const functionName = element.getAttribute('data-run');
            window[functionName]();
        });
    },
    tabbing: (e) => {
        
    }
}

function isValueEmpty(value) {
    switch (typeof value) {
        case "string":
            return value === "" || value === "0";
        case "number":
        case "bigint":
        case "boolean":
            return value === 0;
        case "symbol":
        case "undefined":
        case "object":
        case "function":
        default:
            return false
    }
}

function setDisplaySiblingElement(element, displayElement) {
    const nextSibling = element.nextElementSibling;
    if (nextSibling !== null && 
        nextSibling.outerHTML !== undefined &&
        nextSibling.outerHTML.includes('#else')) {
        nextSibling.style.display = !displayElement ? "" : "none";
    }
}

function shouldDisplayElement(ids, allTrue = true) {
    let displayElement = allTrue;
    ids.forEach((id) => {
        const switchResult = id.startsWith('!');
        id = switchResult ? id.substring(1) : id;
        const element = $(id);
        if (element !== undefined) {
            const hasValue = !isValueEmpty(element.value)
            if (allTrue) {
                displayElement &= (switchResult ? !hasValue : hasValue);
            } else {
                displayElement |= (switchResult ? !hasValue : hasValue);
            }
            
        }
    })

    return displayElement;
}

document.addEventListener('DOMContentLoaded', app.init);


// const test = document.querySelector('#landing');
// test.addEventListener('keydown', (e) => {
//     if (e.key === 'Tab') {
//         e.preventDefault();

//         const currentTabId = test.querySelector(':focus').getAttribute('tabindex');
//         const nextTab = test.querySelector(`[tabindex="${Number.parseInt(currentTabId) + 1}"]`);
//         if (nextTab !== null) {
//             nextTab.focus();
//         }
//     }
// })

// const test2 = document.querySelector('#name-form');
// test.addEventListener('keydown', (e) => {
//     if (e.key === 'Tab') {
//         e.preventDefault();

//         const currentTabId = test.querySelector(':focus').getAttribute('tabindex');
//         const nextTab = test.querySelector(`[tabindex="${Number.parseInt(currentTabId) + 1}"]`);
//         if (nextTab !== null) {
//             nextTab.focus();
//         }
//     }
// })
const defaultAllowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter']

function allowNumbers(event) {
    if (isNaN(event.key) && !defaultAllowedKeys.includes(event.key) || event.code === 'Space') {
        event.preventDefault();
    }
}function calculatePace(timeInSeconds, distanceInKm) {
    return timeInSeconds / distanceInKm;
}

function calculateAverageSpeed(distanceInKm, totalTimeInSeconds) {
    const totatTimeInHours = (totalTimeInSeconds / 3600);

    return distanceInKm / totatTimeInHours;
}

function calculateSecondsPerKm(distanceInKm, totalTimeInSeconds) {
    const timePerKm = totalTimeInSeconds / distanceInKm;

    return timePerKm;
}

function calculateTotalTimeInSeconds(distanceInKm, totalTimeInSeconds) {
    const totalTime = totalTimeInSeconds * distanceInKm;

    return totalTime;
}


function getTotalTimeInSeconds(time) {
    return ((time.hours * 3600) + (time.minutes * 60) + (time.seconds));
}

function convertFromFloat(float) {
    const time = {
        seconds: 0,
        minutes: 0,
        hours: 0,
    };

    const hours = Math.floor(float / 60);
    const minutes = (float - (hours * 60));
    const secondsRemaining = minutes % 1;

    time.hours = Math.floor(hours);
    time.minutes = Math.floor(minutes);
    time.seconds = Math.round(secondsRemaining * 60);

    return time;
}

function convertFromSeconds(seconds) {
    const time = {
        seconds: 0,
        minutes: 0,
        hours: 0,
    };

    const minutesRemaining = seconds % 3600;
    time.hours = Math.floor(seconds / 3600);
    time.minutes = Math.floor((minutesRemaining) / 60);
    time.seconds = Math.floor(minutesRemaining % 3600 % 60);

    return time;
}

function padLeft(value, count) {
    let result = '';
    let amountToAdd = count - value.toString().length;
    
    if (amountToAdd > 0) {
        result += '0';
        amountToAdd--;
    }

    return result + value.toString();
}

function toString(time, format, seperator = ':', ignoreZero = false) {
    const formatArray = format.split(seperator);
    let result = [];
    let timePartAsString;

    for (const index in formatArray) {
            const timePart = formatArray[index];
            switch (timePart[0]) {
                case 'h':
                    if (ignoreZero === true && time.hours === 0) {
                        continue;
                    }

                    timePartAsString = padLeft(time.hours, timePart.length);
                    result.push(timePartAsString);

                    break;
                case 'm':
                    if (ignoreZero === true && time.hours === 0 && time.minutes === 0) {
                        continue;
                    }

                    timePartAsString = padLeft(time.minutes, timePart.length);
                    result.push(timePartAsString);

                    break;
                case 's':
                    if (ignoreZero === true && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
                        continue;
                    }

                    timePartAsString = padLeft(time.seconds, timePart.length);
                    result.push(timePartAsString);
                    break;
        }
    }

    return result.join(seperator);
}
function createTable(headers) {
    const table = document.createElement('table');
    return table;
}

function addTableHeaders(table, headers) {
    const row = document.createElement('tr');

    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.innerHTML = headers[i];

        row.appendChild(th);
    }

    const thead = document.createElement('thead');
    thead.appendChild(row);
    table.appendChild(thead);
}

function createBody() {
    const tbody = document.createElement('tbody');

    return tbody;
}

function appendToBody(body, values) {
    const row = createRow(values);
    body.appendChild(row);
}

function createData(value) {
    const element = document.createElement('td');
    element.innerHTML = value;

    return element;
}

function createRow(values) {
    const row = document.createElement('tr');
    for (let i = 0; i < values.length; i++) {
        row.appendChild(createData(values[i]));
    }

    return row;
}

function clear(table) {
    table.clearChildren();
}const months = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december'
];

function initStart()
{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }

    setCurrentDate(new Date());
}

function setCurrentDate(date) {
    const dateString = `${date.getDate()} ${months[date.getMonth()]}`;

    document.getElementById('currentDate').innerHTML = dateString;
}

function showPosition(position) {
    const apiKey = '20e046499d268d3e0aac0c2573b7d3c0';

    fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lang=nl&lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}`)
        .then((response) => response.json())
        .then((json) => fillWeatherData(json));
}

function fillWeatherData(json) {
    const temperature = document.getElementById('temperature');
    const weather = document.getElementById('weatherDescription');
    const weatherJson = json.weather[0];

    temperature.innerHTML = json.main.temp.toFixed(1) + '&#8451';

    weather.innerHTML = '- ' + weatherJson.description;

     if (weatherJson.id < 800) {
        const background = document.querySelector('.background');
        background.classList.remove('blue-sky');
        background.classList.add('rain');
     }
}function initLanding() {
    document.getElementById('facts').addEventListener('click', (e) => {        
        const cls = 'extend-facts';
        const target = e.currentTarget;
        if (target.classList.contains(cls)) {
            target.classList.remove(cls);
            target.querySelector('span').innerText = 'Body Fact';
        } else {
            target.classList.add(cls);
            target.querySelector('span').innerText = 'Je lichaam neemt ongeveer 60 tot 90 gram koolhydraten op per uur';
        }
    });
}
function initNegativeSplit() {
    $('negative-split').addEventListener('input', (e) => {  
        updateRangeLabel(e);
    });
}

function updateRangeLabel(e) {
    const label = $('negative-split-range-label');

    switch (e.target.value) {
        case '5': label.innerText  = 'high five!'; break;
        default: label.innerText = '';
    }
}
const rangeSliderMap = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 42.195
];

function initPace() {
    const hours = document.getElementById('hours');
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');

    createSelectOptions(hours, 6, 'uur');
    createSelectOptions(minutes, 60, 'min.', 24);
    createSelectOptions(seconds, 60, 'sec.');

    $('kilometer').addEventListener('input', (e) => {  
        updateRangeInput(e);
        onTimeUpdate();
    });
}

function onTimeUpdate() {
    const totalTime = getTimeInput();

    updateAveragePaceByTotalTime(totalTime);
    updateAverageSpeedByTotalTime(totalTime);
}

function updateRangeInput(e) {
    const input = $('kilometer-input');
    input.value = rangeSliderMap[e.target.value];

    const label = $('kilometer-range-label');
    switch (input.value) {
        case '5': label.innerText  = 'high five!'; break;
        case '42.195': label.innerText  = 'marathon!'; break;
        default: label.innerText = '';
    }
}

function setTimeInput(timeInSeconds) {
    const time = convertFromSeconds(timeInSeconds);

    $('hours').value = time.hours;
    $('minutes').value = time.minutes;
    $('seconds').value = time.seconds;
}

function createSelectOptions(element, total, postfix, selectedValue = 0) {
    for (let i = 0; i < total; i++) {
        const option = document.createElement('option')
        option.innerHTML = `${i} ${postfix}`;
        option.value = i;
        element.appendChild(option);

        if (selectedValue === i) {
            option.selected = true;
        }
    }
}

/**
 * @returns {{hours: number, minutes: number, seconds: number}}
 */
function getTimeInput() {
    const timeInput = {
        seconds: 0,
        minutes: 0,
        hours: 0,
    };
    
    timeInput.hours = Number.parseInt($('hours').value);
    timeInput.minutes = Number.parseInt($('minutes').value);
    timeInput.seconds = Number.parseInt($('seconds').value);

    return timeInput;
}

/**
 * @returns {number}
 */
function getDisctanceInKm() {
    return Number.parseFloat($('kilometer-input').value);
}


// function updatePace(distanceInKm, timeInput) {
//     const averageSpeed = getAveragePace(distanceInKm, timeInput);

//     setTimePaceInput(averageSpeed);
// }

// function getAveragePace(distanceInKm, timeInput) {

//     const timePerSeconds = convertFromSeconds(secondsPerKm);
    
//     return timePerSeconds;
// }

//////////////////////////////////

function updatePaceByAverageSpeed(averageSpeed) {
    const distanceInKm = Number.parseFloat($('kilometer-input').value);
    const newTimeInSeconds = (1 / (averageSpeed / 3600));
    const totalTimeInSeconds = calculateTotalTimeInSeconds(distanceInKm, newTimeInSeconds);

    setTimeInput(totalTimeInSeconds);
}

function updatePaceByAveragePace(averagePace) {
    const distanceInKm = $('kilometer-input').value;
    const totalTimeInSeconds = calculateTotalTimeInSeconds(distanceInKm, averagePace);

    setTimeInput(totalTimeInSeconds);
}
const paceInput = {
    intervalMap: {},
    caretPosition: 0,
    defaultAllowedKeys: ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
}

function initPaceInput() {
    const buttonUp = document.getElementById('pace-button-up');
    const buttonDown = document.getElementById('pace-button-down');
    const averagePace = document.getElementById('average-pace');

    handlePaceButtonEvents(paceInput, buttonUp, 1, averagePace);
    handlePaceButtonEvents(paceInput, buttonDown, -1, averagePace);

    HandlePaceKeyInput(paceInput, averagePace);

    setTimePaceInput(288);
}

function HandlePaceKeyInput(paceInput, element) {
    element.value = element.innerText;
    element.addEventListener('keydown', (e) => {
        const colonIndex = e.currentTarget.innerText.indexOf(':');
        if (!((e.key <= '9' && e.key >= '0') || paceInput.defaultAllowedKeys.includes(e.key))) {
            if (e.key === ':') {
                if (window.getSelection().anchorOffset === colonIndex) {                    
                    setCaretPosition(element, colonIndex + 1);
                }
            } 
            
            e.preventDefault();
        }

                
        if ((window.getSelection().anchorOffset === colonIndex + 1 && e.key === 'Backspace') ||
            (window.getSelection().anchorOffset === colonIndex && e.key === 'Delete')) {
            e.preventDefault();
        }
    })

    element.addEventListener('input', (e) => {
        paceInput.caretPosition = window.getSelection().anchorOffset;
        const averagePace = convertAveragePaceText(e.currentTarget);
        
        if (averagePace.minutes >= 60) {
            averagePace.minutes = 59;
        }

        if (averagePace.seconds >= 60) {
            averagePace.seconds = 59;
        }

        const newPace = averagePace.minutes * 60 + averagePace.seconds;

        updatePaceTime(newPace);
        setCaretPosition(e.currentTarget, paceInput.caretPosition);
    })
}

function handlePaceButtonEvents(paceInput, element, change) {
    element.addEventListener('mousedown', (e) => { 
        const intervalId = setInterval(() => onPaceUpdate(change), 150);
        paceInput.intervalMap[element.id] = intervalId;
    });
    
    element.addEventListener('click', (e) => onPaceUpdate(change));
    element.addEventListener('mouseleave', (e) => clearInterval(paceInput.intervalMap[element.id]));
    element.addEventListener('mouseup', (e) => clearInterval(paceInput.intervalMap[element.id]));
}

function convertAveragePaceText(averagePaceElement) {
    const averagePaceSplit = averagePaceElement.innerText.split(':');
    for (let i = 0; i < averagePaceSplit.length; i++) {
        const timePart = averagePaceSplit[i];
        if (!timePart || isNaN(timePart)) {
            averagePaceSplit[i] = 0;
        }
    }

    return {
        minutes: Number.parseInt(averagePaceSplit[0]),
        seconds: Number.parseInt(averagePaceSplit[1])
    };
}

function updateAveragePaceSubscribers(averagePace) {
    updateAverageSpeedByAveragePace(averagePace);
    updatePaceByAveragePace(averagePace)
}

function onPaceUpdate(change) {
    const averagePace = getAveragePace();
    const timeInSeconds = averagePace.minutes * 60 + averagePace.seconds;
    const newPace = timeInSeconds + change;

    updatePaceTime(newPace);
}

function updatePaceTime(newPace) {
    setTimePaceInput(newPace);
    updateAveragePaceSubscribers(newPace);
}

function getAveragePace() {
    const averagePace = document.getElementById('average-pace');

    return {
        minutes: averagePace.minutes,
        seconds: averagePace.seconds,
    }
}

function setTimePaceInput(totalTimeInSeconds) {
    const time = convertFromSeconds(totalTimeInSeconds);
    const averagePace = document.getElementById('average-pace');
    averagePace.minutes = time.minutes;
    averagePace.seconds = time.seconds;

    const result = time.minutes + ':' + padLeft(time.seconds, 2);
    averagePace.value = result;
    averagePace.innerText = result;

    // minutesElement.innerText = time.minutes;
    // minutesElement.value = time.minutes;
    // secondsElement.innerText = padLeft(time.seconds, 2);
    // secondsElement.value = time.seconds;
}




//////////////////////////////////////////////////
function updateAveragePaceByAverageSpeed(averageSpeed) {
    const newAverageTimeInSeconds = (1 / (averageSpeed / 3600));
    setTimePaceInput(newAverageTimeInSeconds);
}

function updateAveragePaceByTotalTime(totalTime) {
    const distanceInKm = getDisctanceInKm();
    const totalTimeInSeconds = ((totalTime.hours * 3600) + (totalTime.minutes * 60) + (totalTime.seconds));
    const secondsPerKm = calculateSecondsPerKm(distanceInKm, totalTimeInSeconds)

    setTimePaceInput(secondsPerKm);
}




const speedInput = {
    intervalMap: {},
    caretPosition: 0,
    defaultAllowedKeys: ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
}

function initSpeedInput() {
    const buttonUp = document.getElementById('speed-button-up');
    const buttonDown = document.getElementById('speed-button-down');
    const speedElement = document.getElementById('speed');

    handleSpeedButtonEvents(speedInput, buttonUp, 0.1, speedElement);
    handleSpeedButtonEvents(speedInput, buttonDown, -0.1, speedElement);
    
    HandleSpeedKeyInput(speedInput, speedElement);
    // updateSpeed(getDisctanceInKm(), getTimeInput());
}


function HandleSpeedKeyInput(speedInput, element) {
    element.value = Number.parseFloat(element.innerText.replace(',', '.'));
    element.addEventListener('keydown', (e) => {
        const commaIndex = e.currentTarget.innerText.indexOf(',');
        if (!((e.key <= '9' && e.key >= '0') || speedInput.defaultAllowedKeys.includes(e.key))) {
            if (e.key === '.' || e.key === ',') {
                if (window.getSelection().anchorOffset === commaIndex) {                    
                    setCaretPosition(element, commaIndex + 1);
                }
            } 

            e.preventDefault();
        }

        
        if ((window.getSelection().anchorOffset === commaIndex + 1 && e.key === 'Backspace') ||
            (window.getSelection().anchorOffset === commaIndex && e.key === 'Delete')) {
            e.preventDefault();
        }
    })

    element.addEventListener('input', (e) => {
        speedInput.caretPosition = window.getSelection().anchorOffset;
        let averageSpeed = Number.parseFloat(e.currentTarget.innerText.replace(',', '.'));
        let roundedAverageSpeed = Math.floor(averageSpeed * 10) / 10;
        updateSpeedField(e.currentTarget, roundedAverageSpeed);
        updateSpeedSubscribers(roundedAverageSpeed);
        setCaretPosition(e.currentTarget, speedInput.caretPosition);
    })
}

function handleSpeedButtonEvents(speedInput, element, change, speedElement) {
    element.addEventListener('mousedown', (e) => { 
        const intervalId = setInterval(() => onUpdateSpeed(change, speedElement), 150);
        speedInput.intervalMap[element.id] = intervalId;
    });
    
    element.addEventListener('click', (e) => onUpdateSpeed(change, speedElement));
    element.addEventListener('mouseleave', (e) => clearInterval(speedInput.intervalMap[element.id]));
    element.addEventListener('mouseup', (e) => clearInterval(speedInput.intervalMap[element.id]));
}

function updateSpeedSubscribers(averageSpeed) {
    updatePaceByAverageSpeed(averageSpeed);
    updateAveragePaceByAverageSpeed(averageSpeed);
}


function onUpdateSpeed(change, speedElement) {
    const newSpeed = Math.round((speedElement.value + change) * 100) / 100;
    updateSpeedField(speedElement, newSpeed);
    updateSpeedSubscribers(newSpeed);
}


function updateSpeedField(speedElement, averageSpeed) {
    strSpeed = averageSpeed.toFixed(1).replace('.', ',');

    speedElement.value = averageSpeed;
    speedElement.innerText = strSpeed;
}

function setCaretPosition(element, position) {
    if (position > element.innerText.length) {
        position -= 1;
    }

    const range = document.createRange();
    range.setStart(element.firstChild, position);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}


/////////////////////////////////

function calculateAverageSpeed(distanceInKm, timeInput) {
    const totalTimeInSeconds = getTotalTimeInSeconds(timeInput);
    const averageSpeed = (distanceInKm * 1000 / totalTimeInSeconds * 3.6);

    return averageSpeed;
}

function updateAverageSpeedByAveragePace(averagePace) {
    const speedElement = document.getElementById('speed');
    updateSpeedField(speedElement, 1 / averagePace * 3600);
}

function updateAverageSpeedByTotalTime(totalTime) {
    const distanceInKm = getDisctanceInKm();
    const averageSpeed = calculateAverageSpeed(distanceInKm, totalTime);
    const speed = document.getElementById('speed');

    updateSpeedField(speed, averageSpeed);    
}

function createPaceTable() {
    const distances = [1, 2, 3, 4, 5, 10, 15, 20, 21.1, 25, 30, 35, 40, 42.195];
    const timeInput = getTimeInput();
    const distanceInKm = getDisctanceInKm();

    const totalSeconds = getTotalTimeInSeconds(timeInput);
    let secondsPerKm = calculateSecondsPerKm(distanceInKm, totalSeconds);
    const panelMain = $('panelMain');
    const weight = Number.parseInt($('weight').value);
    const negativeSplit = calculateNegativeSplit(secondsPerKm, distanceInKm);
    
    const table = createTable();
    const tableHeaders = getTableHeaders(weight);
    addTableHeaders(table, tableHeaders);
    const tbody = createBody();

    let totalSecondsForDistance = 0;
    let lastDistance = 0;
    for (let i = 0; i < distances.length; i++) {
        let d = distances[i];
        if (negativeSplit.diff) {
            secondsPerKm = negativeSplit.startSpeed + negativeSplit.speedUp * (1 - d);
        }

        totalSecondsForDistance += secondsPerKm * (d - lastDistance);

        if (d >= distanceInKm) {
            const values = calculateValues(distanceInKm, totalSeconds, weight)    
            appendToBody(tbody, values);
            break;
        }

        const values = calculateValues(d, totalSecondsForDistance, weight)
        appendToBody(tbody, values);
        
        if (d === distanceInKm) {
            break;
        }

        lastDistance = d;
    }

    panelMain.replaceChildren();
    panelMain.appendChild(table);
    table.appendChild(tbody);
}

function calculateValues(distanceInKm, totalSecondsForDistance, weight) {
    let distance = distanceInKm;
    if (distanceInKm === 21.1) {
        distance = '<b>Halve</b>';
    } else if (distanceInKm === 42.195) {
        distance = '<b>Marathon</b>';
    }

    const pace = calculatePace(totalSecondsForDistance, distanceInKm);
    const paceTime = convertFromSeconds(pace);

    const totalTime = convertFromSeconds(totalSecondsForDistance);
    const timeString = toString(totalTime, 'h:mm:ss', ':', true);
    const kcal = calculateKcal(distanceInKm, weight, totalSecondsForDistance);

    return [distance, timeString, kcal, toString(paceTime, 'm:ss')];
}

function getTableHeaders(weight) {
    if (isNaN(weight)) {
        return ['Afstand', 'Tijd', '', 'Tempo'];
    }

    return ['Afstand', 'Tijd', 'Energie', 'Tempo'];
}

function calculateKcal(distanceInKm, weight, secondsPerKm) {
    if (isNaN(weight)) {
        return '';
    }

    return Math.round(distanceInKm * weight * (secondsPerKm / 3600));
}

function convertPaceToString(totalTimeInSeconds, distanceInKm)
{
    const pace = calculatePace(totalTimeInSeconds, distanceInKm);
    const paceTime = convertFromSeconds(pace);

    return toString(paceTime, 'm:ss');
}

/**
 * @returns {number}
 */
function getNegativeSplit()
{
    return Number.parseInt($('negative-split-input').value);
}

/**
 * @returns {{diff: number, startSpeed: number, speedUp: number}}
 */
function calculateNegativeSplit(timePerKm, distanceInKm)
{
    const negativeSplit = getNegativeSplit();
    const startSpeed = timePerKm * (1 + negativeSplit / 100);
    const endSpeed = timePerKm * (1 - negativeSplit / 100);
    const speedUp = (startSpeed - endSpeed) / (distanceInKm - 1);

    return {
        diff: negativeSplit,
        startSpeed: startSpeed,
        speedUp: speedUp
    };
}