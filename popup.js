import GetLocation from "./APIs/fetchingUserLocation.js";

const prayersEN = ["Fajr","Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const prayersAR = ["الفجر", "الشروق","الظهر", "العصر", "المغرب", "العشاء"];
const EN_header = document.querySelector("#EN-header")
const AR_header = document.querySelector("#AR-header")
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
        console.log("sending location.....")
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
        if(request.Data.ptr ==1)
        {
            EN_header.innerText = "";
            AR_header.innerText = "";
        }
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
    if (prayerTimesPtr == 6) {
        prayerTimesPtr = 0
    }
    chrome.runtime.sendMessage({timesPtr: prayerTimesPtr});
    // hideContent();
    // setTimeout(hideContent, 240000);
    
    // fajrSpan.classList.add("hide")
    if(prayerTimesPtr ==1)
    {
        EN_header.innerText = ""
        AR_header.innerText = ""
    }
    nextPrayerEN.innerText = prayersEN[prayerTimesPtr];
    nextPrayerAR.innerText = prayersAR[prayerTimesPtr];
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
    chrome.runtime.sendMessage({selectedAudio : selectElement.value})
});

 
