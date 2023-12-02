import DataFetching from "./APIs/fetchingData.js";

const currentDate = new Date();
let prayerTimes, times, timesPtr=-1;

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.location) {
        try {
            prayerTimes = await DataFetching(request.location.latt, request.location.lngg);
            getNextPrayerTime();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } 
    else if (request.installed) {
        chrome.runtime.sendMessage({ firstMessage: true });
    }
});



function getNextPrayerTime() {
    const day = currentDate.getDate()-1;
    let timesAsString = [prayerTimes.data[day].timings.Fajr, prayerTimes.data[day].timings.Dhuhr, prayerTimes.data[day].timings.Asr, prayerTimes.data[day].timings.Maghrib, prayerTimes.data[day].timings.Isha];
    times = parseTimeStringsToDates(timesAsString);
    for (let i = 0; i < 5; i++) {
        if (new Date().getTime() < times[i].getTime()) {
            timesPtr = i;
            break;
        }
    }
   
    // should send the timesPtr here from background to content and update the nextprayer varibale on the top on content file
    chrome.runtime.sendMessage({ ptr: timesPtr });
    schedulePrayerAlarms();
}

function parseTimeStringsToDates(timesAsString) {
    const dateObjects = timesAsString.map((timesAsString) => {
        const match = timesAsString.match(/(\d{2}:\d{2})/);
        if (match) {
            const time = match[0];
            const [hours, minutes] = time.split(':').map(Number);
            const targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0)
            return targetTime;
        } else {
            return null;
        }
    });

    return dateObjects;
}





//make this function has 2 arguments which are tmiesAsString and prayerTimes (OR JUST PRAYERTIMESTODY) for getNextPrayerTime function
function schedulePrayerAlarms() {
    const now = new Date();
    const day = now.getDate()-1
    const timesAsString =  [prayerTimes.data[day].timings.Fajr, prayerTimes.data[day].timings.Dhuhr, prayerTimes.data[day].timings.Asr, prayerTimes.data[day].timings.Maghrib, prayerTimes.data[day].timings.Isha];
    const prayerTimesToday = parseTimeStringsToDates(timesAsString);

    Object.keys(prayerTimesToday).forEach(prayer => {
        const prayerTime = new Date(prayerTimesToday[prayer]);
        console.log("this is prayerTime",prayerTime);
        
        if (prayerTime > now) {
            const timeDifference = prayerTime - now;
            console.log("here")
            chrome.alarms.get(prayer,exists=>{
                if (!exists)
                chrome.alarms.create(prayer, { when: now.getTime() + timeDifference });
            })
        }
    });

    
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    chrome.alarms.get("midnight",exist=>{
        if (!exist)
        chrome.alarms.create("midnight", { when: midnight.getTime() });
    })
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    

    if (alarm.name === "midnight") {
        chrome.runtime.alarms.clearAll();
        schedulePrayerAlarms();
    } else {
        ////SHOULD SEND HERE THE VALUE OF TIMESPTR TO POPUP.JS
        chrome.runtime.sendMessage({ alarm: true });
    }
});

 

