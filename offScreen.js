const audioElement = document.querySelector("#prayerCall");

chrome.runtime.onMessage.addListener(function(request) {
    if (request) {
        CheckAudios(request.data.selectedAudio,request.data.ptr, request.data.close )
     }  
    });

function CheckAudios(value, prayerPtr, close) {
    if (value == "audio2") {
        if (prayerPtr == 0 )
            audioElement.src = "Assets/Audios/abdelbassetFajr.mp3";
        else
            audioElement.src = "Assets/Audios/abdelbasset.mp3";
    } else 
        audioElement.src = "Assets/Audios/azaanNasser.mp3";
     
    if (!close)
   audioElement.play();
else{ 
    chrome.runtime.sendMessage({ off: true });
    audioElement.pause();
    audioElement.currentTime = 0;
}}