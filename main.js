const $ = (query) => document.getElementById(query);

const app = {
    pages: [],
    previousPage: null,
    flip: new Event('flip'),
    init: () => {
        app.bind();
        app.escape();
        app.pages = document.querySelectorAll('.page');
        app.pages.forEach((pg) => {
            pg.addEventListener('flip', app.resolve);
            pg.addEventListener('flip', app.display);
            pg.addEventListener('flip', app.run);
            pg.addEventListener('flip', app.tab);
        });

        document.querySelectorAll('.spa-link').forEach((link) => {
            link.addEventListener('click', app.nav);
            link.addEventListener('keypress', (e) => { if (e.key === 'Enter') app.nav(e) });
            const currentPage = link.getAttribute('data-target');
            if (currentPage === 'landing') {
                link.addEventListener('click', app.clear);
            }
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
                if (id.includes('#')) {
                    const ids = id.split('#');
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
    tab: (e) => {
        const page = e.target;
        focusElement(page, 0);

        page.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
        
                const currentTabId = page.querySelector(':focus').getAttribute('tabindex');
                let modifier = 1;
                if (e.shiftKey) {
                    modifier = -1;                    
                }
                focusElement(page, Number.parseInt(currentTabId) + modifier);
            }
        })
    },
    escape: () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const previousPageElement = document.querySelector('.active');
                if (previousPageElement.hasAttribute('data-escapable')) {
                    let currentPage = previousPageElement.getAttribute('data-escapable');

                    if (currentPage === 'previous') {
                        currentPage = app.previousPage;
                    }
            
                    if (previousPageElement.classList.contains('active')) {
                        previousPageElement.classList.remove('active')
                    }
                    
                    document.getElementById(currentPage).classList.add('active');
                    document.getElementById(currentPage).dispatchEvent(app.flip);
            
                    app.previousPage = previousPageElement.id;
                }
            }
        })
    }
}

/**
 * @param {*} value 
 * @returns {boolean}
 */
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

/**
 * @param {Element} element 
 * @param {Element} displayElement 
 */
function setDisplaySiblingElement(element, displayElement) {
    const nextSibling = element.nextElementSibling;
    if (nextSibling !== null && 
        nextSibling.outerHTML !== undefined &&
        nextSibling.outerHTML.includes('#else')) {
        nextSibling.style.display = !displayElement ? "" : "none";
    }
}

/**
 * @param {Array} ids 
 * @param {boolean} allTrue 
 * @returns 
 */
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

/**
 * @param {Element} page 
 * @param {number} id 
 */
function focusElement(page, id) {
    let nextTab = page.querySelector(`[tabindex="${id}"]`);
    if (nextTab === null) {
        nextTab = page.querySelector(`[tabindex="0"]`);
    }

    if (nextTab !== null) {
        nextTab.focus();
    }
}


// const test = document.querySelector('#pace');

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

