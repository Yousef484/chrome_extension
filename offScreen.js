const audioElement = document.querySelector("#prayerCall");

chrome.runtime.onMessage.addListener(function(request) {
    if (request) {
        CheckAudios("audio1",request.data.ptr, request.data.close )
     }  
    });

function CheckAudios(value, prayerPtr, close) {
    console.log("this is check audio")
    if (value == "audio2") {
        if (prayerPtr == 0 )
            audioElement.src = "Assets/Audios/abdelbassetFajr.mp3";
        else
            audioElement.src = "Assets/Audios/abdelbasset.mp3";
    } else 
        audioElement.src = "Assets/Audios/azaanNasser.mp3";
     
    if (!close)
   audioElement.play();
else 
 audioElement.pause();    
}

