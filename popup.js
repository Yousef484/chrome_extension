const prayersEN = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const prayersAR = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];
const audioElement = document.querySelector("#prayerCall");
const nextPrayerEN = document.querySelector('#nextPrayerEN');
const nextPrayerAR = document.querySelector('#nextPrayerAR');
const clock = document.querySelector("#clck");
const beforePrayer = document.querySelector(".beforePrayer");
const afterPrayer = document.querySelector(".afterPrayer");
const fajrSpan = document.querySelector("#fajrSpan");
const selectElement = document.querySelector("#audios");
let installedMessageSent = false;
let getLocationCalled = false;
let prayerTimesPtr;

function GetLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            function (position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                const loc = { latt: lat, lngg: lng };
                chrome.runtime.sendMessage({ location: loc });
            },
            function (error) {
                console.log(error.message);
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser!!!");
    }
}

(() => {
    if (!installedMessageSent) {
        chrome.runtime.sendMessage({ installed: true });
        installedMessageSent = true;
    }
})();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.firstMessage && !getLocationCalled) {
        getLocationCalled = true;
        GetLocation();
        chrome.runtime.onMessage.removeListener(arguments.callee);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    
    if(request.alarm)
    {
        CallForThePrayer();
    }
        //---/ I SHOULD SEND THE PRAYERTIMES TO ACSSESS THE TIME OF THE PRAYER TO DISPLY IT -----\
     else if (request.ptr ==-1)
      {
        nextPrayerEN.innerText = prayersEN[0]
        nextPrayerAR.innerText = prayersAR[0]
        //clock.innerText = prayerTimes.data[now.getDate()].timings.Fajr.replace("(EET)", " ")
      }
      else if (request.ptr >-1){
      prayerTimesPtr = request.ptr;   
      nextPrayerEN.innerText = prayersEN[prayerTimesPtr]
      nextPrayerAR.innerText = prayersAR[prayerTimesPtr]
      //clock.innerText = timesStrings[prayerTimesPtr].replace("(EET)", " ")
      }
    
    
});


function CallForThePrayer() {
    if (prayerTimesPtr == 0)
        fajrSpan.classList.remove("hide")

    CheckAudios();

    prayerTimesPtr++;
    if (prayerTimesPtr == 5) {
        prayerTimesPtr = 0
        // clearInterval(interval);
    }
    hideContent();
    audioElement.play()
    setTimeout(hideContent, 240000);
    fajrSpan.classList.add("hide")
    nextPrayerEN.innerText = prayersEN[prayerTimesPtr]
    nextPrayerAR.innerText = prayersAR[prayerTimesPtr]
    // clock.innerText = timesStrings[prayerTimesPtr].replace("(EET)", " ")
}






function hideContent() {
    beforePrayer.classList.toggle("hide");
    afterPrayer.classList.toggle("hide");
}

function CheckAudios() {
    if (selectElement.value == "audio2") {
        if (prayerTimesPtr == 0)
            audioElement.src = "abdelbassetFajr.mp3";
        else
            audioElement.src = "abdelbasset.mp3";
    } else
        audioElement.src = "azaanNasser.mp3";
}