function timeToString(time, format, seperator = ':', ignoreZero = false) {
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
        background.classList.remove('dry');
        background.classList.add('rain');
     }
}const bodyFacts = [
    '2,4 miljoen Nederlanders regelmatig hardlopen',
    'Vrouwen gemiddeld het hardste rennen als ze 29 jaar zijn en mannen 27 jaar',
    'Hardlopers presteren het best bij een temperatuur rond de 8 graden',
    'Het snelste tempo ooit gemeten voor een mannelijke sprinter op 100 meter is 9,58 seconden, gevestigd door Usain Bolt in 2009.',
    'je een uur moet hardlopen voor het verbranden van een Quattro formaggi',
    'het lopen van een marathon tussen de 2500 en 3000 kcal kost',
    'je lichaam zo’n 60 tot 90 gram koolhydraten per uur opnemen',
    'Een handige vuistregel is dat je bij een grote inspanning iedere 20-30 minuten een gel kan gebruiken',
    'Je koolhydraatvoorraad is beperkt en hierop kan je zonder aanvulling ongeveer 45 tot 90 minuten hardlopen',
    // 'Hardlopen kan helpen bij het verminderen van stress en het verbeteren van de stemming door de afgifte van endorfines, de zogenaamde gelukshormonen',
    // 'Hardlopen helpt bij het versterken van je botten. Het is aangetoond dat regelmatig hardlopen de botdichtheid verhoogt en het risico op osteoporose vermindert',
    'Mensen die meer dan 30 min per dag sporten bereiken een betere en diepere slaap',
    'Regelmatig hardlopen kan het risico op hartaandoeningen, beroertes en diabetes type 2 verminderen',
    'De oudste marathonloper ooit was 101 jaar en liep een marathon in een tijd van 07:49',
    'De Marathon in Denemarken is de snelste marathon ter wereld met een gemiddelde finishtijd van 3u51:22',
    'Je mag 2500 tot 3000 kcal extra eten met een marathon',
    // 'De eerste georganiseerde marathon vond plaats tijdens de Olympische Spelen van 1896 in Griekenland, gebaseerd op de mythische loopafstand tussen de steden Marathon en Athene',
    // 'Het wereldrecord voor de snelste marathontijd bij mannen staat op naam van Eliud Kipchoge uit Kenia, met een tijd van 2 uur, 1 minuut en 39 seconden, behaald in Berlijn in 2018',
    // 'Het wereldrecord voor de snelste marathontijd bij vrouwen staat op naam van Brigid Kosgei uit Kenia, met een tijd van 2 uur, 14 minuten en 4 seconden, behaald in Chicago in 2019',
    'De eerste officiële vrouwenmarathon vond plaats in 1972 in New York City, waarbij slechts acht vrouwen deelnamen',
    'Hardloopschoenen gaan gemiddeld 650 - 1000 kilometer mee voordat je ze moet vervangen',
    'Schoenen hebben ook rust nodig. Het kan wel 48 uur duren voordat je schoenen in hun origineel staat zijn teruggekeerd',
    'Er elk jaar meer dan een miljard hardloopschoenen worden verkocht',
];

