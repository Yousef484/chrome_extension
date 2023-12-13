import DataFetching from "./APIs/fetchingData.js";

const currentDate = new Date();
let prayerTimes, times, timesPtr=-1, isPlaying = false;
let Data ={}, popup;

chrome.runtime.onMessage.addListener(async function (request) {
    if (request.location) {
        try {
            prayerTimes = await DataFetching(request.location.latt, request.location.lngg);
            getNextPrayerTime();
            Data.selectedAudio = request.selectedAudio

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } 
    else if (request.installed) {
        
        chrome.runtime.sendMessage({ firstMessage: true, playing:isPlaying });
    }
    else if (request.timesPtr)
     timesPtr = request.timesPtr;
    else if (request.close || request.selectedAudio!= Data.selectedAudio){
        Data.selectedAudio = request.selectedAudio
        Data.close =true;
        chrome.runtime.sendMessage({data:Data});
        chrome.offscreen.closeDocument();
    }
    else if (request.off)
     isPlaying = false;
});



function getNextPrayerTime() {
    const day = currentDate.getDate()-1;
    let timesAsString = [prayerTimes.data[day].timings.Fajr,prayerTimes.data[day].timings.Sunrise, prayerTimes.data[day].timings.Dhuhr, prayerTimes.data[day].timings.Asr, prayerTimes.data[day].timings.Maghrib, prayerTimes.data[day].timings.Isha];
    times = parseTimeStringsToDates(timesAsString);
    for (let i = 0; i < 6; i++) {
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
     else {
        
        if (timesPtr ==0)
      popup = "popup2_fajr.html"
    else 
      popup = "popup2.html"
    console.log(`this is Ptr:${timesPtr} and this is popup:${popup}`)
    chrome.windows.create({
        url: popup,
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
            console.log("this Is DATA:", Data)
            chrome.runtime.sendMessage({data:Data});
            });
     isPlaying = true;
    chrome.runtime.sendMessage({ test: true });

    }
});












     /*============TESTING PERPOSES===============*/ 

// chrome.alarms.create('openPopupAlarm', { delayInMinutes: 1 });

// chrome.alarms.onAlarm.addListener(function(alam) {
//   if (alam.name === 'openPopupAlarm' && Data.ptr !=1) {
//     if (timesPtr ==0)
//       popup = "popup2_fajr.html"
//     else 
//       popup = "popup2.html"
//     console.log(`this is Ptr:${timesPtr} and this is popup:${popup}`)
//     chrome.windows.create({
//         url: popup,
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
//             console.log("this Is DATA:", Data)
//             chrome.runtime.sendMessage({data:Data});
//             });
//      isPlaying = true;
//     chrome.runtime.sendMessage({ test: true });
    
//   }
// });

 