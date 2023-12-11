import GetLocation from "./APIs/fetchingUserLocation.js";

const prayersEN = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const prayersAR = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];
const nextPrayerEN = document.querySelector('#nextPrayerEN');
const nextPrayerAR = document.querySelector('#nextPrayerAR');
const clock = document.querySelector("#clck");
// const beforePrayer = document.querySelector(".beforePrayer");
// const afterPrayer = document.querySelector(".afterPrayer");
const fajrSpan = document.querySelector("#fajrSpan");
const selectElement = document.querySelector("#audios");
const closeAudioButton = document.querySelector("#closeAudioButton");
let installedMessageSent = false;
let prayerTimesPtr;
let timeOfPrayers;
let getLocationCalled =false;


(() => {
    if (!installedMessageSent) {
        chrome.runtime.sendMessage({ installed: true });
        installedMessageSent = true;
    }
})();

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.firstMessage && !getLocationCalled) {
        getLocationCalled = true;
        const loc = await GetLocation();
        if(request.playing)
        {
            closeAudioButton.classList.remove("hide")    
        }
        const selectedAudioo = localStorage.getItem("selectedAudio");
        if (selectedAudioo != null)
        selectElement.value = selectedAudioo 
        chrome.runtime.sendMessage({ location: loc , selectedAudio: selectedAudioo});
        chrome.runtime.onMessage.removeListener(arguments.callee);
    }
});


chrome.runtime.onMessage.addListener(function (request) {    
    // if (request.alarm) {
    //     closeAudioButton.classList.remove("hide")
    //     CallForThePrayer();
    //  }
    if (request.test)
    {
        closeAudioButton.classList.remove("hide")
        CallForThePrayer();
    }  
    else if (request.Data.ptr == -1) {
        timeOfPrayers = request.Data.prayerTimes;
        nextPrayerEN.innerText = prayersEN[0]
        nextPrayerAR.innerText = prayersAR[0]
        clock.innerText = timeOfPrayers[0].replace("(EET)", " ")
    }
    else if (request.Data.ptr > -1) {
        prayerTimesPtr = request.Data.ptr;
        timeOfPrayers = request.Data.prayerTimes;
        nextPrayerEN.innerText = prayersEN[prayerTimesPtr]
        nextPrayerAR.innerText = prayersAR[prayerTimesPtr]
        clock.innerText = timeOfPrayers[prayerTimesPtr].replace("(EET)", " ")
    }
});


function CallForThePrayer() {
    // if (prayerTimesPtr == 0)
    //     fajrSpan.classList.remove("hide")

    prayerTimesPtr++;
    if (prayerTimesPtr == 5) {
        prayerTimesPtr = 0
    }
    chrome.runtime.sendMessage({timesPtr: prayerTimesPtr});
    // hideContent();
    // setTimeout(hideContent, 240000);
    
    // fajrSpan.classList.add("hide")
    nextPrayerEN.innerText = prayersEN[prayerTimesPtr]
    nextPrayerAR.innerText = prayersAR[prayerTimesPtr]
    clock.innerText = timeOfPrayers[prayerTimesPtr].replace("(EET)", " ")
}


// function hideContent() {
//     beforePrayer.classList.toggle("hide");
//     afterPrayer.classList.toggle("hide");
// }


closeAudioButton.addEventListener("click", function () {
    closeAudioButton.classList.add("hide");
   chrome.runtime.sendMessage({close:true});
});

selectElement.addEventListener("change", function () {
    
    const selectedAudio = selectElement.value;
    localStorage.setItem("selectedAudio", selectedAudio);
    console.log("this is selectedAudio:", selectedAudio);
    chrome.runtime.sendMessage({selectedAudio : selectElement.value})
});

 
