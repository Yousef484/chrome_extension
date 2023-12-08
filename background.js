import DataFetching from "./APIs/fetchingData.js";

const currentDate = new Date();
let prayerTimes, times, timesPtr=-1;
let Data ={}

chrome.runtime.onMessage.addListener(async function (request) {
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
    else if (request.timesPtr)
     timesPtr = request.timesPtr;
    else if (request.close){
        // you should get here the audio number too and the popup should send it too
        Data.close =true;
    chrome.runtime.sendMessage({data:Data});
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
    const data = {
        ptr:timesPtr,
        prayerTimes : timesAsString
    }
    chrome.runtime.sendMessage({ Data: data });
    schedulePrayerAlarms(times);
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


function schedulePrayerAlarms(prayerTimesToday) {
    const now = new Date();
    const day = now.getDate()-1
    Object.keys(prayerTimesToday).forEach(prayer => {
        const prayerTime = new Date(prayerTimesToday[prayer]); 
        if (prayerTime > now) {
            const timeDifference = prayerTime - now;
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
     } 
    //  else {
        
    //     chrome.windows.create({
    //         url: "popup2.html",
    //         type: "popup",
    //         width: 920,
    //         height: 530
    //       });
    //       chrome.offscreen.createDocument({
    //             url:chrome.runtime.getURL("offScreen.html"),
    //             reasons:["AUDIO_PLAYBACK"],
    //             justification: "justification is required.",
    //             },()=>{
    //             Data.ptr = timesPtr;
    //             Data.close = false;
    //             chrome.runtime.sendMessage({data:Data});
    //             });
    //     chrome.runtime.sendMessage({ alarm: true });

    // }
});

















     /*============TESTING PERPOSES===============*/ 

chrome.alarms.create('openPopupAlarm', { delayInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alam) {
  if (alam.name === 'openPopupAlarm') {
    console.log('ggggggggggggggggggg')
    chrome.windows.create({
        url: "popup2.html",
        type: "popup",
        width: 920,
        height: 530
      });
      chrome.offscreen.createDocument({
            url:chrome.runtime.getURL("offScreen.html"),
            reasons:["AUDIO_PLAYBACK"],
            justification: "justification is required.",
            },()=>{
            Data.ptr = timesPtr;
            Data.close = false;
            chrome.runtime.sendMessage({data:Data});
            });
    chrome.runtime.sendMessage({ test: true });
  }
});

 