function initLanding() {
    document.getElementById('facts').addEventListener('click', (e) => {        
        const cls = 'extend-facts';
        const target = e.currentTarget;
        if (target.classList.contains(cls)) {
            target.classList.remove(cls);
            target.querySelector('span').innerText = 'Body Fact';
        } else {
            target.classList.add(cls);
            const randomIndex = getRandomInt(0, bodyFacts.length);
            target.querySelector('span').innerText = bodyFacts[randomIndex];
        }
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
  }
function initNegativeSplit() {

    $('negative-split-range').value = 0;
    $('negative-split-range').addEventListener('input', (e) => {
        updateRangeLabel(e);
        $('negative-split-input').innerText = e.target.value;
    });
}

function updateRangeLabel(e) {
    const label = $('negative-split-range-label');

    switch (e.target.value) {
        case '5': label.innerHTML  = 'high five &#x1F596;'; break;
        case '10': label.innerHTML = 'komeet &#x1F92F;'; break;
        default: label.innerHTML   = '';
    }
}
const rangeSliderMap = [
    0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 
    2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 
    3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 
    4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 
    5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0,
    5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0,
    5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 
    6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 
    7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 
    8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 
    9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9,
    10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0,
    10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0,
    10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 
    11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 
    12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 
    13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 
    14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 
    15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 
    16.0, 16.1,
    16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 
    16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1, 16.1,
    16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 
    17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 
    18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 
    19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 
    20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 
    21.0, 21.1, 
    21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1,  
    21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 21.1, 
    21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 
    22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 
    23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 
    24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 
    25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 
    26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 
    27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 
    28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 
    29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 
    30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0,
    30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0,
    30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 
    31.0, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 
    32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 
    33.0, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 
    34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 
    35.0, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 
    36.0, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 
    37.0, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 
    38.0, 38.1, 38.2, 38.3, 38.4, 38.5, 38.6, 38.7, 38.8, 38.9, 
    39.0, 39.1, 39.2, 39.3, 39.4, 39.5, 39.6, 39.7, 39.8, 39.9, 
    40.0, 40.1, 40.2, 40.3, 40.4, 40.5, 40.6, 40.7, 40.8, 40.9, 
    41.0, 41.1, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 
    42.0, 42.1, 42.195
];

let totalTimeLastUpdated = true;

function initPace() {
    const hours = document.getElementById('hours');
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');

    createSelectOptions(hours, 9, 'uur');
    createSelectOptions(minutes, 60, 'min.');
    createSelectOptions(seconds, 60, 'sec.');

    $('kilometer').addEventListener('input', (e) => {
        updateRangeInput(e);
        if (totalTimeLastUpdated) {
            onTimeUpdate();
        } else {
            onPaceUpdate();
        }
    });
}

function onTimeUpdate() {
    totalTimeLastUpdated = true;
    const totalTime = getTimeInput();

    updateAveragePaceByTotalTime(totalTime);
    updateAverageSpeedByTotalTime(totalTime);
}

function updateRangeInput(e) {
    const input = $('kilometer-input');
    input.value = rangeSliderMap[e.target.value];

    const label = $('kilometer-range-label');
    switch (input.value) {
        case '5': label.innerHTML = 'high five &#x1F596;'; break;
        case '10': label.innerHTML = '10K &#x1F64C;'; break;
        case '16.1': label.innerHTML = '10 EM!'; break;
        case '21.1': label.innerHTML = 'halve marathon!'; break;
        case '30': label.innerHTML = 'dirty 30 &#x1F480;'; break;
        case '42.195': label.innerHTML = 'marathon &#x1F947;'; break;
        default: label.innerHTML = '';
    }
}

function setTimeInput(timeInSeconds) {
    const time = convertFromSeconds(timeInSeconds);

    $('hours').value = time.hours;
    $('minutes').value = time.minutes;
    $('seconds').value = time.seconds;
}

function createSelectOptions(element, total, postfix) {
    for (let i = 0; i < total; i++) {
        const option = document.createElement('option')
        option.innerHTML = `${i} ${postfix}`;
        option.value = i;
        element.appendChild(option);
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
    defaultAllowedKeys: ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
}

function initPaceInput() {
    const buttonUp = document.getElementById('pace-button-up');
    const buttonDown = document.getElementById('pace-button-down');
    const averagePaceMin = document.getElementById('average-pace-min');
    const averagePaceSec = document.getElementById('average-pace-sec');

    averagePaceMin.value = 0;
    averagePaceSec.value = 0;

    handlePaceButtonEvents(paceInput, buttonUp, 1, averagePaceSec);
    handlePaceButtonEvents(paceInput, buttonDown, -1, averagePaceSec);

    HandlePaceKeyInput(averagePaceMin, 60);
    HandlePaceKeyInput(averagePaceSec, 1);

    // setTimePaceInput(360);
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + 1);
}

function HandlePaceKeyInput(element, change) {    
    element.addEventListener('keydown', (e) => {
        if (!paceInput.defaultAllowedKeys.includes(e.key)) {
            if (!e.ctrlKey) {
                e.preventDefault();
                return;
            }
        }

        if (e.key == 'Delete') {
            let caretPosition = window.getSelection().anchorOffset;
            setCaretPosition(e.currentTarget, ++caretPosition);
        }

        if (e.key == 'ArrowUp') {
            e.preventDefault();
            onPaceUpdate(change);
        }

        if (e.key == 'ArrowDown') {
            e.preventDefault();
            onPaceUpdate(-change);
        }
    })
    
    element.addEventListener('paste', (e) => {
        let paste = e.clipboardData.getData('text');
        if (isNaN(Number.parseInt(paste))) {
            e.preventDefault();
        }
    })

    element.addEventListener('drop', (e) => {
        e.preventDefault();
    })

    element.addEventListener('input', (e) => {
        let caretPosition = window.getSelection().anchorOffset;
        let newValue = 0;
        if (e.inputType == 'insertFromPaste') {
            newValue = Number.parseInt(element.innerText);
            if (newValue > 59) {
                newValue = 59;
            }

            element.innerText = newValue.toString();
            element.value = newValue;
        } else if (e.data !== null && e.data >= '0' && e.data <= '9') {
            const data = Number.parseInt(e.data);
            newValue = 0;
            if (caretPosition == 1) {
                newValue = data * 10 + Math.floor(element.value % 10);
            } else {
                newValue = Math.floor(element.value / 10) * 10 + data;
            }
            
            element.innerText = newValue.toString();
            element.value = newValue;
        }

        const averagePace = getAveragePace();
        const newPace = averagePace.minutes * 60 + averagePace.seconds;
        totalTimeLastUpdated = false;

        updatePaceTime(newPace);
        setCaretPosition(element, caretPosition);
        if (caretPosition === 2) {
            const nextElementId = e.currentTarget.getAttribute('data-next');
            const nextElement = document.getElementById(nextElementId);
            
            nextElement.focus();
        }
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

function onPaceUpdate(change = 0) {
    totalTimeLastUpdated = false;

    const averagePace = getAveragePace();
    const timeInSeconds = averagePace.minutes * 60 + averagePace.seconds;
    let newPace = timeInSeconds + change;
    if (newPace > (12 * 60)) {
        newPace = 12 * 60;
    } else if (newPace < (2 * 60)) {
        newPace = 2 * 60;
    }
    

    updatePaceTime(newPace);
}

function updatePaceTime(newPace) {
    setTimePaceInput(newPace);
    updateAveragePaceSubscribers(newPace);
}

function getAveragePace() {
    const averagePaceMin = document.getElementById('average-pace-min');
    const averagePaceSec = document.getElementById('average-pace-sec');

    return {
        minutes: averagePaceMin.value,
        seconds: averagePaceSec.value,
    }
}

function setTimePaceInput(totalTimeInSeconds) {
    if (totalTimeInSeconds === Infinity || totalTimeInSeconds < 0 || isNaN(totalTimeInSeconds)) {
        totalTimeInSeconds = 0;
    }

    const time = convertFromSeconds(totalTimeInSeconds);
    const averagePaceMin = document.getElementById('average-pace-min');
    const averagePaceSec = document.getElementById('average-pace-sec');

    averagePaceMin.value = time.minutes;
    averagePaceMin.innerText = padLeft(time.minutes, 2)

    averagePaceSec.value = time.seconds;
    averagePaceSec.innerText = padLeft(time.seconds, 2)
}




//////////////////////////////////////////////////
function updateAveragePaceByAverageSpeed(averageSpeed) {
    const newAverageTimeInSeconds = (1 / (averageSpeed / 3600));
    if (newAverageTimeInSeconds < 0 || newAverageTimeInSeconds > 3600) {
        return;
    }

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
    defaultAllowedKeys: ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', ',', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
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
        if (!speedInput.defaultAllowedKeys.includes(e.key)) {
            if (!e.ctrlKey) {
                e.preventDefault();
                return;
            }
        }

        let caretPosition = window.getSelection().anchorOffset;
        if (e.key == 'Delete' && e.currentTarget.innerText[caretPosition] === ',') {    
            setCaretPosition(e.currentTarget, ++caretPosition);
            e.preventDefault();
        }

        if (e.key == 'Backspace' && e.currentTarget.innerText[caretPosition - 1] === ',') {    
            setCaretPosition(e.currentTarget, --caretPosition);
            e.preventDefault();
        }

        if (e.key == 'ArrowUp') {
            e.preventDefault();
            onUpdateSpeed(0.1, element);
        }

        if (e.key == 'ArrowDown') {
            e.preventDefault();
            onUpdateSpeed(-0.1, element);
        }
    })

    element.addEventListener('paste', (e) => {
        let paste = e.clipboardData.getData('text');
        if (isNaN(Number.parseInt(paste))) {
            e.preventDefault();
        }
    })

    element.addEventListener('drop', (e) => {
        e.preventDefault();
    })

    element.addEventListener('input', (e) => {
        speedInput.caretPosition = window.getSelection().anchorOffset;
        let averageSpeed = Number.parseFloat(e.currentTarget.innerText.replace(',', '.'));
        let roundedAverageSpeed = Math.floor(averageSpeed * 10) / 10;
        
        if (isNaN(roundedAverageSpeed)) {
            roundedAverageSpeed = 0;
        } else if (roundedAverageSpeed > 3600) {
            roundedAverageSpeed = 3600;
        }

        e.currentTarget.innerText = roundedAverageSpeed;
        element.value = roundedAverageSpeed;        
        totalTimeLastUpdated = false;

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
    if (averageSpeed < 1) {
        return;
    }

    updatePaceByAverageSpeed(averageSpeed);
    updateAveragePaceByAverageSpeed(averageSpeed);
}


function onUpdateSpeed(change, speedElement) {
    totalTimeLastUpdated = false;
    let newSpeed = Math.round((speedElement.value + change) * 100) / 100;
    if (newSpeed < 5) {
        newSpeed = 5; 
    } else if (newSpeed > 3600) {
        newSpeed = 3600;
    }

    
    updateSpeedField(speedElement, newSpeed);
    updateSpeedSubscribers(newSpeed);
}


function updateSpeedField(speedElement, averageSpeed) {
    if (averageSpeed === Infinity || averageSpeed < 0 || isNaN(averageSpeed)) {
        averageSpeed = 0;
    }
    strSpeed = averageSpeed.toFixed(1).replace('.', ',');

    speedElement.value = Math.round(averageSpeed * 10) / 10;
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
    if (totalSeconds === 0) {
        return;
    }
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
            if (negativeSplit.diff) {
                values[3] = timeToString(convertFromSeconds(secondsPerKm), 'm:ss');
            }
            appendToBody(tbody, values);
            break;
        }

        const values = calculateValues(d, totalSecondsForDistance, weight)
        if (negativeSplit.diff) {
            values[3] = timeToString(convertFromSeconds(secondsPerKm), 'm:ss');
        }
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
    } else {
        distance = distance + ' km';
    }

    const pace = calculatePace(totalSecondsForDistance, distanceInKm);
    const paceTime = convertFromSeconds(pace);

    if (pace === Infinity) {
        return;
    }

    const totalTime = convertFromSeconds(totalSecondsForDistance);
    const timeString = timeToString(totalTime, 'hh:mm:ss', ':');
    const kcal = calculateKcal(distanceInKm, weight, pace);
    let kcalString = '';
    if (kcal) {
        kcalString = kcal.toLocaleString('nl-NL') + ' kcal';
    }

    return [distance, timeString, kcalString, timeToString(paceTime, 'm:ss') + ' / km'];
}

function getTableHeaders(weight) {
    if (isNaN(weight)) {
        return ['Afstand', 'Tijd', '', 'Tempo'];
    }

    return ['Afstand', 'Tijd', 'Energie', 'Tempo'];
}

function calculateKcal(distanceInKm, weight, pace) {
    if (isNaN(weight)) {
        return '';
    }
    // gewicht    12 km uur       5 km per uur
//     // 75 *       12 *            (5 / 60)
// console.log(document.getElementById('speed').value);
// console.log(typeof(document.getElementById('speed').value));
    return Math.round(document.getElementById('speed').value * distanceInKm * weight * (pace / 3600));
}

function convertPaceToString(totalTimeInSeconds, distanceInKm)
{
    const pace = calculatePace(totalTimeInSeconds, distanceInKm);
    const paceTime = convertFromSeconds(pace);

    return timeToString(paceTime, 'm:ss');
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