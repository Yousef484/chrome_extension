export default async function getLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            const successCallback = (position) => {
                const loc = { latt: position.coords.latitude, lngg: position.coords.longitude };
                resolve(loc);
            };

            const errorCallback = (error) => {
                reject(error.message);
            };

            navigator.geolocation.watchPosition(successCallback, errorCallback);
        } else {
            reject("Geolocation is not supported by this browser!!!");
        }
    });
}
